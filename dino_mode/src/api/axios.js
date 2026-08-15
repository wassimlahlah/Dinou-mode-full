import axios from "axios";

const api = axios.create({
    baseURL: "https://icommers-backend.onrender.com/api/products",
});

// =========================
// REQUEST INTERCEPTOR
// =========================
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


// =========================
// RESPONSE INTERCEPTOR
// =========================
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        // إذا الخطأ ليس 401، نتركه كما هو
        if (error.response?.status !== 401) {
            return Promise.reject(error);
        }

        // منع تكرار refresh بلا نهاية
        if (originalRequest?._retry) {
            return Promise.reject(error);
        }

        // الحصول على refresh token
        const refreshToken = localStorage.getItem("refresh_token");

        // إذا لم يوجد refresh token
        if (!refreshToken) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("role");

            // فقط إذا كان المستخدم في Dashboard
            if (window.location.pathname.startsWith("/dashboard")) {
                window.location.href = "/admin";
            }

            return Promise.reject(error);
        }

        // منع إعادة المحاولة أكثر من مرة
        originalRequest._retry = true;

        try {
            // طلب Access Token جديد
            const response = await axios.post(
                "https://icommers-backend.onrender.com/api/token/refresh/",
                {
                    refresh: refreshToken,
                }
            );

            const newAccessToken = response.data.access;

            // حفظ Access Token الجديد
            localStorage.setItem(
                "access_token",
                newAccessToken
            );

            // تحديث Authorization للطلب الأصلي
            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            // إعادة إرسال الطلب الأصلي
            return api(originalRequest);

        } catch (refreshError) {

            // إذا فشل Refresh Token
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("role");

            // لا نرسل مستخدم المتجر إلى Admin Login
            if (window.location.pathname.startsWith("/dashboard")) {
                window.location.href = "/admin";
            }

            return Promise.reject(refreshError);
        }
    }
);

export default api;