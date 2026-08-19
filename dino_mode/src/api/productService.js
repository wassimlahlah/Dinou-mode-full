import api from "./axios";

export const adaptProduct = (p) => ({
    ...p,
    category: p.category ?? "",
    categoryName: p.category_name ?? "",
    colors: p.productsInfo?.map((info) => ({
        id: info.id,
        color: info.color,
        image: info.image || "",
        sizes: info.sizesQte?.map((sq) => ({
            id: sq.id,
            label: sq.size,
            number: sq.eqSize,
            quantity: sq.qte,
        })) || [],
    })) || [],
});

export const getProducts = async (categoryId = 0) => {
    const response = await api.get(`/products_method/${categoryId}/0/`);
    const rawProducts = response.data.data || [];
    return rawProducts.map(adaptProduct);
};

export const getOffers = async () => {
    const response = await api.get("/get_offers/");
    const rawProducts = response.data.data || [];
    return rawProducts.map(adaptProduct);
};

export const getCategories = async () => {
    const response = await api.get("/category_method/0/");
    return response.data.data || [];
};

// 🔧 معدل: زدنا baladiya و is_birou باش يتوافق مع موديل Commend
export const createOrder = async (orderData, receiptImage = null) => {
    const formData = new FormData();
    
    formData.append(
        "json",
        JSON.stringify({
            fullName: orderData.fullName,
            phone: orderData.phone,
            willya: orderData.willya,
            baladiya: orderData.baladiya || null,
            is_birou: orderData.is_birou || false,
            commend_orders: orderData.commend_orders,
        })
    );
    
    if (receiptImage) {
        formData.append("recipte", receiptImage);
    }
    
    const response = await api.post("/commends_orders_method/pending/0/", formData);
    return response.data;
};

export const getLivraisonPrices = async () => {
    const response = await api.get("/livrison_method/0/");
    return response.data.data || [];
};
export const createLivraisonPrice = async (data) => {
    const response = await api.post("/livrison_method/0/", data);
    return response.data;
};

export const updateLivraisonPrice = async (id, data) => {
    const response = await api.put(`/livrison_method/${id}/`, data);
    return response.data;
};

export const deleteLivraisonPrice = async (id) => {
    const response = await api.delete(`/livrison_method/${id}/`);
    return response.data;
};

export const login = async (username, password) => {
    const response = await api.post("/signin/", { username, password });
    return response.data;
};