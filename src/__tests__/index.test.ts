import { parseBuffer } from "../index";
import fs from "fs/promises";

describe("parse", () => {
  it("check 3 subjects in one box", async () => {
    const title = "./mock/test1.pdf";
    const file = await fs.readFile(new URL(title, import.meta.url));

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
    expect(subjects).toEqual(expect.arrayContaining(expectingSubjects));
    expect(subjects.length).toEqual(3);
  });

  it("check 2 labs in one box", async () => {
    const title = "./mock/test2.pdf";
    const file = await fs.readFile(new URL(title, import.meta.url));

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
        start_time: "10:20",
        end_time: "12:00",
        group,
        teacher: "Луцюк С.В.",
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
    expect(subjects).toEqual(expect.arrayContaining(expectingSubjects));
    expect(subjects.length).toEqual(4);
  });

  it("check subjects length in real pdf", async () => {
    const title = "./mock/test3.pdf";
    const file = await fs.readFile(new URL(title, import.meta.url));

    const subjects = await parseBuffer(file);
    expect(subjects.length).toEqual(56);
  });
});