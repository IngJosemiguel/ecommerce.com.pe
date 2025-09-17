import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Heart,
  Star,
  Grid,
  List,
} from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { useCart } from '../hooks/useCart';
import toast from 'react-hot-toast';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [wishlist, setWishlist] = useState([]);
  const { addToCart, getCartItemsCount } = useCart();
// Removed unused state variable 'showFilters'

  // Hook personalizado para búsqueda y filtrado
  const {
    searchTerm,
    setSearchTerm,
    filterValue: selectedCategory,
    setFilterValue: setSelectedCategory,
    sortBy,
    setSortBy,
    filteredData: filteredProducts
  } = useSearch(products, {
    searchFields: ['name', 'description'],
    filterField: 'category',
    sortField: 'name'
  });

  // Mock products data
  useEffect(() => {
    const mockProducts = [
      {
        id: 1,
        name: 'iPhone 14 Pro',
        price: 999,
        originalPrice: 1099,
        category: 'electronics',
        image:
          'https://via.placeholder.com/300x300/3B82F6/FFFFFF?text=iPhone+14',
        rating: 4.8,
        reviews: 245,
        description: 'El iPhone más avanzado con chip A16 Bionic y cámara Pro',
        inStock: true,
        discount: 9,
      },
      {
        id: 2,
        name: 'MacBook Air M2',
        price: 1199,
        originalPrice: 1299,
        category: 'electronics',
        image:
          'https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=MacBook+Air',
        rating: 4.9,
        reviews: 189,
        description: 'Ultraligero y potente con el chip M2 de Apple',
        inStock: true,
        discount: 8,
      },
      {
        id: 3,
        name: 'Camiseta Premium',
        price: 29,
        originalPrice: 39,
        category: 'clothing',
        image:
          'https://via.placeholder.com/300x300/10B981/FFFFFF?text=Camiseta',
        rating: 4.5,
        reviews: 67,
        description: 'Camiseta de algodón 100% orgánico, suave y cómoda',
        inStock: true,
        discount: 26,
      },
      {
        id: 4,
        name: 'Zapatillas Running',
        price: 89,
        originalPrice: 120,
        category: 'clothing',
        image:
          'https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=Zapatillas',
        rating: 4.6,
        reviews: 134,
        description: 'Zapatillas deportivas con tecnología de amortiguación',
        inStock: true,
        discount: 26,
      },
      {
        id: 5,
        name: 'Libro de Cocina',
        price: 24,
        originalPrice: 30,
        category: 'books',
        image:
          'https://via.placeholder.com/300x300/EF4444/FFFFFF?text=Libro+Cocina',
        rating: 4.7,
        reviews: 89,
        description: 'Recetas deliciosas y fáciles para toda la familia',
        inStock: true,
        discount: 20,
      },
      {
        id: 6,
        name: 'Auriculares Bluetooth',
        price: 79,
        originalPrice: 99,
        category: 'electronics',
        image:
          'https://via.placeholder.com/300x300/6366F1/FFFFFF?text=Auriculares',
        rating: 4.4,
        reviews: 156,
        description: 'Auriculares inalámbricos con cancelación de ruido',
        inStock: false,
        discount: 20,
      },
    ];
    setProducts(mockProducts);
  }, []);



  const categories = [
    { id: 'all', name: 'Todos', count: products.length },
    {
      id: 'electronics',
      name: 'Electrónicos',
      count: products.filter(p => p.category === 'electronics').length,
    },
    {
      id: 'clothing',
      name: 'Ropa',
      count: products.filter(p => p.category === 'clothing').length,
    },
    {
      id: 'books',
      name: 'Libros',
      count: products.filter(p => p.category === 'books').length,
    },
  ];

  // addToCart function is now provided by useCart hook

  const toggleWishlist = product => {
    const isInWishlist = wishlist.find(item => item.id === product.id);
    if (isInWishlist) {
      setWishlist(wishlist.filter(item => item.id !== product.id));
      toast.success('Eliminado de favoritos');
    } else {
      setWishlist([...wishlist, product]);
      toast.success('Agregado a favoritos');
    }
  };

  const ProductCard = ({ product }) => {
    const isInWishlist = wishlist.find(item => item.id === product.id);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="group relative"
      >
        <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-200">
          <div className="relative overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            
            {product.discount > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                -{product.discount}%
              </div>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleWishlist(product)}
              className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                isInWishlist
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white shadow-sm'
              }`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </motion.button>
            
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-white text-gray-800 px-3 py-1 rounded font-medium text-sm">Agotado</span>
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-center mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 ml-2">
                ({product.reviews})
              </span>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-900">
                  ${product.price}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => addToCart(product)}
              disabled={!product.inStock}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{product.inStock ? 'Agregar al Carrito' : 'Agotado'}</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-gray-900 mb-3"
            >
              TechStore
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Los mejores productos de tecnología y más
            </motion.p>
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-blue-600 hover:bg-blue-700 rounded-lg p-3 shadow-md transition-colors"
              >
                <ShoppingCart className="w-6 h-6 text-white" />
                {getCartItemsCount() > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold"
                  >
                    {getCartItemsCount()}
                  </motion.span>
                )}
              </motion.div>
            </div>
          </div>

          {/* Search and Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col lg:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="name">Ordenar por nombre</option>
                <option value="price-low">Precio: menor a mayor</option>
                <option value="price-high">Precio: mayor a menor</option>
                <option value="rating">Mejor valorados</option>
              </select>

              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white'}`}
                >
                  <Grid className="w-4 h-4" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-white'}`}
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-64 flex-shrink-0"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{category.name}</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        selectedCategory === category.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {category.count}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Products Grid */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex-1"
          >
            <div className="mb-6">
              <div className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200">
                <p className="text-gray-600 text-sm">
                  Mostrando <span className="font-semibold text-gray-900">{filteredProducts.length}</span> de <span className="font-semibold text-gray-900">{products.length}</span> productos
                </p>
              </div>
            </div>

            <div
              className={`grid gap-6 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 col-span-full"
              >
                <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 max-w-md mx-auto">
                  <div className="text-gray-400 mb-4">
                    <Search className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    No se encontraron productos
                  </h3>
                  <p className="text-gray-600">
                    Intenta con otros términos de búsqueda o explora nuestras categorías
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
