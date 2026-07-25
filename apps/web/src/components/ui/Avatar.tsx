import Image from "next/image";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  fullRound?: boolean;
}

const SIZE_MAP = {
  xs: "h-6 w-6 text-[9px]",
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
};

const PIXEL_SIZE = {
  xs: 24,
  sm: 32,
  md: 44,
  lg: 56,
};

const COLORS = [
  "bg-sky-500/20 text-sky-200",
  "bg-violet-500/20 text-violet-200",
  "bg-emerald-500/20 text-emerald-200",
  "bg-amber-500/20 text-amber-200",
  "bg-rose-500/20 text-rose-200",
];

function colorFor(name: string) {
  const index =
    Array.from(name || "?").reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    ) % COLORS.length;
  return COLORS[index];
}

export function Avatar({ name, src, size = "md", fullRound }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    const isLocalImage = src.startsWith("/") && !src.startsWith("//");

    return (
      <Image
        src={src}
        alt={name}
        width={PIXEL_SIZE[size]}
        height={PIXEL_SIZE[size]}
        unoptimized={!isLocalImage}
        draggable={false}
        className={`${SIZE_MAP[size]} ${
          fullRound ? "rounded-full" : "rounded-2xl"
        } shrink-0 object-cover ring-1 ring-white/10`}
      />
    );
  }

  return (
    <div
      className={`${SIZE_MAP[size]} ${colorFor(
        name,
      )} flex shrink-0 items-center justify-center ${
        fullRound ? "rounded-full" : "rounded-2xl"
      } font-semibold ring-1 ring-white/10`}
    >
      {initials || "?"}
    </div>
  );
}
