// src/components/Dashboard/Recorder.jsx
import { useState } from "react";
import { useStudyTime } from "../../context/StudyTimeContext";

export default function FileUploadBox() {
  const { productiveSeconds, addProductiveSeconds } = useStudyTime();

  const [durationMin, setDurationMin] = useState(null);
  const [fileName, setFileName] = useState("");

  /* ---------- Helpers ---------- */
  const formatProductive = () => {
    const h = Math.floor(productiveSeconds / 3600);
    const m = Math.floor((productiveSeconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const handleFile = (file) => {
    if (!file) return;

    setFileName(file.name);

    const video = document.createElement("video");
    video.preload = "metadata";
    video.src = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      const minutes = Math.round(video.duration / 60);
      setDurationMin(minutes);
    };
  };

  const confirmTime = () => {
    if (!durationMin) return;

    addProductiveSeconds(durationMin * 60); // seconds
    setDurationMin(null);
    setFileName("");
  };

  return (
    <div className="space-y-6">
      {/* Focused Time Today */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white shadow-sm">
        <div className="text-sm opacity-90">Focused Time Today</div>
        <div className="text-2xl font-semibold mt-1">
          {formatProductive()}
        </div>
      </div>

      {/* Upload Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-800">
            Record / Upload Study Session
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload raw study video. Duration is read locally — nothing is stored.
          </p>
        </div>

        {/* Upload */}
        <label className="block cursor-pointer">
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />

          <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition">
            Click to upload study video
          </div>
        </label>

        {/* Preview */}
        {durationMin !== null && (
          <div className="rounded-lg bg-slate-50 p-4 space-y-3">
            <div className="text-sm text-slate-700">
              <span className="font-medium">File:</span> {fileName}
            </div>

            <div className="text-sm text-slate-700">
              Detected duration:
              <span className="ml-1 font-semibold">
                {durationMin} min
              </span>
            </div>

            <button
              onClick={confirmTime}
              className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2 text-sm font-medium text-white transition"
            >
              Add to Productive Time
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
