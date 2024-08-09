const { fromXml } = require('./xml');

describe('xml', () => {
    const header =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<!DOCTYPE report PUBLIC "-//JACOCO//DTD Report 1.1//EN" "report.dtd">' +
        '<report name="fabric-gateway">';
    const trailer = '</report>';

    function report(content) {
        return Buffer.from(header + content + trailer);
    }

    describe('summary', () => {
        const xml = report(`
            <counter type="INSTRUCTION" missed="10" covered="90" />
            <counter type="BRANCH" missed="20" covered="80" />
            <counter type="LINE" missed="30" covered="70" />
            <counter type="COMPLEXITY" missed="40" covered="60" />
            <counter type="METHOD" missed="50" covered="50" />
            <counter type="CLASS" missed="60" covered="40" />
            `);

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
                expected: 40,
            },
        }).map(([name, test]) => {
            // eslint-disable-next-line jest/valid-title
            it(name, () => {
                const coverage = fromXml(xml);
                const actual = test.extract(coverage);
                expect(actual).toBe(test.expected);
            });
        });

        it('single counter', () => {
            const data = report('<counter type="INSTRUCTION" missed="10" covered="190" />');
            const coverage = fromXml(data);
            const actual = coverage.instruction;
            expect(actual).toBe(95);
        });

        it('nothing to cover', () => {
            const data = report('<counter type="METHOD" missed="0" covered="0" />');
            const coverage = fromXml(data);
            const actual = coverage.method;
            expect(actual).toBe(NaN);
        });

        it('missing counter', () => {
            const data = report('');
            const coverage = fromXml(data);
            const actual = coverage.instruction;
            expect(actual).toBe(NaN);
        });
    });

    describe('packages', () => {
        const xml = report(`
            <package name="pkg/name/b">
                <counter type="INSTRUCTION" missed="8" covered="92" />
                <counter type="BRANCH" missed="18" covered="82" />
                <counter type="LINE" missed="28" covered="72" />
                <counter type="COMPLEXITY" missed="38" covered="62" />
                <counter type="METHOD" missed="48" covered="52" />
                <counter type="CLASS" missed="58" covered="42" />
            </package>
            <package name="pkg/name/a">
                <counter type="INSTRUCTION" missed="9" covered="91" />
                <counter type="BRANCH" missed="19" covered="81" />
                <counter type="LINE" missed="29" covered="71" />
                <counter type="COMPLEXITY" missed="39" covered="61" />
                <counter type="METHOD" missed="49" covered="51" />
                <counter type="CLASS" missed="59" covered="41" />
            </package>
            <package name="pkg/name/c">
                <counter type="INSTRUCTION" missed="7" covered="93" />
                <counter type="BRANCH" missed="17" covered="83" />
                <counter type="LINE" missed="27" covered="73" />
                <counter type="COMPLEXITY" missed="37" covered="63" />
                <counter type="METHOD" missed="47" covered="53" />
                <counter type="CLASS" missed="57" covered="43" />
            </package>
            `);

        it('single package', () => {
            const data = report('<package name="pkg/name"></package>');
            const coverage = fromXml(data);
            const actual = coverage.packages;

            const names = actual.map((p) => p.name);
            expect(names).toStrictEqual(['pkg.name']);
        });

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
                expected: [41, 42, 43],
            },
        }).map(([name, test]) =>
            // eslint-disable-next-line jest/valid-title
            it(name, () => {
                const coverage = fromXml(xml);
                const actual = coverage.packages.map(test.extract);
                expect(actual).toStrictEqual(test.expected);
            }),
        );

        it('nothing to cover', () => {
            const data = report('<package name="pkg/name"> <counter type="CLASS" missed="0" covered="0" /> </package>');
            const coverage = fromXml(data);
            const actual = coverage.packages;

            const classes = actual.map((p) => p.class);
            expect(classes).toStrictEqual([NaN]);
        });

        it('missing counter', () => {
            const data = report('<package name="pkg/name"></package>');
            const coverage = fromXml(data);
            const actual = coverage.packages;

            const classes = actual.map((p) => p.class);
            expect(classes).toStrictEqual([NaN]);
        });
    });

    describe('classes', () => {
        const xml = report(`
            <package name="pkg/name">
                <class name="pkg/name/Class2" sourcefilename="Class1.java">
                    <counter type="INSTRUCTION" missed="8" covered="92" />
                    <counter type="BRANCH" missed="18" covered="82" />
                    <counter type="LINE" missed="28" covered="72" />
                    <counter type="COMPLEXITY" missed="38" covered="62" />
                    <counter type="METHOD" missed="48" covered="52" />
                    <counter type="CLASS" missed="0" covered="1" />
                </class>
                <class name="pkg/name/Class1" sourcefilename="Class1.java">
                    <counter type="INSTRUCTION" missed="9" covered="91" />
                    <counter type="BRANCH" missed="19" covered="81" />
                    <counter type="LINE" missed="29" covered="71" />
                    <counter type="COMPLEXITY" missed="39" covered="61" />
                    <counter type="METHOD" missed="49" covered="51" />
                    <counter type="CLASS" missed="0" covered="1" />
                </class>
                <class name="pkg/name/Class3" sourcefilename="Class3.java">
                    <counter type="INSTRUCTION" missed="7" covered="93" />
                    <counter type="BRANCH" missed="17" covered="83" />
                    <counter type="LINE" missed="27" covered="73" />
                    <counter type="COMPLEXITY" missed="37" covered="63" />
                    <counter type="METHOD" missed="47" covered="53" />
                    <counter type="CLASS" missed="0" covered="1" />
                </class>
            </package>
            `);

        it('single class', () => {
            const data = report(
                '<package name="pkg/name"> <class name="pkg/name/ClassName" sourcefilename="ClassName.java"></class> </package>',
            );
            const coverage = fromXml(data);
            const actual = coverage.packages.flatMap((p) => p.classes);

            const names = actual.map((c) => c.name);
            expect(names).toStrictEqual(['ClassName']);
        });

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
                expected: [100, 100, 100],
            },
        }).map(([name, test]) =>
            // eslint-disable-next-line jest/valid-title
            it(name, () => {
                const coverage = fromXml(xml);
                const actual = coverage.packages.flatMap((p) => p.classes).map(test.extract);
                expect(actual).toStrictEqual(test.expected);
            }),
        );

        it('nothing to cover', () => {
            const data = report(`
                <package name="pkg/name">
                    <class name="pkg/name/ClassName" sourcefilename="ClassName.java">
                        <counter type="METHOD" missed="0" covered="0" />
                    </class>
                </package>
                `);
            const coverage = fromXml(data);
            const actual = coverage.packages.flatMap((p) => p.classes);

            const classes = actual.map((c) => c.method);
            expect(classes).toStrictEqual([NaN]);
        });

        it('missing counter', () => {
            const data = report(
                '<package name="pkg/name"> <class name="pkg/name/ClassName" sourcefilename="ClassName.java"></class> </package>',
            );
            const coverage = fromXml(data);
            const actual = coverage.packages.flatMap((p) => p.classes);

            const classes = actual.map((c) => c.class);
            expect(classes).toStrictEqual([NaN]);
        });
    });
});
