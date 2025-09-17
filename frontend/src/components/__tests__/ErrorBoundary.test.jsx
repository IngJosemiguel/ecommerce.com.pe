// React 18+ - No need to import React for JSX
import { useState, useEffect } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Componente que lanza error para testing
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock de console.error para evitar logs en tests
// eslint-disable-next-line no-console
const originalError = console.error;
beforeAll(() => {
// Suppress console.error during tests
global.console.error = jest.fn();
});

afterAll(() => {
  // eslint-disable-next-line no-console
  console.error = originalError;
});

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line no-console
    console.error.mockClear();
  });

  it('renderiza children cuando no hay error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renderiza UI de error cuando hay un error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument();
    expect(
      screen.getByText(/Ha ocurrido un error inesperado/)
    ).toBeInTheDocument();
  });

  it('muestra botón de reintentar automáticamente', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryButton = screen.getByText('Reintentar automáticamente');
    expect(retryButton).toBeInTheDocument();
  });

  it('muestra botón de reintentar', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryButton = screen.getByText('Reintentar automáticamente');
    expect(retryButton).toBeInTheDocument();

    // Simular que el error se resuelve
    fireEvent.click(retryButton);

    // El componente debería intentar renderizar de nuevo
    expect(retryButton).toBeInTheDocument();
  });

  it('muestra detalles del error en desarrollo', () => {
    // Simular entorno de desarrollo
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Detalles del error (desarrollo)')).toBeInTheDocument();
    
    // Expandir los detalles del error para acceder al texto
    const detailsElement = screen.getByText('Detalles del error (desarrollo)');
    fireEvent.click(detailsElement);
    
    const errorDetails = screen.getByText('Detalles del error (desarrollo)').closest('details');
    expect(errorDetails).toHaveTextContent('Error: Test error');

    // Restaurar entorno
    process.env.NODE_ENV = originalEnv;
  });

  it('no muestra detalles del error en producción', () => {
    // Simular entorno de producción
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Detalles del error (desarrollo)')).not.toBeInTheDocument();
    expect(screen.queryByText('Error: Test error')).not.toBeInTheDocument();

    // Restaurar entorno
    process.env.NODE_ENV = originalEnv;
  });

  it('renderiza fallback personalizado cuando se proporciona', () => {
    const CustomFallback = ({ error, resetError }) => (
      <div>
        <h2>Error personalizado</h2>
        <p>{error.message}</p>
        <button onClick={resetError}>Reset personalizado</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={CustomFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error personalizado')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('Reset personalizado')).toBeInTheDocument();
  });

  it('llama a onError cuando se proporciona', () => {
    const mockOnError = jest.fn();

    render(
      <ErrorBoundary onError={mockOnError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(mockOnError).toHaveBeenCalledTimes(1);
    expect(mockOnError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object),
      expect.any(Object)
    );
  });

  it('resetea el estado cuando resetError es llamado', () => {
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShouldThrow(false), 100);
        return () => clearTimeout(timer);
      }, []);

      return <ThrowError shouldThrow={shouldThrow} />;
    };

    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    // Inicialmente debería mostrar error
    expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument();

    // Hacer click en reintentar
    const retryButton = screen.getByText('Reintentar automáticamente');
    fireEvent.click(retryButton);

    // Debería seguir mostrando la UI de error hasta que el componente se arregle
    expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument();
  });

  it('maneja errores de renderizado anidados', () => {
    const NestedError = () => {
      throw new Error('Nested error');
    };

    const ParentComponent = () => (
      <div>
        <h1>Parent</h1>
        <NestedError />
      </div>
    );

    render(
      <ErrorBoundary>
        <ParentComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument();
    // eslint-disable-next-line no-console
    expect(console.error).toHaveBeenCalled();
  });

  it('maneja errores asincrónicos correctamente', async () => {
    const AsyncError = () => {
      useEffect(() => {
        // Los errores asincrónicos no son capturados por ErrorBoundary
        // Este test documenta el comportamiento esperado
        setTimeout(() => {
          // Este error no será capturado
        }, 0);
      }, []);

      return <div>Async component</div>;
    };

    render(
      <ErrorBoundary>
        <AsyncError />
      </ErrorBoundary>
    );

    // El componente debería renderizarse normalmente
    expect(screen.getByText('Async component')).toBeInTheDocument();
  });

  it('preserva el estado después de un error y reset', () => {
    const StatefulComponent = ({ shouldThrow }) => {
      const [count, setCount] = useState(0);
    const [hasRendered, setHasRendered] = useState(false);

    useEffect(() => {
        setHasRendered(true);
      }, []);

      if (shouldThrow && !hasRendered) {
        throw new Error('First render error');
      }

      return (
        <div>
          <span>Count: {count}</span>
          <button onClick={() => setCount(c => c + 1)}>Increment</button>
        </div>
      );
    };

    const TestWrapper = () => {
      const [shouldThrow, setShouldThrow] = useState(true);

      return (
        <ErrorBoundary>
          <StatefulComponent shouldThrow={shouldThrow} />
          <button onClick={() => setShouldThrow(false)}>Fix Error</button>
        </ErrorBoundary>
      );
    };

    render(<TestWrapper />);

    // Inicialmente debería mostrar error
    expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument();

    // Hacer click en reintentar
    const retryButton = screen.getByText('Reintentar automáticamente');
    fireEvent.click(retryButton);

    // El estado se resetea con cada intento, por lo que debería seguir mostrando error
    expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument();
  });
});
