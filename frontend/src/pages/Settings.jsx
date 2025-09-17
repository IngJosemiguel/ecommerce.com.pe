import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Mail,
  Smartphone,
  Save,
  Eye,
  EyeOff,
  Upload,
  Edit,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    profile: {
      name: 'Admin User',
      email: 'admin@ecommerce.com',
      phone: '+34 123 456 789',
      avatar: 'https://via.placeholder.com/100x100',
      timezone: 'Europe/Madrid',
      language: 'es',
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      orderUpdates: true,
      marketingEmails: false,
      securityAlerts: true,
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: true,
      sessionTimeout: 30,
    },
    payment: {
      currency: 'EUR',
      taxRate: 21,
      paymentMethods: ['credit_card', 'paypal', 'bank_transfer'],
    },
    store: {
      storeName: 'Mi E-commerce',
      storeDescription: 'La mejor tienda online',
      storeUrl: 'https://mi-ecommerce.com',
      contactEmail: 'contacto@mi-ecommerce.com',
      supportPhone: '+34 900 123 456',
    },
  });

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'payment', label: 'Pagos', icon: CreditCard },
    { id: 'store', label: 'Tienda', icon: Globe },
  ];

  const handleSave = section => {
    toast.success(`Configuración de ${section} guardada correctamente`);
  };

  const ProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <img
            src={settings.profile.avatar}
            alt="Avatar"
            className="w-20 h-20 rounded-full object-cover"
          />
          <button className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700">
            <Upload className="w-4 h-4" />
          </button>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Foto de Perfil</h3>
          <p className="text-sm text-gray-500">JPG, GIF o PNG. Máximo 1MB.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Completo
          </label>
          <input
            type="text"
            value={settings.profile.name}
            onChange={e =>
              setSettings({
                ...settings,
                profile: { ...settings.profile, name: e.target.value },
              })
            }
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={settings.profile.email}
            onChange={e =>
              setSettings({
                ...settings,
                profile: { ...settings.profile, email: e.target.value },
              })
            }
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            value={settings.profile.phone}
            onChange={e =>
              setSettings({
                ...settings,
                profile: { ...settings.profile, phone: e.target.value },
              })
            }
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zona Horaria
          </label>
          <select
            value={settings.profile.timezone}
            onChange={e =>
              setSettings({
                ...settings,
                profile: { ...settings.profile, timezone: e.target.value },
              })
            }
            className="input"
          >
            <option value="Europe/Madrid">Madrid (GMT+1)</option>
            <option value="Europe/London">Londres (GMT+0)</option>
            <option value="America/New_York">Nueva York (GMT-5)</option>
            <option value="Asia/Tokyo">Tokio (GMT+9)</option>
          </select>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Cambiar Contraseña
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña Actual
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <input type="password" className="input" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Contraseña
            </label>
            <input type="password" className="input" placeholder="••••••••" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('perfil')}
          className="btn-primary flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </button>
      </div>
    </div>
  );

  const NotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Preferencias de Notificación
        </h3>
        <div className="space-y-4">
          {[
            {
              key: 'emailNotifications',
              label: 'Notificaciones por Email',
              icon: Mail,
            },
            {
              key: 'pushNotifications',
              label: 'Notificaciones Push',
              icon: Bell,
            },
            {
              key: 'smsNotifications',
              label: 'Notificaciones SMS',
              icon: Smartphone,
            },
            {
              key: 'orderUpdates',
              label: 'Actualizaciones de Pedidos',
              icon: Bell,
            },
            {
              key: 'marketingEmails',
              label: 'Emails de Marketing',
              icon: Mail,
            },
            {
              key: 'securityAlerts',
              label: 'Alertas de Seguridad',
              icon: Shield,
            },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {item.label}
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications[item.key]}
                    onChange={e =>
                      setSettings({
                        ...settings,
                        notifications: {
                          ...settings.notifications,
                          [item.key]: e.target.checked,
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('notificaciones')}
          className="btn-primary flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </button>
      </div>
    </div>
  );

  const SecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Configuración de Seguridad
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Autenticación de Dos Factores
              </h4>
              <p className="text-sm text-gray-500">
                Añade una capa extra de seguridad a tu cuenta
              </p>
            </div>
            <button className="btn-secondary text-sm">
              {settings.security.twoFactorAuth ? 'Desactivar' : 'Activar'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Alertas de Inicio de Sesión
              </h4>
              <p className="text-sm text-gray-500">
                Recibe notificaciones cuando alguien acceda a tu cuenta
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security.loginAlerts}
                onChange={e =>
                  setSettings({
                    ...settings,
                    security: {
                      ...settings.security,
                      loginAlerts: e.target.checked,
                    },
                  })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Tiempo de Sesión
            </h4>
            <p className="text-sm text-gray-500 mb-3">
              Tiempo antes de cerrar sesión automáticamente
            </p>
            <select
              value={settings.security.sessionTimeout}
              onChange={e =>
                setSettings({
                  ...settings,
                  security: {
                    ...settings.security,
                    sessionTimeout: parseInt(e.target.value),
                  },
                })
              }
              className="input w-full md:w-auto"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={60}>1 hora</option>
              <option value={120}>2 horas</option>
              <option value={0}>Nunca</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('seguridad')}
          className="btn-primary flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </button>
      </div>
    </div>
  );

  const PaymentSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Configuración de Pagos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda Principal
            </label>
            <select
              value={settings.payment.currency}
              onChange={e =>
                setSettings({
                  ...settings,
                  payment: { ...settings.payment, currency: e.target.value },
                })
              }
              className="input"
            >
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dólar Americano ($)</option>
              <option value="GBP">Libra Esterlina (£)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tasa de Impuestos (%)
            </label>
            <input
              type="number"
              value={settings.payment.taxRate}
              onChange={e =>
                setSettings({
                  ...settings,
                  payment: {
                    ...settings.payment,
                    taxRate: parseFloat(e.target.value),
                  },
                })
              }
              className="input"
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">
          Métodos de Pago Activos
        </h4>
        <div className="space-y-3">
          {[
            {
              id: 'credit_card',
              name: 'Tarjeta de Crédito/Débito',
              enabled: true,
            },
            { id: 'paypal', name: 'PayPal', enabled: true },
            {
              id: 'bank_transfer',
              name: 'Transferencia Bancaria',
              enabled: true,
            },
            { id: 'apple_pay', name: 'Apple Pay', enabled: false },
            { id: 'google_pay', name: 'Google Pay', enabled: false },
          ].map(method => (
            <div
              key={method.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <span className="text-sm font-medium text-gray-900">
                {method.name}
              </span>
              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={method.enabled}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
                <button className="text-gray-400 hover:text-gray-600">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('pagos')}
          className="btn-primary flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </button>
      </div>
    </div>
  );

  const StoreSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Información de la Tienda
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Tienda
            </label>
            <input
              type="text"
              value={settings.store.storeName}
              onChange={e =>
                setSettings({
                  ...settings,
                  store: { ...settings.store, storeName: e.target.value },
                })
              }
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de la Tienda
            </label>
            <input
              type="url"
              value={settings.store.storeUrl}
              onChange={e =>
                setSettings({
                  ...settings,
                  store: { ...settings.store, storeUrl: e.target.value },
                })
              }
              className="input"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={settings.store.storeDescription}
              onChange={e =>
                setSettings({
                  ...settings,
                  store: {
                    ...settings.store,
                    storeDescription: e.target.value,
                  },
                })
              }
              rows={3}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de Contacto
            </label>
            <input
              type="email"
              value={settings.store.contactEmail}
              onChange={e =>
                setSettings({
                  ...settings,
                  store: { ...settings.store, contactEmail: e.target.value },
                })
              }
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono de Soporte
            </label>
            <input
              type="tel"
              value={settings.store.supportPhone}
              onChange={e =>
                setSettings({
                  ...settings,
                  store: { ...settings.store, supportPhone: e.target.value },
                })
              }
              className="input"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleSave('tienda')}
          className="btn-primary flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'payment':
        return <PaymentSettings />;
      case 'store':
        return <StoreSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">
          Gestiona las configuraciones de tu cuenta y tienda
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="card"
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
