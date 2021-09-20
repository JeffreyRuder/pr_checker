# PR Checker

## About
This project is a demonstration of a simple Node REST API. It in turn uses the GitHub REST API. Its
main feature is allowing users to list pull requests (PRs) with a number of commits for 
each request. The GitHub REST API on its own does not do this - listing and getting a PR with
number of commits are two separate requests.

## Installation
Check out this repository and run `npm install`.

## Development
To run the server locally in development mode, run `npm run serve-dev`. This project uses `nodemon`
for hot reloading in development mode.

## API 
You can `GET` this URI: `http://localhost:3000/pull_requests/owner/:owner/name/:name` with GitHub
repository owner and name string parameters.

You can also `POST` to this URI `http://localhost:3000/pull_requests` with a GitHub repository URL.
The request body should be `application/json` and in the format:

`{ "url": "https://github.com/JeffreyRuder/pr_checker" }`

Either way, responses will be an array of JSON objects with `number`, `html_url`, and `commits` fields.
The `number` is the pull request identification number used by GitHub. The `html_url` is the URL for the
pull request. The `commits` field is a number that is the number of commits for that pull request.

## Testing
This project uses [Jest](https://github.com/facebook/jest) for tests. It uses [Nock](https://github.com/nock/nock) to support testing code that makes external HTTP requests in isolation. Run `npm test` to run the test suite.

## Linting
This project uses [Google GTS](https://github.com/google/gts) for linting. Review the `package.json` file to see scripts for linting. If I were onboarding other developers for this project, I would recommend installing relevant editor plugins (such as Typescript and ESLint plugins for VSCode).

## Future Development Ideas
* Support passing parameters for sorting and filtering
* Support passing parameters for open, closed, and all PRs
* Support passing a repository URL as a query parameter, which will require URL decoding
* Add metadata to responses (e.g. total number of PRs)
* Improve error handling to provide more specific error messages for different scenarios
* Add apiDoc or a similar API documentation generation tool
* Add an authentication strategy to allow for querying private repos
* If the API will become more complicated, consider expanding the `pull_requests.ts` code into a controller class
