import Promise = require('any-promise')
import { Request, Response } from 'popsicle'

/* tslint:disable */
function noop () {}
/* tslint:enable */

function defaultShouldRetry (request: Request) {
  if (request.errored) {
    return request.errored.code === 'EUNAVAILABLE'
  }

  if (request.response) {
    return request.response.statusType() === 5
  }

  return false
}

function popsicleRetry ({
  maxRetries = 5, retryDelay = 5000, shouldRetry = defaultShouldRetry, onRetry = noop
}: popsicleRetry.Options = {}) {
  return function (self: Request) {
    let retries = 0

    self.always(function (request) {
      if (shouldRetry(request) && retries < maxRetries) {
        return new Promise((resolve) => {
          setTimeout(() => {
            const retry = request.clone()
            retries++
            onRetry(retry)
            resolve(retry)
          }, retryDelay)
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
  export interface Options {
    maxRetries?: number
    retryDelay?: number
    shouldRetry?: (request?: Request) => boolean
    onRetry?: (request?: Request) => any
  }
}

export = popsicleRetry
