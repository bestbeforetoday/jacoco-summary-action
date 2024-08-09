const core = require('@actions/core');
const { readFile } = require('node:fs/promises');
const { fromXml } = require('./xml');

try {
    const coverageFile = core.getInput('coverage-file');
    const coveragePath = core.toPlatformPath(coverageFile);

    const coverageXml = readFile(coveragePath);
    fromXml(coverageXml);
} catch (error) {
    core.setFailed(error.message);
}
