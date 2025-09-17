import { createContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario guardado en localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiService.login(email, password);

      if (response.user && response.token) {
        const { user, token } = response;
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        toast.success('Sesión iniciada correctamente');
        return { success: true, user };
      } else {
        toast.error(response.message || 'Error al iniciar sesión');
        return {
          success: false,
          error: response.message || 'Credenciales inválidas',
        };
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor');
      return { success: false, error: 'Error al iniciar sesión' };
    }
  };

  const register = async userData => {
    try {
      const response = await apiService.register(userData);

      if (response.user && response.token) {
        const { user, token } = response;
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        toast.success('Cuenta creada correctamente');
        return { success: true, user };
      } else {
        toast.error(response.message || 'Error al registrarse');
        return {
          success: false,
          error: response.message || 'Error al registrarse',
        };
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor');
      return { success: false, error: 'Error al registrarse' };
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error al cerrar sesión:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      toast.success('Sesión cerrada correctamente');
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isCustomer = () => {
    return user?.role === 'customer';
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAdmin,
    isCustomer,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



export default AuthContext;
