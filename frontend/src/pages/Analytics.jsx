import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Download,
  BarChart3,
} from 'lucide-react';
import {
  Line,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  const timeRanges = [
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 90 días' },
    { value: '1y', label: 'Último año' },
  ];

  const revenueData = [
    {
      date: '2024-01-01',
      revenue: 4000,
      orders: 24,
      customers: 12,
      conversion: 2.4,
    },
    {
      date: '2024-01-02',
      revenue: 3000,
      orders: 18,
      customers: 15,
      conversion: 3.2,
    },
    {
      date: '2024-01-03',
      revenue: 5000,
      orders: 32,
      customers: 20,
      conversion: 4.1,
    },
    {
      date: '2024-01-04',
      revenue: 2780,
      orders: 19,
      customers: 8,
      conversion: 2.8,
    },
    {
      date: '2024-01-05',
      revenue: 1890,
      orders: 14,
      customers: 11,
      conversion: 3.5,
    },
    {
      date: '2024-01-06',
      revenue: 2390,
      orders: 21,
      customers: 16,
      conversion: 3.8,
    },
    {
      date: '2024-01-07',
      revenue: 3490,
      orders: 28,
      customers: 18,
      conversion: 4.2,
    },
  ];

  const categoryPerformance = [
    { category: 'Electrónicos', revenue: 45000, orders: 234, growth: 12.5 },
    { category: 'Ropa', revenue: 32000, orders: 456, growth: 8.3 },
    { category: 'Hogar', revenue: 28000, orders: 189, growth: -2.1 },
    { category: 'Deportes', revenue: 15000, orders: 123, growth: 15.7 },
    { category: 'Libros', revenue: 8000, orders: 89, growth: 5.2 },
  ];

  const trafficSources = [
    { name: 'Búsqueda Orgánica', value: 35, color: '#3b82f6' },
    { name: 'Redes Sociales', value: 25, color: '#10b981' },
    { name: 'Email Marketing', value: 20, color: '#f59e0b' },
    { name: 'Publicidad Pagada', value: 15, color: '#ef4444' },
    { name: 'Directo', value: 5, color: '#8b5cf6' },
  ];

  const topProducts = [
    { name: 'iPhone 15 Pro', sales: 156, revenue: 155844, growth: 23.5 },
    { name: 'MacBook Air M2', sales: 89, revenue: 115691, growth: 18.2 },
    { name: 'AirPods Pro', sales: 234, revenue: 58266, growth: 45.1 },
    { name: 'iPad Air', sales: 67, revenue: 40199, growth: 12.8 },
    { name: 'Apple Watch', sales: 123, revenue: 36900, growth: 8.9 },
  ];

  const conversionFunnel = [
    { stage: 'Visitantes', count: 10000, percentage: 100 },
    { stage: 'Vieron Producto', count: 3500, percentage: 35 },
    { stage: 'Agregaron al Carrito', count: 1200, percentage: 12 },
    { stage: 'Iniciaron Checkout', count: 800, percentage: 8 },
    { stage: 'Completaron Compra', count: 320, percentage: 3.2 },
  ];

  const kpiCards = [
    {
      title: 'Ingresos Totales',
      value: '$125,430',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Pedidos',
      value: '1,234',
      change: '+8.2%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'text-blue-600',
    },
    {
      title: 'Tasa de Conversión',
      value: '3.2%',
      change: '+0.5%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      title: 'Valor Promedio',
      value: '$101.50',
      change: '-2.1%',
      changeType: 'negative',
      icon: BarChart3,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analíticas</h1>
          <p className="text-gray-600 mt-1">
            Análisis detallado del rendimiento de tu negocio
          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
            className="input"
          >
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <button className="btn-secondary flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Exportar Reporte
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {kpi.value}
                  </p>
                  <div className="flex items-center mt-2">
                    {kpi.changeType === 'positive' ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        kpi.changeType === 'positive'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {kpi.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      vs período anterior
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full bg-gray-100`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Tendencia de Ingresos
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedMetric('revenue')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedMetric === 'revenue'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Ingresos
            </button>
            <button
              onClick={() => setSelectedMetric('orders')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedMetric === 'orders'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pedidos
            </button>
            <button
              onClick={() => setSelectedMetric('customers')}
              className={`px-3 py-1 text-sm rounded-md ${
                selectedMetric === 'customers'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Clientes
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey={selectedMetric}
              fill="#3b82f6"
              fillOpacity={0.3}
              stroke="#3b82f6"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="conversion"
              stroke="#10b981"
              strokeWidth={2}
              yAxisId="right"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Fuentes de Tráfico
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={trafficSources}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {trafficSources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Performance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rendimiento por Categoría
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Productos Más Vendidos
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-sm font-medium text-gray-600">
                    Producto
                  </th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">
                    Ventas
                  </th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">
                    Ingresos
                  </th>
                  <th className="text-right py-2 text-sm font-medium text-gray-600">
                    Crecimiento
                  </th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, _index) => (
                  <tr key={product.name} className="border-b border-gray-100">
                    <td className="py-3 text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="py-3 text-sm text-gray-600 text-right">
                      {product.sales}
                    </td>
                    <td className="py-3 text-sm text-gray-600 text-right">
                      ${product.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`text-sm font-medium ${
                          product.growth > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {product.growth > 0 ? '+' : ''}
                        {product.growth}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Embudo de Conversión
          </h3>
          <div className="space-y-4">
            {conversionFunnel.map((stage, _index) => {
              const width = (stage.percentage / 100) * 100;
              return (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {stage.stage}
                    </span>
                    <span className="text-sm text-gray-500">
                      {stage.count.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stage.percentage}%
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
