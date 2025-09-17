import { renderHook, act, waitFor } from '@testing-library/react';
import { toast } from 'react-hot-toast';
import { useApi, useCrudApi } from '../useApi';

// Mock de react-hot-toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
}));

// Mock de fetch global
global.fetch = jest.fn();

describe('useApi Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch.mockClear();
  });

  describe('useApi básico', () => {
    const mockApiFunction = jest.fn();

    beforeEach(() => {
      mockApiFunction.mockClear();
    });

    it('inicializa con estado correcto', () => {
      const { result } = renderHook(() => useApi(mockApiFunction));

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.execute).toBe('function');
      expect(typeof result.current.retry).toBe('function');
    });

    it('ejecuta función API exitosamente', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockApiFunction.mockResolvedValue(mockData);

      const { result } = renderHook(() => useApi(mockApiFunction));

      await act(async () => {
        await result.current.execute('param1', 'param2');
      });

      expect(mockApiFunction).toHaveBeenCalledWith('param1', 'param2');
      expect(result.current.data).toEqual(mockData);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('maneja errores correctamente', async () => {
      const mockError = new Error('API Error');
      mockApiFunction.mockRejectedValue(mockError);

      const { result } = renderHook(() => useApi(mockApiFunction));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(mockError);
    });

    it('actualiza estado de loading correctamente', async () => {
      let resolvePromise;
      const pendingPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockApiFunction.mockReturnValue(pendingPromise);

      const { result } = renderHook(() => useApi(mockApiFunction));

      act(() => {
        result.current.execute();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolvePromise({ success: true });
        await pendingPromise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('función retry ejecuta la última llamada', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockApiFunction.mockResolvedValue(mockData);

      const { result } = renderHook(() => useApi(mockApiFunction));

      await act(async () => {
        await result.current.execute('param1', 'param2');
      });

      mockApiFunction.mockClear();
      mockApiFunction.mockResolvedValue({ id: 2, name: 'Retry' });

      await act(async () => {
        await result.current.retry();
      });

      expect(mockApiFunction).toHaveBeenCalledWith('param1', 'param2');
      expect(result.current.data).toEqual({ id: 2, name: 'Retry' });
    });

    it('retry no hace nada si no hay llamada previa', async () => {
      const { result } = renderHook(() => useApi(mockApiFunction));

      await act(async () => {
        await result.current.retry();
      });

      expect(mockApiFunction).not.toHaveBeenCalled();
    });
  });

  describe('useApi con opciones', () => {
    const mockApiFunction = jest.fn();

    beforeEach(() => {
      mockApiFunction.mockClear();
    });

    it('ejecuta automáticamente con autoExecute', async () => {
      const mockData = { id: 1, name: 'Auto' };
      mockApiFunction.mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useApi(mockApiFunction, {
          autoExecute: true,
          params: ['auto-param'],
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockApiFunction).toHaveBeenCalledWith('auto-param');
      expect(result.current.data).toEqual(mockData);
    });

    it('muestra toast de éxito cuando está habilitado', async () => {
      const mockData = { id: 1, name: 'Success' };
      mockApiFunction.mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useApi(mockApiFunction, {
          showSuccessToast: true,
          successMessage: 'Operación exitosa',
        })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(toast.success).toHaveBeenCalledWith('Operación exitosa');
    });

    it('muestra toast de error cuando está habilitado', async () => {
      const mockError = new Error('API Error');
      mockApiFunction.mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useApi(mockApiFunction, {
          showErrorToast: true,
          errorMessage: 'Error personalizado',
        })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(toast.error).toHaveBeenCalledWith('Error personalizado');
    });

    it('usa mensaje de error por defecto', async () => {
      const mockError = new Error('API Error');
      mockApiFunction.mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useApi(mockApiFunction, { showErrorToast: true })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(toast.error).toHaveBeenCalledWith('Ha ocurrido un error');
    });

    it('ejecuta callback onSuccess', async () => {
      const mockData = { id: 1, name: 'Success' };
      const onSuccess = jest.fn();
      mockApiFunction.mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useApi(mockApiFunction, { onSuccess })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(onSuccess).toHaveBeenCalledWith(mockData);
    });

    it('ejecuta callback onError', async () => {
      const mockError = new Error('API Error');
      const onError = jest.fn();
      mockApiFunction.mockRejectedValue(mockError);

      const { result } = renderHook(() => useApi(mockApiFunction, { onError }));

      await act(async () => {
        await result.current.execute();
      });

      expect(onError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('useCrudApi', () => {
    const mockService = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    beforeEach(() => {
      Object.values(mockService).forEach(fn => fn.mockClear());
    });

    it('inicializa con estado correcto', () => {
      const { result } = renderHook(() => useCrudApi(mockService));

      expect(result.current.data).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.getAll).toBe('function');
      expect(typeof result.current.getById).toBe('function');
      expect(typeof result.current.create).toBe('function');
      expect(typeof result.current.update).toBe('function');
      expect(typeof result.current.delete).toBe('function');
    });

    it('ejecuta getAll correctamente', async () => {
      const mockData = [{ id: 1 }, { id: 2 }];
      mockService.getAll.mockResolvedValue(mockData);

      const { result } = renderHook(() => useCrudApi(mockService));

      await act(async () => {
        await result.current.getAll();
      });

      expect(mockService.getAll).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockData);
    });

    it('ejecuta getById correctamente', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockService.getById.mockResolvedValue(mockData);

      const { result } = renderHook(() => useCrudApi(mockService));

      await act(async () => {
        await result.current.getById(1);
      });

      expect(mockService.getById).toHaveBeenCalledWith(1);
      expect(result.current.data).toEqual(mockData);
    });

    it('ejecuta create correctamente', async () => {
      const newItem = { name: 'New Item' };
      const createdItem = { id: 1, ...newItem };
      mockService.create.mockResolvedValue(createdItem);

      const { result } = renderHook(() => useCrudApi(mockService));

      await act(async () => {
        await result.current.create(newItem);
      });

      expect(mockService.create).toHaveBeenCalledWith(newItem);
      expect(result.current.data).toEqual(createdItem);
    });

    it('ejecuta update correctamente', async () => {
      const updateData = { name: 'Updated Item' };
      const updatedItem = { id: 1, ...updateData };
      mockService.update.mockResolvedValue(updatedItem);

      const { result } = renderHook(() => useCrudApi(mockService));

      await act(async () => {
        await result.current.update(1, updateData);
      });

      expect(mockService.update).toHaveBeenCalledWith(1, updateData);
      expect(result.current.data).toEqual(updatedItem);
    });

    it('ejecuta delete correctamente', async () => {
      const deleteResponse = { success: true };
      mockService.delete.mockResolvedValue(deleteResponse);

      const { result } = renderHook(() => useCrudApi(mockService));

      await act(async () => {
        await result.current.delete(1);
      });

      expect(mockService.delete).toHaveBeenCalledWith(1);
      expect(result.current.data).toEqual(deleteResponse);
    });

    it('maneja errores en operaciones CRUD', async () => {
      const mockError = new Error('CRUD Error');
      mockService.getAll.mockRejectedValue(mockError);

      const { result } = renderHook(() => useCrudApi(mockService));

      await act(async () => {
        await result.current.getAll();
      });

      expect(result.current.error).toBe(mockError);
      expect(result.current.data).toBeNull();
    });

    it('muestra toasts para operaciones CRUD exitosas', async () => {
      const createdItem = { id: 1, name: 'New Item' };
      mockService.create.mockResolvedValue(createdItem);

      const { result } = renderHook(() =>
        useCrudApi(mockService, { showSuccessToast: true })
      );

      await act(async () => {
        await result.current.create({ name: 'New Item' });
      });

      expect(toast.success).toHaveBeenCalledWith(
        'Operación completada exitosamente'
      );
    });
  });

  describe('Casos edge y cleanup', () => {
    it('cancela requests cuando el componente se desmonta', async () => {
      const mockApiFunction = jest.fn();
      let resolvePromise;
      const pendingPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      mockApiFunction.mockReturnValue(pendingPromise);

      const { result, unmount } = renderHook(() => useApi(mockApiFunction));

      act(() => {
        result.current.execute();
      });

      expect(result.current.loading).toBe(true);

      unmount();

      // Resolver después del unmount no debería actualizar el estado
      await act(async () => {
        resolvePromise({ data: 'test' });
        await pendingPromise;
      });

      // No podemos verificar el estado después del unmount,
      // pero esto asegura que no hay warnings de memory leaks
    });

    it('maneja múltiples llamadas concurrentes', async () => {
      const mockApiFunction = jest.fn();

      const { result } = renderHook(() => useApi(mockApiFunction));

      // Primera llamada
      mockApiFunction.mockResolvedValueOnce({ id: 1 });
      const promise1 = act(async () => {
        await result.current.execute('param1');
      });

      // Segunda llamada antes de que termine la primera
      mockApiFunction.mockResolvedValueOnce({ id: 2 });
      const promise2 = act(async () => {
        await result.current.execute('param2');
      });

      await Promise.all([promise1, promise2]);

      // Debería tener el resultado de la última llamada
      expect(result.current.data).toEqual({ id: 2 });
      expect(mockApiFunction).toHaveBeenCalledTimes(2);
    });

    it('maneja errores de red correctamente', async () => {
      const mockApiFunction = jest.fn();
      const networkError = new TypeError('Failed to fetch');
      mockApiFunction.mockRejectedValue(networkError);

      const { result } = renderHook(() =>
        useApi(mockApiFunction, { showErrorToast: true })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.error).toBe(networkError);
      expect(toast.error).toHaveBeenCalledWith('Ha ocurrido un error');
    });
  });
});
