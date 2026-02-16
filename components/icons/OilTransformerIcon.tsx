import * as React from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export function OilTransformerIcon({
  size = 24,
  color = "#000",
}: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
    >
      {/* Main tank */}
      <Rect x="10" y="18" width="44" height="30" rx="2" fill={color} />

      {/* Radiator fins */}
      <Path
        d="M14 20v26
           M18 20v26
           M22 20v26
           M26 20v26
           M30 20v26
           M34 20v26
           M38 20v26
           M42 20v26
           M46 20v26
           M50 20v26"
        stroke="#fff"
        strokeWidth="1"
        opacity="0.35"
      />

      {/* Top cover */}
      <Rect x="12" y="14" width="40" height="4" rx="1" fill={color} />

      {/* Bushings / insulators */}
      <Circle cx="22" cy="10" r="3" fill={color} />
      <Circle cx="32" cy="10" r="3" fill={color} />
      <Circle cx="42" cy="10" r="3" fill={color} />

      {/* Insulator stems */}
      <Path
        d="M22 13v5
           M32 13v5
           M42 13v5"
        stroke={color}
        strokeWidth="2"
      />

      {/* Base feet */}
      <Rect x="16" y="50" width="8" height="3" rx="1" fill={color} />
      <Rect x="40" y="50" width="8" height="3" rx="1" fill={color} />
    </Svg>
  );
}
