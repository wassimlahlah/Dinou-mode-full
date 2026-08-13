import api from "./axios";

export const getCategories = async () => {
    // ← ضفنا 0/ لأن الـ URL pattern يحتاج category_id
    const response = await api.get("/category_method/0/");
    return response.data; // { status, message, data: [...] }
};