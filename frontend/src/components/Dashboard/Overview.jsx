function Overview() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Today’s Progress</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat title="Today" value="2h 45m" />
        <Stat title="This Week" value="14h" />
        <Stat title="Global Rank" value="#128" />
      </div>
    </>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-black p-4 rounded-lg border">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl text-amber-50 font-bold">{value}</p>
    </div>
  );
}

export { Overview, Stat };
