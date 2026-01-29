// Jest mock implementation for Bun test environment
const jest = {
  fn: () => {
    const mockFn = (...args: any[]) => {
      mockFn.mock.calls = [...(mockFn.mock.calls || []), args];
      mockFn.mock.results = [...(mockFn.mock.results || [])];
      return mockFn.mock.returnValue;
    };

    mockFn.mock = {
      calls: [],
      results: [],
      returnValue: undefined as any,
    };

    mockFn.mockImplementation = (impl: Function) => {
      mockFn.implementation = impl;
      return mockFn;
    };

    mockFn.mockResolvedValue = (value: any) => {
      mockFn.mockReturnValue = value;
      return mockFn;
    };

    mockFn.mockRejectedValue = (error: Error) => {
      mockFn.mockReturnValue = Promise.reject(error);
      return mockFn;
    };

    mockFn.mockReset = () => {
      mockFn.mock.calls = [];
      mockFn.mock.results = [];
      mockFn.mock.returnValue = undefined;
      mockFn.implementation = undefined;
    };

    return mockFn;
  },
};

// Make jest globally available for tests
(global as any).jest = jest;
