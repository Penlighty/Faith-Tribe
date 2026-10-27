import type { SVGProps } from 'react';
import { ICONS, type IconName } from './icons';
import { LEGACY_ICON_MAP } from './legacy-map';

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName | string;
  /** 'tonal' adds a soft fill behind the line; use it for active/selected states. */
  variant?: 'line' | 'tonal';
  size?: number | string;
  /** Stroke width in the 24px grid. Default 2. */
  strokeWidth?: number;
  /** Provide a title to expose the icon to screen readers; otherwise it is aria-hidden. */
  title?: string;
}

export function Icon({ name, variant = 'line', size = 24, strokeWidth = 2, title, ...rest }: IconProps) {
  const mappedName = (name in ICONS ? name : LEGACY_ICON_MAP[name]) as IconName | undefined;
  const def = (mappedName && ICONS[mappedName]) || ICONS[name as IconName] || ICONS['info'];
  if (!def) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {variant === 'tonal' && def.tone ? <path d={def.tone} fill="currentColor" fillOpacity={0.2} stroke="none" /> : null}
      {def.d.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
