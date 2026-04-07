export const SELLING_UNIT_OPTIONS = [
  { value: "KG", label: "Kilogram (kg)", defaultUnitLabel: "kg" },
  { value: "BAG", label: "Bag", defaultUnitLabel: "bag" },
  { value: "PIECE", label: "Piece / each", defaultUnitLabel: "piece" },
  { value: "CRATE", label: "Crate", defaultUnitLabel: "crate" },
  { value: "BUNCH", label: "Bunch", defaultUnitLabel: "bunch" },
] as const;

export type SellingUnitType = (typeof SELLING_UNIT_OPTIONS)[number]["value"];

export const getDefaultUnitLabel = (unitType?: string) =>
  SELLING_UNIT_OPTIONS.find((option) => option.value === unitType)?.defaultUnitLabel ?? "unit";

export const formatUnitLabel = (unitType?: string, unitLabel?: string) =>
  (unitLabel && unitLabel.trim()) || getDefaultUnitLabel(unitType);

export const formatPricePerUnit = (price: number, unitType?: string, unitLabel?: string) =>
  `MWK ${price.toFixed(2)} per ${formatUnitLabel(unitType, unitLabel)}`;

export const formatQuantityWithUnit = (quantity: number, unitType?: string, unitLabel?: string) =>
  `${quantity} ${formatUnitLabel(unitType, unitLabel)}`;
