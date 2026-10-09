export const formatPercent = (value: number) => `${Math.round(value)}%`;
export const classNames = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(" ");
