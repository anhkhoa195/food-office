import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth-storage");
    if (token) {
      try {
        const authData = JSON.parse(token);
        if (authData.state?.accessToken) {
          config.headers.Authorization = `Bearer ${authData.state.accessToken}`;
        }
      } catch (error) {
        console.error("Error parsing auth token:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("auth-storage");
      window.location.href = "/login";
    }

    const message =
      error.response?.data?.message || error.message || "An error occurred";
    toast.error(message);

    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  sendOtp: async (phone: string) => {
    const response = await api.post("/auth/send-otp", { phone });
    return response.data;
  },

  verifyOtp: async (phone: string, code: string) => {
    const response = await api.post("/auth/verify-otp", { phone, code });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};

// Users service
export const usersService = {
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (data: { name?: string; email?: string }) => {
    const response = await api.put("/users/profile", data);
    return response.data;
  },
};

// Menu service
export const menuService = {
  getMenuItems: async (filters?: {
    category?: string;
    available?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append("category", filters.category);
    if (filters?.available !== undefined)
      params.append("available", filters.available.toString());

    const response = await api.get(`/menu?${params.toString()}`);
    return response.data;
  },

  getMenuItem: async (id: string) => {
    const response = await api.get(`/menu/${id}`);
    return response.data;
  },

  createMenuItem: async (data: any) => {
    const response = await api.post("/menu", data);
    return response.data;
  },

  updateMenuItem: async (id: string, data: any) => {
    const response = await api.put(`/menu/${id}`, data);
    return response.data;
  },

  deleteMenuItem: async (id: string) => {
    const response = await api.delete(`/menu/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get("/menu/categories/list");
    return response.data;
  },
};

// Orders service
export const ordersService = {
  getOrderSessions: async (filters?: { active?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.active !== undefined)
      params.append("active", filters.active.toString());

    const response = await api.get(`/orders/sessions?${params.toString()}`);
    return response.data;
  },

  createOrderSession: async (data: any) => {
    const response = await api.post("/orders/sessions", data);
    return response.data;
  },

  getOrderSession: async (id: string) => {
    const response = await api.get(`/orders/sessions/${id}`);
    return response.data;
  },

  updateOrderSession: async (id: string, data: any) => {
    const response = await api.put(`/orders/sessions/${id}`, data);
    return response.data;
  },

  deleteOrderSession: async (id: string) => {
    const response = await api.delete(`/orders/sessions/${id}`);
    return response.data;
  },

  getOrders: async (filters?: { sessionId?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.sessionId) params.append("sessionId", filters.sessionId);
    if (filters?.status) params.append("status", filters.status);

    const response = await api.get(`/orders?${params.toString()}`);
    return response.data;
  },

  createOrder: async (data: any) => {
    const response = await api.post("/orders", data);
    return response.data;
  },

  getOrder: async (id: string) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  updateOrder: async (id: string, data: any) => {
    const response = await api.put(`/orders/${id}`, data);
    return response.data;
  },

  deleteOrder: async (id: string) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },

  getSessionOrders: async (sessionId: string) => {
    const response = await api.get(`/orders/sessions/${sessionId}/orders`);
    return response.data;
  },
};

// Billing service
export const billingService = {
  getWeeklyReport: async (startDate: string, endDate?: string) => {
    const params = new URLSearchParams();
    params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const response = await api.get(
      `/billing/reports/weekly?${params.toString()}`
    );
    return response.data;
  },

  getMonthlyReport: async (year: number, month: number) => {
    const response = await api.get(
      `/billing/reports/monthly?year=${year}&month=${month}`
    );
    return response.data;
  },

  exportWeeklyReport: async (
    startDate: string,
    endDate?: string,
    format: "pdf" | "excel" = "pdf"
  ) => {
    const params = new URLSearchParams();
    params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    params.append("format", format);

    const response = await api.get(
      `/billing/export/weekly?${params.toString()}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },

  exportMonthlyReport: async (
    year: number,
    month: number,
    format: "pdf" | "excel" = "pdf"
  ) => {
    const response = await api.get(
      `/billing/export/monthly?year=${year}&month=${month}&format=${format}`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  },

  getBillingSummary: async () => {
    const response = await api.get("/billing/summary");
    return response.data;
  },
};

export default api;
