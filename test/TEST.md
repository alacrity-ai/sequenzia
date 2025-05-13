# Integration Tests

These tests will not run as part of `npm run test`.
These tests are integration tests which run via:

`npm run test:integration`

These tests may use OpenAI endpoints, and therefore require an OpenAI API key to be set in the environment variable `OPENAI_API_KEY`.

Moreover they are costly to run due to this API usage, so they are not run as part of the standard test suite.
