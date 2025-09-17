import { useCallback } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Hook personalizado para manejo centralizado de errores
 * Complementa el ErrorBoundary para errores asincrónicos
 */
export const useErrorHandler = () => {
  const handleError = useCallback((error, context = {}) => {
    // Log del error
    // eslint-disable-next-line no-console
    console.error('Error handled by useErrorHandler:', error, context);
    
    // Mostrar toast de error al usuario
    const errorMessage = error?.message || 'Ha ocurrido un error inesperado';
    toast.error(errorMessage, {
      duration: 5000,
      position: 'top-right'
    });
    
    // Reportar error en producción
    if (process.env.NODE_ENV === 'production') {
      reportError(error, context);
    }
  }, []);
  
  const handleAsyncError = useCallback(async (asyncFn, context = {}) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, { ...context, type: 'async' });
      throw error; // Re-throw para que el componente pueda manejar el estado
    }
  }, [handleError]);
  
  const reportError = async (error, context) => {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          context: {
            ...context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
          }
        })
      });
    } catch (reportingError) {
      // eslint-disable-next-line no-console
      console.error('Failed to report error:', reportingError);
    }
  };
  
  return {
    handleError,
    handleAsyncError
  };
};

export default useErrorHandler;