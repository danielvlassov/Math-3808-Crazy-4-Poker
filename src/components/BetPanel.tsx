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
    <Card className="relative bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-2xl ring-2 ring-yellow-400 w-full max-w-lg transform hover:scale-102 transition">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-serif tracking-wider text-yellow-300 animate-pulse drop-shadow-lg">
          🎲 PLACE YOUR BETS 🎲
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-8 pb-8">
        {/* chips */}
        <div className="grid grid-cols-3 gap-6 items-end">
          {(
            [
              ["Ante", "ante"],
              ["Super Bonus", "ante"],
              ["Queens Up", "queensUp"],
            ] as const
          ).map(([label, key]) => (
            <div
              key={label}
              className="flex flex-col items-center space-y-2"
            >
              <div className="text-xl font-bold uppercase">{label}</div>
              <div className="relative">
                <Input
                  type="number"
                  value={bets[key] as number}
                  disabled={lock || label === "Super Bonus"}
                  min={0}
                  onChange={e =>
                    setBets({ ...bets, [key]: +e.target.value })
                  }
                  className="w-28 h-14 text-2xl text-center font-mono border-4 border-yellow-400 bg-gray-700 text-white hover:border-yellow-300 transition"
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-300 text-2xl">
                  $
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* action buttons */}
        <div className="flex flex-wrap justify-center gap-6">
          {phase === "ready" ? (
            <Button
              size="lg"
              className={`px-16 py-4 text-2xl font-bold uppercase tracking-wider 
                ${disableDeal ? "bg-gray-600 cursor-not-allowed" : "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 shadow-lg"}
              }`}
              onClick={onDeal}
              disabled={disableDeal}
            >
              DEAL
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="lg"
                className="px-12 py-4 text-2xl font-bold bg-green-500 hover:bg-green-600 shadow-lg uppercase tracking-wide"
                onClick={onPlay}
              >
                PLAY ${bets.play}
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="px-12 py-4 text-2xl font-bold bg-red-600 hover:bg-red-700 shadow-lg uppercase tracking-wide"
                onClick={onFold}
              >
                FOLD
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onTriple}
                disabled={!canTriple}
                className={`px-12 py-4 text-2xl font-bold uppercase tracking-wide shadow-lg transition 
                  ${canTriple
                    ? "bg-purple-600 text-white hover:bg-purple-700 animate-pulse"
                    : "border-4 border-purple-600 text-gray-500 cursor-not-allowed opacity-50"
                  }`}
              >
                Triple Down{canTriple ? ` $${bets.play * 3}` : ""}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/*
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
  */
