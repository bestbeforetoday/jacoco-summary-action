export default {
    roots: ['<rootDir>/src'],
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: ['**/*.?(m|c)[jt]s?(x)', '!**/*.d.ts'],
    coverageProvider: 'v8',
    testMatch: ['**/?(*.)+(spec|test).?(m|c)[jt]s?(x)'],
    verbose: true,
    workerThreads: true,
};
