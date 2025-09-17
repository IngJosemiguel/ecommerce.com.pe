import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  MoreHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([
    {
      id: '#12345',
      customer: 'Juan Pérez',
      email: 'juan@email.com',
      total: 299.99,
      status: 'Completado',
      date: '2024-01-15',
      items: 3,
      paymentMethod: 'Tarjeta de Crédito',
      shippingAddress: 'Calle Principal 123, Madrid',
    },
    {
      id: '#12346',
      customer: 'María García',
      email: 'maria@email.com',
      total: 159.5,
      status: 'Pendiente',
      date: '2024-01-15',
      items: 2,
      paymentMethod: 'PayPal',
      shippingAddress: 'Avenida Central 456, Barcelona',
    },
    {
      id: '#12347',
      customer: 'Carlos López',
      email: 'carlos@email.com',
      total: 89.99,
      status: 'Enviado',
      date: '2024-01-14',
      items: 1,
      paymentMethod: 'Transferencia',
      shippingAddress: 'Plaza Mayor 789, Valencia',
    },
    {
      id: '#12348',
      customer: 'Ana Martín',
      email: 'ana@email.com',
      total: 199.99,
      status: 'Procesando',
      date: '2024-01-14',
      items: 4,
      paymentMethod: 'Tarjeta de Débito',
      shippingAddress: 'Calle Secundaria 321, Sevilla',
    },
    {
      id: '#12349',
      customer: 'Luis Rodríguez',
      email: 'luis@email.com',
      total: 449.99,
      status: 'Cancelado',
      date: '2024-01-13',
      items: 2,
      paymentMethod: 'Tarjeta de Crédito',
      shippingAddress: 'Avenida Norte 654, Bilbao',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const statuses = [
    'Todos',
    'Pendiente',
    'Procesando',
    'Enviado',
    'Completado',
    'Cancelado',
  ];

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === 'Todos' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = status => {
    switch (status) {
      case 'Completado':
        return 'bg-green-100 text-green-800';
      case 'Enviado':
        return 'bg-blue-100 text-blue-800';
      case 'Procesando':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pendiente':
        return 'bg-orange-100 text-orange-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'Completado':
        return <CheckCircle className="w-4 h-4" />;
      case 'Enviado':
        return <Truck className="w-4 h-4" />;
      case 'Procesando':
        return <Clock className="w-4 h-4" />;
      case 'Pendiente':
        return <AlertCircle className="w-4 h-4" />;
      case 'Cancelado':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(
      orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    toast.success(`Estado del pedido actualizado a ${newStatus}`);
  };

  const OrderDetailModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Detalles del Pedido {order.id}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Información del Cliente
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>
                    <span className="font-medium">Nombre:</span>{' '}
                    {order.customer}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {order.email}
                  </p>
                  <p>
                    <span className="font-medium">Dirección:</span>{' '}
                    {order.shippingAddress}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Información del Pedido
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p>
                    <span className="font-medium">Fecha:</span> {order.date}
                  </p>
                  <p>
                    <span className="font-medium">Total:</span> ${order.total}
                  </p>
                  <p>
                    <span className="font-medium">Artículos:</span>{' '}
                    {order.items}
                  </p>
                  <p>
                    <span className="font-medium">Método de Pago:</span>{' '}
                    {order.paymentMethod}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Estado del Pedido
                </h4>
                <div className="space-y-3">
                  <div
                    className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    <span className="ml-2">{order.status}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cambiar Estado
                    </label>
                    <select
                      value={order.status}
                      onChange={e =>
                        updateOrderStatus(order.id, e.target.value)
                      }
                      className="input"
                    >
                      {statuses
                        .filter(s => s !== 'Todos')
                        .map(status => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Acciones</h4>
                <div className="space-y-2">
                  <button className="w-full btn-primary text-sm">
                    Enviar Email al Cliente
                  </button>
                  <button className="w-full btn-secondary text-sm">
                    Generar Factura
                  </button>
                  <button className="w-full btn-secondary text-sm">
                    Imprimir Etiqueta de Envío
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pedidos</h1>
          <p className="text-gray-600 mt-1">
            Gestiona y rastrea todos los pedidos de tu tienda
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {statuses
          .filter(s => s !== 'Todos')
          .map(status => {
            const count = orders.filter(o => o.status === status).length;
            return (
              <div key={status} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {status}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <div
                    className={`p-2 rounded-full ${getStatusColor(status).replace('text-', 'text-white bg-').split(' ')[1]}`}
                  >
                    {getStatusIcon(status)}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar pedidos..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 input w-full md:w-80"
              />
            </div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="input w-full md:w-auto"
            >
              {statuses.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {filteredOrders.length} de {orders.length} pedidos
            </span>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artículos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map(order => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.paymentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.customer}
                    </div>
                    <div className="text-sm text-gray-500">{order.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${order.total}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.items}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

export default Orders;
