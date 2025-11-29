// Mock the database connection before any imports
const mockDb = {
  transaction: jest.fn().mockImplementation(async (callback: any) => {
    const mockTrx = {};
    return callback(mockTrx);
  }),
  raw: jest.fn().mockResolvedValue([]),
  destroy: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../database/connection', () => ({
  __esModule: true,
  default: mockDb,
}));

// Mock axios for Adjutor API calls
jest.mock('axios');

// Global test timeout
jest.setTimeout(30000);

// Clean up after all tests
afterAll(async () => {
  // Close any open handles
  await new Promise(resolve => setTimeout(resolve, 500));
});
