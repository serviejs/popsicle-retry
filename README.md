# Popsicle Retry

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]

> Enable request retry for Popsicle.

## Installation

```
npm install popsicle-retry --save
```

## Usage

```js
import { retry } from "popsicle-retry";

const send = retry(transport);
const res = await send(req);
```

### Methods

- **retry(fn, shouldRetry?)** Wraps a request function with retry support. Accepts a second function that returns a delay, or `-1` (default is `retries()`).
- **retryAllowed(error?, request?)** Check if a request should be retried. Defaults to `5xx` and unavailable errors.
- **retries(count?, isRetryAllowed?)** An exponential back-off function, defaulting to 3 retries.

## License

Apache 2.0

[npm-image]: https://img.shields.io/npm/v/popsicle-retry.svg?style=flat
[npm-url]: https://npmjs.org/package/popsicle-retry
[downloads-image]: https://img.shields.io/npm/dm/popsicle-retry.svg?style=flat
[downloads-url]: https://npmjs.org/package/popsicle-retry
[travis-image]: https://img.shields.io/travis/serviejs/popsicle-retry.svg?style=flat
[travis-url]: https://travis-ci.org/serviejs/popsicle-retry
[coveralls-image]: https://img.shields.io/coveralls/serviejs/popsicle-retry.svg?style=flat
[coveralls-url]: https://coveralls.io/r/serviejs/popsicle-retry?branch=master
