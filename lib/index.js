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
function parseBuffer(file) {
    return __awaiter(this, void 0, void 0, function* () {
        const pdfExtract = new pdf_js_extract_1.PDFExtract();
        const options = { lastPage: 1 };
        const pdfExtractedResult = yield pdfExtract.extractBuffer(file, options);
        const chunks = pdfExtractedResult.pages[0].content;
        const stgroup = getStgroup(chunks);
        removeTime(chunks);
        const subjects = getSubjects(chunks, stgroup);
        duplicateLabs(subjects);
        return subjects;
    });
}
exports.parseBuffer = parseBuffer;
parse("./src/__tests__/mock/МДБ-22-02.pdf").then((res) => {
    // console.log(res);
});
function parse(title) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const file = yield fs_1.promises.readFile(title);
            const pdfExtract = new pdf_js_extract_1.PDFExtract();
            const options = { lastPage: 1 };
            const pdfExtractedResult = yield pdfExtract.extractBuffer(file, options);
            const chunks = pdfExtractedResult.pages[0].content;
            const stgroup = getStgroup(chunks);
            removeTime(chunks);
            const subjects = getSubjects(chunks, stgroup);
            duplicateLabs(subjects);
            return subjects;
        }
        catch (e) {
            throw new Error(`Can't parse ${title}`);
        }
    });
}
exports.parse = parse;
// лаба - 2 пары подряд
function duplicateLabs(subjects) {
    subjects.forEach((subject) => {
        if (subject.type === "лабораторные занятия") {
            let newSubject = JSON.parse(JSON.stringify(subject));
            switch (newSubject.start_time) {
                case pairtimes.first.start_time:
                    newSubject = Object.assign(Object.assign({}, newSubject), pairtimes.second);
                    break;
                case pairtimes.second.start_time:
                    newSubject = Object.assign(Object.assign({}, newSubject), pairtimes.third);
                    break;
                case pairtimes.third.start_time:
                    newSubject = Object.assign(Object.assign({}, newSubject), pairtimes.fourth);
                    break;
                case pairtimes.fourth.start_time:
                    newSubject = Object.assign(Object.assign({}, newSubject), pairtimes.fifth);
                    break;
                case pairtimes.fifth.start_time:
                    newSubject = Object.assign(Object.assign({}, newSubject), pairtimes.sixth);
                    break;
                case pairtimes.sixth.start_time:
                    newSubject = Object.assign(Object.assign({}, newSubject), pairtimes.seventh);
                    break;
                case pairtimes.seventh.start_time:
                    newSubject = Object.assign(Object.assign({}, newSubject), pairtimes.eighth);
                    break;
                default:
                    newSubject = null;
                    break;
            }
            if (newSubject !== null)
                subjects.push(newSubject);
        }
        else if (subject.subject === "Учебная практика") {
            let newSubject = JSON.parse(JSON.stringify(subject));
            let newSubjectSecond = JSON.parse(JSON.stringify(subject));
            switch (newSubject.start_time) {
                case pairtimes.first.start_time:
                    newSubject = Object.assign(Object.assign({}, newSubject), pairtimes.second);
                    newSubjectSecond = Object.assign(Object.assign({}, newSubject), pairtimes.third);
                    break;
                case pairtimes.second.start_time:
                    newSubject = Object.assign(Object.assign({}, newSubject), pairtimes.third);
                    newSubjectSecond = Object.assign(Object.assign({}, newSubject), pairtimes.fourth);
                    break;
                case pairtimes.third.start_time:
                    newSubject = Object.assign(Object.assign({}, newSubject), pairtimes.fourth);
                    newSubjectSecond = Object.assign(Object.assign({}, newSubject), pairtimes.fifth);
                    break;
                case pairtimes.fourth.start_time:
                    newSubject = Object.assign(Object.assign({}, newSubject), pairtimes.fifth);
                    newSubjectSecond = Object.assign(Object.assign({}, newSubject), pairtimes.sixth);
                    break;
                case pairtimes.fifth.start_time:
                    newSubject = Object.assign(Object.assign({}, newSubject), pairtimes.sixth);
                    newSubjectSecond = Object.assign(Object.assign({}, newSubject), pairtimes.seventh);
                    break;
                case pairtimes.sixth.start_time:
                    newSubject = Object.assign(Object.assign({}, newSubject), pairtimes.seventh);
                    newSubjectSecond = Object.assign(Object.assign({}, newSubject), pairtimes.eighth);
                    break;
                case pairtimes.seventh.start_time:
                    newSubject = Object.assign(Object.assign({}, newSubject), pairtimes.eighth);
                    break;
                default:
                    newSubject = null;
                    break;
            }
            if (newSubject !== null)
                subjects.push(newSubject);
            if (newSubjectSecond !== null)
                subjects.push(newSubjectSecond);
        }
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
function getSubject(chunks, stgroup) {
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
    chunks.splice(0, index + 2);
    //убираем проеблы с концов и двойные пробелы
    return parseSubject(subject, x, stgroup);
}
function parseSubject(text, x, stgroup) {
    var _a, _b, _c;
    let subject = text.match(/(?<subject>^[\dA-ZА-Я][A-ZА-Яa-zа-яё \d:/(),-]*)/);
    let date = text.match(/(?<date>\[(.*)\]$)/);
    let audience;
    let group = text.match(/\.*(?<group>\([ А-Я]*\))/) || "Без подгруппы";
    let teacher = "";
    const types = [
        "семинар",
        "лекции",
        "лабораторные занятия",
        "экзамен",
        "консультация",
    ];
    let type = text.match(`(?<type>${types.join("|")})`);
    if (!type) {
        throw new Error(`Не удалось распознать тип занятия: ${text}`);
    }
    function isTypeOfSubjectTypes(x) {
        return types.includes(x);
    }
    const typedType = type[0];
    if (!isTypeOfSubjectTypes(typedType)) {
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
        // make subject ( а) to (а)
        subject[0] = subject[0].replace(/\(\s/g, "(");
        // make subject (а ) to (а)
        subject[0] = subject[0].replace(/\s\)/g, ")");
        return Object.assign(Object.assign(Object.assign({ stgroup, subject: subject[0], audience: audience }, parseDate(date[1])), parseTime(x)), { group: group !== "Без подгруппы"
                ? typeof group === "string"
                    ? group.replace(/\s+/g, "")
                    : group[0].replace(/\s+/g, "")
                : "Без подгруппы", teacher, type: typedType });
    }
    throw new Error(`Не удалось распознать предмет: ${text}`);
}
function parseDate(text) {
    //ищем периоды
    let periods = Array.from(text.matchAll(/(?<start_date>\d{2}\.\d{2})[-](?<end_date>\d{2}\.\d{2}) (?<repeat>(?:[а-я]{1}[.]{1}){2})/g));
    function isRepeat(x) {
        return x === "ч.н." || x === "к.н.";
    }
    //ищем единичные даты
    //перед этим добавим пробел для поиска выражения
    let dates = Array.from(text.padStart(text.length + 1).matchAll(/[^-](?<date>\d{2}\.\d{2})(?!-)/g));
    //удаляем лишнее
    const formattedPeriods = periods.map((period) => {
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
    });
    const formattedDates = dates.map((date) => {
        if (date.groups === undefined)
            throw new Error("Не удалось распарсить дату" + date.toString());
        return date.groups.date;
    });
    return { periods: formattedPeriods, dates: formattedDates };
}
const pairtimes = {
    first: { start_time: "8:30", end_time: "10:10" },
    second: { start_time: "10:20", end_time: "12:00" },
    third: { start_time: "12:20", end_time: "14:00" },
    fourth: { start_time: "14:10", end_time: "15:50" },
    fifth: { start_time: "16:00", end_time: "17:40" },
    sixth: { start_time: "18:00", end_time: "19:30" },
    seventh: { start_time: "19:40", end_time: "21:10" },
    eighth: { start_time: "21:20", end_time: "22:50" },
};
// смотрим на время по координате начала названия предмета от левого края
// 46 - первая пара
// 139 - вторая
// 233 - третья
// 327 - четвертая
// 420 - пятая
// 514 - шестая
// 607 - седьмая
function parseTime(x) {
    let pairtime = {};
    switch (Math.trunc(x)) {
        case 46:
            pairtime = pairtimes.first;
            break;
        case 139:
            pairtime = pairtimes.second;
            break;
        case 233:
            pairtime = pairtimes.third;
            break;
        case 327:
            pairtime = pairtimes.fourth;
            break;
        case 420:
            pairtime = pairtimes.fifth;
            break;
        case 514:
            pairtime = pairtimes.sixth;
            break;
        case 607:
            pairtime = pairtimes.seventh;
            break;
        default:
            pairtime = pairtimes.eighth;
            break;
    }
    return pairtime;
}
function getSubjects(chunks, stgroup) {
    let subjects = [];
    while (chunks && chunks.length) {
        const subject = getSubject(chunks, stgroup);
        subjects.push(subject);
    }
    return subjects;
}
//# sourceMappingURL=index.js.map