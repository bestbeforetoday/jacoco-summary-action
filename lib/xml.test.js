const { fromXml } = require('./xml');

describe('xml', () => {
    const header =
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<!DOCTYPE report PUBLIC "-//JACOCO//DTD Report 1.1//EN" "report.dtd">' +
        '<report name="fabric-gateway">';
    const trailer = '</report>';

    function xml(content) {
        return Buffer.from(header + content + trailer);
    }

    describe('summary', () => {
        const summary = xml(`
            <counter type="INSTRUCTION" missed="10" covered="90" />
            <counter type="BRANCH" missed="20" covered="80" />
            <counter type="LINE" missed="30" covered="70" />
            <counter type="COMPLEXITY" missed="40" covered="60" />
            <counter type="METHOD" missed="50" covered="50" />
            <counter type="CLASS" missed="60" covered="40" />
            `);

        it('instructions', () => {
            const coverage = fromXml(summary);
            const actual = coverage.summaryInstruction();
            expect(actual).toBe(90);
        });

        it('branches', () => {
            const coverage = fromXml(summary);
            const actual = coverage.summaryBranch();
            expect(actual).toBe(80);
        });

        it('lines', () => {
            const coverage = fromXml(summary);
            const actual = coverage.summaryLine();
            expect(actual).toBe(70);
        });

        it('complexity', () => {
            const coverage = fromXml(summary);
            const actual = coverage.summaryComplexity();
            expect(actual).toBe(60);
        });

        it('method', () => {
            const coverage = fromXml(summary);
            const actual = coverage.summaryMethod();
            expect(actual).toBe(50);
        });

        it('class', () => {
            const coverage = fromXml(summary);
            const actual = coverage.summaryClass();
            expect(actual).toBe(40);
        });

        it('single counter', () => {
            const data = xml('<counter type="INSTRUCTION" missed="10" covered="190" />');
            const coverage = fromXml(data);
            const actual = coverage.summaryInstruction();
            expect(actual).toBe(95);
        });

        it('nothing to cover', () => {
            const data = xml('<counter type="METHOD" missed="0" covered="0" />');
            const coverage = fromXml(data);
            const actual = coverage.summaryMethod();
            expect(actual).toBe('-');
        });

        it('missing counter', () => {
            const data = xml('');
            const coverage = fromXml(data);
            const actual = coverage.summaryInstruction();
            expect(actual).toBe('-');
        });

        it('markdown', () => {
            const coverage = fromXml(summary);
            const actual = coverage.summary();
            console.log(actual);
            expect(actual).toContain('90');
            expect(actual).toContain('80');
            expect(actual).toContain('70');
            expect(actual).toContain('60');
            expect(actual).toContain('50');
            expect(actual).toContain('40');
        });
    });
});
