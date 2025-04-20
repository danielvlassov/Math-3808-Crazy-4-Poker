import { Card, Rank } from "./Card";
import { Player } from "./Player";
import { evaluateBest4of5, beats } from "./HandEvaluator";
import { HandRank } from "./HandRank";

export interface RoundResult {
  summary: string;
  delta: number; // net bankroll change
  breakdown: {
    ante: number;
    play: number;
    superBonus: number;
    queensUp: number;
  };
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

  settleRound(bets: { ante: number; queensUp: number; play: number }): RoundResult {
    const [player, dealer] = this.players;
    const pEval = evaluateBest4of5(player.hand);
    const dEval = evaluateBest4of5(dealer.hand);
    const dealerQualifies = dEval.rank > HandRank.HighCard || (dEval.rank === HandRank.HighCard && dEval.ranks[0] >= Rank.King);

    const diff = beats(pEval, dEval);
    const playerBeats = diff > 0;
    const playerTies = diff === 0;

    const ante = bets.ante;
    const playStake = bets.play;
    const quStake = bets.queensUp;

    // Ante P/L
    let antePL: number;
    if (!dealerQualifies) antePL = 0; // push
    else if (playerBeats) antePL = ante; // win
    else if (playerTies) antePL = 0; // push on tie
    else antePL = -ante; // lose

    // Play P/L
    let playPL: number;
    if (!dealerQualifies) playPL = playStake; // win on no‑open
    else if (playerBeats) playPL = playStake; // win
    else if (playerTies) playPL = 0; // push
    else playPL = -playStake; // lose

    // Super Bonus P/L
    const sbStake = playStake;
    const sbHigh = pEval.rank >= HandRank.Straight;
    let sbPL: number;
    if (sbHigh) sbPL = sbStake * superBonusTable[pEval.rank];
    else if (!dealerQualifies) sbPL = 0; // push
    else if (!playerBeats) sbPL = -sbStake; // loss only when lose & < straight
    else sbPL = 0; // push on win/tie when < straight

    // Queens Up P/L (independent)
    const queensQualify =
      pEval.rank > HandRank.Pair ||
      (
        pEval.rank === HandRank.Pair &&
        pEval.ranks[0] >= Rank.Queen
      );
    const quPL = queensQualify
      ? quStake * queensUpTable[pEval.rank]!
      : -quStake;

    const delta = antePL + playPL + sbPL + quPL;

    const summaryLines = [
      dealerQualifies
        ? playerBeats
          ? "Dealer qualifies but loses."
          : playerTies
            ? "Dealer qualifies and ties."
            : "Dealer qualifies and wins."
        : "Dealer does not qualify.",
      `Ante: ${antePL > 0 ? "Win" : antePL < 0 ? "Lose" : "Push"} ${antePL >= 0 ? "+" + antePL : antePL}`,
      `Play: ${playPL > 0 ? "Win" : playPL < 0 ? "Lose" : "Push"} ${playPL >= 0 ? "+" + playPL : playPL}`,
      `Super Bonus: ${sbPL > 0 ? "Win" : sbPL < 0 ? "Lose" : "Push"} ${sbPL >= 0 ? "+" + sbPL : sbPL}`,
      `Queens Up: ${quPL > 0 ? "Win" : quPL < 0 ? "Lose" : "Push"} ${quPL >= 0 ? "+" + quPL : quPL}`,
    ];

    return {
      summary: summaryLines.join("\n"), delta, breakdown: {
        ante: antePL,
        play: playPL,
        superBonus: sbPL,
        queensUp: quPL,
      },
    };
  }
}


// Payout tables
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
