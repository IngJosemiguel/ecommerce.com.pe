import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    const {
      showSuccessToast = false,
      showErrorToast = true,
      successMessage = 'Operación exitosa',
      errorMessage = 'Ha ocurrido un error',
      onSuccess,
      onError,
      retries = 0,
      retryDelay = 1000,
    } = options;

    setLoading(true);
    setError(null);

    let attempt = 0;
    const maxAttempts = retries + 1;

    while (attempt < maxAttempts) {
      try {
        const result = await apiCall();

        if (showSuccessToast) {
          toast.success(successMessage);
        }

        if (onSuccess) {
          onSuccess(result);
        }

        setLoading(false);
        return { success: true, data: result, error: null };
      } catch (err) {
        attempt++;

        if (attempt < maxAttempts) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }

        // Final attempt failed
        const errorMsg =
          err.response?.data?.message || err.message || errorMessage;
        setError(errorMsg);

        if (showErrorToast) {
          toast.error(errorMsg);
        }

        if (onError) {
          onError(err);
        }

        setLoading(false);
        return { success: false, data: null, error: errorMsg };
      }
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    reset,
  };
};

// Hook específico para operaciones CRUD
export const useCrudApi = baseApiCall => {
  const { loading, error, execute, reset } = useApi();

  const create = useCallback(
    (data, options = {}) => {
      return execute(() => baseApiCall.create(data), {
        showSuccessToast: true,
        successMessage: 'Elemento creado exitosamente',
        ...options,
      });
    },
    [execute, baseApiCall]
  );

  const update = useCallback(
    (id, data, options = {}) => {
      return execute(() => baseApiCall.update(id, data), {
        showSuccessToast: true,
        successMessage: 'Elemento actualizado exitosamente',
        ...options,
      });
    },
    [execute, baseApiCall]
  );

  const remove = useCallback(
    (id, options = {}) => {
      return execute(() => baseApiCall.delete(id), {
        showSuccessToast: true,
        successMessage: 'Elemento eliminado exitosamente',
        ...options,
      });
    },
    [execute, baseApiCall]
  );

  const fetch = useCallback(
    (params = {}, options = {}) => {
      return execute(() => baseApiCall.getAll(params), {
        showErrorToast: true,
        ...options,
      });
    },
    [execute, baseApiCall]
  );

  const fetchById = useCallback(
    (id, options = {}) => {
      return execute(() => baseApiCall.getById(id), {
        showErrorToast: true,
        ...options,
      });
    },
    [execute, baseApiCall]
  );

  return {
    loading,
    error,
    create,
    update,
    remove,
    fetch,
    fetchById,
    reset,
  };
};

export default useApi;
