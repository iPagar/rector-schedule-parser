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

##### Issues

Предложения и замечания [здесь](https://github.com/iPagar/rector-schedule-parser/issues)

##### Contributing

Ты можешь внести вклад в соответствии с [CONTRIBUTING.md](CONTRIBUTING.md)

##### License

Испольуется [MIT License](LICENSE)
