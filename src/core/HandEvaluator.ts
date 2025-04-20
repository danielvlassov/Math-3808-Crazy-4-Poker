import { Card, Rank } from "./Card";
import { HandRank } from "./HandRank";

export interface EvalResult {
  rank: HandRank;
  ranks: number[]; // tiebreak t‑high → low
}

export function evaluateBest4of5(cards: Card[]): EvalResult {
  if (cards.length !== 5) throw new Error("Hand must have 5 cards");
  let best: EvalResult | null = null;
  for (let cut = 0; cut < 5; cut++) {
    const candidate = cards.filter((_, i) => i !== cut);
    const res = eval4(candidate);
    if (!best || compare(res, best) > 0) best = res;
  }
  return best!;
}

function eval4(cs: Card[]): EvalResult {
  const rs = cs.map(c => c.rank).sort((a, b) => b - a);
  const suits = new Set(cs.map(c => c.suit));
  const counts: Record<number, number> = {};
  rs.forEach(r => (counts[r] = (counts[r] ?? 0) + 1));
  const groups = Object.values(counts).sort((a, b) => b - a);

  const isFlush = suits.size === 1;
  const isStraight = rs.every((r, i) => i === 0 || r === rs[i - 1] - 1);

  // Four‑kind
  if (groups[0] === 4) {
    const quadRank = +Object.keys(counts).find(k => counts[+k] === 4)!;
    return {
      rank: quadRank === Rank.Ace ? HandRank.FourAces : HandRank.FourKind,
      ranks: [quadRank],
    };
  }
  // Straight‑flush
  if (isStraight && isFlush) return { rank: HandRank.StraightFlush, ranks: rs };
  // Three‑kind
  if (groups[0] === 3) return { rank: HandRank.ThreeKind, ranks: rs };
  // Two‑pair
  if (Object.keys(counts).length === 2) return { rank: HandRank.TwoPair, ranks: rs };
  // Pair
  if (Object.keys(counts).length === 3) return { rank: HandRank.Pair, ranks: rs };
  // Flush
  if (isFlush) return { rank: HandRank.Flush, ranks: rs };
  // Straight
  if (isStraight) return { rank: HandRank.Straight, ranks: rs };
  // High card
  return { rank: HandRank.HighCard, ranks: rs };
}

function compare(a: EvalResult, b: EvalResult): number {
  if (a.rank !== b.rank) return a.rank - b.rank;
  for (let i = 0; i < a.ranks.length; i++) {
    if (a.ranks[i] !== b.ranks[i]) return a.ranks[i] - b.ranks[i];
  }
  return 0;
}

export function beats(a: EvalResult, b: EvalResult): number {
  return compare(a, b);
}