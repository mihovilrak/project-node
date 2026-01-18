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
