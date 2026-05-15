"use client";
import { useState } from "react";

const EMOJI_FALLBACKS = ["🦅","⚔️","🐺","⚡","⭐","🧀","🏈","🔥","🦁","🐻"];

export function TeamAvatar({
  avatar,
  teamName,
  rosterId,
  size = 40,
}: {
  avatar: string | null;
  teamName: string;
  rosterId: number;
  size?: number;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const emoji = EMOJI_FALLBACKS[rosterId % EMOJI_FALLBACKS.length];

  if (avatar && !imgFailed) {
    return (
      <div
        className="rounded-lg overflow-hidden bg-pitch-surface3 border border-border flex-shrink-0"
        style={{ width: size, height: size }}
      >
        <img
          src={avatar}
          alt={teamName}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="object-cover w-full h-full"
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className="rounded-lg bg-pitch-surface3 border border-border flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.5) }}
    >
      {emoji}
    </div>
  );
}