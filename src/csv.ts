import { Coverage, Package, Class } from './coverage';

export function fromCsv(csv: Buffer): Coverage {
    const data = parseCsv(csv.toString());
    return new CsvCoverage(data);
}

function assertDefined<T>(value: T | undefined | null, message: string): T {
    if (value == undefined) {
        throw new Error(message);
    }
    return value;
}

type Row = { [key: string]: string };

function parseCsv(csv: string): Row[] {
    const data = csv.split('\n').map((line) => line.split(','));
    const headings = assertDefined(data[0], 'Missing header row from CSV');
    return data
        .slice(1)
        .filter((row) => row.length === headings.length)
        .map((row) => {
            const element: Row = {};
            headings.forEach((heading, i) => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                element[heading] = row[i]!;
            });
            return element;
        });
}

class Rows {
    #rows: Row[];

    constructor(rows: Row[]) {
        this.#rows = rows;
    }

    get rows(): Row[] {
        return this.#rows;
    }

    get instruction(): number {
        return this.#percentageForType('INSTRUCTION');
    }

    get branch(): number {
        return this.#percentageForType('BRANCH');
    }

    get line(): number {
        return this.#percentageForType('LINE');
    }

    get complexity(): number {
        return this.#percentageForType('COMPLEXITY');
    }

    get method(): number {
        return this.#percentageForType('METHOD');
    }

    get class(): number {
        return this.#percentageForType('CLASS');
    }

    #percentageForType(type: string): number {
        const missed = sum(this.#rows.map((row) => row[`${type}_MISSED`]));
        const covered = sum(this.#rows.map((row) => row[`${type}_COVERED`]));
        return percentage(missed, covered);
    }
}

class CsvCoverage extends Rows implements Coverage {
    get packages(): CsvPackage[] {
        const packageMap = groupBy(this.rows, 'PACKAGE');
        const packages: CsvPackage[] = [];
        for (const [name, rows] of packageMap.entries()) {
            packages.push(new CsvPackage(name, rows));
        }
        packages.sort((a, b) => a.name.localeCompare(b.name));
        return packages;
    }
}

function groupBy(elements: Row[], key: string): Map<string, Row[]> {
    const result = new Map<string, Row[]>();
    for (const e of elements) {
        const entryKey = e[key];
        if (!entryKey) {
            continue;
        }

        const entries = result.get(entryKey) ?? [];
        entries.push(e);
        result.set(entryKey, entries);
    }

    return result;
}

function sum(values: (string | undefined)[]): number {
    return values.reduce((accumulator, value) => accumulator + Number(value), 0);
}

function percentage(missed: number, covered: number): number {
    const total = missed + covered;
    if (!total) {
        return NaN;
    }
    return (covered * 100) / total;
}

class CsvPackage extends Rows implements Package {
    #name: string;

    constructor(name: string, rows: Row[]) {
        super(rows);
        this.#name = name;
    }

    get name(): string {
        return this.#name;
    }

    get classes(): CsvClass[] {
        const classes = this.rows.map((r) => new CsvClass(r));
        classes.sort((a, b) => a.name.localeCompare(b.name));
        return classes;
    }
}

class CsvClass implements Class {
    #name: string;
    #row: Row;

    constructor(row: Row) {
        this.#name = assertDefined(row.CLASS, `No CLASS defined for row`);
        this.#row = row;
    }

    get name(): string {
        return this.#name;
    }

    get instruction(): number {
        return this.#percentageForType('INSTRUCTION');
    }

    get branch(): number {
        return this.#percentageForType('BRANCH');
    }

    get line(): number {
        return this.#percentageForType('LINE');
    }

    get complexity(): number {
        return this.#percentageForType('COMPLEXITY');
    }

    get method(): number {
        return this.#percentageForType('METHOD');
    }

    get class(): number {
        return this.#percentageForType('CLASS');
    }

    #percentageForType(type: string): number {
        const missed = Number(this.#row[`${type}_MISSED`]);
        const covered = Number(this.#row[`${type}_COVERED`]);
        return percentage(missed, covered);
    }
}
