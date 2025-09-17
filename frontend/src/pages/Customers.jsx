import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Users,
  UserPlus,
  Download,
} from 'lucide-react';
const Customers = () => {
  const [customers] = useState([
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan@email.com',
      phone: '+34 123 456 789',
      location: 'Madrid, España',
      joinDate: '2023-06-15',
      totalOrders: 12,
      totalSpent: 1299.99,
      lastOrder: '2024-01-15',
      status: 'Activo',
      avatar: 'https://via.placeholder.com/40x40',
    },
    {
      id: 2,
      name: 'María García',
      email: 'maria@email.com',
      phone: '+34 987 654 321',
      location: 'Barcelona, España',
      joinDate: '2023-08-22',
      totalOrders: 8,
      totalSpent: 899.5,
      lastOrder: '2024-01-14',
      status: 'Activo',
      avatar: 'https://via.placeholder.com/40x40',
    },
    {
      id: 3,
      name: 'Carlos López',
      email: 'carlos@email.com',
      phone: '+34 555 123 456',
      location: 'Valencia, España',
      joinDate: '2023-03-10',
      totalOrders: 25,
      totalSpent: 2199.99,
      lastOrder: '2024-01-12',
      status: 'VIP',
      avatar: 'https://via.placeholder.com/40x40',
    },
    {
      id: 4,
      name: 'Ana Martín',
      email: 'ana@email.com',
      phone: '+34 666 789 012',
      location: 'Sevilla, España',
      joinDate: '2023-11-05',
      totalOrders: 3,
      totalSpent: 299.99,
      lastOrder: '2023-12-20',
      status: 'Inactivo',
      avatar: 'https://via.placeholder.com/40x40',
    },
    {
      id: 5,
      name: 'Luis Rodríguez',
      email: 'luis@email.com',
      phone: '+34 777 888 999',
      location: 'Bilbao, España',
      joinDate: '2023-01-18',
      totalOrders: 45,
      totalSpent: 4599.99,
      lastOrder: '2024-01-16',
      status: 'VIP',
      avatar: 'https://via.placeholder.com/40x40',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const statuses = ['Todos', 'Activo', 'VIP', 'Inactivo'];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === 'Todos' || customer.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = status => {
    switch (status) {
      case 'Activo':
        return 'bg-green-100 text-green-800';
      case 'VIP':
        return 'bg-purple-100 text-purple-800';
      case 'Inactivo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const CustomerDetailModal = ({ customer, onClose }) => {
    if (!customer) return null;

    const recentOrders = [
      { id: '#12345', date: '2024-01-15', total: 299.99, status: 'Completado' },
      { id: '#12340', date: '2024-01-10', total: 159.5, status: 'Completado' },
      { id: '#12335', date: '2024-01-05', total: 89.99, status: 'Completado' },
    ];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Perfil del Cliente
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Customer Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="text-center">
                <img
                  src={customer.avatar}
                  alt={customer.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />
                <h4 className="text-lg font-semibold text-gray-900">
                  {customer.name}
                </h4>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    customer.status
                  )}`}
                >
                  {customer.status}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {customer.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {customer.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {customer.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Cliente desde {customer.joinDate}
                </div>
              </div>

              <div className="space-y-2">
                <button className="w-full btn-primary text-sm">
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Email
                </button>
                <button className="w-full btn-secondary text-sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Cliente
                </button>
              </div>
            </div>

            {/* Stats and Orders */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">
                        Total Pedidos
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {customer.totalOrders}
                      </p>
                    </div>
                    <ShoppingBag className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">
                        Total Gastado
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        ${customer.totalSpent}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">
                        Promedio por Pedido
                      </p>
                      <p className="text-2xl font-bold text-purple-900">
                        $
                        {(customer.totalSpent / customer.totalOrders).toFixed(
                          2
                        )}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <h5 className="text-lg font-semibold text-gray-900 mb-4">
                  Pedidos Recientes
                </h5>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Pedido
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Fecha
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentOrders.map(order => (
                        <tr key={order.id}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {order.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {order.date}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            ${order.total}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">
            Gestiona tu base de clientes y analiza su comportamiento
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          <button className="btn-primary flex items-center">
            <UserPlus className="w-4 h-4 mr-2" />
            Agregar Cliente
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Clientes
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.length}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes VIP</p>
              <p className="text-2xl font-bold text-purple-600">
                {customers.filter(c => c.status === 'VIP').length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Clientes Activos
              </p>
              <p className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.status === 'Activo').length}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Valor Promedio
              </p>
              <p className="text-2xl font-bold text-orange-600">
                $
                {(
                  customers.reduce((sum, c) => sum + c.totalSpent, 0) /
                  customers.length
                ).toFixed(0)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar clientes..."
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
              {filteredCustomers.length} de {customers.length} clientes
            </span>
          </div>
        </div>
      </div>

      {/* Customers Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pedidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Gastado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Pedido
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map(customer => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={customer.avatar}
                        alt={customer.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Cliente desde {customer.joinDate}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {customer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.totalOrders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${customer.totalSpent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        customer.status
                      )}`}
                    >
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.lastOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
};

export default Customers;
