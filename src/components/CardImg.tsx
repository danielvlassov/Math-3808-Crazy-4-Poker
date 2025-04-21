import { Card } from "../core/Card";

interface CardImgProps {
  card?: Card;
  faceDown?: boolean;
  placeholder?: boolean;
  className?: string;
}

export default function CardImg({ card, faceDown = false, placeholder = false}: CardImgProps) {
  // Ghost
  if (placeholder) {
    return (
      <svg width={80} height={120} className="rounded-lg border-2 border-gray-500 bg-white/20">
        <rect width="100%" height="100%" rx="8" ry="8" fill="white" />
      </svg>
    );
  }

  // Face‑down card back
  if (faceDown) {
    return (
      <svg width={80} height={120} className="rounded-lg shadow-inner">
        <rect width="100%" height="100%" rx="8" ry="8" fill="#d22" />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="40"
          fontFamily="serif"
          fill="white"
        >
          ♦
        </text>
      </svg>
    );
  }

  // Face‑up card
  return (
    <svg width={80} height={120} className="rounded-lg border-2 border-black bg-white shadow-md">
      <rect width="100%" height="100%" rx="8" ry="8" fill="white" />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="36"
        fontFamily="serif"
        fill={card?.color === "red" ? "#d22" : "#000"}
      >
        {card?.label}
      </text>
    </svg>
  );
}