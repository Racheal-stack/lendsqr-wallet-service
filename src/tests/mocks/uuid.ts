// Mock implementation of uuid for testing
let counter = 0;

export const v4 = (): string => {
  counter++;
  return `test-uuid-${counter}-${Date.now()}`;
};

export default { v4 };
