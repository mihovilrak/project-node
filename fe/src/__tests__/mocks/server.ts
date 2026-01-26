// Use require() to avoid ES module parsing issues with MSW dependencies
const { setupServer } = require('msw/node');
const { handlers } = require('./handlers');

/**
 * MSW server for Node.js (Jest) environment
 * This intercepts HTTP requests in tests
 */
export const server = setupServer(...handlers);
