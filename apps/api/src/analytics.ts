import type { HistoryPoint } from "@crypto-terminal/contracts";

const dayInMilliseconds = 86_400_000;

export function historyForRange(points: HistoryPoint[], days: string) {
  const lastTimestamp = points.at(-1)?.timestamp;
  if (lastTimestamp === undefined) return [];
  const cutoff = lastTimestamp - Number(days) * dayInMilliseconds;
  return points.filter((point) => point.timestamp >= cutoff);
}

export function calculateReturns(points: HistoryPoint[]) {
  if (points.length === 0) return [];
  const first = points[0]!.price;
  return points.map((point) => ({
    ...point,
    normalizedReturn: first === 0 ? 0 : (point.price / first - 1) * 100,
  }));
}

export function dailyReturns(points: HistoryPoint[]) {
  const daily = new Map<string, HistoryPoint>();
  for (const point of points) {
    daily.set(new Date(point.timestamp).toISOString().slice(0, 10), point);
  }
  const observations = [...daily.values()].sort(
    (left, right) => left.timestamp - right.timestamp,
  );
  const returns: number[] = [];
  for (let index = 1; index < observations.length; index += 1) {
    const previous = observations[index - 1]!.price;
    const current = observations[index]!.price;
    if (previous !== 0) returns.push(current / previous - 1);
  }
  return returns;
}

export function annualizedVolatility(returns: number[]) {
  if (returns.length < 2) return 0;
  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance =
    returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    (returns.length - 1);
  return Math.sqrt(variance) * Math.sqrt(365) * 100;
}

export function maximumDrawdown(points: HistoryPoint[]) {
  let peak = points[0]?.price ?? 0;
  let drawdown = 0;
  for (const point of points) {
    peak = Math.max(peak, point.price);
    if (peak > 0)
      drawdown = Math.min(drawdown, ((point.price - peak) / peak) * 100);
  }
  return drawdown;
}

export function correlation(first: number[], second: number[]) {
  const length = Math.min(first.length, second.length);
  if (length < 2) return null;
  const a = first.slice(-length);
  const b = second.slice(-length);
  const meanA = a.reduce((sum, value) => sum + value, 0) / length;
  const meanB = b.reduce((sum, value) => sum + value, 0) / length;
  let numerator = 0;
  let denominatorA = 0;
  let denominatorB = 0;
  for (let index = 0; index < length; index += 1) {
    const deltaA = a[index]! - meanA;
    const deltaB = b[index]! - meanB;
    numerator += deltaA * deltaB;
    denominatorA += deltaA ** 2;
    denominatorB += deltaB ** 2;
  }
  const denominator = Math.sqrt(denominatorA * denominatorB);
  return denominator === 0 ? null : numerator / denominator;
}

export function buildMetrics(
  points: HistoryPoint[],
  referenceReturns?: number[],
) {
  const returns = dailyReturns(points);
  const first = points[0]?.price ?? 0;
  const last = points.at(-1)?.price ?? 0;
  const volumes = points
    .map((point) => point.volume)
    .filter((value): value is number => value !== null);
  return {
    totalReturn: first === 0 ? 0 : (last / first - 1) * 100,
    annualizedVolatility: annualizedVolatility(returns),
    maxDrawdown: maximumDrawdown(points),
    averageVolume: volumes.length
      ? volumes.reduce((sum, value) => sum + value, 0) / volumes.length
      : 0,
    correlationToFirst: referenceReturns
      ? correlation(referenceReturns, returns)
      : null,
  };
}
