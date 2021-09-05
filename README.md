# Lambda Packager

Another lambda packager. Native tooling for python and node lambda packages (no docker).

Why? Python and nodejs are interpreted languages that don't always need to be built on the same architecture targetting the deployment. Lambda functions are (typically) small but not straightforward to build. Numerous tools exist to help you package lambdas but they often have prerequisites that are cumbersome or may be blocked by corporate policies (docker availability).

Lambda Packager does some things differently that solve common problems. It does the minimum steps for packaging and plugs into existing CI/CD workflows for user's just getting started with AWS Lambda.

### Features

- Fast, runs on your machine and doesn't require any other tools
- Creates a distinct fingerprint of your package to solve the [lambda update problem with cloudformation](https://stackoverflow.com/questions/47426248/aws-lambda-code-in-s3-bucket-not-updating)
- Can easily run in CI/CD pipelines
- Installs production dependencies only

## Quick Start

```
npm i -g @mneil/lambda-packager
lambda-packager
```

## Usage

Running `lambda-package` might be enough. By default lambda-package will try to detect your project and "Just Work". However, not all projects are created equal.

## Debugging

This package uses [debug](https://www.npmjs.com/package/debug). Enable debug logging with

```
export DEBUG=lp:*
```

### Defaults

TODO: Explain what lambda package looks for so it can live it's best life.

## Common lambda packaging things

1.  What type of project is it? Python, node, go, java, etc...?
2.  Where are the dependencies declared? Usually easy except python makes it... not easy. Go, is there a mod file or not?
3.  Create a temporary directory to work in
4.  Copy source files to that directory
5.  Install dependencies into that directory
6.  Archive the directory
7.  Upload that archive to S3 and give it a distinct name
8.  Inject that name somewhere? That's up to the user. We'll simply output the distinct name to be used....
