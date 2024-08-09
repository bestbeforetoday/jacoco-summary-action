const { fromXml } = require('./xml');
const { readFile } = require('node:fs/promises');
const core = require('@actions/core');
const { Summary } = require('./summary');
const { fromCsv } = require('./csv');

async function readCoverage(file) {
    const coveragePath = core.toPlatformPath(file);
    const coverageData = await readFile(coveragePath);

    const extension = file.slice(file.lastIndexOf('.') + 1).toLocaleLowerCase();
    if (extension === 'xml') {
        return fromXml(coverageData);
    } else if (extension === 'csv') {
        return fromCsv(coverageData);
    }

    throw new Error(`Unsupported file type: ${extension}`);
}

async function addJobSummary(coverage) {
    const summary = new Summary(core.summary);
    await summary.addJobSummary(coverage);
}

async function run() {
    const coverageFile = core.getInput('coverage-file');
    const coverage = await readCoverage(coverageFile);
    await addJobSummary(coverage);
}

run().catch((error) => core.setFailed(error.stack ?? error.message));
