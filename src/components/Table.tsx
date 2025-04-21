
import React, { useMemo } from "react";
import { Game } from "../core/Game";
import { Card } from "../core/Card";
import CardImg from "./CardImg";
import { safeEvaluateBest4of5 } from "../core/HandEvaluator";
import { HandRank } from "../core/HandRank";
import { Rank } from "../core/Card";
import { PlayingCard } from "./CardPicker";

interface Props {
  game: Game;
  hideDealer: boolean;
  showRanks: boolean;
  showDealerRank: boolean;

  deterministic: boolean;
  customCards: Record<string, PlayingCard>;
  onPickPlaceholder: (playerIdx: 0 | 1, slotIdx: number) => void;
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

export default function Table({
  game,
  hideDealer,
  showRanks,
  showDealerRank,
  deterministic,
  customCards,
  onPickPlaceholder,
}: Props) {
  // dealer (1) above player (0)
  const rows = [1, 0] as const;

  return (
    <div className="w-full max-w-5xl bg-green-800 rounded-2xl p-8 shadow-inner flex flex-col gap-8 mx-auto">
      {rows.map((playerIdx) => {
        const player = game.players[playerIdx];
        const isComplete = player.hand.length === 5;

        // memoize evaluation so it only runs when hand really changes
        const evalRes = useMemo(
          () => (isComplete ? safeEvaluateBest4of5(player.hand) : null),
          [isComplete, player.hand]
        );

        const showRank = playerIdx === 0 ? showRanks : showDealerRank;

        return (
          <div key={playerIdx} className="flex flex-col items-center gap-2">
            <span className="text-yellow-200 text-xl font-semibold uppercase">
              {playerIdx === 1 ? "Dealer" : "You"}
            </span>

            <div className="flex gap-6 justify-center">
              {Array.from({ length: 5 }).map((_, slotIdx) => {
                const dealtCard = player.hand[slotIdx];
                const faceDown = playerIdx === 1 && hideDealer;
                const key = `${playerIdx}-${slotIdx}`;

                // Already dealt? show it (face‑down if dealer)
                if (dealtCard) {
                  return (
                    <CardImg
                      key={key}
                      card={dealtCard}
                      faceDown={faceDown}
                    />
                  );
                }

                // Deterministic mode: show chosen or “?”
                if (deterministic) {
                  const custom = customCards[key];
                  return (
                    <div
                      key={key}
                      onClick={() => onPickPlaceholder(playerIdx, slotIdx)}
                      className={
                        "w-16 h-24 flex items-center justify-center rounded-lg border-2 " +
                        (custom
                          ? "border-white"
                          : "border-yellow-400 hover:border-yellow-200 cursor-pointer")
                      }
                    >
                      {custom ? (
                        // wrap in real Card so CardImg.label/color work
                        <CardImg
                          card={new Card(custom.suit, custom.rank)}
                        />
                      ) : (
                        <span className="text-yellow-400 text-2xl">?</span>
                      )}
                    </div>
                  );
                }

                // Ghost placeholder
                return <CardImg key={key} placeholder />;
              })}
            </div>

            {showRank && isComplete && evalRes && (
              <span className="text-white text-lg font-mono">
                {evalRes.rank === HandRank.HighCard
                  ? `${Rank[evalRes.ranks[0]]} High`
                  : evalRes.rank === HandRank.Pair
                    ? `Pair of ${Rank[evalRes.ranks[0]]}s`
                    : rankLabel[evalRes.rank]}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
