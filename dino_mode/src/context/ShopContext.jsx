import { createContext, useContext, useState, useEffect } from "react";
import { getProducts, getCategories } from "../api/productService";

const ShopContext = createContext();

export function ShopProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                setLoading(true);
                setError(null);

                const cachedProducts = sessionStorage.getItem("products");
                const cachedCategories = sessionStorage.getItem("categories");

                if (cachedProducts) {
                    setProducts(JSON.parse(cachedProducts));
                }

                if (cachedCategories) {
                    setCategories(JSON.parse(cachedCategories));
                }

                const [prods, cats] = await Promise.all([
                    getProducts(0),
                    getCategories(),
                ]);

                setProducts(prods);
                setCategories(cats);

                sessionStorage.setItem("products", JSON.stringify(prods));
                sessionStorage.setItem("categories", JSON.stringify(cats));

            } catch (err) {
                console.error("Failed to fetch shop data:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchShopData();
    }, []);

    const addToCart = (
        product,
        quantity,
        size,
        color,
        productSizeId,
        colorImage,
        productColorId    // ← جديد: ضروري باش update_qte يخدم
    ) => {
        setCart((prev) => {
            const existing = prev.find(
                (item) => item.productSizeId === productSizeId
            );

            if (existing) {
                return prev.map((item) =>
                    item.productSizeId === productSizeId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            return [
                ...prev,
                {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    oldPrice: product.oldPrice,
                    quantity,
                    size,
                    color,
                    productSizeId,
                    productColorId,   // ← جديد
                    colorImage,
                    image: colorImage || product.image,
                },
            ];
        });
    };

    const removeFromCart = (productSizeId) => {
        setCart((prev) =>
            prev.filter((item) => item.productSizeId !== productSizeId)
        );
    };

    const updateQuantity = (productSizeId, quantity) => {
        if (quantity < 1) return;

        setCart((prev) =>
            prev.map((item) =>
                item.productSizeId === productSizeId
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const getProductById = (id) => products.find((p) => p.id === id);

    return (
        <ShopContext.Provider
            value={{
                cart,
                products,
                categories,
                loading,
                error,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                getProductById,
            }}
        >
            {children}
        </ShopContext.Provider>
    );
}

export const useShop = () => useContext(ShopContext);