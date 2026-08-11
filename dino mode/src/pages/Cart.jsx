import { useShop } from "../context/ShopContext";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useShop();

    const delivery = cartTotal > 10000 ? 0 : 500;
    const finalTotal = cartTotal + delivery;

    return (
        <div className="bg-pink-50 min-h-screen">
        <div className="p-4 md:p-10 max-w-7xl mx-auto">
            <motion.h1 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl md:text-5xl font-serif font-bold mb-6 md:mb-10"
            >
                My Cart
            </motion.h1>

            {cart.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 md:py-20"
                >
                    <p className="text-5xl md:text-6xl mb-6">🛒</p>
                    <p className="text-xl md:text-2xl text-gray-400 mb-6">Your cart is empty</p>
                    <Link
                        to="/shop"
                        className="inline-block bg-black text-white px-8 md:px-10 py-3 md:py-4 rounded-full hover:bg-pink-500 transition font-medium"
                    >
                        Continue Shopping
                    </Link>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                    
                    {/* ===== PRODUCTS ===== */}
                    <div className="lg:col-span-2 space-y-3 md:space-y-4">
                        <AnimatePresence>
                            {cart.map((item) => {
                                // ✅ Récupère l'image depuis la couleur sélectionnée ou la première couleur
                                const itemImage = item.colors?.[0]?.image || "";
                                
                                return (
                                    <motion.div
                                        key={`${item.id}-${item.size}-${item.color}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="flex flex-col sm:flex-row gap-4 bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100"
                                    >
                                        {/* Image */}
                                        <Link to={`/product/${item.id}`} className="shrink-0">
                                            <img
                                                src={itemImage}
                                                className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-xl hover:scale-105 transition-transform"
                                                alt={item.name}
                                                onError={(e) => {
                                                    e.target.src = "https://via.placeholder.com/150?text=No+Image";
                                                }}
                                            />
                                        </Link>
                                        
                                        {/* Info */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start gap-2">
                                                    <Link to={`/product/${item.id}`}>
                                                        <h2 className="text-base md:text-lg font-semibold text-gray-800 hover:text-pink-500 transition-colors line-clamp-1">
                                                            {item.name}
                                                        </h2>
                                                    </Link>
                                                    <button
                                                        onClick={() => removeFromCart(item.id, item.size, item.color)}
                                                        className="md:text-gray-400 cursor-pointer hover:text-red-500 text-red-500 transition p-1"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                </div>
                                                
                                                <p className="text-pink-500 font-bold text-base md:text-lg mt-1">
                                                    {item.price.toLocaleString()} DA
                                                </p>
                                                
                                                {(item.size || item.color) && (
                                                    <p className="text-xs md:text-sm text-gray-400 mt-1">
                                                        {item.size && `Size: ${item.size}`}
                                                        {item.size && item.color && " • "}
                                                        {item.color && `Color: ${item.color}`}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Bottom row: Quantity + Total */}
                                            <div className="flex items-center justify-between mt-3 md:mt-4">
                                                {/* Quantity */}
                                                <div className="flex items-center gap-2 md:gap-3">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity - 1)}
                                                        className="w-8 h-8 md:w-9 md:h-9 cursor-pointer rounded-full bg-[#F7D6DF] flex items-center justify-center hover:bg-pink-400 hover:text-white transition active:scale-90"
                                                    >
                                                        <FaMinus size={10} />
                                                    </button>
                                                    <span className="font-bold w-6 text-center text-sm md:text-base">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                                                        className="w-8 h-8 md:w-9 md:h-9 cursor-pointer rounded-full bg-[#F7D6DF] flex items-center justify-center hover:bg-pink-400 hover:text-white transition active:scale-90"
                                                    >
                                                        <FaPlus size={10} />
                                                    </button>
                                                </div>

                                                {/* Total */}
                                                <p className="text-base md:text-xl font-bold text-gray-800">
                                                    {(item.price * item.quantity).toLocaleString()} DA
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* Clear cart */}
                        <button
                            onClick={clearCart}
                            className="text-gray-500 hover:text-red-500 cursor-pointer transition text-sm underline px-1"
                        >
                            Clear Cart
                        </button>
                    </div>

                    {/* ===== ORDER SUMMARY ===== */}
                    <div className="lg:col-span-1">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 lg:sticky lg:top-6"
                        >
                            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 font-serif">Order Summary</h2>
                            
                            <div className="space-y-3 text-gray-600 text-sm md:text-base">
                                <div className="flex justify-between">
                                    <span>Subtotal ({cart.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
                                    <span className="font-medium">{cartTotal.toLocaleString()} DA</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 my-4 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-base md:text-lg font-bold">Total</span>
                                    <span className="text-xl md:text-2xl font-bold text-pink-500">
                                        {finalTotal.toLocaleString()} DA
                                    </span>
                                </div>
                                {delivery === 0 && (
                                    <p className="text-xs text-green-500 mt-1">🎉 Free shipping unlocked!</p>
                                )}
                            </div>

                            {/* Checkout Button */}
                            <Link
                                to="/checkout"
                                className="block w-full bg-black text-white text-center py-3.5 md:py-4 rounded-full hover:bg-pink-500 transition font-bold text-base md:text-lg mb-3"
                            >
                                Checkout
                            </Link>

                            <Link
                                to="/shop"
                                className="block w-full border-2 border-black text-black text-center py-3.5 md:py-4 rounded-full hover:bg-black hover:text-white transition font-medium text-sm md:text-base"
                            >
                                Continue Shopping
                            </Link>
                        </motion.div>
                    </div>

                </div>
            )}
        </div>
        </div>
    );
}