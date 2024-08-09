# jacoco-summary-action

This action adds Jacoco code coverage generated in a previous step as a GitHub Actions step summary.

## Usage

The action provides the following options:

- `coverage-file`: The path to the Jacoco XML or CSV coverage file.

### Example

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-java@v4
    with:
      distribution: 'temurin'
      java-version: '21'
  - name: Test with code coverage
    run: mvn test jacoco:report
  - name: Coverage summary
    uses: bestbeforetoday/jacoco-summary-action@v1
    with:
      coverage-file: target/site/jacoco/jacoco.csv
```
