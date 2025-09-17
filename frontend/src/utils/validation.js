// Utilidades de validación reutilizables
import { useState, useCallback } from 'react';

// Validadores básicos
export const required = (value, message = 'Este campo es requerido') => {
  if (value === null || value === undefined || value === '') {
    return message;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return message;
  }
  return null;
};

export const email = (value, message = 'Ingrese un email válido') => {
  if (!value) return null;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) ? null : message;
};

export const minLength = (min, message) => (value) => {
  if (!value) return null;
  
  const defaultMessage = `Debe tener al menos ${min} caracteres`;
  return value.length >= min ? null : (message || defaultMessage);
};

export const password = (value, message = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número') => {
  if (!value) return null;
  
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(value) ? null : message;
};

export const confirmPassword = (originalPassword, message = 'Las contraseñas no coinciden') => (value) => {
  if (!value) return null;
  
  return value === originalPassword ? null : message;
};

// Validador compuesto
export const compose = (...validators) => (value) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) return error;
  }
  return null;
};

// Función para validar un campo con múltiples validadores
export const validateField = (value, validatorList = []) => {
  for (const validator of validatorList) {
    const error = validator(value);
    if (error) {
      return error;
    }
  }
  return null;
};

// Función para validar un formulario completo
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach(fieldName => {
    const fieldValue = formData[fieldName];
    const fieldValidators = validationRules[fieldName];

    const error = validateField(fieldValue, fieldValidators);
    if (error) {
      errors[fieldName] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};

// Función auxiliar para crear un hook de validación (requiere React)
export const createFormValidationHook = () => {
  // Este hook debe ser usado en un entorno React
  return (initialValues = {}, validationRules = {}) => {
    // Usar React hooks importados
    
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validateSingleField = useCallback(
      (name, value) => {
        const fieldValidators = validationRules[name] || [];
        return validateField(value, fieldValidators);
      },
      [validationRules]
    );

    const handleChange = useCallback(
      (name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));

        // Validar solo si el campo ya fue tocado
        if (touched[name]) {
          const error = validateSingleField(name, value);
          setErrors(prev => ({ ...prev, [name]: error }));
        }
      },
      [touched, validateSingleField]
    );

    const handleBlur = useCallback(
      name => {
        setTouched(prev => ({ ...prev, [name]: true }));

        const error = validateSingleField(name, values[name]);
        setErrors(prev => ({ ...prev, [name]: error }));
      },
      [values, validateSingleField]
    );

    const validateAll = useCallback(() => {
      const { isValid, errors: validationErrors } = validateForm(
        values,
        validationRules
      );
      setErrors(validationErrors);
      setTouched(
        Object.keys(validationRules).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        )
      );
      return isValid;
    }, [values, validationRules]);

    const reset = useCallback(
      (newValues = initialValues) => {
        setValues(newValues);
        setErrors({});
        setTouched({});
      },
      [initialValues]
    );

    const setFieldError = useCallback((name, error) => {
      setErrors(prev => ({ ...prev, [name]: error }));
    }, []);

    return {
      values,
      errors,
      touched,
      handleChange,
      handleBlur,
      validateAll,
      reset,
      setFieldError,
      isValid:
        Object.keys(errors).length === 0 && Object.keys(touched).length > 0,
    };
  };
};

// Esquemas de validación predefinidos
export const validationSchemas = {
  login: {
    email: [required, email],
    password: [required],
  },

  register: {
    name: [required, minLength(2)],
    email: [required, email],
    password: [required, password],
    confirmPassword: [], // Se debe configurar dinámicamente
  },

  product: {
    name: [
      required,
      minLength(3),
    ],
    description: [required, minLength(10)],
    price: [required],
    category: [required],
  },

  profile: {
    name: [required, minLength(2)],
    email: [required, email],
  },
};
