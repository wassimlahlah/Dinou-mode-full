import { createContext, useContext, useState, useEffect } from "react";
import { getProducts, getCategories, adaptProduct } from "../api/productService";

const ShopContext = createContext();

export function ShopProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const cats = await getCategories();
                setCategories(cats);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
                setError(err.message);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const prods = await getProducts(0);
                setProducts(prods);
            } catch (err) {
                console.error("Failed to fetch products:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const addToCart = (product, quantity, size, color, productSizeId, colorImage) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.productSizeId === productSizeId);
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
                    colorImage,
                    image: colorImage || product.image,
                },
            ];
        });
    };

    const removeFromCart = (productSizeId) => {
        setCart((prev) => prev.filter((item) => item.productSizeId !== productSizeId));
    };

    const updateQuantity = (productSizeId, quantity) => {
        if (quantity < 1) return;
        setCart((prev) =>
            prev.map((item) =>
                item.productSizeId === productSizeId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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