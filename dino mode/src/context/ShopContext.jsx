import { createContext, useContext, useState } from "react";

const ShopContext = createContext();

export function ShopProvider({ children }) {
    const [cart, setCart] = useState([]);

    const addToCart = (product, quantity, size, color) => {
        setCart((prev) => {
            const existing = prev.find(
                (item) => item.id === product.id && item.size === size && item.color === color
            );
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id && item.size === size && item.color === color
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { ...product, quantity, size, color }];
        });
    };

    const removeFromCart = (id, size, color) => {
        setCart((prev) => prev.filter(
            (item) => !(item.id === id && item.size === size && item.color === color)
        ));
    };

    const updateQuantity = (id, size, color, quantity) => {
        if (quantity < 1) return;
        setCart((prev) =>
            prev.map((item) =>
                item.id === id && item.size === size && item.color === color
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <ShopContext.Provider
            value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}
        >
            {children}
        </ShopContext.Provider>
    );
}

export const useShop = () => useContext(ShopContext);