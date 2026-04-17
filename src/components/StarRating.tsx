import React from "react";

const TOTAL = 5;

function getStarFill(value: number | null, starIndex: number): "full" | "half" | "empty" {
  if (value === null) return "empty";
  if (value >= starIndex) return "full";
  if (value >= starIndex - 0.5) return "half";
  return "empty";
}

function StarIcon({ fill }: { fill: "full" | "half" | "empty" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-5 h-5 pointer-events-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`half-${fill}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="50%" stopColor={fill === "half" ? "#b45309" : fill === "full" ? "#b45309" : "#d1d5db"} />
          <stop offset="50%" stopColor={fill === "full" ? "#b45309" : "#d1d5db"} />
        </linearGradient>
      </defs>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={
          fill === "full"
            ? "#b45309"
            : fill === "half"
            ? "url(#half-half)"
            : "#d1d5db"
        }
        stroke={fill === "empty" ? "#9ca3af" : "#b45309"}
        strokeWidth="1"
      />
    </svg>
  );
}

interface StarRatingProps {
  value: number | null;
  onChange?: (rating: number | null) => void;
}

export default function StarRating({ value, onChange }: StarRatingProps) {
  const readonly = !onChange;

  if (readonly) {
    if (value === null) return null;
    return (
      <div
        role="img"
        aria-label={`${value} out of 5 stars`}
        className="flex items-center gap-0.5"
      >
        {Array.from({ length: TOTAL }, (_, i) => i + 1).map((star) => (
          <StarIcon key={star} fill={getStarFill(value, star)} />
        ))}
      </div>
    );
  }

  return (
    <div role="group" aria-label="Rating" className="flex items-center gap-2">
      <div className="flex items-center">
        {Array.from({ length: TOTAL }, (_, i) => i + 1).map((star) => (
          <div key={star} className="relative inline-flex w-6 h-6">
            <button
              type="button"
              aria-label={`Rate ${star - 0.5} stars`}
              className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer border-0 bg-transparent p-0 m-0 outline-none focus:outline-none"
              onClick={() => onChange(star - 0.5)}
            />
            <button
              type="button"
              aria-label={`Rate ${star} stars`}
              className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer border-0 bg-transparent p-0 m-0 outline-none focus:outline-none"
              onClick={() => onChange(star)}
            />
            <StarIcon fill={getStarFill(value, star)} />
          </div>
        ))}
      </div>
      {value !== null && (
        <button
          type="button"
          aria-label="Clear rating"
          onClick={() => onChange(null)}
          className="text-xs text-copy-light hover:text-copy transition-colors border-0 bg-transparent cursor-pointer p-0 leading-none"
        >
          ✕
        </button>
      )}
    </div>
  );
}
