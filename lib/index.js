"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBuffer = exports.parse = void 0;
const pdf_js_extract_1 = require("pdf.js-extract");
const fs_1 = require("fs");
const pair_times_1 = require("./pair-times");
function parseBuffer(file, parserOptions = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const pdfExtract = new pdf_js_extract_1.PDFExtract();
        const pdfOptions = { lastPage: 1 };
        const pdfExtractedResult = yield pdfExtract.extractBuffer(file, pdfOptions);
        const chunks = pdfExtractedResult.pages[0].content;
        const pairTimes = (0, pair_times_1.resolvePairTimes)(parserOptions.pairTimes);
        const stgroup = getStgroup(chunks);
        removeTime(chunks);
        const subjects = getSubjects(chunks, stgroup, pairTimes);
        makeDoubleLabsAsSingle(subjects, pairTimes);
        return subjects;
    });
}
exports.parseBuffer = parseBuffer;
function parse(title, parserOptions = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const file = yield fs_1.promises.readFile(title);
            const pdfExtract = new pdf_js_extract_1.PDFExtract();
            const pdfOptions = { lastPage: 1 };
            const pdfExtractedResult = yield pdfExtract.extractBuffer(file, pdfOptions);
            const chunks = pdfExtractedResult.pages[0].content;
            const pairTimes = (0, pair_times_1.resolvePairTimes)(parserOptions.pairTimes);
            const stgroup = getStgroup(chunks);
            removeTime(chunks);
            const subjects = getSubjects(chunks, stgroup, pairTimes);
            makeDoubleLabsAsSingle(subjects, pairTimes);
            return subjects;
        }
        catch (e) {
            throw new Error(`Can't parse ${title}`);
        }
    });
}
exports.parse = parse;
function makeDoubleLabsAsSingle(subjects, pairTimes) {
    subjects.forEach((subject) => {
        const foundPairTime = pairTimes.find((pairtime) => {
            return (pairtime.start_time === subject.start_time &&
                pairtime.end_time === subject.end_time);
        });
        if (foundPairTime) {
            return foundPairTime;
        }
        else {
            const foundStartTime = pairTimes.find((pairtime) => {
                return pairtime.start_time === subject.start_time;
            });
            const foundEndTime = pairTimes.find((pairtime) => {
                return pairtime.end_time === subject.end_time;
            });
            if (!foundEndTime) {
                throw new Error(`Can't find end time ${subject.end_time}`);
            }
            if (!foundStartTime) {
                throw new Error(`Can't find start time ${subject.start_time}`);
            }
            subject.end_time = foundStartTime.end_time;
            const newSubject = Object.assign(Object.assign({}, subject), { start_time: foundEndTime.start_time, end_time: foundEndTime.end_time });
            subjects.push(newSubject);
        }
    });
    // remove double labs
    subjects = subjects.filter((subject) => {
        const startTime = parseInt(subject.start_time.split(":")[0]);
        const endTime = parseInt(subject.end_time.split(":")[0]);
        return endTime - startTime !== 2;
    });
}
function getStgroup(chunks) {
    const endSymbol = "8:";
    let stgroup = "";
    let index = 0;
    if (chunks) {
        for (var i = 0; i < chunks.length && !chunks[i].str.includes(endSymbol); i++) {
            stgroup += chunks[i].str;
            index = i;
        }
        chunks.splice(0, index + 1);
    }
    return stgroup;
}
//избавляемся от времени начала и конца пар и названий дней недели
function removeTime(chunks) {
    const timeLength = 147;
    let removedLength = 0;
    let index = 0;
    if (chunks) {
        for (var i = 0; i < chunks.length && removedLength < timeLength; i++) {
            removedLength += chunks[i].str.length;
            index = i;
        }
        chunks.splice(0, index + 1);
    }
}
function getSubject(chunks, stgroup, pairTimes) {
    const lastSymb = "]";
    let subject = "";
    let index = 0;
    const x = chunks[0].x;
    for (var i = 0; i < chunks.length && !chunks[i].str.includes(lastSymb); i++) {
        if (chunks[i].str.length)
            subject += " " + chunks[i].str.trim();
        index = i;
    }
    subject = (subject + chunks[index + 1].str)
        .replace(/\s{2,}/g, " ")
        .replace(/\s[,]/g, ",")
        .trim();
    const chunkWithMaxX = chunks
        .filter((_, i) => i <= index + 1)
        .reduce((prev, current) => (prev.x > current.x ? prev : current));
    let startTime = (0, pair_times_1.getStartTimeByX)(chunks[0].x, pairTimes);
    let endTime = (0, pair_times_1.getEndTimeByX)(chunkWithMaxX.x, pairTimes);
    const chunksStr = chunks
        .filter((_, i) => i <= index + 1)
        .map((x) => x.str)
        .join("");
    if (process.env.NODE_ENV === "development") {
        console.log("\nSubject: " + subject, "\nX1: " + x, "\nX2: " + chunkWithMaxX.x, "\nStart time: " + startTime, "\nEnd Time:" + endTime, "\nchunks: " + chunksStr);
    }
    chunks.splice(0, index + 2);
    //убираем проеблы с концов и двойные пробелы
    return parseSubject({
        text: subject,
        x,
        stgroup,
        startTime,
        endTime,
    });
}
function parseSubject({ text, stgroup, startTime, endTime, }) {
    var _a, _b, _c;
    // Маппинг новых форматов типов занятий к стандартным
    const typeMapping = {
        // Стандартные форматы (оставляем как есть)
        семинар: "семинар",
        лекции: "лекции",
        "лабораторные занятия": "лабораторные занятия",
        экзамен: "экзамен",
        консультация: "консультация",
        // Новые форматы с заглавной буквы
        лекция: "лекции",
        семинары: "семинар",
        лабораторная: "лабораторные занятия",
        лабораторные: "лабораторные занятия",
        лаб: "лабораторные занятия",
        консультации: "консультация",
        экзамены: "экзамен",
    };
    let subject = text.match(/(?<subject>^[\dA-ZА-Я][A-ZА-Яa-zа-яё \d:/(),-]*)/);
    let date = text.match(/(?<date>\[(.*)\]$)/);
    let audience;
    // group can be (А) or ( А) or (А ) or ( А )
    let group = text.match(/\.*(?<group>\([ А-Б]*\))/) || "Без подгруппы";
    let teacher = "";
    // Получаем все возможные варианты типов для поиска
    const allTypeVariants = Object.keys(typeMapping);
    // Создаём регулярное выражение с флагом i для регистронезависимого поиска
    const typeRegex = new RegExp(`(${allTypeVariants.join("|")})`, "i");
    let type = text.match(typeRegex);
    if (!type) {
        throw new Error(`Не удалось распознать тип занятия: ${text}`);
    }
    // Получаем нормализованный тип из маппинга
    const foundType = type[0].toLowerCase();
    const normalizedType = typeMapping[foundType];
    if (!normalizedType) {
        throw new Error(`Не удалось распознать тип занятия: ${text}`);
    }
    //проверяем наличие преподавателя
    if (subject && type && type.index && group && date) {
        const endSubject = subject[0].length;
        const teacherLen = type.index - endSubject;
        if (teacherLen > 4)
            teacher = text.slice(endSubject + 1, endSubject + teacherLen).trim();
        //проверяем наличие аудитории
        let beginIndex = type.index + type[0].length;
        if (group !== "Без подгруппы")
            beginIndex =
                typeof group !== "string" && group.index
                    ? (group === null || group === void 0 ? void 0 : group.index) + group[0].length
                    : beginIndex;
        audience =
            (_c = (_b = (_a = text
                .slice(beginIndex, date.index)
                .match(/\.(?<group>(.*))\./)) === null || _a === void 0 ? void 0 : _a.groups) === null || _b === void 0 ? void 0 : _b.group.trim()) !== null && _c !== void 0 ? _c : "";
        // исключения
        if (audience.includes("ИГ -3")) {
            audience = "ИГ-3";
        }
        // make ( а) to (а)
        audience = audience.replace(/\(\s/g, "(");
        // make (а ) to (а)
        audience = audience.replace(/\s\)/g, ")");
        // make subject ( а) to (а)
        subject[0] = subject[0].replace(/\(\s/g, "(");
        // make subject (а ) to (а)
        subject[0] = subject[0].replace(/\s\)/g, ")");
        return Object.assign(Object.assign({ stgroup, subject: subject[0], audience: audience }, parseDate(date[1])), { start_time: startTime, end_time: endTime, group: group !== "Без подгруппы"
                ? typeof group === "string"
                    ? group.replace(/\s+/g, "")
                    : group[0].replace(/\s+/g, "")
                : "Без подгруппы", teacher, type: normalizedType });
    }
    throw new Error(`Не удалось распознать предмет: ${text}`);
}
function parseDate(text) {
    // ищем периоды, for example [14.09-30.11к.н. ] or [07.09]
    let periods = Array.from(text.matchAll(/(?<start_date>\d{2}\.\d{2})[-](?<end_date>\d{2}\.\d{2}) (?<repeat>(?:[а-я]{1}[.]{1}){2})/g));
    if (!periods.length) {
        // проверяем наличие периодов без пробела, for example [14.09-30.11к.н.]
        periods = Array.from(text.matchAll(/(?<start_date>\d{2}\.\d{2})[-](?<end_date>\d{2}\.\d{2})(?<repeat>(?:[а-я]{1}[.]{1}){2})/g));
    }
    function isRepeat(x) {
        return x === "ч.н." || x === "к.н.";
    }
    //ищем единичные даты
    //перед этим добавим пробел для поиска выражения
    let dates = Array.from(text.padStart(text.length + 1).matchAll(/[^-](?<date>\d{2}\.\d{2})(?!-)/g));
    //удаляем лишнее
    const formattedPeriods = periods
        .map((period) => {
        var _a, _b, _c;
        const start_date = (_a = period.groups) === null || _a === void 0 ? void 0 : _a.start_date;
        if (start_date === undefined)
            throw new Error("Не удалось распарсить дату" + period.toString());
        const end_date = (_b = period.groups) === null || _b === void 0 ? void 0 : _b.end_date;
        if (end_date === undefined)
            throw new Error("Не удалось распарсить дату" + period.toString());
        const repeat = (_c = period.groups) === null || _c === void 0 ? void 0 : _c.repeat;
        if (repeat === undefined)
            throw new Error("Не удалось распарсить дату" + period.toString());
        if (!isRepeat(repeat))
            throw new Error("Не удалось распарсить дату" + period.toString());
        return {
            start_date,
            end_date,
            repeat,
        };
    })
        .map((period) => {
        // start_date: '13.09', end_date: '11.10' should be with year
        const start_date = period.start_date;
        const end_date = period.end_date;
        const start_date_month = parseInt(start_date.split(".")[1]);
        const end_date_month = parseInt(end_date.split(".")[1]);
        return Object.assign(Object.assign({}, period), { start_date: `${period.start_date}.${new Date().getFullYear()}`, end_date: `${period.end_date}.${new Date().getFullYear()}` });
    });
    const formattedDates = dates
        .map((date) => {
        if (date.groups === undefined)
            throw new Error("Не удалось распарсить дату" + date.toString());
        return date.groups.date;
    })
        .map((date) => {
        return `${date}.${new Date().getFullYear()}`;
    });
    return { periods: formattedPeriods, dates: formattedDates };
}
function getSubjects(chunks, stgroup, pairTimes) {
    let subjects = [];
    while (chunks && chunks.length) {
        const subject = getSubject(chunks, stgroup, pairTimes);
        subjects.push(subject);
    }
    return subjects;
}
//# sourceMappingURL=index.js.map