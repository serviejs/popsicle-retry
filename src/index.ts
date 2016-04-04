import Promise = require('any-promise')
import { Request, Response } from 'popsicle'

/**
 * Retry middleware.
 */
function popsicleRetry (retries = popsicleRetry.retries()) {
  return function (self: Request) {
    let iter = 0

    self.always(function (request) {
      const delay = retries(request, ++iter)

      if (delay > 0) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(request.clone())
          }, delay)
        })
          // Alias the response to the original request.
          .then(function (response: Response) {
            request.response = response
          })
      }
    })
  }
}

namespace popsicleRetry {
  /**
   * Check if the request should be attempted again.
   */
  export function retryAllowed (request: Request) {
    if (request.errored) {
      return request.errored.code === 'EUNAVAILABLE'
    }

    if (request.response) {
      return request.response.statusType() === 5
    }

    return false
  }

  /**
   * Init a default retry function.
   */
  export function retries (count = 5, isRetryAllowed = retryAllowed) {
    // Source: https://github.com/sindresorhus/got/blob/814bcacd1433d8f62dbb81260526b9ff56b26934/index.js#L261-L268
    return function (request: Request, iter: number) {
      if (iter > count || !isRetryAllowed(request)) {
        return -1
      }

      const noise = Math.random() * 100
      return (1 << iter) * 1000 + noise
    }
  }
}

export = popsicleRetry
