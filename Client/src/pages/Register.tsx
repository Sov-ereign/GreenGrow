import { useState } from "react";
import { Eye, EyeOff, Leaf } from "lucide-react";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-gray-50 p-6">
      <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-lg p-10 transition-all hover:shadow-xl">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full shadow-md mx-auto mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Create Account
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            Start your journey with us 🌿
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            {["firstName", "lastName"].map((field) => (
              <div key={field} className="relative">
                <input
                  id={field}
                  name={field}
                  type="text"
                  value={(formData as any)[field]}
                  onChange={handleChange}
                  placeholder=" "
                  required
                  className="peer w-full px-4 pt-5 pb-2 rounded-xl border border-gray-300 bg-transparent text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
                <label
                  htmlFor={field}
                  className="absolute text-gray-500 text-sm left-4 top-2.5 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base transition-all"
                >
                  {field === "firstName" ? "First Name" : "Last Name"}
                </label>
              </div>
            ))}
          </div>

          {/* Email */}
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder=" "
              required
              className="peer w-full px-4 pt-5 pb-2 rounded-xl border border-gray-300 bg-transparent text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            <label
              htmlFor="email"
              className="absolute text-gray-500 text-sm left-4 top-2.5 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base transition-all"
            >
              Email Address
            </label>
          </div>

          {/* Phone */}
          <div className="relative">
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder=" "
              required
              className="peer w-full px-4 pt-5 pb-2 rounded-xl border border-gray-300 bg-transparent text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
            <label
              htmlFor="phoneNumber"
              className="absolute text-gray-500 text-sm left-4 top-2.5 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base transition-all"
            >
              Phone Number
            </label>
          </div>

          {/* Password */}
          {[
            {
              id: "password",
              label: "Password",
              state: showPassword,
              set: setShowPassword,
            },
            {
              id: "confirmPassword",
              label: "Confirm Password",
              state: showConfirmPassword,
              set: setShowConfirmPassword,
            },
          ].map(({ id, label, state, set }) => (
            <div key={id} className="relative">
              <input
                id={id}
                name={id}
                type={state ? "text" : "password"}
                value={(formData as any)[id]}
                onChange={handleChange}
                placeholder=" "
                required
                className="peer w-full px-4 pt-5 pb-2 pr-10 rounded-xl border border-gray-300 bg-transparent text-gray-900 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
              <label
                htmlFor={id}
                className="absolute text-gray-500 text-sm left-4 top-2.5 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base transition-all"
              >
                {label}
              </label>
              <button
                type="button"
                onClick={() => set(!state)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {state ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full h-11 mt-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Create Account
          </button>

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <a
              href="#"
              className="text-emerald-600 font-semibold hover:underline"
            >
              Sign in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
