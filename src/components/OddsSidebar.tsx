import { HandRank } from "../core/HandRank";

interface OddsSidebarProps {
  rank: HandRank | null; // highlight when player hits rank
}

const superBonus: [HandRank, string][] = [
  [HandRank.FourAces, "200 : 1"],
  [HandRank.FourKind, "30 : 1"],
  [HandRank.StraightFlush, "15 : 1"],
  [HandRank.ThreeKind, "2 : 1"],
  [HandRank.Flush, "3 : 2"],
  [HandRank.Straight, "1 : 1"],
];

const queensUp: [HandRank, string][] = [
  [HandRank.FourKind, "50 : 1"],
  [HandRank.StraightFlush, "40 : 1"],
  [HandRank.ThreeKind, "8 : 1"],
  [HandRank.Flush, "4 : 1"],
  [HandRank.Straight, "3 : 1"],
  [HandRank.TwoPair, "2 : 1"],
  [HandRank.Pair, "1 : 1"],
];

export default function OddsSidebar({ rank }: OddsSidebarProps) {
  return (
    <aside className="flex flex-col gap-6 text-sm font-mono">
      <PayTable title="Super Bonus" rows={superBonus} hit={rank} />
      <PayTable title="Queens Up" rows={queensUp} hit={rank} />
    </aside>
  );
}

function PayTable({ title, rows, hit }: { title: string; rows: [HandRank,string][]; hit: HandRank | null }) {
  return (
    <div className="bg-black/40 p-4 rounded-lg w-52">
      <h3 className="text-center text-yellow-300 mb-2 font-bold">{title}</h3>
      <ul className="space-y-1">
        {rows.map(([r, pay]) => (
          <li key={r} className={`flex justify-between ${hit === r ? "text-green-400 font-semibold" : "text-white"}`}>
            <span>{HandRank[r]}</span>
            <span>{pay}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
