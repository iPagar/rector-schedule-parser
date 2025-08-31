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
            end_date: "30.10" + `.${new Date().getFullYear()}`,
            repeat: "к.н.",
            start_date: "11.09" + `.${new Date().getFullYear()}`,
          },
        ],
        dates: [
          "13.11" + `.${new Date().getFullYear()}`,
          "20.11" + `.${new Date().getFullYear()}`,
        ],
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
            end_date: "18.12" + `.${new Date().getFullYear()}`,
            repeat: "к.н.",
            start_date: "27.11" + `.${new Date().getFullYear()}`,
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
        dates: ["25.12" + `.${new Date().getFullYear()}`],
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
            end_date: "13.10" + `.${new Date().getFullYear()}`,
            repeat: "ч.н.",
            start_date: "15.09" + `.${new Date().getFullYear()}`,
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
        dates: [
          "06.10" + `.${new Date().getFullYear()}`,
          "20.10" + `.${new Date().getFullYear()}`,
        ],
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
            end_date: "13.10" + `.${new Date().getFullYear()}`,
            repeat: "ч.н.",
            start_date: "15.09" + `.${new Date().getFullYear()}`,
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
        dates: [
          "06.10" + `.${new Date().getFullYear()}`,
          "20.10" + `.${new Date().getFullYear()}`,
        ],
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
        dates: ["15.05" + `.${new Date().getFullYear()}`],
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
        dates: ["15.05" + `.${new Date().getFullYear()}`],
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
        dates: ["02.05" + `.${new Date().getFullYear()}`],
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
        periods: [
          {
            end_date: "04.04" + `.${new Date().getFullYear()}`,
            repeat: "ч.н.",
            start_date: "21.02" + `.${new Date().getFullYear()}`,
          },
        ],
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
        periods: [
          {
            end_date: "23.11" + `.${new Date().getFullYear()}`,
            repeat: "к.н.",
            start_date: "14.09" + `.${new Date().getFullYear()}`,
          },
        ],
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
        dates: ["07.09" + `.${new Date().getFullYear()}`],
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
            start_date: "14.09" + `.${new Date().getFullYear()}`,
            end_date: "30.11" + `.${new Date().getFullYear()}`,
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
            start_date: "18.10" + `.${new Date().getFullYear()}`,
            end_date: "20.12" + `.${new Date().getFullYear()}`,
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
            start_date: "13.09" + `.${new Date().getFullYear()}`,
            end_date: "20.12" + `.${new Date().getFullYear()}`,
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
            start_date: "13.09" + `.${new Date().getFullYear()}`,
            end_date: "11.10" + `.${new Date().getFullYear()}`,
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
            start_date: "08.11" + `.${new Date().getFullYear()}`,
            end_date: "29.11" + `.${new Date().getFullYear()}`,
            repeat: "к.н.",
          },
        ],
        dates: [
          "18.10" + `.${new Date().getFullYear()}`,
          "25.10" + `.${new Date().getFullYear()}`,
        ],
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
            start_date: "20.09" + `.${new Date().getFullYear()}`,
            end_date: "11.10" + `.${new Date().getFullYear()}`,
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
            start_date: "13.09" + `.${new Date().getFullYear()}`,
            end_date: "20.12" + `.${new Date().getFullYear()}`,
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

  it("should parse subject with capitalized type 'Лекция'", async () => {
    const title = "src/__tests__/mock/test8.pdf";
    const file = await fs.readFile(title);

    // Теперь парсер должен успешно обработать тип занятия "Лекция" с заглавной буквы
    const subjects = await parseBuffer(file);

    // Проверяем, что парсер успешно распознал предмет
    expect(subjects).toBeDefined();
    expect(subjects.length).toBeGreaterThan(0);

    // Проверяем, что тип занятия нормализован к "лекции"
    const lectureSubject = subjects.find(
      (s) => s.subject === "Введение в специальность"
    );
    expect(lectureSubject).toBeDefined();
    if (lectureSubject) {
      expect(lectureSubject.type).toBe("лекции");
      expect(lectureSubject.teacher).toBe("Глубоков А.В.");
      expect(lectureSubject.audience).toBe("0207");
    }
  });

  it("should parse complex schedule with multiple periods and groups", async () => {
    const title = "src/__tests__/mock/test9.pdf";
    const file = await fs.readFile(title);

    const subjects = await parseBuffer(file);

    // Проверяем общее количество предметов
    expect(subjects.length).toBe(55);

    // Проверяем, что все предметы относятся к группе МДС-21-01
    expect(subjects.every((s) => s.stgroup === "МДС-21-01")).toBe(true);

    // Проверяем предмет с множественными периодами
    const techMarketing = subjects.find(
      (s) => s.subject === "Технологический маркетинг" && s.type === "семинар"
    );
    expect(techMarketing).toBeDefined();
    if (techMarketing) {
      expect(techMarketing.periods).toHaveLength(2);
      expect(techMarketing.periods[0]).toMatchObject({
        start_date: "09.09.2025",
        end_date: "28.10.2025",
        repeat: "к.н.",
      });
      expect(techMarketing.periods[1]).toMatchObject({
        start_date: "11.11.2025",
        end_date: "02.12.2025",
        repeat: "к.н.",
      });
      expect(techMarketing.teacher).toBe("Кутин А.А.");
      expect(techMarketing.audience).toBe("416(ТехМаш)");
    }

    // Проверяем предмет с подгруппами (А) и (Б)
    const automationA = subjects.find(
      (s) =>
        s.subject ===
          "Автоматизация производственных процессов в машиностроении" &&
        s.group === "(А)" &&
        s.type === "лабораторные занятия"
    );
    expect(automationA).toBeDefined();
    if (automationA) {
      expect(automationA.dates).toEqual(["24.11.2025", "08.12.2025"]);
      expect(automationA.start_time).toBe("8:30");
      expect(automationA.end_time).toBe("10:10");
      expect(automationA.teacher).toBe("Луцюк С.В.");
    }

    const automationB = subjects.find(
      (s) =>
        s.subject ===
          "Автоматизация производственных процессов в машиностроении" &&
        s.group === "(Б)" &&
        s.type === "лабораторные занятия" &&
        s.start_time === "8:30"
    );
    expect(automationB).toBeDefined();
    if (automationB) {
      expect(automationB.dates).toEqual(["01.12.2025", "15.12.2025"]);
    }

    // Проверяем предмет с особым форматом аудитории
    const projectDesign = subjects.find(
      (s) =>
        s.subject === "Проектирование и производство заготовок" &&
        s.type === "семинар"
    );
    expect(projectDesign).toBeDefined();
    if (projectDesign) {
      expect(projectDesign.audience).toBe("416(ТехМаш)");
      expect(projectDesign.teacher).toBe("Седых М.И.");
    }

    // Проверяем предмет с чётной/нечётной неделей
    const techMachineSpecial = subjects.find(
      (s) =>
        s.subject === "Технология машиностроения (специальная часть)" &&
        s.group === "(А)" &&
        s.type === "лабораторные занятия" &&
        s.start_time === "16:00"
    );
    expect(techMachineSpecial).toBeDefined();
    if (techMachineSpecial) {
      expect(techMachineSpecial.periods[0]).toMatchObject({
        start_date: "05.11.2025",
        end_date: "17.12.2025",
        repeat: "ч.н.",
      });
    }

    // Проверяем различные типы занятий
    const subjectTypes = [...new Set(subjects.map((s) => s.type))];
    expect(subjectTypes).toContain("лекции");
    expect(subjectTypes).toContain("семинар");
    expect(subjectTypes).toContain("лабораторные занятия");
  });
});
