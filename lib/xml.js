const { XMLParser } = require('fast-xml-parser');

function fromXml(xml) {
    const parser = new XMLParser({
        ignoreAttributes: false,
    });
    const coverageData = parser.parse(xml);
    return new Coverage(coverageData.report ?? {});
}

class Coverage {
    #report;

    constructor(report) {
        this.#report = report;
    }

    get packages() {
        const packages = asArray(this.#report?.package).map((p) => new Package(p));
        packages.sort((a, b) => a.name.localeCompare(b.name));
        return packages;
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
        const counter = this.#report.counter;
        const instruction = findByType(counter, type);
        return percentage(instruction);
    }
}

function asArray(element) {
    if (!element) {
        return [];
    }

    if (Array.isArray(element)) {
        return element;
    }

    return [element];
}

function findByType(element, type) {
    if (Array.isArray(element)) {
        return element.find((a) => a['@_type'] === type);
    }

    return element?.['@_type'] === type ? element : undefined;
}

function percentage(counter) {
    const missed = Number(counter?.['@_missed']);
    const covered = Number(counter?.['@_covered']);
    const total = missed + covered;
    if (!total) {
        return NaN;
    }
    return (covered * 100) / total;
}

class Package {
    #element;

    constructor(packageElement) {
        this.#element = packageElement;
    }

    get name() {
        return this.#element['@_name'].replaceAll('/', '.');
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

    get classes() {
        const classElements = asArray(this.#element.class);
        const classes = classElements.map((p) => new Class(p));
        classes.sort((a, b) => a.name.localeCompare(b.name));
        return classes;
    }

    #percentageForType(type) {
        const counter = this.#element.counter;
        const instruction = findByType(counter, type);
        return percentage(instruction);
    }
}

class Class {
    #element;

    constructor(classElement) {
        this.#element = classElement;
    }

    get name() {
        const qualifiedName = this.#element['@_name'];
        const shortNameIndex = qualifiedName.lastIndexOf('/') + 1;
        return qualifiedName.slice(shortNameIndex);
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
        const counter = this.#element.counter;
        const instruction = findByType(counter, type);
        return percentage(instruction);
    }
}

module.exports = {
    fromXml,
};
