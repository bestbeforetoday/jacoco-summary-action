import { XMLParser } from 'fast-xml-parser';
import { Class, Coverage, Package } from './coverage';

interface XmlSchema {
    report?: ReportSchema;
}

interface ReportSchema {
    package?: PackageSchema | PackageSchema[];
    counter?: Counter | Counter[];
}

interface PackageSchema {
    '@_name': string;
    counter?: Counter | Counter[];
    class?: ClassSchema | ClassSchema[];
}

interface Counter {
    '@_type': string;
    '@_missed': string;
    '@_covered': string;
}

interface ClassSchema {
    '@_name': string;
    counter?: Counter | Counter[];
}

export function fromXml(xml: Buffer): XmlCoverage {
    const parser = new XMLParser({
        ignoreAttributes: false,
    });
    const coverageData = parser.parse(xml) as XmlSchema;
    return new XmlCoverage(coverageData.report ?? {});
}

class XmlCoverage implements Coverage {
    #report: ReportSchema;

    constructor(report: ReportSchema) {
        this.#report = report;
    }

    get packages(): XmlPackage[] {
        const packages = asArray(this.#report.package).map((p) => new XmlPackage(p));
        packages.sort((a, b) => a.name.localeCompare(b.name));
        return packages;
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
        const counter = this.#report.counter;
        const instruction = findByType(counter, type);
        return percentage(instruction);
    }
}

function asArray<T>(element: T | T[] | undefined): T[] {
    if (!element) {
        return [];
    }

    if (Array.isArray(element)) {
        return element;
    }

    return [element];
}

function findByType(element: Counter | Counter[] | undefined, type: string): Counter | undefined {
    if (Array.isArray(element)) {
        return element.find((a) => a['@_type'] === type);
    }

    return element?.['@_type'] === type ? element : undefined;
}

function percentage(counter: Counter | undefined): number {
    const missed = Number(counter?.['@_missed']);
    const covered = Number(counter?.['@_covered']);
    const total = missed + covered;
    if (!total) {
        return NaN;
    }
    return (covered * 100) / total;
}

class XmlPackage implements Package {
    #element: PackageSchema;

    constructor(packageElement: PackageSchema) {
        this.#element = packageElement;
    }

    get name(): string {
        return this.#element['@_name'].replaceAll('/', '.');
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

    get classes(): XmlClass[] {
        const classElements = asArray(this.#element.class);
        const classes = classElements.map((p) => new XmlClass(p));
        classes.sort((a, b) => a.name.localeCompare(b.name));
        return classes;
    }

    #percentageForType(type: string): number {
        const counter = this.#element.counter;
        const instruction = findByType(counter, type);
        return percentage(instruction);
    }
}

class XmlClass implements Class {
    #element: ClassSchema;

    constructor(classElement: ClassSchema) {
        this.#element = classElement;
    }

    get name(): string {
        const qualifiedName = this.#element['@_name'];
        const shortNameIndex = qualifiedName.lastIndexOf('/') + 1;
        return qualifiedName.slice(shortNameIndex);
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
        const counter = this.#element.counter;
        const instruction = findByType(counter, type);
        return percentage(instruction);
    }
}
