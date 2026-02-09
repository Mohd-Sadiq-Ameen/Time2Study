// /Users/homefolder/Desktop/Projects/project/frontend/src/components/Dashboard/Study.jsx

import { useRef, useState } from "react";

export default function FileUploadBox({ onConfirm }) {
  const videoRef = useRef(null);

  const [durationMin, setDurationMin] = useState(null);
  const [fileName, setFileName] = useState("");

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
    onConfirm(durationMin);
    setDurationMin(null);
    setFileName("");
  };

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-4 space-y-4">

      {/* Upload */}
      <label className="block cursor-pointer">
        <input
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        <div className="rounded-lg border border-dashed border-gray-600 p-6 text-center text-sm text-gray-400 hover:border-gray-400">
          Click to upload study video
        </div>
      </label>

      {/* Preview */}
      {durationMin !== null && (
        <div className="space-y-2">
          <div className="text-sm text-gray-300">
            Detected duration:
            <span className="ml-1 font-medium text-white">
              {durationMin} min
            </span>
          </div>

          <button
            onClick={confirmTime}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 py-2 text-sm font-medium"
          >
            Add to Productive Time
          </button>
        </div>
      )}
    </div>
  );
}
