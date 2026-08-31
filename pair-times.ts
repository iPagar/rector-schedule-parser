export type PairTime = Readonly<{
  start_time: string;
  end_time: string;
}>;

export type PairTimes = readonly [
  PairTime,
  PairTime,
  PairTime,
  PairTime,
  PairTime,
  PairTime,
  PairTime,
  PairTime
];

export const DEFAULT_PAIR_TIMES: PairTimes = [
  { start_time: "8:30", end_time: "10:05" },
  { start_time: "10:15", end_time: "11:50" },
  { start_time: "12:20", end_time: "13:55" },
  { start_time: "14:05", end_time: "15:40" },
  { start_time: "15:50", end_time: "17:25" },
  { start_time: "18:00", end_time: "19:30" },
  { start_time: "19:40", end_time: "21:10" },
  { start_time: "21:20", end_time: "22:50" },
];

export function resolvePairTimes(pairTimes?: PairTimes): PairTimes {
  return pairTimes ?? DEFAULT_PAIR_TIMES;
}

export function getStartTimeByX(x: number, pairTimes: PairTimes): string {
  const pairIndexByX: Record<number, number> = {
    46: 0,
    139: 1,
    233: 2,
    327: 3,
    420: 4,
    514: 5,
    607: 6,
  };
  const pairIndex = pairIndexByX[Math.trunc(x)] ?? 7;

  return pairTimes[pairIndex].start_time;
}

export function getEndTimeByX(x: number, pairTimes: PairTimes): string {
  if (x <= 46) {
    throw new Error("Не удалось распарсить время");
  }

  const boundaries = [139, 233, 327, 420, 514, 607, 700];
  const pairIndex = boundaries.findIndex((boundary) => x <= boundary);

  return pairTimes[pairIndex === -1 ? 7 : pairIndex].end_time;
}
