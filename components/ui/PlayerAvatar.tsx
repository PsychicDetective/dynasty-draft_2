"use client";
import { useState } from "react";

export function PlayerAvatar({
  playerId,
  name,
  size = 32,
}: {
  playerId: string;
  name: string;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="rounded-full overflow-hidden bg-pitch-surface3 border border-border flex-shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {!failed && (
        <img
          src={`/api/sleeper/player-image?id=${playerId}`}
          alt={name}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          className="object-cover w-full h-full"
          onError={() => setFailed(true)}
          onLoad={(e) => {
            const img = e.currentTarget;
            // If image is 1x1 (empty gif), treat as failed
            if (img.naturalWidth <= 1) setFailed(true);
            else setLoaded(true);
          }}
        />
      )}
      {(failed || !loaded) && (
        <svg
          width={Math.round(size * 0.55)}
          height={Math.round(size * 0.55)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-gray-600 absolute"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      )}
    </div>
  );
}
