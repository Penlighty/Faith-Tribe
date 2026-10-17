import type { SVGProps } from 'react';
import { GAME_VISUALS, type GameId } from './games';

export interface GameBadgeProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  game: GameId;
  /** 'tonal': pastel container, dark glyph. 'solid': dark container, pastel glyph. */
  variant?: 'tonal' | 'solid';
  size?: number | string;
  title?: string;
}

export function GameBadge({ game, variant = 'tonal', size = 56, title, ...rest }: GameBadgeProps) {
  const g = GAME_VISUALS[game];
  const bg = variant === 'solid' ? g.ink : g.container;
  const fg = variant === 'solid' ? g.container : g.ink;
  return (
    <svg
      viewBox="0 0 96 96"
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={g.shapePath} fill={bg} />
      <g
        transform={`translate(48 ${48 + g.dy}) scale(${g.scale}) translate(-12 -12)`}
        fill="none"
        stroke={fg}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {g.glyph.tone ? <path d={g.glyph.tone} fill={fg} fillOpacity={0.18} stroke="none" /> : null}
        {g.glyph.d.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}

/** Just the game's silhouette, for masks, outlines, and selection rings. */
export function GameShape({ game, size = 56, ...rest }: { game: GameId; size?: number | string } & Omit<SVGProps<SVGSVGElement>, 'name'>) {
  return (
    <svg viewBox="0 0 96 96" width={size} height={size} aria-hidden focusable="false" {...rest}>
      <path d={GAME_VISUALS[game].shapePath} fill="currentColor" />
    </svg>
  );
}
