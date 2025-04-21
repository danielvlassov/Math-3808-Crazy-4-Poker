import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Props {
  phase: "ready" | "dealt";
  bets: { ante: number; queensUp: number; play: number };
  setBets: (b: Props["bets"]) => void;
  onDeal: () => void;
  onPlay: () => void;
  onFold: () => void;
  onTriple: () => void;
  canTriple: boolean;
  disableDeal?: boolean;
}

export default function BetPanel({ phase, bets, setBets, onDeal, onPlay, onFold, onTriple, canTriple, disableDeal = false }: Props) {
  const lock = phase !== "ready";
  return (
    <Card className="relative bg-white text-black shadow-2xl w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-4xl font-serif tracking-wider">PLACE YOUR BETS</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-8 pb-8">
        {/* chips */}
        <div className="grid grid-cols-3 gap-4 items-end">
          {(
            [
              ["Ante", "ante"],
              ["Super Bonus", "ante"],
              ["Queens Up", "queensUp"],
            ] as const
          ).map(([label, key]) => (
            <ChipInput
              key={label}
              label={label}
              amount={bets[key] as number}
              disabled={lock || (label === "Super Bonus")}
              onChange={val => setBets({ ...bets, [key]: val })}
            />
          ))}
        </div>

        {/* action buttons */}
        <div className="flex flex-wrap justify-center gap-6">
          {phase === "ready" ? (
            <Button
              size="lg"
              className="px-12 text-xl"
              onClick={onDeal}
              disabled={disableDeal}
            >
              Deal
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="lg"
                className="px-10 text-xl bg-green-600 text-white hover:bg-green-700"
                onClick={onPlay}
              >
                Play ${bets.play}
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="px-10 text-xl hover:bg-red-700"
                onClick={onFold}
              >
                Fold
              </Button>
              <Button
                variant="outline"
                size="lg"
                className={
                  canTriple
                    ? "px-10 text-xl bg-purple-600 text-white animate-pulse"
                    : "px-10 text-xl opacity-50 cursor-not-allowed"
                }
                onClick={onTriple}
                disabled={!canTriple}
              >
                Triple Down{canTriple ? ` $${bets.play * 3}` : ""}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ChipInput({ label, amount, onChange, disabled }: { label: string; amount: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-col gap-1 items-center">
      <span className="text-lg font-bold">{label}</span>
      <Input
        type="number"
        className="w-24 h-12 text-2xl text-center font-mono border-2 border-black disabled:opacity-40"
        value={amount}
        disabled={disabled}
        min={0}
        onChange={e => onChange(+e.target.value)}
      />
    </div>
  );
}