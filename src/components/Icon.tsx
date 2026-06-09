import React from "react";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";
import { colors } from "@/theme";

export type IconName =
  | "plus" | "check" | "cart" | "chevR" | "chevL" | "chevD" | "user" | "home"
  | "x" | "trash" | "search" | "lock" | "mail" | "share" | "bell" | "copy"
  | "logout" | "leave" | "undo" | "camera" | "pencil" | "minus" | "tag"
  | "list" | "sparkle";

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 24, color = colors.gray900, strokeWidth = 1.8 }: Props) {
  const common = { stroke: color, strokeWidth, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, fill: "none" };
  const paths: Record<IconName, React.ReactNode> = {
    plus: <Path d="M12 5v14M5 12h14" {...common} />,
    check: <Path d="M4 12.5l5 5L20 6.5" {...common} />,
    cart: (
      <G {...common}>
        <Circle cx={9} cy={20} r={1.4} />
        <Circle cx={18} cy={20} r={1.4} />
        <Path d="M2.5 3.5h2.2l2.2 11.2a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2l1.5-7.7H6" />
      </G>
    ),
    chevR: <Path d="M9 5l7 7-7 7" {...common} />,
    chevL: <Path d="M15 5l-7 7 7 7" {...common} />,
    chevD: <Path d="M5 9l7 7 7-7" {...common} />,
    user: (
      <G {...common}>
        <Circle cx={12} cy={8} r={4} />
        <Path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
      </G>
    ),
    home: <Path d="M4 11l8-7 8 7M6.5 9.5V20h11V9.5" {...common} />,
    x: <Path d="M6 6l12 12M18 6L6 18" {...common} />,
    trash: <Path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" {...common} />,
    search: (
      <G {...common}>
        <Circle cx={11} cy={11} r={6.5} />
        <Path d="M20 20l-4-4" />
      </G>
    ),
    lock: (
      <G {...common}>
        <Rect x={5} y={11} width={14} height={9} rx={2} />
        <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </G>
    ),
    mail: (
      <G {...common}>
        <Rect x={3} y={5} width={18} height={14} rx={2} />
        <Path d="M4 7l8 6 8-6" />
      </G>
    ),
    share: (
      <G {...common}>
        <Circle cx={6} cy={12} r={2.4} />
        <Circle cx={17} cy={6} r={2.4} />
        <Circle cx={17} cy={18} r={2.4} />
        <Path d="M8.2 11l6.6-3.8M8.2 13l6.6 3.8" />
      </G>
    ),
    bell: <Path d="M6 16V10a6 6 0 0 1 12 0v6l1.5 2.5h-15zM10 18.5a2 2 0 0 0 4 0" {...common} />,
    copy: (
      <G {...common}>
        <Rect x={8} y={8} width={11} height={11} rx={2} />
        <Path d="M5 15.5V6a2 2 0 0 1 2-2h8.5" />
      </G>
    ),
    logout: <Path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h10" {...common} />,
    leave: <Path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M9 8l-4 4 4 4M5 12h10" {...common} />,
    undo: <Path d="M9 7L4 12l5 5M4 12h10a6 6 0 0 1 0 12h-1" {...common} />,
    camera: (
      <G {...common}>
        <Path d="M4 8.5h3l1.3-2h7.4l1.3 2H20a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1z" />
        <Circle cx={12} cy={13} r={3.2} />
      </G>
    ),
    pencil: <Path d="M14.5 5.5l4 4M4 20l1-4L16 5l4 4L9 20H4z" {...common} />,
    minus: <Path d="M5 12h14" {...common} />,
    tag: (
      <G {...common}>
        <Path d="M3 11.5V4.5a1 1 0 0 1 1-1h7l9 9-8 8-9-9z" />
        <Circle cx={7.5} cy={8} r={1.3} />
      </G>
    ),
    list: <Path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" {...common} />,
    sparkle: <Path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z" {...common} />,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {paths[name]}
    </Svg>
  );
}
