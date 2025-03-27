// Mock pour localStorage
global.localStorage = {
  getItem: jest.fn((key) => {
    if (key === "token") return "fake-token-12345";
    return null;
  }),
  setItem: jest.fn(),
  clear: jest.fn(),
  removeItem: jest.fn(),
};

// Mock pour la fonction fetch globale
global.fetch = jest.fn();
