class Summary {
    #summary;

    constructor(githubSummary) {
        this.#summary = githubSummary;
    }

    async addJobSummary(coverage) {
        this.#summary
            .addHeading('Unit test coverage', 3)
            .addRaw(summaryTable(coverage))
            .addRaw('<details><summary>Details</summary>');
        for (const p of coverage.packages.filter(hasCoverage)) {
            this.#summary.addHeading(p.name, 4).addRaw(packageTable(p));
        }
        this.#summary.addRaw('</details>');
        await this.#summary.write();
    }
}

function summaryTable(coverage) {
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

function packageTable(packageCoverage) {
    const rows = [headerRow('Class', '% Instructions', '% Branches', '% Lines', '% Complexity', '% Method')];

    for (const c of packageCoverage.classes.filter(hasCoverage)) {
        rows.push(row(c.name, c.instruction, c.branch, c.line, c.complexity, c.method));
    }

    return table(rows);
}

function hasCoverage(element) {
    return !isNaN(element.instruction);
}

function table(rows) {
    return `<table>${rows.join('')}</table>`;
}

function headerRow(...headers) {
    const content = headers.map((h) => `<th>${h}</th>`);
    return `<tr>${content.join('')}</tr>`;
}

function row(...cells) {
    const content = cells.map(cell);
    return `<tr>${content.join('')}</tr>`;
}

function cell(value) {
    const type = typeof value;

    if (type === 'number') {
        value = isNaN(value) ? '-' : String(Math.floor(value));
        return `<td align="right">${value}</td>`;
    }

    if (type !== 'string') {
        value = String(value);
    }

    return `<td>${value}</td>`;
}

function strong(text) {
    return `<strong>${text}</strong>`;
}

module.exports = {
    Summary,
};
