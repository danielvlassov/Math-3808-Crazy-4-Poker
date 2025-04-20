import { Card } from "./Card";

export class Player {
  constructor(public id: number) {}
  readonly hand: Card[] = [];

  // TODO: Change betting states
  balance = 100;
  ante = 0; play = 0; superBonus = 0; queensUp = 0;

  add(card: Card): void { this.hand.push(card); }
}
