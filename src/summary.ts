import core from '@actions/core';
import { Class, Coverage, Package } from './coverage';

export class Summary {
    #summary: typeof core.summary;

    constructor(githubSummary: typeof core.summary) {
        this.#summary = githubSummary;
    }

    async addJobSummary(coverage: Coverage): Promise<void> {
        this.#summary
            .addHeading('Code coverage', 3)
            .addRaw(summaryTable(coverage))
            .addRaw('<details><summary>Details</summary>');
        for (const p of coverage.packages.filter(hasCoverage)) {
            this.#summary.addHeading(p.name, 4).addRaw(packageTable(p));
        }
        this.#summary.addRaw('</details>');
        await this.#summary.write();
    }
}

function summaryTable(coverage: Coverage): string {
    const rows = [headerRow('Package', '% Instructions', '% Branches', '% Lines', '% Complexity', '% Method')];

    for (const p of coverage.packages.filter(hasCoverage)) {
        rows.push(row(p.name, p.instruction, p.branch, p.line, p.complexity, p.method));
    }

    rows.push(
        row(
            strong('Total'),
            coverage.instruction,
            coverage.branch,
            coverage.line,
            coverage.complexity,
            coverage.method,
        ),
    );

    return table(rows);
}

function packageTable(packageCoverage: Package) {
    const rows = [headerRow('Class', '% Instructions', '% Branches', '% Lines', '% Complexity', '% Method')];

    for (const c of packageCoverage.classes.filter(hasCoverage)) {
        rows.push(row(c.name, c.instruction, c.branch, c.line, c.complexity, c.method));
    }

    return table(rows);
}

function hasCoverage(element: Coverage | Package | Class): boolean {
    return !isNaN(element.instruction);
}

function table(rows: string[]): string {
    return `<table>${rows.join('')}</table>`;
}

function headerRow(...headers: string[]): string {
    const content = headers.map((h) => `<th>${h}</th>`);
    return `<tr>${content.join('')}</tr>`;
}

function row(...cells: (number | string)[]): string {
    const content = cells.map(cell);
    return `<tr>${content.join('')}</tr>`;
}

function cell(value: number | string): string {
    if (typeof value === 'number') {
        value = isNaN(value) ? '-' : String(Math.floor(value));
        return `<td align="right">${value}</td>`;
    }

    return `<td>${value}</td>`;
}

function strong(text: string): string {
    return `<strong>${text}</strong>`;
}
