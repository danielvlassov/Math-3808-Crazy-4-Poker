export enum Suit {
    Clubs    = '♣',
    Spades   = '♠',
    Hearts   = '♥',
    Diamonds = '♦',
  }
  
  export enum Rank {
    Two   = 2,
    Three = 3,
    Four  = 4,
    Five  = 5,
    Six   = 6,
    Seven = 7,
    Eight = 8,
    Nine  = 9,
    Ten   = 10,
    Jack  = 11,
    Queen = 12,
    King  = 13,
    Ace   = 14,
  }
  
  export class Card {
    readonly suit: Suit;
    readonly rank: Rank;
  
    constructor(suit: Suit, rank: Rank) {
      this.suit = suit;
      this.rank = rank;
      Object.freeze(this);
    }
  
    get label(): string {
      const faces: Record<Rank, string> = {
        [Rank.Jack]: 'J',
        [Rank.Queen]: 'Q',
        [Rank.King]: 'K',
        [Rank.Ace]: 'A',
      } as Partial<Record<Rank, string>> as Record<Rank, string>;
  
      return `${faces[this.rank] ?? this.rank}${this.suit}`;
    }
  
    get color(): 'red' | 'black' {
      return this.suit === Suit.Hearts || this.suit === Suit.Diamonds
        ? 'red'
        : 'black';
    }
  
    toString(): string { return this.label; }
    toJSON(): string   { return this.label; }
  
  
    static readonly FULL_DECK: readonly Card[] = (() => {
      const deck: Card[] = [];
      for (const s of Object.values(Suit))
        for (let r = Rank.Two; r <= Rank.Ace; r++)
          deck.push(new Card(s as Suit, r as Rank));
      return deck;
    })();

    static shuffled(rng: () => number = Math.random): Card[] {
      const a = [...Card.FULL_DECK];
      for (let i = a.length - 1; i > 0; --i) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
  }