const { XMLParser } = require('fast-xml-parser');

function fromXml(xml) {
    const parser = new XMLParser({
        ignoreAttributes: false,
    });
    const coverageData = parser.parse(xml);
    return new Coverage(coverageData);
}

class Coverage {
    #coverageData;

    constructor(coverageData) {
        this.#coverageData = coverageData;
    }

    summary() {
        return (
            '| | % Instruction | % Branch | % Line | % Complexity | % Method | % Class |\n' +
            '| --- | ---: | ---: | ---: | ---: | ---: | ---: |\n' +
            `| **All classes** | ${this.summaryInstruction()} | ${this.summaryBranch()} | ${this.summaryLine()} | ${this.summaryComplexity()} | ${this.summaryMethod()} | ${this.summaryClass()} |\n`
        );
    }

    summaryInstruction() {
        return this.#summaryByType('INSTRUCTION');
    }

    summaryBranch() {
        return this.#summaryByType('BRANCH');
    }

    summaryLine() {
        return this.#summaryByType('LINE');
    }

    summaryComplexity() {
        return this.#summaryByType('COMPLEXITY');
    }

    summaryMethod() {
        return this.#summaryByType('METHOD');
    }

    summaryClass() {
        return this.#summaryByType('CLASS');
    }

    #summaryByType(type) {
        const counter = this.#coverageData?.report?.counter;
        const instruction = this.#findByType(counter, type);
        return this.#percentage(instruction);
    }

    #findByType(element, type) {
        if (Array.isArray(element)) {
            return element.find((a) => a['@_type'] === type);
        }

        return element?.['@_type'] === type ? element : undefined;
    }

    #percentage(counter) {
        const missed = Number(counter?.['@_missed']);
        const covered = Number(counter?.['@_covered']);
        const total = missed + covered;
        if (!total) {
            return '-';
        }
        return (covered * 100) / total;
    }
}

module.exports = {
    fromXml,
};
