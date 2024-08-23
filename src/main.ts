import { fromXml } from './xml';
import { readFile } from 'node:fs/promises';
import * as core from '@actions/core';
import { Summary } from './summary';
import { fromCsv } from './csv';
import { Coverage } from './coverage';

async function readCoverage(file: string): Promise<Coverage> {
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

async function addJobSummary(coverage: Coverage): Promise<void> {
    const summary = new Summary(core.summary);
    await summary.addJobSummary(coverage);
}

export async function run() {
    const coverageFile = core.getInput('coverage-file');
    const coverage = await readCoverage(coverageFile);
    await addJobSummary(coverage);
}
