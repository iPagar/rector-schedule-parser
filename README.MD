# Парсер расписаний

Это библиотека для парсинг расписаний с сайта. В качестве исходника берется PDF-файл, на выходе получаем json.

В настоящее время используется на сервере мини-приложения Станкин.Модули.

##### Установка

`npm i iPagar/rector-schedule-parser`

##### Использование

    import { parse } from "../../index";

    parser("file.pdf");

    ИЛИ

    import { parseBuffer } from "../../index";

    parser(pdfBuffer);

##### Issues

Предложения и замечания [здесь](https://github.com/iPagar/rector-schedule-parser/issues)

##### Contributing

Ты можешь внести вклад в соответствии с [CONTRIBUTING.md](CONTRIBUTING.md)

##### License

Испольуется [MIT License](LICENSE)
