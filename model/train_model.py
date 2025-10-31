import os
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras import layers, models, mixed_precision

gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        tf.config.set_visible_devices(gpus, 'GPU')
        logical = tf.config.list_logical_devices('GPU')
        print(f"✅ CUDA GPU(s) available: {len(gpus)} physical / {len(logical)} logical")
    except Exception as e:
        print(f"⚠️ GPU configuration issue, falling back to CPU: {e}")
else:
    print("❌ No CUDA GPU detected, using CPU.")


data_dir = 'dataset'
img_size = (160, 160)
batch_size = 32
seed = 1337

# Build the dataset pipeline on CPU to avoid GPU kernel conflicts (seed needed for validation_split)
with tf.device('/CPU:0'):
    train_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset='training',
        seed=seed,
        shuffle=False,
        label_mode='categorical',
        image_size=img_size,
        batch_size=batch_size
    )
    val_ds = tf.keras.utils.image_dataset_from_directory(
        data_dir,
        validation_split=0.2,
        subset='validation',
        seed=seed,
        shuffle=False,
        label_mode='categorical',
        image_size=img_size,
        batch_size=batch_size
    )

    class_names = train_ds.class_names
    num_classes = len(class_names)

    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.cache().shuffle(1000).prefetch(AUTOTUNE)
    val_ds = val_ds.cache().prefetch(AUTOTUNE)

# Build and train model on accelerator if available
device = '/GPU:0' if gpus else '/CPU:0'
with tf.device(device):
    if gpus:
        mixed_precision.set_global_policy('mixed_float16')
    # Simple rescaling to avoid variable-creating augmentation layers that conflict with GPU kernels
    preprocess = layers.Rescaling(1./255)

    inputs = layers.Input(shape=(*img_size, 3))
    x = preprocess(inputs)

    base_model = EfficientNetB0(weights='imagenet', include_top=False, input_shape=(*img_size, 3))
    base_model.trainable = False
    x = base_model(x)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(128, activation='relu')(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation='softmax', dtype='float32')(x)
    model = models.Model(inputs, outputs)

    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=1,
        steps_per_epoch=100,
        validation_steps=20
    )

# Save weights only (avoids Keras JSON serialization issues)
os.makedirs("model", exist_ok=True)
weights_path = 'model/disease_model.weights.h5'
model.save_weights(weights_path)
print(f"✅ Weights saved to {weights_path}")
