export default {
    roots: ['<rootDir>/lib'],
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: ['**/*.?(m)[jt]s?(x)', '!**/*.d.ts'],
    coverageProvider: 'v8',
    testMatch: ['**/?(*.)+(spec|test).?(m)[jt]s?(x)'],
    verbose: true,
    workerThreads: true,
};
