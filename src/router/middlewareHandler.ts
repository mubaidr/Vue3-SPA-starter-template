/** This file defines a middleware handler that can handle multiple middlewares in a given route, navigating to each one until all pass */
//     // if so, continue to the intended route

import type { Router } from "vue-router";

/**
 * A class that handles the middlewares of the coming request.
 *
 * @export
 * @class MiddlewareHandler
 */
export class MiddlewareHandler {
  /**
   * Our "request" object - the route that the request is going to
   *
   * @type {RouteLocationNormalized}
   * @memberof MiddlewareHandler
   */
  middlewares: string[];
  middlewareCallback: any | null;

  constructor(
    middlewares: string[] | string,
    middlewareCallback = null as any
  ) {
    if (typeof middlewares === "string") {
      middlewares = [middlewares];
    }
    this.middlewares = middlewares;
    this.middlewareCallback = middlewareCallback;
  }

  /**
   * Handle a middleware given its name. It will import the middleware and then run its default export function
   *
   * @param {string} name
   * @return {*}
   * @memberof MiddlewareHandler
   */
  handleMiddleware(name: string, options: any) {
    return import(`./middlewares/${name}.ts`).then((middleware) => {
      return middleware.default(options);
    });
  }

  /**
   * Run the middleware handler. This will look at all the middlewares for the given route, and run them one by one. If a middleware redirects (e.g. prevents access), then the user will be redirected according to the middleware and the next middlewares will not run
   *
   * @return {*}
   * @memberof MiddlewareHandler
   */
  async handle() {
    // If there are no middlewares to run, just continue
    if (!this.middlewares) {
      return;
    }

    for (const middleware of this.middlewares) {
      const result = {
        middleware: middleware,
        data: undefined as any,
      };

      result.data = await this.handleMiddleware(
        middleware,
        this.middlewareCallback
      );

      // If the middleware returned something, it means that we're going to the middleware intercepted route instead
      if (result.data !== undefined) {
        // If the result is false, we cancel the navigation
        if (result.data === false) {
          return result;
        }

        // We should set a reference to the intended page in the URL so we can redirect there after the middleware that intercepted the request is satisfied. Some middlewares may not want this behaviour (e.g. if you're authenticated but trying to visit a guest only page (like login), you don't want to set a redirect to login in the URL as it makes no sense)
        if (
          !(result.data.setRedirectToIntended === false) &&
          this.middlewareCallback?.fullPath
        ) {
          result.data.query = {
            redirect: this.middlewareCallback.fullPath,
          };
        }

        return result;
      }
    }
  }
}

export const setupMiddlewareHandler = (router: Router) => {
  router.beforeEach(async (to) => {
    if (!to.redirectedFrom && to.query.redirect) {
      return to.query.redirect;
    }

    const middleware = new MiddlewareHandler(
      (to.meta.middleware as string[]) || [],
      to
    );

    const response = await middleware.handle();

    if (response && "data" in response) {
      return response.data;
    }
  });
};
