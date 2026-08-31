# Парсер расписаний

Это библиотека для парсинг расписаний с сайта. В качестве исходника берется PDF-файл, на выходе получаем json.

В настоящее время используется на сервере мини-приложения Станкин.Модули.

##### Установка

`npm i rector-schedule-parser`

##### Использование

    import { parse } from "rector-schedule-parser";

    parse("file.pdf");

    ИЛИ

    import { parseBuffer } from "rector-schedule-parser";

    parseBuffer(pdfBuffer);

По умолчанию используется актуальная сетка времени. При необходимости её можно
передать вторым аргументом:

```ts
import { parse, type PairTimes } from "rector-schedule-parser";

const pairTimes: PairTimes = [
  { start_time: "8:30", end_time: "10:10" },
  { start_time: "10:20", end_time: "12:00" },
  { start_time: "12:20", end_time: "14:00" },
  { start_time: "14:10", end_time: "15:50" },
  { start_time: "16:00", end_time: "17:40" },
  { start_time: "18:00", end_time: "19:30" },
  { start_time: "19:40", end_time: "21:10" },
  { start_time: "21:20", end_time: "22:50" },
];

parse("file.pdf", { pairTimes });
```

##### Issues

Предложения и замечания [здесь](https://github.com/iPagar/rector-schedule-parser/issues)

##### Contributing

Ты можешь внести вклад в соответствии с [CONTRIBUTING.md](CONTRIBUTING.md)

##### License

Испольуется [MIT License](LICENSE)
