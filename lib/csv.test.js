const { fromCsv } = require('./csv');

const header = row(
    'GROUP',
    'PACKAGE',
    'CLASS',
    'INSTRUCTION_MISSED',
    'INSTRUCTION_COVERED',
    'BRANCH_MISSED',
    'BRANCH_COVERED',
    'LINE_MISSED',
    'LINE_COVERED',
    'COMPLEXITY_MISSED',
    'COMPLEXITY_COVERED',
    'METHOD_MISSED',
    'METHOD_COVERED',
);

function row(...elements) {
    return elements.map((e) => String(e)).join(',');
}

function csv(...rows) {
    return Buffer.from([header, ...rows].join('\n'));
}

describe('csv', () => {
    describe('summary', () => {
        const input = csv(
            row('group', 'pkg.name.a', 'Class', 11, 89, 21, 79, 31, 69, 41, 59, 51, 49),
            row('group', 'pkg.name.b', 'Class', 9, 91, 19, 81, 29, 71, 39, 61, 49, 51),
        );

        Object.entries({
            instructions: {
                extract: (e) => e.instruction,
                expected: 90,
            },
            branches: {
                extract: (e) => e.branch,
                expected: 80,
            },
            lines: {
                extract: (e) => e.line,
                expected: 70,
            },
            complexity: {
                extract: (e) => e.complexity,
                expected: 60,
            },
            methods: {
                extract: (e) => e.method,
                expected: 50,
            },
            classes: {
                extract: (e) => e.class,
                expected: NaN,
            },
        }).map(([name, test]) => {
            // eslint-disable-next-line jest/valid-title
            it(name, () => {
                const coverage = fromCsv(input);
                const actual = test.extract(coverage);
                expect(actual).toBe(test.expected);
            });
        });

        it('nothing to cover', () => {
            const input = csv(row('group', 'pkg.name.a', 'Class', 10, 90, 20, 80, 30, 70, 40, 60, 0, 0));
            const coverage = fromCsv(input);
            const actual = coverage.method;
            expect(actual).toBe(NaN);
        });
    });

    describe('packages', () => {
        const input = csv(
            row('group', 'pkg.name.b', 'ClassA', 9, 91, 19, 81, 29, 71, 39, 61, 49, 51),
            row('group', 'pkg.name.b', 'ClassB', 7, 93, 17, 83, 27, 73, 37, 63, 47, 53),
            row('group', 'pkg.name.a', 'ClassA', 10, 90, 20, 80, 30, 70, 40, 60, 50, 50),
            row('group', 'pkg.name.a', 'ClassB', 8, 92, 18, 82, 28, 72, 38, 62, 48, 52),
            row('group', 'pkg.name.c', 'ClassA', 8, 92, 18, 82, 28, 72, 38, 62, 48, 52),
            row('group', 'pkg.name.c', 'ClassB', 6, 94, 16, 84, 26, 74, 36, 64, 46, 54),
        );

        Object.entries({
            'packages sorted by name': {
                extract: (e) => e.name,
                expected: ['pkg.name.a', 'pkg.name.b', 'pkg.name.c'],
            },
            instructions: {
                extract: (e) => e.instruction,
                expected: [91, 92, 93],
            },
            branches: {
                extract: (e) => e.branch,
                expected: [81, 82, 83],
            },
            lines: {
                extract: (e) => e.line,
                expected: [71, 72, 73],
            },
            complexity: {
                extract: (e) => e.complexity,
                expected: [61, 62, 63],
            },
            methods: {
                extract: (e) => e.method,
                expected: [51, 52, 53],
            },
            classes: {
                extract: (e) => e.class,
                expected: [NaN, NaN, NaN],
            },
        }).map(([name, test]) =>
            // eslint-disable-next-line jest/valid-title
            it(name, () => {
                const coverage = fromCsv(input);
                const actual = coverage.packages.map(test.extract);
                expect(actual).toStrictEqual(test.expected);
            }),
        );

        it('nothing to cover', () => {
            const input = csv(row('group', 'pkg.name', 'Class', 10, 90, 20, 80, 30, 70, 40, 60, 0, 0));
            const coverage = fromCsv(input);
            const actual = coverage.packages;

            const classes = actual.map((p) => p.method);
            expect(classes).toStrictEqual([NaN]);
        });

        it('trailing newline', () => {
            const input = csv(row('group', 'pkg.name', 'Class', 10, 90, 20, 80, 30, 70, 40, 60, 50, 50), row());
            const coverage = fromCsv(input);
            const actual = coverage.packages;

            const classes = actual.map((p) => p.name);
            expect(classes).toStrictEqual(['pkg.name']);
        });
    });

    describe('classes', () => {
        const input = csv(
            row('group', 'pkg.name', 'Class2', 8, 92, 18, 82, 28, 72, 38, 62, 48, 52),
            row('group', 'pkg.name', 'Class1', 9, 91, 19, 81, 29, 71, 39, 61, 49, 51),
            row('group', 'pkg.name', 'Class3', 7, 93, 17, 83, 27, 73, 37, 63, 47, 53),
        );

        Object.entries({
            'classes sorted by name': {
                extract: (e) => e.name,
                expected: ['Class1', 'Class2', 'Class3'],
            },
            instructions: {
                extract: (e) => e.instruction,
                expected: [91, 92, 93],
            },
            branches: {
                extract: (e) => e.branch,
                expected: [81, 82, 83],
            },
            lines: {
                extract: (e) => e.line,
                expected: [71, 72, 73],
            },
            complexity: {
                extract: (e) => e.complexity,
                expected: [61, 62, 63],
            },
            methods: {
                extract: (e) => e.method,
                expected: [51, 52, 53],
            },
            classes: {
                extract: (e) => e.class,
                expected: [NaN, NaN, NaN],
            },
        }).map(([name, test]) =>
            // eslint-disable-next-line jest/valid-title
            it(name, () => {
                const coverage = fromCsv(input);
                const actual = coverage.packages.flatMap((p) => p.classes).map(test.extract);
                expect(actual).toStrictEqual(test.expected);
            }),
        );

        it('nothing to cover', () => {
            const input = csv(row('group', 'pkg.name', 'Class', 10, 90, 20, 80, 30, 70, 40, 60, 0, 0));
            const coverage = fromCsv(input);
            const actual = coverage.packages.flatMap((p) => p.classes);

            const classes = actual.map((c) => c.method);
            expect(classes).toStrictEqual([NaN]);
        });
    });
});
