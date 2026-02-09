// /Users/homefolder/Desktop/Projects/project/frontend/src/components/Dashboard/StudyManager.jsx
// /Users/homefolder/Desktop/Projects/project/frontend/src/components/Dashboard/Study.jsx , video metadata read is here
// i want y to import this varible , which is here produtive time , if i upload video or timer , both should reflect on each page together , got it , do it 

import { useEffect, useState } from "react";

export default function StudyManager() {
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [productiveSeconds, setProductiveSeconds] = useState(0);
  const [customMinutes, setCustomMinutes] = useState("");

  // EI additions
  const [sessionIntent, setSessionIntent] = useState("");
  const [reflection, setReflection] = useState(null); // 👍 | 😐 | 👎

  const elapsedSeconds = totalSeconds - secondsLeft;
  const progress = (elapsedSeconds / totalSeconds) * 100;

  /* ---------------- Timer Engine ---------------- */
  useEffect(() => {
    if (!isRunning) return;

    if (secondsLeft === 0) {
      setIsRunning(false);
      setProductiveSeconds((p) => p + totalSeconds);
      setSecondsLeft(totalSeconds);
      return;
    }

    const id = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning, secondsLeft, totalSeconds]);

  /* ---------------- Helpers ---------------- */
  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const formatProductive = () => {
    const h = Math.floor(productiveSeconds / 3600);
    const m = Math.floor((productiveSeconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  /* ---------------- Duration Control (IDLE only) ---------------- */
  const setDuration = (minutes) => {
    if (isRunning || isPaused) return;
    const secs = minutes * 60;
    setTotalSeconds(secs);
    setSecondsLeft(secs);
  };

  const applyCustomTime = () => {
    const min = Number(customMinutes);
    if (!min || min <= 0) return;
    setDuration(min);
    setCustomMinutes("");
  };

  /* ---------------- Controls ---------------- */
  const start = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const pause = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const resume = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const addStudiedTime = () => {
    setProductiveSeconds((p) => p + elapsedSeconds);
    setSecondsLeft(totalSeconds);
    setIsPaused(false);
    setReflection(null);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center gap-8">

      {/* Productive Time */}
      <div className="text-lg text-neutral-300">
        Focused Time Today:{" "}
        <span className="text-white font-semibold">{formatProductive()}</span>
      </div>

      {/* Session Intent (IDLE only) */}
      {!isRunning && !isPaused && (
        <input
          value={sessionIntent}
          onChange={(e) => setSessionIntent(e.target.value)}
          placeholder="What are you focusing on?"
          maxLength={60}
          className="w-80 px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-sm text-neutral-200"
        />
      )}

      {/* Circular Timer */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        <svg className="absolute inset-0" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" stroke="#262626" strokeWidth="6" fill="none" />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#f59e0b"
            strokeWidth="6"
            fill="none"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <span className="text-6xl font-mono z-10">
          {formatTime(secondsLeft)}
        </span>
      </div>

      {/* Controls */}
      {!isRunning && !isPaused && (
        <button
          onClick={start}
          className="px-12 py-3 rounded-xl bg-green-600 hover:bg-green-500 text-lg"
        >
          Start
        </button>
      )}

      {isRunning && (
        <button
          onClick={pause}
          className="px-12 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-lg"
        >
          Pause
        </button>
      )}

      {isPaused && (
        <>
          <div className="flex gap-4">
            <button
              onClick={resume}
              className="px-8 py-3 rounded-xl bg-green-600 hover:bg-green-500"
            >
              Resume
            </button>
            <button
              onClick={addStudiedTime}
              className="px-8 py-3 rounded-xl bg-neutral-700 hover:bg-neutral-600"
            >
              Add Studied Time
            </button>
          </div>

          {/* Completion Reflection */}
          <div className="flex gap-4 mt-2 text-2xl">
            {["👍", "😐", "👎"].map((r) => (
              <button
                key={r}
                onClick={() => setReflection(r)}
                className={`transition ${
                  reflection === r ? "scale-125" : "opacity-60 hover:opacity-100"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Custom Time (RESTORED, IDLE only) */}
      {!isRunning && !isPaused && (
        <div className="flex gap-2">
          <input
            type="number"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            placeholder="Custom min"
            className="w-32 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700"
          />
          <button
            onClick={applyCustomTime}
            className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600"
          >
            Set
          </button>
        </div>
      )}

      {/* Preset Durations */}
      {!isRunning && !isPaused && (
        <div className="flex gap-3">
          {[10, 15, 20, 30, 45].map((min) => (
            <button
              key={min}
              onClick={() => setDuration(min)}
              className={`px-4 py-2 rounded-lg text-sm ${
                totalSeconds === min * 60
                  ? "bg-indigo-600"
                  : "bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              {min} min
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
