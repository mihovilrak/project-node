module.exports = {
    injectGlobal: jest.fn(),
    insertRule: jest.fn(),
    keyframes: jest.fn(),
    sheet: {
      insertRule: jest.fn(),
      cssRules: [],
    },
  };
  