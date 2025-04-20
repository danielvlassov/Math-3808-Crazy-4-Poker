import React, { useState, useCallback } from "react";
import { Game, RoundResult } from "./core/Game";
import { evaluateBest4of5 } from "./core/HandEvaluator";
import { HandRank } from "./core/HandRank";
import { Rank } from "./core/Card";
import Table from "./components/Table";
import BetPanel from "./components/BetPanel";
import OddsSidebar from "./components/OddsSidebar";
import seedrandom from "seedrandom";

interface Bets {
  ante: number;
  queensUp: number;
  play: number;
}

export default function App() {
  const [game] = useState(() => new Game());
  const [, force] = useState(0);
  const [phase, setPhase] = useState<"ready" | "dealt" | "result">("ready");
  const [bets, setBets] = useState<Bets>({ ante: 25, queensUp: 25, play: 0 });
  const [bankroll, setBankroll] = useState(1000);
  const [playerRank, setPlayerRank] = useState<HandRank | null>(null);
  const [adminPeek, setAdminPeek] = useState(false);
  const rerender = useCallback(() => force((x) => x + 1), []);
  const [result, setResult] = useState<RoundResult | null>(null);


  const canTriple: boolean =
    phase === "dealt" &&
    (() => {
      const evalRes = evaluateBest4of5(game.players[0].hand);
      if (evalRes.rank > HandRank.Pair) return true;
      if (evalRes.rank === HandRank.Pair) {
        // count suits to detect the pair rank
        const counts: Record<number, number> = {};
        evalRes.ranks.forEach(r => counts[r] = (counts[r] || 0) + 1);
        const pairRank = Number(Object.entries(counts).find(([, c]) => c === 2)?.[0]);
        return pairRank === Rank.Ace;
      }
      return false;
    })();

  const deal = () => {
    game.shuffle(seedrandom());
    game.dealHands();
    setPlayerRank(evaluateBest4of5(game.players[0].hand).rank);
    setBets((b) => ({ ...b, play: b.ante }));
    setPhase("dealt");
    rerender();
  };

  const play = () => {
    const res = game.settleRound({ ante: bets.ante, queensUp: bets.queensUp, play: bets.play });
    setResult(res);
    setBankroll(b => b + res.delta);
    setPhase("result");
  };

  const fold = () => {
    const res = game.settleRound({ ante: bets.ante, queensUp: bets.queensUp, play: 0 });
    setResult(res);
    setBankroll(b => b + res.delta);
    setPhase("result");
  };

  const redeal = () => {
    game.players.forEach((p) => (p.hand.length = 0));
    setPhase("ready");
    rerender();
  };

  const tripleDown = () => {
    const tripleAmt = bets.ante * 3;
    // update the UI so Play shows 3×Ante
    setBets(b => ({ ...b, play: tripleAmt }));
    // resolve the round with play = 3×Ante
    const res = game.settleRound({
      ante: bets.ante,
      queensUp: bets.queensUp,
      play: tripleAmt,
    });
    setResult(res);
    setBankroll(b => b + res.delta);
    setPhase("result");
  };


  return (
    <main className="min-h-screen flex flex-col items-center bg-gradient-to-b from-green-900 to-black text-white p-6">
      <h1 className="text-5xl font-bold mb-4 tracking-wide">Crazy 4 Poker</h1>

      <div className="flex items-center gap-4 text-2xl font-mono mb-6">
        Bankroll: ${bankroll}
        <button onClick={() => setBankroll((b) => b + 500)} className="bg-white text-black px-3 py-1 rounded shadow">
          +500
        </button>
        <label className="flex items-center gap-2 text-sm ml-4">
          <input type="checkbox" checked={adminPeek} onChange={(e) => setAdminPeek(e.target.checked)} /> Admin Mode
        </label>
      </div>
      <div className="flex items-center gap-4 mb-4">
        {adminPeek && (
          <div className="text-xs bg-black/40 px-2 py-1 rounded">
        Admin Mode: dealer cards & hand rank visible.
          </div>
        )}
        <div className="text-xs bg-black/40 px-2 py-1 rounded">
          Dealer qualifies with King High. Best 4 of 5 cards play.
        </div>
      </div>

      <div className="flex w-full max-w-7xl mx-auto justify-center gap-10">
        <OddsSidebar rank={phase === "result" ? playerRank : null} />
        <div className="flex-1 flex flex-col items-center gap-8">
          <Table game={game} hideDealer={phase === "dealt" && !adminPeek} showRanks={phase !== "ready"} showDealerRank={phase === "result" || adminPeek} />
          {phase === "result" && result ? (
            // Result breakdown table
            <div className="flex flex-col items-center gap-6">

              <div className="bg-black/40 p-4 rounded-lg max-w-md w-full">
                <pre className="whitespace-pre-wrap text-xl font-mono text-center">
                {result.summary.split("\n")[0]}
                </pre>
              </div>

              <div className="bg-black/40 p-6 rounded-lg max-w-md w-full">
                <table className="w-full table-auto text-2xl border-collapse">
                  <thead>
                    <tr className="bg-gray-800">
                      <th className="px-4 py-2">Bet</th>
                      <th className="px-4 py-2">Result</th>
                      <th className="px-4 py-2">P/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {([
                      ["Ante", result.breakdown.ante],
                      ["Play", result.breakdown.play],
                      ["Super Bonus", result.breakdown.superBonus],
                      ["Queens Up", result.breakdown.queensUp],
                    ] as [string, number][]).map(([label, pl]) => {
                      const color =
                        pl > 0 ? "text-green-400" :
                          pl < 0 ? "text-red-400" :
                            "text-gray-400";
                      const status = pl > 0 ? "Win" : pl < 0 ? "Lose" : "Push";
                      return (
                        <tr key={label} className="even:bg-gray-900">
                          <td className="border-t border-gray-700 px-4 py-2">{label}</td>
                          <td className="border-t border-gray-700 px-4 py-2">{status}</td>
                          <td className={`border-t border-gray-700 px-4 py-2 font-mono ${color}`}>
                            {pl > 0 ? `+${pl}` : pl}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-800">
                      <td className="px-4 py-2 font-bold text-3xl">Net</td>
                      <td></td>
                      <td className={`px-4 py-2 font-bold text-3xl ${result.delta > 0 ? "text-green-300" :
                        result.delta < 0 ? "text-red-300" :
                          "text-gray-300"
                        }`}>
                        {result.delta > 0 ? `+${result.delta}` : result.delta}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <button
                onClick={redeal}
                className="mt-4 px-10 py-4 bg-yellow-500 text-black rounded-lg text-3xl shadow-md hover:bg-yellow-600"
              >
                Redeal
              </button>
            </div>
          ) : (
            <BetPanel phase={phase === "ready" ? "ready" : "dealt"} bets={bets} setBets={setBets} onDeal={deal} onPlay={play} onFold={fold} onTriple={tripleDown} canTriple={canTriple} />
          )}
        </div>
      </div>
    </main>
  );
}
