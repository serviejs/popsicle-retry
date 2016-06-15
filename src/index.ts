import extend = require('xtend')
import Promise = require('any-promise')
import { Request, Response, PopsicleError } from 'popsicle'

/**
 * Retry middleware.
 */
function popsicleRetry (retries = popsicleRetry.retries()) {
  let iter = 0

  return function retry (request: Request, next: () => Promise<Response>) {
    // Attempt a retry.
    function attempt (error: PopsicleError, response: Response, result: any) {
      const delay = retries(error, response, ++iter)

      if (delay <= 0) {
        return result
      }

      return new Promise(resolve => {
        setTimeout(
          () => {
            const options = extend(request.toOptions(), {
              use: request.middleware.slice(request.middleware.indexOf(retry))
            })

            return resolve(new Request(options))
          },
          delay
        )
      })
    }

    return next()
      .then(
        function (response: Response) {
          return attempt(null, response, Promise.resolve(response))
        },
        function (error: PopsicleError) {
          return attempt(error, null, Promise.reject(error))
        }
      )
  }
}

namespace popsicleRetry {
  /**
   * Check if the request should be attempted again.
   */
  export function retryAllowed (error: PopsicleError, response: Response) {
    if (error) {
      if (error.code === 'EUNAVAILABLE') {
        if ((process as any).browser) {
          return navigator.onLine !== false
        }

        const code: string = (error.cause as any).code

        return (
          code === 'ECONNREFUSED' ||
          code === 'ECONNRESET' ||
          code === 'ETIMEDOUT' ||
          code === 'EPIPE'
        )
      }

      return false
    }

    if (response) {
      return response.statusType() === 5
    }

    return false
  }

  /**
   * Init a default retry function.
   */
  export function retries (count = 5, isRetryAllowed = retryAllowed) {
    // Source: https://github.com/sindresorhus/got/blob/814bcacd1433d8f62dbb81260526b9ff56b26934/index.js#L261-L268
    return function (error: PopsicleError, response: Response, iter: number) {
      if (iter > count || !isRetryAllowed(error, response)) {
        return -1
      }

      const noise = Math.random() * 100
      return (1 << iter) * 1000 + noise
    }
  }
}

export = popsicleRetry
