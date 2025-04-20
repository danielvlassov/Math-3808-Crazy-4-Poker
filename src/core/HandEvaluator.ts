import { Card, Rank } from "./Card";
import { HandRank } from "./HandRank";

export interface EvalResult {
  rank: HandRank;
  /* tiebreakers: in descending importance */
  ranks: number[];
}

export function safeEvaluateBest4of5(cards: Card[]): EvalResult | null {
  if (cards.length !== 5) return null;
  try {
    return evaluateBest4of5(cards);
  } catch {
    return null;
  }
}

export function evaluateBest4of5(cards: Card[]): EvalResult {
  if (cards.length !== 5) throw new Error("Hand must have 5 cards");
  let best: EvalResult | null = null;
  for (let cut = 0; cut < 5; cut++) {
    const hand4 = cards.filter((_, i) => i !== cut);
    const res  = eval4(hand4);
    if (!best || compare(res, best) > 0) best = res;
  }
  return best!;
}

function eval4(cs: Card[]): EvalResult {
  // sort ranks descending
  const rs = cs.map(c => c.rank).sort((a, b) => b - a);
  const suits = new Set(cs.map(c => c.suit));

  // count frequencies
  const counts: Record<number, number> = {};
  rs.forEach(r => (counts[r] = (counts[r] ?? 0) + 1));
  const freqs = Object.values(counts).sort((a, b) => b - a);

  const isFlush    = suits.size === 1;
  const isStraight = rs.every((r, i) => i === 0 || r === rs[i - 1] - 1);

  // 4OAK
  if (freqs[0] === 4) {
    const quadRank = Number(Object.keys(counts).find(k => counts[+k] === 4)!);
    return {
      rank: quadRank === Rank.Ace ? HandRank.FourAces : HandRank.FourKind,
      ranks: [quadRank],
    };
  }

  // Straight
  if (isStraight && isFlush) {
    // ranks[0] is the high‐card of the straight
    return { rank: HandRank.StraightFlush, ranks: [rs[0]] };
  }

  // 3OAK
  if (freqs[0] === 3) {
    const threeRank = Number(Object.keys(counts).find(k => counts[+k] === 3)!);
    // collect kickers
    const kickers = Object.entries(counts)
      .filter(([, c]) => c === 1)
      .map(([r]) => Number(r))
      .sort((a, b) => b - a);
    return { rank: HandRank.ThreeKind, ranks: [threeRank, ...kickers] };
  }

  // Two Pair
  if (Object.keys(counts).length === 2) {
    // exactly two distinct ranks => either four‐kind (handled above) or two‐pair
    const pairRanks = Object.entries(counts)
      .filter(([, c]) => c === 2)
      .map(([r]) => Number(r))
      .sort((a, b) => b - a);
    // the singleton kicker
    const kicker = Number(Object.entries(counts).find(([, c]) => c === 1)![0]);
    return { rank: HandRank.TwoPair, ranks: [...pairRanks, kicker] };
  }

  // Pair
  if (Object.keys(counts).length === 3) {
    // exactly one pair
    const pairRank = Number(Object.entries(counts).find(([, c]) => c === 2)![0]);
    const kickers = Object.entries(counts)
      .filter(([, c]) => c === 1)
      .map(([r]) => Number(r))
      .sort((a, b) => b - a);
    return { rank: HandRank.Pair, ranks: [pairRank, ...kickers] };
  }

  // Flush
  if (isFlush) {
    // tiebreak on all four ranks highest to lowest
    return { rank: HandRank.Flush, ranks: rs };
  }

  // Straight
  if (isStraight) {
    return { rank: HandRank.Straight, ranks: [rs[0]] };
  }

  // High Card
  return { rank: HandRank.HighCard, ranks: rs };
}

// Compare a vs b: positive then a wins, negative then b wins
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