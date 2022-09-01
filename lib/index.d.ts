/// <reference types="node" />
declare function parseBuffer(file: Buffer): Promise<({
    group: string | false;
    teacher: string;
    type: string;
    periods: {
        [x: string]: string;
    }[];
    dates: (string | undefined)[];
    stgroup: string;
    subject: string;
    audience: string | undefined;
} | undefined)[]>;
declare function parse(title: string): Promise<({
    group: string | false;
    teacher: string;
    type: string;
    periods: {
        [x: string]: string;
    }[];
    dates: (string | undefined)[];
    stgroup: string;
    subject: string;
    audience: string | undefined;
} | undefined)[]>;
export { parse, parseBuffer };
