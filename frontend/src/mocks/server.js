// Temporary mock server for testing without MSW
const setupServer = _handlers => ({
  // eslint-disable-next-line no-console
  listen: _options => console.log('Mock server listening'),
  // eslint-disable-next-line no-console
  resetHandlers: () => console.log('Mock server handlers reset'),
  // eslint-disable-next-line no-console
  close: () => console.log('Mock server closed'),
});

const http = {
  get: (path, handler) => ({ path, handler, method: 'GET' }),
  post: (path, handler) => ({ path, handler, method: 'POST' }),
};

const HttpResponse = {
  json: (data, options = {}) => ({ data, status: options.status || 200 }),
  error: () => ({ error: true, status: 500 }),
};

// For now, we'll use a simple mock instead of MSW
// TODO: Fix MSW v2 compatibility issues

// URL base de la API
const API_BASE_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Datos mock para tests
const mockUsers = [
  {
    id: 1,
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'user',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    email: 'admin@example.com',
    firstName: 'Jane',
    lastName: 'Admin',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const mockProducts = [
  {
    id: 1,
    name: 'Producto Test 1',
    description: 'Descripción del producto test 1',
    price: 99.99,
    category: 'electronics',
    stock: 10,
    images: ['image1.jpg'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Producto Test 2',
    description: 'Descripción del producto test 2',
    price: 149.99,
    category: 'clothing',
    stock: 5,
    images: ['image2.jpg'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const mockOrders = [
  {
    id: 1,
    userId: 1,
    status: 'pending',
    total: 99.99,
    items: [
      {
        productId: 1,
        quantity: 1,
        price: 99.99,
      },
    ],
    shippingAddress: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'Test Country',
    },
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// Handlers para las rutas de la API
export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const { email, password } = await request.json();

    if (email === 'user@example.com' && password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: mockUsers[0],
          token: 'mock-jwt-token',
        },
      });
    }

    if (email === 'admin@example.com' && password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: mockUsers[1],
          token: 'mock-admin-jwt-token',
        },
      });
    }

    return HttpResponse.json(
      {
        success: false,
        message: 'Credenciales inválidas',
      },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const { email, firstName, lastName } = await request.json();

    // Simular email ya registrado
    if (email === 'existing@example.com') {
      return HttpResponse.json(
        {
          success: false,
          message: 'El email ya está registrado',
        },
        { status: 400 }
      );
    }

    const newUser = {
      id: mockUsers.length + 1,
      email,
      firstName,
      lastName,
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    return HttpResponse.json(
      {
        success: true,
        data: {
          user: newUser,
          token: 'mock-new-user-token',
        },
      },
      { status: 201 }
    );
  }),

  http.post(`${API_BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Sesión cerrada exitosamente',
    });
  }),

  http.get(`${API_BASE_URL}/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Token no proporcionado',
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: mockUsers[0],
    });
  }),

  // Products endpoints
  http.get(`${API_BASE_URL}/products`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');

    let filteredProducts = [...mockProducts];

    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    if (search) {
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: {
        products: paginatedProducts,
        pagination: {
          page,
          limit,
          total: filteredProducts.length,
          pages: Math.ceil(filteredProducts.length / limit),
        },
      },
    });
  }),

  http.get(`${API_BASE_URL}/products/:id`, ({ params }) => {
    const { id } = params;
    const product = mockProducts.find(p => p.id === parseInt(id));

    if (!product) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Producto no encontrado',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: product,
    });
  }),

  http.post(`${API_BASE_URL}/products`, async ({ request }) => {
    const productData = await request.json();

    const newProduct = {
      id: mockProducts.length + 1,
      ...productData,
      createdAt: new Date().toISOString(),
    };

    mockProducts.push(newProduct);

    return HttpResponse.json(
      {
        success: true,
        data: newProduct,
      },
      { status: 201 }
    );
  }),

  // Orders endpoints
  http.get(`${API_BASE_URL}/orders`, () => {
    return HttpResponse.json({
      success: true,
      data: mockOrders,
    });
  }),

  http.post(`${API_BASE_URL}/orders`, async ({ request }) => {
    const orderData = await request.json();

    const newOrder = {
      id: mockOrders.length + 1,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    mockOrders.push(newOrder);

    return HttpResponse.json(
      {
        success: true,
        data: newOrder,
      },
      { status: 201 }
    );
  }),

  // Users endpoints (admin)
  http.get(`${API_BASE_URL}/users`, () => {
    return HttpResponse.json({
      success: true,
      data: mockUsers,
    });
  }),

  // Error handlers para testing
  http.get(`${API_BASE_URL}/error/500`, () => {
    return HttpResponse.json(
      {
        success: false,
        message: 'Error interno del servidor',
      },
      { status: 500 }
    );
  }),

  http.get(`${API_BASE_URL}/error/network`, () => {
    return HttpResponse.error();
  }),
];

// Configurar el servidor
export const server = setupServer(...handlers);

// Utilidades para tests
export const mockApiResponse = {
  success: data => ({
    success: true,
    data,
  }),

  error: (message, status = 400) => ({
    success: false,
    message,
    status,
  }),

  paginated: (items, page = 1, limit = 10) => ({
    success: true,
    data: {
      items: items.slice((page - 1) * limit, page * limit),
      pagination: {
        page,
        limit,
        total: items.length,
        pages: Math.ceil(items.length / limit),
      },
    },
  }),
};

// Resetear datos mock
export const resetMockData = () => {
  mockUsers.length = 0;
  mockUsers.push(
    {
      id: 1,
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      email: 'admin@example.com',
      firstName: 'Jane',
      lastName: 'Admin',
      role: 'admin',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
    }
  );

  mockProducts.length = 0;
  mockProducts.push(
    {
      id: 1,
      name: 'Producto Test 1',
      description: 'Descripción del producto test 1',
      price: 99.99,
      category: 'electronics',
      stock: 10,
      images: ['image1.jpg'],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Producto Test 2',
      description: 'Descripción del producto test 2',
      price: 149.99,
      category: 'clothing',
      stock: 5,
      images: ['image2.jpg'],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
    }
  );

  mockOrders.length = 0;
  mockOrders.push({
    id: 1,
    userId: 1,
    status: 'pending',
    total: 99.99,
    items: [
      {
        productId: 1,
        quantity: 1,
        price: 99.99,
      },
    ],
    shippingAddress: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345',
      country: 'Test Country',
    },
    createdAt: '2024-01-01T00:00:00Z',
  });
};
