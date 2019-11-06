import { CommonRequest, CommonResponse } from "servie/dist/common";

/**
 * Browser detection.
 */
declare global {
  namespace NodeJS {
    interface Process {
      browser?: boolean;
    }
  }
}

/**
 * Check if the request should be attempted again.
 */
export function retryAllowed(
  error?: Error & { code?: string },
  response?: CommonResponse
) {
  if (error) {
    if (error.code === "EUNAVAILABLE") {
      if (process.browser) {
        return navigator.onLine !== false;
      }

      return true;
    }

    return false;
  }

  if (response) return ~~(response.status / 100) === 5;

  return false;
}

/**
 * Init a default retry function.
 */
export function retries(count = 3, isRetryAllowed = retryAllowed) {
  // Source: https://github.com/sindresorhus/got/blob/814bcacd1433d8f62dbb81260526b9ff56b26934/index.js#L261-L268
  return function(
    error: Error | undefined,
    response: CommonResponse | undefined,
    iter: number
  ) {
    if (iter > count || !isRetryAllowed(error, response)) {
      return -1;
    }

    const noise = Math.random() * 100;
    return 2 ** (iter - 1) * 1000 + noise;
  };
}

/**
 * Middleware signature.
 */
export type App<T extends CommonRequest, U extends CommonResponse> = (
  req: T,
  next: () => Promise<U>
) => Promise<U>;

/**
 * Middleware for running retry logic.
 */
export function retry<T extends CommonRequest, U extends CommonResponse>(
  fn: App<T, U>,
  shouldRetry: (
    error: Error | undefined,
    response: CommonResponse | undefined,
    iter: number
  ) => number = retries(),
  preFlight: (req: T, iter: number, origRequest: T) => T = req => req
): App<T, U> {
  return async function retry(request, next) {
    let iter = 0;

    // Attempt a retry.
    function attempt(
      error: Error | undefined,
      response: U | undefined,
      result: Promise<U>
    ): Promise<U> {
      const delay = shouldRetry(error, response, ++iter);
      if (delay < 0) return result;

      return new Promise(resolve => {
        setTimeout(() => resolve(run(request.clone() as T)), delay);
      });
    }

    async function run(req: T): Promise<U> {
      try {
        const res = await fn(preFlight(req, iter, request), next);
        return attempt(undefined, res, Promise.resolve(res));
      } catch (err) {
        return attempt(err, undefined, Promise.reject(err));
      }
    }

    return run(request.clone() as T);
  };
}
