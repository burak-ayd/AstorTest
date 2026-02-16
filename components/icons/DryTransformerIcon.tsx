import * as React from "react";
import Svg, { Path, Rect } from "react-native-svg";

type Props = {
  size?: number;
  color?: string;
};

export function DryTransformerIcon({
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
      {/* Upper rail */}
      <Rect x="6" y="6" width="52" height="4" rx="1" fill={color} />

      {/* Transformer coils */}
      <Rect x="10" y="14" width="12" height="32" rx="2" fill={color} />
      <Rect x="26" y="14" width="12" height="32" rx="2" fill={color} />
      <Rect x="42" y="14" width="12" height="32" rx="2" fill={color} />

      {/* Coil bolt dots */}
      <Path
        d="M13 20h2M13 26h2M13 32h2M13 38h2
           M29 20h2M29 26h2M29 32h2M29 38h2
           M45 20h2M45 26h2M45 32h2M45 38h2"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Lower rail */}
      <Rect x="6" y="50" width="52" height="4" rx="1" fill={color} />
    </Svg>
  );
}
