import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Eye,
  Edit,
  Search,
  Filter,
  Download,
  Zap,
  Cpu,
  Shield,
  Layers
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useSearch } from '../hooks/useSearch';

const AdminPanel = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hologramActive, setHologramActive] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [matrixRain, setMatrixRain] = useState([]);

  // Matrix rain effect
  useEffect(() => {
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const drops = [];
    for (let i = 0; i < 50; i++) {
      drops.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        char: chars[Math.floor(Math.random() * chars.length)],
        speed: Math.random() * 2 + 1
      });
    }
    setMatrixRain(drops);

    const interval = setInterval(() => {
      setMatrixRain(prev => prev.map(drop => ({
        ...drop,
        y: drop.y > 100 ? -10 : drop.y + drop.speed,
        char: chars[Math.floor(Math.random() * chars.length)]
      })));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const hologramInterval = setInterval(() => {
      setHologramActive(prev => !prev);
    }, 3000);

    const scannerInterval = setInterval(() => {
      setScannerActive(true);
      setTimeout(() => setScannerActive(false), 2000);
    }, 5000);

    return () => {
      clearInterval(hologramInterval);
      clearInterval(scannerInterval);
    };
  }, []);

  // Mock data
  const recentOrders = [
    { id: '001', customer: 'Juan Pérez', status: 'pending', date: '2024-01-15', total: 150000 },
    { id: '002', customer: 'María García', status: 'completed', date: '2024-01-14', total: 89000 },
    { id: '003', customer: 'Carlos López', status: 'shipped', date: '2024-01-13', total: 245000 },
  ];



  // Hooks de búsqueda para cada sección
  const ordersSearch = useSearch(recentOrders, {
    searchFields: ['id', 'customer'],
    filterField: 'status',
    sortField: 'date'
  });

  // Redirect if not admin
  if (!user || !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  const stats = [
    {
      title: 'Ventas Totales',
      value: '$45,231',
      change: '+12%',
      icon: DollarSign,
      color: 'green',
    },
    {
      title: 'Pedidos',
      value: '1,234',
      change: '+8%',
      icon: ShoppingCart,
      color: 'blue',
    },
    {
      title: 'Productos',
      value: '567',
      change: '+3%',
      icon: Package,
      color: 'purple',
    },
    {
      title: 'Clientes',
      value: '2,345',
      change: '+15%',
      icon: Users,
      color: 'orange',
    },
  ];

  const getStatusColor = status => {
    switch (status) {
      case 'Completado':
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Enviado':
        return 'bg-blue-100 text-blue-800';
      case 'Procesando':
        return 'bg-purple-100 text-purple-800';
      case 'Activo':
        return 'bg-green-100 text-green-800';
      case 'Agotado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'dashboard', name: 'NEURAL CORE', icon: Cpu, color: 'from-cyan-400 to-blue-600' },
    { id: 'orders', name: 'QUANTUM ORDERS', icon: Zap, color: 'from-purple-400 to-pink-600' },
    { id: 'products', name: 'HOLO INVENTORY', icon: Layers, color: 'from-green-400 to-emerald-600' },
    { id: 'customers', name: 'CYBER USERS', icon: Shield, color: 'from-orange-400 to-red-600' },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Matrix Rain Background */}
      <div className="absolute inset-0 opacity-20">
        {matrixRain.map(drop => (
          <motion.div
            key={drop.id}
            className="absolute text-green-400 font-mono text-sm"
            style={{
              left: `${drop.x}%`,
              top: `${drop.y}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {drop.char}
          </motion.div>
        ))}
      </div>

      {/* Holographic Grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Scanner Line */}
      <AnimatePresence>
        {scannerActive && (
          <motion.div
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            initial={{ y: 0 }}
            animate={{ y: '100vh' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "linear" }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Futuristic Header */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="inline-block relative"
            animate={{
              rotateY: hologramActive ? 360 : 0,
            }}
            transition={{ duration: 2, ease: "easeInOut" }}
          >
            <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
              CYBER ADMIN NEXUS
            </h1>
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400/20 to-purple-500/20 blur-xl rounded-full" />
          </motion.div>
          <motion.p 
            className="text-cyan-300 text-xl font-mono tracking-wider"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            [ NEURAL INTERFACE ACTIVATED ]
          </motion.p>
        </motion.div>

        {/* Futuristic Tabs */}
        <div className="mb-12">
          <div className="flex justify-center space-x-4">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative group perspective-1000`}
                  initial={{ opacity: 0, rotateX: -90 }}
                  animate={{ opacity: 1, rotateX: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: 5,
                    z: 50
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`
                    relative px-8 py-4 rounded-xl border-2 transition-all duration-500
                    ${isActive 
                      ? `bg-gradient-to-r ${tab.color} border-transparent shadow-2xl shadow-cyan-500/50` 
                      : 'bg-gray-900/50 border-gray-700 hover:border-cyan-400/50'
                    }
                    backdrop-blur-sm transform-gpu
                  `}>
                    {/* Holographic effect */}
                    <div className={`
                      absolute inset-0 rounded-xl opacity-30 transition-opacity duration-500
                      ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}
                    `} style={{
                      background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)`
                    }} />
                    
                    {/* Glowing border */}
                    {isActive && (
                      <motion.div
                        className="absolute -inset-1 rounded-xl opacity-75 blur-sm"
                        style={{ background: `linear-gradient(45deg, ${tab.color.replace('from-', '').replace('to-', ', ')})` }}
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                    
                    <div className="relative flex items-center space-x-3">
                      <motion.div
                        animate={{
                          rotateZ: isActive ? 360 : 0,
                        }}
                        transition={{
                          duration: isActive ? 2 : 0,
                          repeat: isActive ? Infinity : 0,
                          ease: "linear"
                        }}
                      >
                        <Icon className={`w-6 h-6 ${
                          isActive ? 'text-white' : 'text-cyan-400'
                        }`} />
                      </motion.div>
                      <span className={`font-mono font-bold tracking-wider ${
                        isActive ? 'text-white' : 'text-cyan-400'
                      }`}>
                        {tab.name}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Neural Core Dashboard */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-12"
          >
            {/* Holographic Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const colors = {
                  green: { from: 'from-green-400', to: 'to-emerald-600', glow: 'shadow-green-500/50' },
                  blue: { from: 'from-blue-400', to: 'to-cyan-600', glow: 'shadow-blue-500/50' },
                  purple: { from: 'from-purple-400', to: 'to-pink-600', glow: 'shadow-purple-500/50' },
                  orange: { from: 'from-orange-400', to: 'to-red-600', glow: 'shadow-orange-500/50' }
                };
                const colorScheme = colors[stat.color] || colors.blue;
                
                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, rotateX: -90, z: -100 }}
                    animate={{ opacity: 1, rotateX: 0, z: 0 }}
                    transition={{ 
                      delay: index * 0.2, 
                      duration: 1,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      rotateY: 10,
                      rotateX: 5,
                      scale: 1.05,
                      z: 50
                    }}
                    className="group perspective-1000 cursor-pointer"
                  >
                    <div className={`
                      relative p-8 rounded-2xl border-2 border-gray-700/50
                      bg-gradient-to-br from-gray-900/80 to-gray-800/80
                      backdrop-blur-xl transform-gpu transition-all duration-500
                      hover:border-cyan-400/50 ${colorScheme.glow} hover:shadow-2xl
                    `}>
                      {/* Animated background */}
                      <motion.div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${colorScheme.from} ${colorScheme.to} opacity-0 group-hover:opacity-10`}
                        animate={{
                          opacity: [0, 0.1, 0],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      
                      {/* Holographic scan line */}
                      <motion.div
                        className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100"
                        animate={{
                          y: [0, 200, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <motion.p 
                              className="text-cyan-300 font-mono text-sm tracking-wider uppercase mb-2"
                              animate={{
                                opacity: [0.7, 1, 0.7],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              {stat.title}
                            </motion.p>
                            <motion.p 
                              className="text-4xl font-bold text-white mb-3"
                              animate={{
                                scale: [1, 1.02, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              {stat.value}
                            </motion.p>
                            <p className={`text-sm font-mono ${
                              stat.change.startsWith('+')
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}>
                              {stat.change} NEURAL SYNC
                            </p>
                          </div>
                          
                          <motion.div
                            className={`p-4 rounded-xl bg-gradient-to-br ${colorScheme.from} ${colorScheme.to} shadow-lg`}
                            animate={{
                              rotateZ: [0, 360],
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              rotateZ: { duration: 10, repeat: Infinity, ease: "linear" },
                              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                            }}
                          >
                            <Icon className="w-8 h-8 text-white" />
                          </motion.div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${colorScheme.from} ${colorScheme.to}`}
                            initial={{ width: 0 }}
                            animate={{ width: '75%' }}
                            transition={{ delay: index * 0.3 + 1, duration: 1.5, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Quantum Orders Matrix */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl border-2 border-gray-700/50 overflow-hidden">
                {/* Header with holographic effect */}
                <div className="relative p-8 border-b border-gray-700/50">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10"
                    animate={{
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="relative flex items-center justify-between">
                    <motion.h3 
                      className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent font-mono"
                      animate={{
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      [ QUANTUM ORDERS MATRIX ]
                    </motion.h3>
                    <motion.div
                      className="flex space-x-2"
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                      <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                    </motion.div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-800/50 to-gray-700/50">
                        {['NEURAL ID', 'ENTITY', 'CREDITS', 'STATUS', 'TIMESTAMP', 'ACTIONS'].map((header, index) => (
                          <motion.th
                            key={header}
                            className="px-8 py-6 text-left text-xs font-bold text-cyan-300 uppercase tracking-widest font-mono"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 1.2 }}
                          >
                            {header}
                          </motion.th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/30">
                      {recentOrders.map((order, index) => (
                        <motion.tr 
                          key={order.id} 
                          className="group hover:bg-gradient-to-r hover:from-cyan-900/20 hover:to-purple-900/20 transition-all duration-500"
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 1.5 }}
                          whileHover={{ scale: 1.02, z: 10 }}
                        >
                          <td className="px-8 py-6 whitespace-nowrap">
                            <motion.span 
                              className="text-sm font-mono font-bold text-cyan-400"
                              animate={{
                                textShadow: ['0 0 5px rgba(34, 211, 238, 0.5)', '0 0 20px rgba(34, 211, 238, 0.8)', '0 0 5px rgba(34, 211, 238, 0.5)'],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              #{order.id}
                            </motion.span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-sm text-white font-medium">
                            {order.customer}
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className="text-sm font-bold text-green-400 font-mono">
                              {order.total}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <motion.span
                              className={`inline-flex px-4 py-2 text-xs font-bold rounded-full border-2 font-mono tracking-wider ${getStatusColor(order.status)}`}
                              animate={{
                                boxShadow: [
                                  '0 0 5px rgba(34, 211, 238, 0.3)',
                                  '0 0 20px rgba(34, 211, 238, 0.6)',
                                  '0 0 5px rgba(34, 211, 238, 0.3)'
                                ],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            >
                              {order.status}
                            </motion.span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-300 font-mono">
                            {order.date}
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex space-x-3">
                              <motion.button 
                                className="p-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 transition-all duration-300"
                                whileHover={{ scale: 1.1, rotateZ: 5 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Eye className="w-4 h-4" />
                              </motion.button>
                              <motion.button 
                                className="p-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-500 hover:to-emerald-500 transition-all duration-300"
                                whileHover={{ scale: 1.1, rotateZ: -5 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Edit className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Quantum Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateX: -90 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl border-2 border-purple-500/30 p-8">
              <div className="flex justify-between items-center mb-8">
                <motion.h3 
                  className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent font-mono"
                  animate={{
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  [ QUANTUM ORDERS CONTROL ]
                </motion.h3>
                <motion.div 
                  className="flex space-x-4"
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button 
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-mono font-bold tracking-wider hover:from-green-500 hover:to-emerald-500 transition-all duration-300"
                    whileHover={{ scale: 1.05, rotateZ: 2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-5 h-5" />
                    <span>EXPORT DATA</span>
                  </motion.button>
                </motion.div>
              </div>
              
              <div className="flex space-x-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="NEURAL SEARCH..."
                      className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border-2 border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 font-mono"
                      value={ordersSearch.searchTerm}
                      onChange={e => ordersSearch.setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <motion.button 
                  className="flex items-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-mono font-bold tracking-wider hover:from-purple-500 hover:to-pink-500 transition-all duration-300"
                  whileHover={{ scale: 1.05, rotateZ: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Filter className="w-5 h-5" />
                  <span>FILTERS</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Holo Inventory Tab */}
        {activeTab === 'products' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center py-20"
          >
            <motion.div
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl border-2 border-green-500/30 p-12"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(34, 197, 94, 0.3)',
                  '0 0 40px rgba(34, 197, 94, 0.6)',
                  '0 0 20px rgba(34, 197, 94, 0.3)'
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div
                animate={{
                  rotateY: [0, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <Layers className="w-24 h-24 text-green-400 mx-auto mb-6" />
              </motion.div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent font-mono mb-4">
                [ HOLO INVENTORY MATRIX ]
              </h3>
              <p className="text-cyan-300 font-mono text-lg">
                NEURAL INTERFACE LOADING...
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Cyber Users Tab */}
        {activeTab === 'customers' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateZ: -90 }}
            animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center py-20"
          >
            <motion.div
              className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl border-2 border-orange-500/30 p-12"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(249, 115, 22, 0.3)',
                  '0 0 40px rgba(249, 115, 22, 0.6)',
                  '0 0 20px rgba(249, 115, 22, 0.3)'
                ],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotateZ: [0, 180, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Shield className="w-24 h-24 text-orange-400 mx-auto mb-6" />
              </motion.div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent font-mono mb-4">
                [ CYBER USERS DATABASE ]
              </h3>
              <p className="text-cyan-300 font-mono text-lg">
                QUANTUM ENCRYPTION ACTIVE...
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
