import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiUrl } from "@/lib/env";

interface PlantDetailData {
  plant: any;
  images: any[];
  assessments: any[];
}

const PlantDetail: React.FC = () => {
  const { id } = useParams();
  const [data, setData] = useState<PlantDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(apiUrl(`/api/plants/${id}`), {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to load plant detail");
        }
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        console.error("Error loading plant detail:", err);
        setError(err.message || "Failed to load plant detail");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (!id) return <p className="text-sm text-gray-500">No plant selected.</p>;
  if (loading) return <p className="text-sm text-gray-500">Loading plant details...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!data) return null;

  const { plant, images, assessments } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="h-20 w-20 rounded-xl overflow-hidden bg-gray-100 border">
          {plant.profileImage ? (
            <img
              src={plant.profileImage}
              alt={plant.plantName || "Plant"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
              No image
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {plant.plantName || plant.cropType || "Plant"}
          </h1>
          <p className="text-sm text-gray-500">
            {plant.cropType && <span className="mr-2">{plant.cropType}</span>}
            {plant.location && <span>• {plant.location}</span>}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold mb-2">Image Timeline</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-3">
            {images.length === 0 && (
              <p className="text-sm text-gray-500">
                No images uploaded for this plant yet.
              </p>
            )}
            {images.map((img) => (
              <div
                key={img._id}
                className="flex items-center gap-3 border rounded-md p-2 bg-gray-50"
              >
                <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center text-xs text-gray-500">
                  {img.storagePath ? (
                    <img
                      src={img.storagePath}
                      alt="Plant"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "Img"
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">
                    {new Date(img.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {img.storagePath}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Assessments</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-3">
            {assessments.length === 0 && (
              <p className="text-sm text-gray-500">
                No assessments recorded for this plant yet.
              </p>
            )}
            {assessments.map((a) => (
              <div
                key={a._id}
                className="border rounded-md p-3 bg-white space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-gray-600">
                    {a.severity || "low"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>
                {a.diseasePrediction && (
                  <p className="text-sm text-gray-800">
                    {a.diseasePrediction}
                  </p>
                )}
                {Array.isArray(a.recommendations) &&
                  a.recommendations.length > 0 && (
                    <ul className="list-disc pl-4 text-xs text-gray-700">
                      {a.recommendations.map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  )}
                {a.nextCheckDate && (
                  <p className="text-xs text-green-700">
                    Next check: {new Date(a.nextCheckDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantDetail;
