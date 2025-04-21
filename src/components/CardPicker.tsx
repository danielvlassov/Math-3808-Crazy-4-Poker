import { Card, Suit, Rank } from "../core/Card";
import CardImg from "./CardImg";

export interface PlayingCard {
    suit: Suit;
    rank: Rank;
}

interface Props {
    existing: PlayingCard[]; // cards already in use
    onSelect: (c: PlayingCard) => void;
    onClose: () => void;
}

const ALL_CARDS: PlayingCard[] = [];
for (let r = Rank.Two; r <= Rank.Ace; r++) {
    for (const s of Object.values(Suit)) {
        ALL_CARDS.push({ suit: s, rank: r as Rank });
    }
}

export default function CardPicker({ existing, onSelect, onClose }: Props) {
    const used = new Set(existing.map(c => `${c.suit}-${c.rank}`));
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="relative bg-white p-4 rounded-lg w-[90vw] max-w-lg max-h-[85vh]">
            {/* Cancel button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-white bg-red-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
            >
              ✕
            </button>
    
            <h2 className="text-2xl mb-4 text-center">Choose a Card</h2>
    
            {/* 4x13 grid */}
            <div className="grid grid-cols-4 gap-2 overflow-auto max-h-[70vh] pb-2">
              {ALL_CARDS.map(c => {
                const id = `${c.suit}-${c.rank}`;
                const taken = used.has(id);
                return (
                  <button
                    key={id}
                    disabled={taken}
                    onClick={() => !taken && onSelect(c)}
                    className={`p-1 ${taken
                      ? "opacity-30 cursor-not-allowed"
                      : "hover:opacity-80 cursor-pointer"
                    }`}
                  >
                    <CardImg
                      card={new Card(c.suit, c.rank)}
                      className="w-16 h-24"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }