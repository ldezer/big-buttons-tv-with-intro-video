import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navigation
  "house.fill": "home",
  "chevron.left": "chevron-left",
  "chevron.right": "chevron-right",
  "chevron.left.forwardslash.chevron.right": "code",
  "paperplane.fill": "send",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  "arrow.left": "arrow-back",
  "arrow.right": "arrow-forward",

  // Actions
  "plus": "add",
  "plus.circle.fill": "add-circle",
  "pencil": "edit",
  "pencil.circle.fill": "edit",
  "trash": "delete",
  "trash.fill": "delete",
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",
  "star.fill": "star",
  "star": "star-border",
  "heart.fill": "favorite",
  "heart": "favorite-border",
  "gearshape.fill": "settings",
  "gearshape": "settings",
  "lock.fill": "lock",
  "lock.open.fill": "lock-open",
  "person.fill": "person",
  "person.circle.fill": "account-circle",
  "person.2.fill": "people",
  "square.grid.2x2.fill": "grid-view",
  "rectangle.grid.1x2.fill": "view-agenda",
  "square.grid.3x3.fill": "apps",
  "speaker.wave.2.fill": "volume-up",
  "speaker.slash.fill": "volume-off",
  "magnifyingglass": "search",
  "photo": "photo",
  "play.rectangle.fill": "smart-display",
  "link": "link",
  "shuffle": "shuffle",
  "arrow.up.arrow.down": "swap-vert",
  "info.circle": "info",
  "questionmark.circle": "help",
  "exclamationmark.triangle.fill": "warning",
  "hand.tap.fill": "touch-app",
  "bolt.fill": "bolt",
  "sparkles": "auto-awesome",
  "rectangle.stack.fill": "layers",
  "doc.fill": "description",
  "paintbrush.fill": "brush",
  "eyedropper": "colorize",
  "arrow.clockwise": "refresh",
  "arrow.uturn.left": "undo",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const mappedName = MAPPING[name] ?? "help";
  return <MaterialIcons color={color} size={size} name={mappedName} style={style} />;
}
