import fs from "fs/promises";
import { parseBuffer } from "../..";

describe("parse", () => {
  it("check 3 subjects in one box", async () => {
    const title = "src/__tests__/mock/test1.pdf";

    const file = await fs.readFile(title);

    // expecting subjects
    const stgroup = "МДМ-21-11";
    const start_time = "10:20";
    const end_time = "12:00";
    const group = "Без подгруппы";
    const expectingSubjects = [
      {
        stgroup,
        subject: "Интегрированные CAE системы в машиностроении",
        audience: "",
        periods: [
          {
            end_date: "30.10",
            repeat: "к.н.",
            start_date: "11.09",
          },
        ],
        dates: ["13.11", "20.11"],
        start_time,
        end_time,
        group,
        teacher: "Гиловой Л.Я.",
        type: "лекции",
      },
      {
        stgroup,
        subject: "Социология культуры и межкультурные коммуникации",
        audience: "",
        periods: [
          {
            end_date: "18.12",
            repeat: "к.н.",
            start_date: "27.11",
          },
        ],
        dates: [],
        start_time,
        end_time,
        group,
        teacher: "Михайлова М.В.",
        type: "семинар",
      },
      {
        stgroup,
        subject: "Профессиональные научные коммуникации",
        audience: "",
        periods: [],
        dates: ["25.12"],
        start_time,
        end_time,
        group,
        teacher: "Кузнецов Б.М.",
        type: "семинар",
      },
    ];

    const subjects = await parseBuffer(file);
    expect(subjects).toEqual(expectingSubjects);
  });

  it("check 2 labs in one box", async () => {
    const title = "src/__tests__/mock/test2.pdf";
    const file = await fs.readFile(title);

    // expecting subjects
    const stgroup = "МДС-18-02";
    const group = "Без подгруппы";
    const expectingSubjects = [
      {
        stgroup,
        subject: "Методы и средства контроля качества изделий в машиностроении",
        audience: "415",
        periods: [
          {
            end_date: "13.10",
            repeat: "ч.н.",
            start_date: "15.09",
          },
        ],
        dates: [],
        start_time: "10:20",
        end_time: "12:00",
        group,
        teacher: "Кириллов А.К.",
        type: "лабораторные занятия",
      },
      {
        stgroup,
        subject: "Основы технологии машиностроения",
        audience: "415",
        periods: [],
        dates: ["06.10", "20.10"],
        start_time: "10:20",
        end_time: "12:00",
        group,
        teacher: "Луцюк С.В.",
        type: "лабораторные занятия",
      },
      {
        stgroup,
        subject: "Методы и средства контроля качества изделий в машиностроении",
        audience: "415",
        periods: [
          {
            end_date: "13.10",
            repeat: "ч.н.",
            start_date: "15.09",
          },
        ],
        dates: [],
        start_time: "12:20",
        end_time: "14:00",
        group,
        teacher: "Кириллов А.К.",
        type: "лабораторные занятия",
      },
      {
        stgroup,
        subject: "Основы технологии машиностроения",
        audience: "415",
        periods: [],
        dates: ["06.10", "20.10"],
        start_time: "12:20",
        end_time: "14:00",
        group,
        teacher: "Луцюк С.В.",
        type: "лабораторные занятия",
      },
    ];

    const subjects = await parseBuffer(file);

    expect(subjects).toEqual(expectingSubjects);
  });

  it("check subjects length in real pdf", async () => {
    const title = "src/__tests__/mock/test3.pdf";
    const file = await fs.readFile(title);

    const subjects = await parseBuffer(file);
    expect(subjects.length).toEqual(56);
  });

  it("check exams and consultations", async () => {
    const title = "src/__tests__/mock/test4.pdf";
    const file = await fs.readFile(title);
    const subjects = await parseBuffer(file);

    // expecting subjects
    const stgroup = "ИДБ-19-10";
    const group = "Без подгруппы";
    const expectingSubjects = [
      {
        stgroup,
        subject: "Программная инженерия",
        audience: "0801",
        periods: [],
        dates: ["15.05"],
        start_time: "8:30",
        end_time: "10:10",
        group,
        teacher: "Рыбаков А.В.",
        type: "экзамен",
      },
      {
        stgroup,
        subject: "Программная инженерия",
        audience: "0801",
        periods: [],
        dates: ["15.05"],
        start_time: "10:20",
        end_time: "12:00",
        group,
        teacher: "Рыбаков А.В.",
        type: "экзамен",
      },
      {
        stgroup,
        subject: "Системы интеллектуального анализа данных",
        audience: "0202",
        periods: [],
        dates: ["02.05"],
        start_time: "14:10",
        end_time: "15:50",
        group,
        teacher: "Логачёв М.С.",
        type: "консультация",
      },
    ];

    expect(subjects).toEqual(expect.arrayContaining(expectingSubjects));
    expect(subjects.length).toEqual(3);
  });

  it('check physics labs in "A" group', async () => {
    const title = "src/__tests__/mock/test5.pdf";
    const file = await fs.readFile(title);
    const subjects = await parseBuffer(file);

    // expecting subjects
    const expectingSubjects = [
      {
        audience: "408",
        dates: [],
        end_time: "14:00",
        group: "(А)",
        periods: [{ end_date: "04.04", repeat: "ч.н.", start_date: "21.02" }],
        start_time: "12:20",
        stgroup: "МДБ-22-02",
        subject: "Физика",
        teacher: "Штанько А.Е.",
        type: "лабораторные занятия",
      },
    ];

    expect(subjects[0]).toMatchObject(expectingSubjects[0]);
  });

  it('checks "Фрезер (ММ)" location', async () => {
    const title = "src/__tests__/mock/test6.pdf";
    const file = await fs.readFile(title);
    const subjects = await parseBuffer(file);

    const expectingSubjects = [
      {
        stgroup: "МДБ-23-09",
        subject: "Технология конструкционных материалов",
        audience: "Фрезер 303 (ММ)",
        periods: [{ end_date: "23.11", repeat: "к.н.", start_date: "14.09" }],
        dates: [],
        start_time: "8:30",
        end_time: "10:10",
        group: "Без подгруппы",
        teacher: "Федоров М.Ю.",
        type: "лекции",
      },
      {
        stgroup: "МДБ-23-09",
        subject: "Технология конструкционных материалов",
        audience: "Фрезер 303 (ММ)",
        periods: [],
        dates: ["07.09"],
        start_time: "10:20",
        end_time: "12:00",
        group: "Без подгруппы",
        teacher: "Федоров М.Ю.",
        type: "лекции",
      },
      {
        stgroup: "МДБ-23-09",
        subject: "Информатика",
        audience: "Фрезер 303 (ММ)",
        periods: [
          {
            start_date: "14.09",
            end_date: "30.11",
            repeat: "к.н.",
          },
        ],
        dates: [],
        start_time: "10:20",
        end_time: "12:00",
        group: "Без подгруппы",
        teacher: "Конюхова Г.П.",
        type: "лекции",
      },
    ];

    expect(subjects).toEqual(expect.arrayContaining(expectingSubjects));
    expect(subjects.length).toEqual(3);
  });

  it("checks for double seminars", async () => {
    const title = "src/__tests__/mock/test7.pdf";
    const file = await fs.readFile(title);
    const subjects = await parseBuffer(file);

    const expectingSubjects = [
      {
        stgroup: "МДБ-23-09",
        subject: "Учебная практика",
        audience: "Фрезер 215",
        periods: [
          {
            start_date: "18.10",
            end_date: "20.12",
            repeat: "к.н.",
          },
        ],
        dates: [],
        start_time: "8:30",
        end_time: "10:10",
        group: "Без подгруппы",
        teacher: "Федоров С.Ю.",
        type: "семинар",
      },
      {
        stgroup: "МДБ-23-09",
        subject: "Учебная практика",
        audience: "Фрезер 215",
        periods: [
          {
            start_date: "13.09",
            end_date: "20.12",
            repeat: "к.н.",
          },
        ],
        dates: [],
        start_time: "10:20",
        end_time: "12:00",
        group: "Без подгруппы",
        teacher: "Федоров С.Ю.",
        type: "семинар",
      },
      {
        stgroup: "МДБ-23-09",
        subject: "Учебная практика",
        audience: "Фрезер 215",
        periods: [
          {
            start_date: "13.09",
            end_date: "11.10",
            repeat: "к.н.",
          },
        ],
        dates: [],
        start_time: "14:10",
        end_time: "15:50",
        group: "Без подгруппы",
        teacher: "Федоров С.Ю.",
        type: "семинар",
      },
      {
        stgroup: "МДБ-23-09",
        subject: "Основы российской государственности",
        audience: "Фрезер 403",
        periods: [
          {
            start_date: "08.11",
            end_date: "29.11",
            repeat: "к.н.",
          },
        ],
        dates: ["18.10", "25.10"],
        start_time: "14:10",
        end_time: "15:50",
        group: "Без подгруппы",
        teacher: "Ливанова А.Н.",
        type: "семинар",
      },
      {
        stgroup: "МДБ-23-09",
        subject: "Технология конструкционных материалов",
        audience: "Фрезер 403",
        periods: [
          {
            start_date: "20.09",
            end_date: "11.10",
            repeat: "к.н.",
          },
        ],
        dates: [],
        start_time: "16:00",
        end_time: "17:40",
        group: "Без подгруппы",
        teacher: "Иванов Г.Н.",
        type: "семинар",
      },
      {
        stgroup: "МДБ-23-09",
        subject: "Учебная практика",
        audience: "Фрезер 215",
        periods: [
          {
            start_date: "13.09",
            end_date: "20.12",
            repeat: "к.н.",
          },
        ],
        dates: [],
        start_time: "12:20",
        end_time: "14:00",
        group: "Без подгруппы",
        teacher: "Федоров С.Ю.",
        type: "семинар",
      },
    ];

    expect(subjects.length).toEqual(expectingSubjects.length);
    expect(subjects).toEqual(expectingSubjects);
  });
});
