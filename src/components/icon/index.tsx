import type { CSSProperties, FunctionComponent, SVGProps } from 'react'

import LogoSvg from '@/assets/images/logo.svg?react'

const iconMap: Record<string, FunctionComponent<SVGProps<SVGSVGElement>>> = {
  logo: LogoSvg
}

export interface IconProps {
  name: string
  size?: number | string
  fill?: string
  style?: CSSProperties
}

export default function Icon({ name, size = 16, fill = 'currentColor', style }: IconProps) {
  const SvgComponent = iconMap[name]

  if (!SvgComponent) return null

  return <SvgComponent width={size} height={size} fill={fill} style={style} />
}
