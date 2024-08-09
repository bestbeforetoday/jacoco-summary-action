function fromCsv(csv) {
    const data = parseCsv(csv.toString());
    return new Coverage(data);
}

function parseCsv(csv) {
    const data = csv.split('\n').map((line) => line.split(','));
    const headings = data[0];
    return data
        .slice(1)
        .filter((row) => row.length === headings.length)
        .map((row) => {
            const element = {};
            headings.forEach((heading, i) => {
                element[heading] = row[i];
            });
            return element;
        });
}

class Rows {
    #rows;

    constructor(rows) {
        this.#rows = rows;
    }

    get rows() {
        return this.#rows;
    }

    get instruction() {
        return this.#percentageForType('INSTRUCTION');
    }

    get branch() {
        return this.#percentageForType('BRANCH');
    }

    get line() {
        return this.#percentageForType('LINE');
    }

    get complexity() {
        return this.#percentageForType('COMPLEXITY');
    }

    get method() {
        return this.#percentageForType('METHOD');
    }

    get class() {
        return this.#percentageForType('CLASS');
    }

    #percentageForType(type) {
        const missed = sum(this.#rows.map((row) => row[`${type}_MISSED`]));
        const covered = sum(this.#rows.map((row) => row[`${type}_COVERED`]));
        return percentage(missed, covered);
    }
}

class Coverage extends Rows {
    constructor(rows) {
        super(rows);
    }

    get packages() {
        const packageMap = groupBy(this.rows, 'PACKAGE');
        const packages = [];
        for (const [name, rows] of packageMap.entries()) {
            packages.push(new Package(name, rows));
        }
        packages.sort((a, b) => a.name.localeCompare(b.name));
        return packages;
    }
}

function groupBy(elements, key) {
    const result = new Map();
    for (const e of elements) {
        const entries = result.get(e[key]) ?? [];
        entries.push(e);
        result.set(e[key], entries);
    }

    return result;
}

function sum(values) {
    return values.reduce((accumulator, value) => accumulator + Number(value), 0);
}

function percentage(missed, covered) {
    const total = missed + covered;
    if (!total) {
        return NaN;
    }
    return (covered * 100) / total;
}

class Package extends Rows {
    #name;

    constructor(name, rows) {
        super(rows);
        this.#name = name;
    }

    get name() {
        return this.#name;
    }

    get classes() {
        const classes = this.rows.map((r) => new Class(r));
        classes.sort((a, b) => a.name.localeCompare(b.name));
        return classes;
    }
}

class Class {
    #row;

    constructor(row) {
        this.#row = row;
    }

    get name() {
        return this.#row.CLASS;
    }

    get instruction() {
        return this.#percentageForType('INSTRUCTION');
    }

    get branch() {
        return this.#percentageForType('BRANCH');
    }

    get line() {
        return this.#percentageForType('LINE');
    }

    get complexity() {
        return this.#percentageForType('COMPLEXITY');
    }

    get method() {
        return this.#percentageForType('METHOD');
    }

    get class() {
        return this.#percentageForType('CLASS');
    }

    #percentageForType(type) {
        const missed = Number(this.#row[`${type}_MISSED`]);
        const covered = Number(this.#row[`${type}_COVERED`]);
        return percentage(missed, covered);
    }
}

module.exports = {
    fromCsv,
};
