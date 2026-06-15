const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const get = async (path) => {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  return res.json();
};

const post = async (path, body) => {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
};

const put = async (path, body, token) => {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
};

export const api = {
  getProducts: () => get("/products"),
  getProduct: (id) => get(`/products/${id}`),
  getOffers: (productId) => get(`/offers?product_id=${productId}`),
  getCheapest: () => get("/offers/cheapest"),
  getRanking: () => get("/offers/ranking"),
  getCategories: () => get("/categories"),
  getBrands: () => get("/brands"),
  getSupermarkets: () => get("/supermarkets"),

  // auth
  register: (body) => post("/auth/register", body),
  login: (body) => post("/auth/login", body),
  verifyEmail: (token) => get(`/auth/verificar-email?token=${token}`),
  forgotPassword: (body) => post("/auth/esqueci-senha", body),
  resetPassword: (body) => post("/auth/redefinir-senha", body),
  updateProfile: (body, token) => put("/auth/perfil", body, token),

  // admin
  createProduct: (body) => post("/products", body),
  createOffer: (body) => post("/offers", body),
  createSupermarket: (body) => post("/supermarkets", body),
  createCategory: (body) => post("/categories", body),
  createBrand: (body) => post("/brands", body),
};