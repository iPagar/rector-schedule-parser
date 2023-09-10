/// <reference types="node" />
declare function parseBuffer(file: Buffer): Promise<Subject[]>;
declare function parse(title: string): Promise<Subject[]>;
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
export declare type Subject = {
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
export declare type SubjectType = "семинар" | "лекции" | "лабораторные занятия" | "экзамен" | "консультация";
export declare type SubjectPeriod = {
    start_date: string;
    end_date: string;
    repeat: "ч.н." | "к.н.";
};
export { parse, parseBuffer };
