export declare type PairTime = Readonly<{
    start_time: string;
    end_time: string;
}>;
export declare type PairTimes = readonly [
    PairTime,
    PairTime,
    PairTime,
    PairTime,
    PairTime,
    PairTime,
    PairTime,
    PairTime
];
export declare const DEFAULT_PAIR_TIMES: PairTimes;
export declare function resolvePairTimes(pairTimes?: PairTimes): PairTimes;
export declare function getStartTimeByX(x: number, pairTimes: PairTimes): string;
export declare function getEndTimeByX(x: number, pairTimes: PairTimes): string;
