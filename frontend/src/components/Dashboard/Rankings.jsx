import { useState } from "react";

const PERIODS = ["Daily", "Weekly", "All Time"];
const CATEGORIES = ["Global", "Engineering", "Medical", "School"];

const mockData = [
  { rank: 1, name: "Aman", minutes: 3120, consistency: 0.92 },
  { rank: 2, name: "Sara", minutes: 2980, consistency: 0.88 },
  { rank: 3, name: "You", minutes: 2760, consistency: 0.95, isYou: true },
  { rank: 4, name: "Rahul", minutes: 2600, consistency: 0.81 },
  { rank: 5, name: "Zoya", minutes: 2480, consistency: 0.79 },
];

export default function Rankings() {
  const [period, setPeriod] = useState("Weekly");
  const [category, setCategory] = useState("Global");

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">🏆 Study Rankings</h1>

        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {PERIODS.map(p => (
              <option key={p}>{p}</option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {CATEGORIES.map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <div className="grid grid-cols-4 px-4 py-3 bg-gray-100 text-sm font-semibold">
          <span>Rank</span>
          <span>User</span>
          <span>Study Time</span>
          <span>Consistency</span>
        </div>

        {mockData.map((user) => (
          <div
            key={user.rank}
            className={`grid grid-cols-4 px-4 py-3 text-sm border-t ${
              user.isYou ? "bg-blue-50 font-semibold" : ""
            }`}
          >
            <span>#{user.rank}</span>
            <span>{user.name}</span>
            <span>{Math.floor(user.minutes / 60)}h {user.minutes % 60}m</span>
            <span>{Math.round(user.consistency * 100)}%</span>
          </div>
        ))}
      </div>

      {/* Your Rank Card */}
      <div className="border rounded-xl p-4 bg-gradient-to-r from-blue-50 to-white">
        <p className="text-sm text-gray-600">Your Position</p>
        <div className="flex justify-between items-center mt-2">
          <div>
            <p className="text-lg font-bold">Rank #3</p>
            <p className="text-sm text-gray-500">
              Weekly · Global
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold">46h studied</p>
            <p className="text-sm text-gray-500">95% consistency</p>
          </div>
        </div>
      </div>

    </div>
  );
}
