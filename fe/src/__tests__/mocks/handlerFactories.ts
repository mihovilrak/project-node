// @ts-nocheck - MSW v1 handlers don't have perfect TypeScript support
// MSW v1 API - use rest handlers
const { rest } = require('msw');

/**
 * Factory functions for creating MSW handlers
 */

export interface HandlerConfig {
  url: string;
  data?: any;
  status?: number;
  delay?: number;
}

/**
 * Create a GET handler
 */
export const createGetHandler = (
  url: string,
  data: any,
  status: number = 200,
  delay?: number
) => {
  return rest.get(url, async (req, res, ctx) => {
    if (delay) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return res(ctx.status(status), ctx.json(data));
  });
};

/**
 * Create a POST handler
 */
export const createPostHandler = (
  url: string,
  responseData: any,
  status: number = 200,
  delay?: number
) => {
  return rest.post(url, async (req, res, ctx) => {
    if (delay) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return res(ctx.status(status), ctx.json(responseData));
  });
};

/**
 * Create a PUT handler
 */
export const createPutHandler = (
  url: string,
  responseData: any,
  status: number = 200,
  delay?: number
) => {
  return rest.put(url, async (req, res, ctx) => {
    if (delay) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return res(ctx.status(status), ctx.json(responseData));
  });
};

/**
 * Create a PATCH handler
 */
export const createPatchHandler = (
  url: string,
  responseData: any,
  status: number = 200,
  delay?: number
) => {
  return rest.patch(url, async (req, res, ctx) => {
    if (delay) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return res(ctx.status(status), ctx.json(responseData));
  });
};

/**
 * Create a DELETE handler
 */
export const createDeleteHandler = (
  url: string,
  status: number = 200,
  delay?: number
) => {
  return rest.delete(url, async (req, res, ctx) => {
    if (delay) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return res(ctx.status(status), ctx.json({}));
  });
};

/**
 * Create an error handler
 */
export const createErrorHandler = (
  url: string,
  status: number,
  error: string | { error: string },
  delay?: number
) => {
  return rest.all(url, async (req, res, ctx) => {
    if (delay) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    const errorMessage = typeof error === 'string' ? error : error.error;
    return res(ctx.status(status), ctx.json({ error: errorMessage }));
  });
};

/**
 * Create a network error handler (simulates network failure)
 */
export const createNetworkErrorHandler = (url: string) => {
  return rest.all(url, () => {
    throw new Error('Network Error');
  });
};
