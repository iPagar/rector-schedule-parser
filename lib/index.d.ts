/// <reference types="node" />
declare function parseBuffer(file: Buffer): Promise<Subject[]>;
declare function parse(title: string): Promise<Subject[]>;
export declare type SubjectType = "семинар" | "лекции" | "лабораторные занятия" | "экзамен" | "консультация";
export declare type SubjectPeriod = {
    /**
     * @example
     * 15.09.2021
     */
    start_date: string;
    /**
     * @example
     * 13.10.2021
     */
    end_date: string;
    repeat: "ч.н." | "к.н.";
};
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
 *          end_date: "13.10.2021",
 *          repeat: "ч.н.",
 *          start_date: "15.09.2021",
 *    }
 *  ],
 *  dates: [ '01.09.2021', '03.09.2021' ],
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
    /**
     * @example
     * 01.09.2021
     */
    dates: string[];
    stgroup: string;
    subject: string;
    audience: string;
    /**
     * @example
     * 8:30
     */
    start_time: string;
    /**
     * @example
     * 10:10
     */
    end_time: string;
};
export { parse, parseBuffer };
