import React, { useState, useCallback } from "react";
import { Game, RoundResult } from "./core/Game";
import { evaluateBest4of5 } from "./core/HandEvaluator";
import { HandRank } from "./core/HandRank";
import { Rank } from "./core/Card";
import Table from "./components/Table";
import BetPanel from "./components/BetPanel";
import OddsSidebar from "./components/OddsSidebar";
import seedrandom from "seedrandom";

export default function App() {
  const [game] = useState(() => new Game());
  const [, force] = useState(0);
  const [phase, setPhase] = useState<"ready" | "dealt" | "result">("ready");
  const [bets, setBets] = useState({ ante: 25, queensUp: 0, play: 0 });
  const [bankroll, setBankroll] = useState(1000);
  const [summary, setSummary] = useState("Place your bets and hit Deal!");
  const [playerRank, setPlayerRank] = useState<HandRank | null>(null);
  const [adminPeek, setAdminPeek] = useState(false);
  const rerender = useCallback(() => force((x) => x + 1), []);

  const deal = () => {
    game.shuffle(seedrandom());
    game.dealHands();
    setPlayerRank(evaluateBest4of5(game.players[0].hand).rank);
    setBets((b) => ({ ...b, play: b.ante }));
    setPhase("dealt");
    setSummary("Decide: Play, Fold, or Triple‑Down.");
    rerender();
  };

  const play = () => {
    const res: RoundResult = game.settleRound({ ante: bets.ante, queensUp: bets.queensUp });
    setSummary(`${res.summary}\nNet ${res.delta >= 0 ? "+" : ""}${res.delta}`);
    setBankroll((b) => b + res.delta);
    setPhase("result");
  };

  const fold = () => {
    setSummary("Hand folded. Ante & Super Bonus lost.");
    setBankroll((b) => b - bets.ante);
    setPhase("result");
  };

  const redeal = () => {
    game.players.forEach((p) => (p.hand.length = 0));
    setPhase("ready");
    setSummary("Place your bets and hit Deal!");
    rerender();
  };

  const tripleDown = () => {
    setBets((b) => ({ ...b, play: b.ante * 3 }));
    const res: RoundResult = game.settleRound({ ante: bets.ante, queensUp: bets.queensUp});
    setSummary(`${res.summary}\nNet ${res.delta >= 0 ? "+" : ""}${res.delta}`);
    setBankroll((b) => b + res.delta);
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
      {adminPeek && (
        <div className="text-xs bg-black/40 px-2 py-1 rounded mb-4">
          Admin Mode: dealer cards & hand rank visible.
        </div>
      )}

      <div className="flex w-full max-w-7xl mx-auto justify-center gap-10">
        <OddsSidebar rank={phase === "result" ? playerRank : null} />
        <div className="flex-1 flex flex-col items-center gap-8">
          <Table game={game} hideDealer={phase === "dealt" && !adminPeek} showRanks={phase !== "ready"} showDealerRank={phase === "result" || adminPeek} />
          {phase === "result" ? (
            <div className="flex flex-col items-center gap-6 max-w-md text-center">
              <pre className="whitespace-pre-wrap text-lg font-mono bg-black/40 p-4 rounded-lg">{summary}</pre>
              <button onClick={redeal} className="px-8 py-4 bg-yellow-500 text-black rounded-lg text-2xl shadow-md hover:bg-yellow-600">
                Redeal
              </button>
            </div>
          ) : (
            <BetPanel phase={phase === "ready" ? "ready" : "dealt"} bets={bets} setBets={setBets} onDeal={deal} onPlay={play} onFold={fold} onTriple={tripleDown} canTriple={phase === "dealt" && (() => { const evalRes = evaluateBest4of5(game.players[0].hand); return ( evalRes.rank > HandRank.Pair || (evalRes.rank === HandRank.Pair && evalRes.ranks[1] === Rank.Ace) ); })() } />
          )}
        </div>
      </div>
    </main>
  );
}
