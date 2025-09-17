import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Eye,
  Search,
  Filter,
  Calendar,
  MapPin,
  CreditCard,
  Download,
} from 'lucide-react';
import { useSearch } from '../hooks/useSearch';

const MyOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Mock orders data
  const orders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'Entregado',
      total: 125.99,
      items: [
        {
          name: 'Smartphone Pro',
          quantity: 1,
          price: 99.99,
          image: '/api/placeholder/60/60',
        },
        {
          name: 'Funda Protectora',
          quantity: 1,
          price: 26.0,
          image: '/api/placeholder/60/60',
        },
      ],
      shipping: {
        address: 'Calle Principal 123, Madrid, España',
        method: 'Envío Estándar',
        tracking: 'ES123456789',
      },
      payment: {
        method: 'Tarjeta de Crédito',
        last4: '1234',
      },
    },
    {
      id: 'ORD-002',
      date: '2024-01-12',
      status: 'En Tránsito',
      total: 89.5,
      items: [
        {
          name: 'Auriculares Bluetooth',
          quantity: 1,
          price: 89.5,
          image: '/api/placeholder/60/60',
        },
      ],
      shipping: {
        address: 'Calle Principal 123, Madrid, España',
        method: 'Envío Express',
        tracking: 'ES987654321',
      },
      payment: {
        method: 'PayPal',
        last4: null,
      },
    },
    {
      id: 'ORD-003',
      date: '2024-01-08',
      status: 'Procesando',
      total: 234.75,
      items: [
        {
          name: 'Laptop Gaming',
          quantity: 1,
          price: 199.99,
          image: '/api/placeholder/60/60',
        },
        {
          name: 'Mouse Gaming',
          quantity: 1,
          price: 34.76,
          image: '/api/placeholder/60/60',
        },
      ],
      shipping: {
        address: 'Calle Principal 123, Madrid, España',
        method: 'Envío Estándar',
        tracking: null,
      },
      payment: {
        method: 'Tarjeta de Crédito',
        last4: '5678',
      },
    },
    {
      id: 'ORD-004',
      date: '2024-01-05',
      status: 'Cancelado',
      total: 67.25,
      items: [
        {
          name: 'Smartwatch',
          quantity: 1,
          price: 67.25,
          image: '/api/placeholder/60/60',
        },
      ],
      shipping: {
        address: 'Calle Principal 123, Madrid, España',
        method: 'Envío Estándar',
        tracking: null,
      },
      payment: {
        method: 'Tarjeta de Crédito',
        last4: '1234',
      },
    },
  ];

  const getStatusIcon = status => {
    switch (status) {
      case 'Entregado':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'En Tránsito':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'Procesando':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Cancelado':
        return <Package className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'Entregado':
        return 'bg-green-100 text-green-800';
      case 'En Tránsito':
        return 'bg-blue-100 text-blue-800';
      case 'Procesando':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Hook personalizado para búsqueda y filtrado
  const {
    searchTerm,
    setSearchTerm,
    filterValue: statusFilter,
    setFilterValue: setStatusFilter,
    filteredData: filteredOrders
  } = useSearch(orders, {
    searchFields: ['id', 'items.name'],
    filterField: 'status',
    sortField: 'date'
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
          <p className="text-gray-600 mt-2">
            Revisa el estado y detalles de tus pedidos
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar pedidos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="Procesando">Procesando</option>
                  <option value="En Tránsito">En Tránsito</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Pedido {order.id}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(order.date).toLocaleDateString('es-ES')}
                            </span>
                          </span>
                          <span>${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                    <button
                      onClick={() =>
                        setSelectedOrder(
                          selectedOrder === order.id ? null : order.id
                        )
                      }
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Detalles</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="p-6">
                <div className="flex items-center space-x-4 overflow-x-auto">
                  {order.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-center space-x-3 min-w-0 flex-shrink-0"
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Details (Expandable) */}
              {selectedOrder === order.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 bg-gray-50"
                >
                  <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Items Detail */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4">
                          Productos
                        </h4>
                        <div className="space-y-4">
                          {order.items.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex items-center space-x-4 p-4 bg-white rounded-lg"
                            >
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">
                                  {item.name}
                                </h5>
                                <p className="text-sm text-gray-500">
                                  Cantidad: {item.quantity}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">
                                  ${item.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Order Info */}
                      <div className="space-y-6">
                        {/* Shipping Info */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>Información de Envío</span>
                          </h4>
                          <div className="bg-white p-4 rounded-lg space-y-2">
                            <p className="text-sm text-gray-600">Dirección:</p>
                            <p className="text-gray-900">
                              {order.shipping.address}
                            </p>
                            <p className="text-sm text-gray-600 mt-3">
                              Método de envío:
                            </p>
                            <p className="text-gray-900">
                              {order.shipping.method}
                            </p>
                            {order.shipping.tracking && (
                              <>
                                <p className="text-sm text-gray-600 mt-3">
                                  Número de seguimiento:
                                </p>
                                <p className="text-blue-600 font-mono">
                                  {order.shipping.tracking}
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Payment Info */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <CreditCard className="w-4 h-4" />
                            <span>Información de Pago</span>
                          </h4>
                          <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-gray-600">
                              Método de pago:
                            </p>
                            <p className="text-gray-900">
                              {order.payment.method}
                              {order.payment.last4 &&
                                ` terminada en ${order.payment.last4}`}
                            </p>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-gray-900">
                                  Total:
                                </span>
                                <span className="font-bold text-lg text-gray-900">
                                  ${order.total.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex space-x-3">
                          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <Download className="w-4 h-4" />
                            <span>Descargar Factura</span>
                          </button>
                          {order.status === 'En Tránsito' && (
                            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                              <Truck className="w-4 h-4" />
                              <span>Rastrear Pedido</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron pedidos
            </h3>
            <p className="text-gray-600 mb-6">
              No tienes pedidos que coincidan con los filtros seleccionados
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Ir a la Tienda
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
