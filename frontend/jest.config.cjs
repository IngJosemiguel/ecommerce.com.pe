module.exports = {
  // Entorno de testing
  testEnvironment: 'jsdom',
  
  // Archivos de configuración
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  
  // Patrones de archivos de test
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.(test|spec).{js,jsx}'
  ],
  
  // Archivos a ignorar
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/build/'
  ],
  
  // Transformaciones
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-react', { runtime: 'automatic' }]
      ]
    }]
  },
  
  // Módulos a transformar
  transformIgnorePatterns: [
    'node_modules/(?!(@testing-library|msw)/)/',
  ],
  
  // Configuración para ES modules
  extensionsToTreatAsEsm: ['.jsx'],
  
  // Mapeo de módulos
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@pages/(.*)$': '<rootDir>/src/pages/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@contexts/(.*)$': '<rootDir>/src/contexts/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@constants/(.*)$': '<rootDir>/src/constants/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js'
  },
  
  // Directorios de módulos
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  
  // Extensiones de archivos
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  
  // Cobertura de código
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/main.jsx',
    '!src/**/*.stories.{js,jsx}',
    '!src/**/__tests__/**',
    '!src/**/*.test.{js,jsx}',
    '!src/**/*.spec.{js,jsx}',
    '!src/setupTests.js'
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Umbrales de cobertura
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Variables de entorno para tests
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },
  
  // Configuración adicional
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  
  // Timeout para tests
  testTimeout: 10000,
  
  // Configuración para watch mode
  // watchPlugins: [
  //   'jest-watch-typeahead/filename',
  //   'jest-watch-typeahead/testname'
  // ],
  
  // Configuración de reporters
  reporters: [
    'default'
    // ['jest-junit', {
    //   outputDirectory: './coverage',
    //   outputName: 'junit.xml'
    // }]
  ],
  
  // Configuración global
  globals: {
    'process.env': {
      NODE_ENV: 'test',
      REACT_APP_API_URL: 'http://localhost:5000/api'
    }
  }
};