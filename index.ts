import { PDFExtract, PDFExtractOptions, PDFExtractText } from "pdf.js-extract";
import { promises as fs } from "fs";

async function parseBuffer(file: Buffer) {
  const pdfExtract = new PDFExtract();
  const options: PDFExtractOptions = { lastPage: 1 };
  const pdfExtractedResult = await pdfExtract.extractBuffer(file, options);
  const chunks = pdfExtractedResult.pages[0].content;

  const stgroup = getStgroup(chunks);
  removeTime(chunks);
  const subjects = getSubjects(chunks, stgroup);
  makeDoubleLabsAsSingle(subjects);
  return subjects;
}

async function parse(title: string) {
  try {
    const file = await fs.readFile(title);
    const pdfExtract = new PDFExtract();
    const options: PDFExtractOptions = { lastPage: 1 };
    const pdfExtractedResult = await pdfExtract.extractBuffer(file, options);
    const chunks = pdfExtractedResult.pages[0].content;

    const stgroup = getStgroup(chunks);
    removeTime(chunks);
    const subjects = getSubjects(chunks, stgroup);
    makeDoubleLabsAsSingle(subjects);
    return subjects;
  } catch (e) {
    throw new Error(`Can't parse ${title}`);
  }
}

function makeDoubleLabsAsSingle(subjects: Subject[]) {
  subjects.forEach((subject) => {
    const foundPairTime = Object.values(pairtimes).find((pairtime) => {
      return (
        pairtime.start_time === subject.start_time &&
        pairtime.end_time === subject.end_time
      );
    });

    if (foundPairTime) {
      return foundPairTime;
    } else {
      const foundStartTime = Object.values(pairtimes).find((pairtime) => {
        return pairtime.start_time === subject.start_time;
      });
      const foundEndTime = Object.values(pairtimes).find((pairtime) => {
        return pairtime.end_time === subject.end_time;
      });

      if (!foundEndTime) {
        throw new Error(`Can't find end time ${subject.end_time}`);
      }
      if (!foundStartTime) {
        throw new Error(`Can't find start time ${subject.start_time}`);
      }

      subject.end_time = foundStartTime.end_time;

      const newSubject: Subject = {
        ...subject,
        start_time: foundEndTime.start_time,
        end_time: foundEndTime.end_time,
      };

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

function getStgroup(chunks: PDFExtractText[]) {
  const endSymbol = "8:";
  let stgroup = "";
  let index = 0;

  if (chunks) {
    for (
      var i = 0;
      i < chunks.length && !chunks[i].str.includes(endSymbol);
      i++
    ) {
      stgroup += chunks[i].str;

      index = i;
    }
    chunks.splice(0, index + 1);
  }

  return stgroup;
}

//избавляемся от времени начала и конца пар и названий дней недели
function removeTime(chunks: PDFExtractText[]) {
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

/**
 * Получаем предметы
 * @returns
 * @example
 * {
 *  group: 'ИСиТ',
 *  teacher: 'Кузнецова Е.В.',
 *  type: 'лекции',
 *  periods: [
 *    {
 *          end_date: "13.10",
 *          repeat: "ч.н.",
 *          start_date: "15.09",
 *    }
 *  ],
 *  dates: [ '01.09.2021', '03.09.2021', '08.09.2021', '10.09.2021' ],
 *  stgroup: 'ИСиТ-21-1',
 *  subject: 'Информационные системы и технологии',
 *  audience: '0202'
 * }
 */
export type Subject = {
  group: string;
  teacher: string;
  type: SubjectType;
  periods: SubjectPeriod[];
  dates: string[];
  stgroup: string;
  subject: string;
  audience: string;
  start_time: string;
  end_time: string;
};

function getSubject(chunks: PDFExtractText[], stgroup: string): Subject {
  const lastSymb = "]";
  let subject = "";
  let index = 0;
  const x = chunks[0].x;

  for (var i = 0; i < chunks.length && !chunks[i].str.includes(lastSymb); i++) {
    if (chunks[i].str.length) subject += " " + chunks[i].str.trim();
    index = i;
  }

  subject = (subject + chunks[index + 1].str)
    .replace(/\s{2,}/g, " ")
    .replace(/\s[,]/g, ",")
    .trim();

  const chunkWithMaxX = chunks
    .filter((_, i) => i <= index + 1)
    .reduce((prev, current) => (prev.x > current.x ? prev : current));

  let startTime = getStartTime(chunks[0].x);
  let endTime = getEndTime(chunkWithMaxX.x);

  const chunksStr = chunks
    .filter((_, i) => i <= index + 1)
    .map((x) => x.str)
    .join("");

  if (process.env.NODE_ENV === "development") {
    console.log(
      "\nSubject: " + subject,
      "\nX1: " + x,
      "\nX2: " + chunkWithMaxX.x,
      "\nStart time: " + startTime,
      "\nEnd Time:" + endTime,
      "\nchunks: " + chunksStr
    );
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

export type SubjectType =
  | "семинар"
  | "лекции"
  | "лабораторные занятия"
  | "экзамен"
  | "консультация";

function parseSubject({
  text,
  stgroup,
  startTime,
  endTime,
}: {
  text: string;
  x: number;
  stgroup: string;
  startTime: string;
  endTime: string;
}): Subject {
  let subject = text.match(/(?<subject>^[\dA-ZА-Я][A-ZА-Яa-zа-яё \d:/(),-]*)/);
  let date = text.match(/(?<date>\[(.*)\]$)/);
  let audience: string;
  // group can be (А) or ( А) or (А ) or ( А )
  let group = text.match(/\.*(?<group>\([ А-Б]*\))/) || "Без подгруппы";
  let teacher = "";
  const types: SubjectType[] = [
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

  function isTypeOfSubjectTypes(x: string): x is SubjectType {
    return types.includes(x as SubjectType);
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
          ? group?.index + group[0].length
          : beginIndex;
    audience =
      text
        .slice(beginIndex, date.index)
        .match(/\.(?<group>(.*))\./)
        ?.groups?.group.trim() ?? "";
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

    return {
      stgroup,
      subject: subject[0],
      audience: audience,
      ...parseDate(date[1]),
      start_time: startTime,
      end_time: endTime,
      group:
        group !== "Без подгруппы"
          ? typeof group === "string"
            ? group.replace(/\s+/g, "")
            : group[0].replace(/\s+/g, "")
          : "Без подгруппы",
      teacher,
      type: typedType,
    };
  }

  throw new Error(`Не удалось распознать предмет: ${text}`);
}

export type SubjectPeriod = {
  start_date: string;
  end_date: string;
  repeat: "ч.н." | "к.н.";
};

function parseDate(text: string): {
  periods: SubjectPeriod[];
  dates: string[];
} {
  // ищем периоды, for example [14.09-30.11к.н. ] or [07.09]
  let periods = Array.from(
    text.matchAll(
      /(?<start_date>\d{2}\.\d{2})[-](?<end_date>\d{2}\.\d{2}) (?<repeat>(?:[а-я]{1}[.]{1}){2})/g
    )
  );
  if (!periods.length) {
    // проверяем наличие периодов без пробела, for example [14.09-30.11к.н.]
    periods = Array.from(
      text.matchAll(
        /(?<start_date>\d{2}\.\d{2})[-](?<end_date>\d{2}\.\d{2})(?<repeat>(?:[а-я]{1}[.]{1}){2})/g
      )
    );
  }

  function isRepeat(x: string): x is "ч.н." | "к.н." {
    return x === "ч.н." || x === "к.н.";
  }

  //ищем единичные даты
  //перед этим добавим пробел для поиска выражения
  let dates = Array.from(
    text.padStart(text.length + 1).matchAll(/[^-](?<date>\d{2}\.\d{2})(?!-)/g)
  );
  //удаляем лишнее
  const formattedPeriods = periods.map((period) => {
    const start_date = period.groups?.start_date;
    if (start_date === undefined)
      throw new Error("Не удалось распарсить дату" + period.toString());

    const end_date = period.groups?.end_date;
    if (end_date === undefined)
      throw new Error("Не удалось распарсить дату" + period.toString());

    const repeat = period.groups?.repeat;
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
function parseTime(x: number): {
  start_time: string;
  end_time: string;
} {
  let pairtime: {
    start_time: string;
    end_time: string;
  } | null;

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

function getStartTime(x: number): string {
  let pairtime: string;

  switch (Math.trunc(x)) {
    case 46:
      pairtime = pairtimes.first.start_time;
      break;
    case 139:
      pairtime = pairtimes.second.start_time;
      break;
    case 233:
      pairtime = pairtimes.third.start_time;
      break;
    case 327:
      pairtime = pairtimes.fourth.start_time;
      break;
    case 420:
      pairtime = pairtimes.fifth.start_time;
      break;
    case 514:
      pairtime = pairtimes.sixth.start_time;
      break;
    case 607:
      pairtime = pairtimes.seventh.start_time;
      break;
    default:
      pairtime = pairtimes.eighth.start_time;
      break;
  }

  return pairtime;
}

function getEndTime(x: number): string {
  let pairtime: string;

  if (x <= 46) {
    throw new Error("Не удалось распарсить время");
  } else if (x <= 139) {
    pairtime = pairtimes.first.end_time;
  } else if (x <= 233) {
    pairtime = pairtimes.second.end_time;
  } else if (x <= 327) {
    pairtime = pairtimes.third.end_time;
  } else if (x <= 420) {
    pairtime = pairtimes.fourth.end_time;
  } else if (x <= 514) {
    pairtime = pairtimes.fifth.end_time;
  } else if (x <= 607) {
    pairtime = pairtimes.sixth.end_time;
  } else if (x <= 700) {
    pairtime = pairtimes.seventh.end_time;
  } else {
    pairtime = pairtimes.eighth.end_time;
  }

  return pairtime;
}

function getSubjects(chunks: PDFExtractText[], stgroup: string) {
  let subjects = [];
  while (chunks && chunks.length) {
    const subject = getSubject(chunks, stgroup);
    subjects.push(subject);
  }

  return subjects;
}

export { parse, parseBuffer };
