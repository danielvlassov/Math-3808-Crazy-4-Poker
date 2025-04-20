import { Game } from "../core/Game";
import CardImg from "./CardImg";
import { evaluateBest4of5 } from "../core/HandEvaluator";
import { HandRank } from "../core/HandRank";
import { Rank } from "../core/Card";

interface Props {
  game: Game;
  hideDealer: boolean;
  showRanks: boolean;
  showDealerRank: boolean;
}

const rankLabel: Record<HandRank, string> = {
  [HandRank.HighCard]: "High Card",
  [HandRank.Pair]: "Pair",
  [HandRank.TwoPair]: "Two Pair",
  [HandRank.ThreeKind]: "Three of a Kind",
  [HandRank.Straight]: "Straight",
  [HandRank.Flush]: "Flush",
  [HandRank.StraightFlush]: "Straight Flush",
  [HandRank.FourKind]: "Four of a Kind",
  [HandRank.FourAces]: "Four Aces",
};

export default function Table({ game, hideDealer, showRanks, showDealerRank }: Props) {
  // Always render 5 slots per hand, dealer first
  const order: (0 | 1)[] = [1, 0];

  return (
    <div className="w-full max-w-5xl bg-green-800 rounded-2xl p-8 shadow-inner flex flex-col gap-8">
      {order.map((idx) => {
        const player = game.players[idx];
        // Determine evaluation only when 5 cards dealt
        const isComplete = player.hand.length === 5;
        const evalRes = isComplete ? evaluateBest4of5(player.hand) : null;
        // Show rank for player vs dealer
        const showRank = idx === 0 ? showRanks : showDealerRank;

        return (
          <div key={idx} className="flex flex-col items-center gap-2">
            <span className="text-yellow-200 text-xl font-semibold uppercase">
              {idx === 1 ? "Dealer" : "You"}
            </span>
            <div className="flex gap-6 justify-center">
              {Array.from({ length: 5 }).map((_, i) => {
                const card = player.hand[i];
                if (!card) {
                  // Ghost placeholder before dealing
                  return <CardImg key={i} placeholder />;
                }
                // Face-down for dealer during play
                const faceDown = idx === 1 && hideDealer;
                return <CardImg key={i} card={card} faceDown={faceDown} />;
              })}
            </div>
            {showRank && isComplete && evalRes && (
              <span className="text-white text-lg font-mono">
                {evalRes.rank === HandRank.HighCard
                  ? `${Rank[evalRes.ranks[0]]} High`
                  : evalRes.rank === HandRank.Pair
                  ? (() => {
                      // find the paired rank
                      const counts: Record<number,number> = {};
                      evalRes.ranks.forEach(r => counts[r] = (counts[r]||0) + 1);
                      // const pairRank = Number(Object.keys(counts).find(r => counts[+r] === 2)); old
                      return `Pair of ${Rank[evalRes.ranks[0]]}s`;
                    })()
                  : rankLabel[evalRes.rank]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
