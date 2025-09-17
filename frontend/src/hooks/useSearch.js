import { useState, useEffect, useMemo } from 'react';

// Función auxiliar para obtener valores anidados (fuera del hook para evitar re-renders)
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

/**
 * Hook personalizado para manejar búsqueda y filtrado de datos
 * @param {Array} data - Array de datos a filtrar
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Estado y funciones de búsqueda/filtrado
 */
export const useSearch = (data = [], options = {}) => {
  const {
    searchFields = ['name'], // Campos donde buscar
    filterField = null, // Campo para filtrar por categoría/estado
    sortField = 'name', // Campo por defecto para ordenar
    debounceDelay = 300, // Delay para debounce
  } = options;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterValue, setFilterValue] = useState('all');
  const [sortBy, setSortBy] = useState(sortField);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce del término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceDelay]);

  // Filtrado y ordenamiento de datos
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Filtrar por categoría/estado
    if (filterField && filterValue !== 'all') {
      filtered = filtered.filter(item => item[filterField] === filterValue);
    }

    // Filtrar por término de búsqueda
    if (debouncedSearchTerm) {
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = getNestedValue(item, field);
          return value && value.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        })
      );
    }

    // Ordenar datos
    if (sortBy) {
      filtered.sort((a, b) => {
        const aValue = getNestedValue(a, sortBy);
        const bValue = getNestedValue(b, sortBy);

        // Ordenamiento especial para precios
        if (sortBy === 'price-low') {
          return a.price - b.price;
        }
        if (sortBy === 'price-high') {
          return b.price - a.price;
        }
        if (sortBy === 'rating') {
          return (b.rating || 0) - (a.rating || 0);
        }

        // Ordenamiento por defecto
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return aValue - bValue;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, debouncedSearchTerm, filterValue, sortBy, searchFields, filterField]);

  // Resetear filtros
  const resetFilters = () => {
    setSearchTerm('');
    setFilterValue('all');
    setSortBy(sortField);
  };

  return {
    searchTerm,
    setSearchTerm,
    filterValue,
    setFilterValue,
    sortBy,
    setSortBy,
    filteredData,
    resetFilters,
    resultsCount: filteredData.length,
    hasResults: filteredData.length > 0,
  };
};

export default useSearch;