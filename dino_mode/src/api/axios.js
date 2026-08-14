import axios from "axios";

const api = axios.create({
    baseURL: "https://icommers-backend.onrender.com/api/products",
});

// REQUEST
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        } else {
            config.headers["Content-Type"] = "application/json";
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// RESPONSE
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        // أي خطأ غير 401 نتركه عادي
        if (error.response?.status !== 401) {
            return Promise.reject(error);
        }

        // 🔴 مهم:
        // إذا كان المستخدم ليس داخل Dashboard
        // لا نرسله إلى Admin Login
        const isAdminPage =
            window.location.pathname.startsWith("/dashboard");

        if (!isAdminPage) {
            return Promise.reject(error);
        }

        // منع تكرار refresh بلا نهاية
        if (originalRequest?._retry) {
            return Promise.reject(error);
        }

        const refreshToken = localStorage.getItem("refresh_token");

        // لا يوجد refresh token
        if (!refreshToken) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("role");

            window.location.href = "/admin";

            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const response = await axios.post(
                "https://icommers-backend.onrender.com/api/token/refresh/",
                {
                    refresh: refreshToken,
                }
            );

            const newAccessToken = response.data.access;

            localStorage.setItem(
                "access_token",
                newAccessToken
            );

            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return api(originalRequest);

        } catch (refreshError) {

            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("role");

            window.location.href = "/admin";

            return Promise.reject(refreshError);
        }
    }
);

export default api;