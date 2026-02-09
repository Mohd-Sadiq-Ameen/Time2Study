import { useStudyTime } from "../../context/StudyTimeContext";

function Overview() {
  const { productiveSeconds } = useStudyTime();

  const format = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Today’s Progress</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat title="Today" value={format(productiveSeconds)} />
        <Stat title="This Week" value="—" />
        <Stat title="This Month" value="—" />
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
