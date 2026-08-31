"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEndTimeByX = exports.getStartTimeByX = exports.resolvePairTimes = exports.DEFAULT_PAIR_TIMES = void 0;
exports.DEFAULT_PAIR_TIMES = [
    { start_time: "8:30", end_time: "10:05" },
    { start_time: "10:15", end_time: "11:50" },
    { start_time: "12:20", end_time: "13:55" },
    { start_time: "14:05", end_time: "15:40" },
    { start_time: "15:50", end_time: "17:25" },
    { start_time: "18:00", end_time: "19:30" },
    { start_time: "19:40", end_time: "21:10" },
    { start_time: "21:20", end_time: "22:50" },
];
function resolvePairTimes(pairTimes) {
    return pairTimes !== null && pairTimes !== void 0 ? pairTimes : exports.DEFAULT_PAIR_TIMES;
}
exports.resolvePairTimes = resolvePairTimes;
function getStartTimeByX(x, pairTimes) {
    var _a;
    const pairIndexByX = {
        46: 0,
        139: 1,
        233: 2,
        327: 3,
        420: 4,
        514: 5,
        607: 6,
    };
    const pairIndex = (_a = pairIndexByX[Math.trunc(x)]) !== null && _a !== void 0 ? _a : 7;
    return pairTimes[pairIndex].start_time;
}
exports.getStartTimeByX = getStartTimeByX;
function getEndTimeByX(x, pairTimes) {
    if (x <= 46) {
        throw new Error("Не удалось распарсить время");
    }
    const boundaries = [139, 233, 327, 420, 514, 607, 700];
    const pairIndex = boundaries.findIndex((boundary) => x <= boundary);
    return pairTimes[pairIndex === -1 ? 7 : pairIndex].end_time;
}
exports.getEndTimeByX = getEndTimeByX;
//# sourceMappingURL=pair-times.js.map