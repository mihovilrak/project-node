import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { configure } from '@testing-library/react';

// Configure testing library
configure({
  // Increase the timeout for async operations
  asyncUtilTimeout: 5000,
  // Add custom queries if needed
});

// Add support for act warnings in React 18
// @ts-ignore - Adding React 18 specific environment flag
global.IS_REACT_ACT_ENVIRONMENT = true;

// Mock logger so tests don't depend on real console and logger calls don't leak
jest.mock('./utils/logger', () => ({
  __esModule: true,
  default: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock TouchRipple to prevent unwanted act warnings
jest.mock('@mui/material/ButtonBase/TouchRipple', () => {
  return {
    __esModule: true,
    default: function TouchRipple() {
      return null;
    }
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];

  constructor(
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    console.log('MockIntersectionObserver constructor', callback, options);
  }

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
}

global.IntersectionObserver = MockIntersectionObserver;

// Mock MutationObserver for MUI
global.MutationObserver = class MutationObserver {
  observe() {}
  disconnect() {}
  takeRecords() { return []; }
};

// Add TextEncoder and TextDecoder to global scope
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// Polyfill for ReadableStream FIRST (required by Response.body.getReader())
// MSW needs Response.body to be a ReadableStream with getReader() method
// This must be defined before Response polyfill
if (typeof global.ReadableStream === 'undefined') {
  (global as any).ReadableStream = class ReadableStream {
    constructor(underlyingSource?: any) {
      this._underlyingSource = underlyingSource;
      this._controller = null;
    }
    private _underlyingSource: any;
    private _controller: any;
    getReader() {
      return {
        read: async () => {
          // If we have underlying source, try to read from it
          if (this._underlyingSource && this._underlyingSource.start) {
            // This is a basic implementation - MSW will provide the actual stream
            return { done: true, value: undefined };
          }
          return { done: true, value: undefined };
        },
        cancel: () => Promise.resolve(),
        releaseLock: () => {}
      };
    }
    cancel() { return Promise.resolve(); }
  };
}

// Polyfill for BroadcastChannel (required by MSW v2)
if (typeof global.BroadcastChannel === 'undefined') {
  (global as any).BroadcastChannel = class BroadcastChannel {
    constructor(public name: string) {}
    postMessage() {}
    close() {}
    addEventListener() {}
    removeEventListener() {}
  };
}

// Polyfill for Response, Request, Headers (required by MSW and its dependencies)
// Must be set up AFTER ReadableStream so Response.body can use it
// MSW's HttpResponse.json() creates Response objects - we need to ensure body.getReader() works
if (typeof global.Response === 'undefined') {
  try {
    const fetch = require('node-fetch');
    (global as any).Response = fetch.Response;
    (global as any).Request = fetch.Request;
    (global as any).Headers = fetch.Headers;
  } catch (e) {
    // Create Response that works with MSW - body must be ReadableStream
    const ReadableStreamClass = (global as any).ReadableStream;
    (global as any).Response = class Response {
      body: any;
      status: number;
      statusText: string;
      ok: boolean;
      headers: any;
      constructor(body?: any, init?: any) {
        this.status = init?.status || 200;
        this.statusText = init?.statusText || 'OK';
        this.ok = this.status >= 200 && this.status < 300;
        this.headers = new ((global as any).Headers)(init?.headers);
        // Always ensure body is a ReadableStream with getReader()
        if (body !== null && body !== undefined) {
          if (typeof body === 'string') {
            const encoder = new TextEncoder();
            this.body = new ReadableStreamClass({
              start(controller: any) {
                controller.enqueue(encoder.encode(body));
                controller.close();
              }
            });
          } else if (body && typeof body.getReader === 'function') {
            this.body = body;
          } else {
            this.body = new ReadableStreamClass();
          }
        } else {
          this.body = new ReadableStreamClass();
        }
      }
      static error() { return new Response(null, { status: 0 }); }
      static json(data: any) { 
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        }); 
      }
    };
    (global as any).Request = class Request {
      constructor(public url: string, public init?: any) {}
    };
    (global as any).Headers = class Headers {
      constructor(public init?: any) {}
    };
  }
}

// Polyfill for TransformStream (required by MSW v2)
if (typeof global.TransformStream === 'undefined') {
  (global as any).TransformStream = class TransformStream {
    constructor() {
      this.readable = new (global as any).ReadableStream();
      this.writable = {};
    }
    readable: any;
    writable: any;
  };
  (global as any).WritableStream = class WritableStream {
    constructor() {}
  };
}

// Mock for MUI Popper positioning
jest.mock('@mui/material/styles', () => {
  const originalModule = jest.requireActual('@mui/material/styles');
  return {
    ...originalModule,
    useTheme: () => ({
      ...originalModule.useTheme(),
      transitions: { create: () => 'none' },
      components: {},
    }),
  };
});

// Suppress MUI findDOMNode deprecation warnings and act() warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    /Warning.*not wrapped in act/.test(args[0])
    || /not wrapped in act/.test(args[0])
  ) {
    return;
  }
  if (/Warning: findDOMNode is deprecated in StrictMode/.test(args[0])) {
    return;
  }
  if (/The current testing environment is not configured to support act/.test(args[0])) {
    return;
  }
  originalConsoleError(...args);
};

// Setup MSW (Mock Service Worker) for API mocking in tests
// Use require() to avoid ES module parsing issues
let server: any;
try {
  const serverModule = require('./__tests__/mocks/server');
  server = serverModule.server;
} catch (e) {
  console.error('Failed to load MSW server:', e);
  // Create a no-op server if MSW fails to load
  server = {
    listen: () => {},
    resetHandlers: () => {},
    close: () => {}
  };
}

// Establish API mocking before all tests
beforeAll(() => {
  if (server && server.listen) {
    server.listen({ onUnhandledRequest: 'warn' });
  }
});

// Reset any request handlers that are declared as a part of our tests
// (i.e. for testing one-time error scenarios)
afterEach(() => {
  if (server && server.resetHandlers) {
    server.resetHandlers();
  }
});

// Clean up after the tests are finished
afterAll(() => {
  if (server && server.close) {
    server.close();
  }
});
