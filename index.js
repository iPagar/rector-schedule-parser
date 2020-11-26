const fs = require("fs");
const PDFExtract = require("pdf.js-extract").PDFExtract;
const pdfExtract = new PDFExtract();
const options = {};

let chunks = "";
let subjects = [];
let stgroup = "";

function parseSchedule(title) {
	return new Promise((resolve, reject) => {
		pdfExtract.extract(title, options, (err, data) => {
			if (err) return reject(err);

			chunks = data.pages[0].content;

			stgroup = getStgroup(chunks);
			removeTime();
			subjects = getSubjects();
			lookForLabs();

			resolve(subjects);
		});
	});
}

// лаба - 2 пары подряд
function lookForLabs() {
	subjects.forEach((subject) => {
		if (subject.type === "лабораторные занятия") {
			let newSubject = JSON.parse(JSON.stringify(subject));
			switch (newSubject.start_time) {
				case pairtimes.first.start_time:
					newSubject = { ...newSubject, ...pairtimes.second };
					break;
				case pairtimes.second.start_time:
					newSubject = { ...newSubject, ...pairtimes.third };
					break;
				case pairtimes.third.start_time:
					newSubject = { ...newSubject, ...pairtimes.fourth };
					break;
				case pairtimes.fourth.start_time:
					newSubject = { ...newSubject, ...pairtimes.fifth };
					break;
				case pairtimes.fifth.start_time:
					newSubject = { ...newSubject, ...pairtimes.sixth };
					break;
				case pairtimes.sixth.start_time:
					newSubject = { ...newSubject, ...pairtimes.seventh };
					break;
				case pairtimes.seventh.start_time:
					newSubject = { ...newSubject, ...pairtimes.eighth };
					break;
				default:
					newSubject = null;
					break;
			}
			if (newSubject !== null) subjects.push(newSubject);
		} else if (subject.subject === "Учебная практика") {
			let newSubject = JSON.parse(JSON.stringify(subject));
			let newSubjectSecond = JSON.parse(JSON.stringify(subject));
			switch (newSubject.start_time) {
				case pairtimes.first.start_time:
					newSubject = { ...newSubject, ...pairtimes.second };
					newSubjectSecond = { ...newSubject, ...pairtimes.third };
					break;
				case pairtimes.second.start_time:
					newSubject = { ...newSubject, ...pairtimes.third };
					newSubjectSecond = { ...newSubject, ...pairtimes.fourth };
					break;
				case pairtimes.third.start_time:
					newSubject = { ...newSubject, ...pairtimes.fourth };
					newSubjectSecond = { ...newSubject, ...pairtimes.fifth };
					break;
				case pairtimes.fourth.start_time:
					newSubject = { ...newSubject, ...pairtimes.fifth };
					newSubjectSecond = { ...newSubject, ...pairtimes.sixth };
					break;
				case pairtimes.fifth.start_time:
					newSubject = { ...newSubject, ...pairtimes.sixth };
					newSubjectSecond = { ...newSubject, ...pairtimes.seventh };
					break;
				case pairtimes.sixth.start_time:
					newSubject = { ...newSubject, ...pairtimes.seventh };
					newSubjectSecond = { ...newSubject, ...pairtimes.eighth };
					break;
				case pairtimes.seventh.start_time:
					newSubject = { ...newSubject, ...pairtimes.eighth };
					break;
				default:
					newSubject = null;
					break;
			}
			if (newSubject !== null) subjects.push(newSubject);
			if (newSubjectSecond !== null) subjects.push(newSubjectSecond);
		}
	});
}

function getStgroup() {
	const endSymbol = "8:";
	let subject = "";
	let index = 0;

	for (
		var i = 0;
		i < chunks.length && !chunks[i].str.includes(endSymbol);
		i++
	) {
		subject += chunks[i].str;

		index = i;
	}
	chunks.splice(0, index + 1);

	return subject;
}

//избавляемся от времени начала и конца пар и названий дней недели
function removeTime() {
	const timeLength = 147;
	let removedLength = 0;
	let index = 0;

	for (var i = 0; i < chunks.length && removedLength < timeLength; i++) {
		removedLength += chunks[i].str.length;
		index = i;
	}
	chunks.splice(0, index + 1);
}

function getSubject() {
	const lastSymb = "]";
	let subject = "";
	let index = 0;

	const x = chunks[0].x;
	for (
		var i = 0;
		i < chunks.length && !chunks[i].str.includes(lastSymb);
		i++
	) {
		if (chunks[i].str.length) subject += " " + chunks[i].str.trim();
		index = i;
	}
	subject = (subject + chunks[index + 1].str)
		.replace(/\s{2,}/g, " ")
		.replace(/\s[,]/g, ",")
		.trim();
	chunks.splice(0, index + 2);

	//убираем проеблы с концов и двойные пробелы
	return parseSubject(subject, x);
}

function parseSubject(text, x) {
	let subject = text.match(/^[\dA-ZА-Я][A-ZА-Яa-zа-яё :/(),-]*/);
	let date = text.match(/\[(.*)\]$/);
	let audience = "";
	let group =
		text.match(/\(.*([А-Я]).*\)/) !== null
			? text.match(/\.*(?<group>\([ А-Я]*\))/)
			: "Без подгруппы";
	let teacher = "";
	let type = text.match(/семинар|лекции|лабораторные занятия/);

	//проверяем наличие преподавателя
	const endSubject = subject.index + subject[0].length;
	const teacherLen = type.index - endSubject;
	if (teacherLen > 4)
		teacher = text.slice(endSubject + 1, endSubject + teacherLen).trim();

	//проверяем наличие аудитории
	let beginIndex = type.index + type[0].length;
	if (group !== "Без подгруппы") beginIndex = group.index + group[0].length;
	audience = text
		.slice(beginIndex, date.index)
		.match(/\.(.*)\./)[1]
		.trim();

	return {
		stgroup: stgroup,
		subject: subject[0],
		audience: audience,
		...parseDate(date[1]),
		...parseTime(x, type),
		group:
			group !== "Без подгруппы"
				? group.groups.group.replace(/\s+/g, "")
				: "Без подгруппы",
		teacher,
		type: type[0],
	};
}

function parseDate(text) {
	//ищем периоды
	let periods = Array.from(
		text.matchAll(
			/(?<start_date>\d{2}\.\d{2})[-](?<end_date>\d{2}\.\d{2}) (?<repeat>(?:[а-я]{1}[.]{1}){2})/g
		)
	);
	//ищем единичные даты
	//перед этим добавим пробел для поиска выражения
	let dates = Array.from(
		text
			.padStart(text.length + 1)
			.matchAll(/[^-](?<date>\d{2}\.\d{2})(?!-)/g)
	);
	//удаляем лишнее
	periods = periods.map((period) => {
		return { ...period.groups };
	});
	dates = dates.map((date) => {
		return date.groups.date;
	});
	// console.log(periods);
	return { periods, dates };
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

function getSubjects() {
	let subjects = [];
	while (chunks.length) {
		subjects.push(getSubject());
	}

	return subjects;
}

module.exports = parseSchedule;
