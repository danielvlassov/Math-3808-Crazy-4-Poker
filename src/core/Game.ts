import { Card, Rank } from "./Card";
import { Player } from "./Player";
import { evaluateBest4of5, beats } from "./HandEvaluator";
import { HandRank } from "./HandRank";

export interface RoundResult {
  summary: string;
  delta: number; // net bankroll change
}

export class Game {
  private deck: Card[] = [];
  readonly players = [new Player(0), new Player(1)];

  shuffle(rng: () => number = Math.random) {
    this.deck = Card.shuffled(rng);
  }

  dealHands() {
    this.players.forEach(p => (p.hand.length = 0));
    for (let i = 0; i < 5; i++) this.players.forEach(p => p.add(this.deck.pop()!));
  }

  settleRound(bets: { ante: number; queensUp: number }): RoundResult {
    const [player, dealer] = this.players;
    const pEval = evaluateBest4of5(player.hand);
    const dEval = evaluateBest4of5(dealer.hand);
    const dealerQualifies = dEval.rank > HandRank.HighCard || (dEval.rank === HandRank.HighCard && dEval.ranks[0] >= Rank.King);

    let summary = "";
    let delta = 0;

    // --- Ante & Play
    const playBet = bets.ante; // 1× ante (no triple‑down yet)
    if (!dealerQualifies) {
      summary += "Dealer does not qualify – ante returned.";
    } else if (beats(pEval, dEval) > 0) {
      summary += "Player wins ante & play.";
      delta += bets.ante + playBet;
    } else {
      summary += "Dealer wins – lose ante & play.";
      delta -= bets.ante + playBet;
    }

    // --- Side bets
    delta += applySideBet("Super Bonus", bets.ante, pEval.rank, superBonusTable, summary);
    delta += applySideBet("Queens Up", bets.queensUp, pEval.rank, queensUpTable, summary);

    return { summary: summary.trim(), delta };
  }
}

function applySideBet(
  label: string,
  stake: number,
  rank: HandRank,
  table: Record<HandRank, number>,
  summary: string
): number {
  if (!stake) return 0;
  const mult = table[rank] ?? 0;
  if (mult === 0) {
    summary += `${label} loses.
`;
    return -stake;
  }
  const win = stake * mult;
  summary += `${label} pays ${mult}:1 = $${win}.
`;
  return win;
}

// --- Payout tables
const superBonusTable: Record<HandRank, number> = {
  [HandRank.HighCard]: 0,
  [HandRank.Pair]: 0,
  [HandRank.TwoPair]: 0,
  [HandRank.ThreeKind]: 2,
  [HandRank.Straight]: 1,
  [HandRank.Flush]: 1.5,
  [HandRank.StraightFlush]: 15,
  [HandRank.FourKind]: 30,
  [HandRank.FourAces]: 200,
};

const queensUpTable: Record<HandRank, number> = {
  [HandRank.HighCard]: 0,
  [HandRank.Pair]: 1, // assumes Queens or better; evaluator handles lower pairs
  [HandRank.TwoPair]: 2,
  [HandRank.ThreeKind]: 8,
  [HandRank.Straight]: 3,
  [HandRank.Flush]: 4,
  [HandRank.StraightFlush]: 40,
  [HandRank.FourKind]: 50,
  [HandRank.FourAces]: 50,
};
