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

## Linting
This project uses [Google GTS](https://github.com/google/gts) for linting. Review the `package.json` file to see scripts for linting. If I were onboarding other developers for this project, I would recommend installing relevant editor plugins (such as Typescript and ESLint plugins for VSCode).

## Future Development Ideas
* Support passing parameters for sorting and filtering
* Support passing parameters for open, closed, and all PRs
* Support passing a repository URL as a query parameter, which will require URL decoding
* Add metadata to responses (e.g. total number of PRs)
