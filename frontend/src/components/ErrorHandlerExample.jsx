import { useState } from 'react';
import { useErrorHandler } from '../hooks/useErrorHandler';

/**
 * Ejemplo de cómo usar el hook useErrorHandler
 * Este componente demuestra el manejo de errores asincrónicos
 */
const ErrorHandlerExample = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const { handleError, handleAsyncError } = useErrorHandler();

  // Ejemplo 1: Manejo de error directo
  const handleDirectError = () => {
    try {
      // Simular un error
      throw new Error('Error simulado para demostración');
    } catch (error) {
      handleError(error, { component: 'ErrorHandlerExample', action: 'directError' });
    }
  };

  // Ejemplo 2: Manejo de error asíncrono
  const handleAsyncOperation = async () => {
    setLoading(true);
    
    await handleAsyncError(async () => {
      // Simular una operación asíncrona que falla
      const response = await fetch('/api/nonexistent-endpoint');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
    }, { 
      component: 'ErrorHandlerExample', 
      action: 'asyncOperation' 
    });
    
    setLoading(false);
  };

  // Ejemplo 3: Error que será capturado por ErrorBoundary
  const triggerBoundaryError = () => {
    throw new Error('Error que será capturado por ErrorBoundary');
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Ejemplos de Manejo de Errores</h2>
      
      <div className="space-y-3">
        <button
          onClick={handleDirectError}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Error Directo (Toast)
        </button>
        
        <button
          onClick={handleAsyncOperation}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Cargando...' : 'Error Asíncrono (Toast)'}
        </button>
        
        <button
          onClick={triggerBoundaryError}
          className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Error Boundary (UI Completa)
        </button>
      </div>
      
      {data && (
        <div className="mt-4 p-3 bg-green-100 rounded">
          <p className="text-green-800">Datos cargados: {JSON.stringify(data)}</p>
        </div>
      )}
    </div>
  );
};

export default ErrorHandlerExample;