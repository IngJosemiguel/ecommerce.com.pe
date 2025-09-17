/* eslint-disable no-console */
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { server } from './mocks/server';

// Configurar React Testing Library
configure({ testIdAttribute: 'data-testid' });

// Mock de IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock de ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock de matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock de localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock de sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock de fetch
global.fetch = jest.fn();

// Mock de URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

// Mock de console para tests más limpios
const originalError = console.error;
beforeAll(() => {
    console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Configurar MSW (Mock Service Worker)
beforeAll(() => {
  // Habilitar el servidor de mocks antes de todos los tests
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  // Reset handlers después de cada test
  server.resetHandlers();

  // Limpiar mocks
  jest.clearAllMocks();

  // Limpiar localStorage y sessionStorage
  localStorage.clear();
  sessionStorage.clear();
});

afterAll(() => {
  // Cerrar el servidor después de todos los tests
  server.close();
});

// Utilidades de testing globales
global.testUtils = {
  // Simular delay
  delay: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms)),

  // Mock de usuario autenticado
  mockAuthenticatedUser: (
    user = { id: 1, email: 'test@example.com', role: 'user' }
  ) => {
    localStorageMock.getItem.mockImplementation(key => {
      if (key === 'user') return JSON.stringify(user);
      if (key === 'token') return 'mock-token';
      return null;
    });
  },

  // Mock de usuario admin
  mockAdminUser: () => {
    const adminUser = { id: 1, email: 'admin@example.com', role: 'admin' };
    global.testUtils.mockAuthenticatedUser(adminUser);
  },

  // Limpiar autenticación
  clearAuth: () => {
    localStorageMock.getItem.mockReturnValue(null);
  },

  // Mock de respuesta exitosa de API
  mockApiSuccess: data => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => data,
    });
  },

  // Mock de error de API
  mockApiError: (status = 500, message = 'Server Error') => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status,
      json: async () => ({ message }),
    });
  },

  // Mock de error de red
  mockNetworkError: () => {
    global.fetch.mockRejectedValueOnce(new Error('Network Error'));
  },
};

// Configuración de timeouts para tests async
jest.setTimeout(10000);

// Suprimir warnings específicos en tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('componentWillReceiveProps') ||
      args[0].includes('componentWillMount'))
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

// Configurar timezone para tests consistentes
process.env.TZ = 'UTC';

// Mock de react-router-dom para tests que no necesitan routing completo
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
}));

// Mock de react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
  Toaster: () => null,
}));
