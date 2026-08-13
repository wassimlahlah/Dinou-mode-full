import { useState } from "react";
import { useShop } from "../context/ShopContext";
import { motion } from "framer-motion";
import { FaCheck, FaTruck, FaShieldAlt, FaUpload } from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

const WILAYAS = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Bejaia",
    "Biskra", "Bechar", "Blida", "Bouira", "Tamanrasset", "Tebessa",
    "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger", "Djelfa", "Jijel",
    "Setif", "Saida", "Skikda", "Sidi Bel Abbes", "Annaba", "Guelma",
    "Constantine", "Medea", "Mostaganem", "M'Sila", "Mascara", "Ouargla",
    "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdes",
    "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
    "Souk Ahras", "Tipaza", "Mila", "Ain Defla", "Naama",
    "Ain Temouchent", "Ghardaia", "Relizane", "Timimoun",
    "Bordj Badji Mokhtar", "Ouled Djellal", "Beni Abbes", "In Salah",
    "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
];

export default function Checkout() {
    const { cart, cartTotal, clearCart } = useShop();
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        willya: "",
    });
    const [receiptImage, setReceiptImage] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const finalTotal = cartTotal;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === "willya" && e.target.value === "Alger") {
            setReceiptImage(null);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 5 * 1024 * 1024) {
            toast.error("Image too large (max 5MB)");
            return;
        }
        setReceiptImage(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 🔥 تحقق من البيانات قبل الإرسال
        if (!formData.fullName.trim()) {
            toast.error("Full name is required");
            return;
        }
        if (!formData.phone.trim()) {
            toast.error("Phone is required");
            return;
        }
        if (!formData.willya) {
            toast.error("Please select your wilaya");
            return;
        }
        if (formData.willya !== "Alger" && !receiptImage) {
            toast.error("Please upload a receipt image");
            return;
        }

        // 🔥 تحقق من الـ cart
        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        setLoading(true);

        // ✅ تأكد من productSizeId رقم صحيح
        const commendOrders = cart.map(item => {
            const psId = parseInt(item.productSizeId, 10);
            if (isNaN(psId) || psId <= 0) {
                throw new Error(`Invalid productSizeId for item: ${item.name}`);
            }
            return {
                productSize: psId,  // ← Integer مضمون
                quantity: parseInt(item.quantity, 10) || 1
            };
        });

        console.log("🔥 Sending commend_orders:", JSON.stringify(commendOrders, null, 2));

        const jsonPayload = {
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            willya: formData.willya,
            commend_orders: commendOrders
        };

        const formPayload = new FormData();
        formPayload.append("json", JSON.stringify(jsonPayload));

        if (receiptImage) {
            formPayload.append("recipte", receiptImage);
        }

        try {
            const res = await api.post("/commends_orders_method/pending/0/", formPayload);

            if (res.data.status === "success") {
                toast.success("Order placed successfully!");
                setSubmitted(true);
                clearCart();
            } else {
                toast.error(res.data.message || "Failed");
            }
        } catch (err) {
            console.error("🔥 Full error:", err);
            console.error("🔥 Response data:", err.response?.data);

            // عرض التفاصيل من الـ backend
            const backendError = err.response?.data;
            if (backendError?.error) {
                toast.error(backendError.error);
            } else if (backendError?.message) {
                toast.error(backendError.message);
            } else if (typeof backendError === 'object') {
                // Validation errors
                const errors = Object.entries(backendError)
                    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                    .join(' | ');
                toast.error(errors || "Validation failed");
            } else {
                toast.error(err.message || "Network error");
            }
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0 && !submitted) {
        return (
            <div className="p-6 md:p-10 max-w-2xl mx-auto text-center">
                <p className="text-5xl md:text-6xl mb-6">🛒</p>
                <p className="text-xl md:text-2xl text-gray-400 mb-6">Your cart is empty</p>
                <Link to="/shop" className="inline-block bg-black text-white px-8 py-3 rounded-full hover:bg-pink-500 transition">
                    Back to Shop
                </Link>
            </div>
        );
    }

    if (submitted) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="p-6 md:p-10 max-w-2xl mx-auto text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 md:w-24 md:h-24 bg-[#F7D6DF] rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaCheck className="text-pink-500 text-3xl md:text-4xl" />
                </motion.div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">Order Confirmed!</h2>
                <p className="text-gray-500 mb-2 text-sm md:text-base">Thank you <span className="font-semibold text-gray-800">{formData.fullName}</span>,</p>
                <p className="text-gray-500 mb-8 text-sm md:text-base">We'll contact you soon at <span className="font-semibold text-gray-800">{formData.phone}</span>.</p>
                <Link to="/shop" className="inline-block bg-black text-white px-8 py-3 rounded-full hover:bg-pink-500 transition">
                    Continue Shopping
                </Link>
            </motion.div>
        );
    }

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto">
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-4xl font-serif font-bold mb-6 md:mb-10">Complete Your Order</motion.h1>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-10">
                <div className="lg:col-span-3">
                    <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 md:p-8 shadow-sm border border-gray-100">
                        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Shipping Information</h2>
                        <div className="space-y-4 md:space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                                <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] transition" placeholder="Your full name" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone <span className="text-red-500">*</span></label>
                                    <input type="tel" name="phone" required value={formData.phone} onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] transition" placeholder="05XX XX XX XX" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Wilaya <span className="text-red-500">*</span></label>
                                    <select name="willya" required value={formData.willya} onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] transition bg-white">
                                        <option value="">Select a wilaya</option>
                                        {WILAYAS.map((w) => (<option key={w} value={w}>{w}</option>))}
                                    </select>
                                </div>
                            </div>

                            {/* 🔥 Receipt Upload for non-Alger */}
                            {formData.willya && formData.willya !== "Alger" && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                    className="border-2 border-dashed border-pink-200 rounded-xl p-4 text-center">
                                    <label className="cursor-pointer block">
                                        <FaUpload className="mx-auto text-pink-400 text-2xl mb-2" />
                                        <span className="text-sm text-gray-600 font-medium">Upload Receipt (1000 DZD deposit)</span>
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </label>
                                    {receiptImage && (
                                        <p className="text-xs text-green-600 mt-2">✓ {receiptImage.name}</p>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1">Required for delivery outside Algiers</p>
                                </motion.div>
                            )}
                        </div>
                        <button type="submit" disabled={loading}
                            className={`w-full mt-6 md:mt-8 py-3.5 md:py-4 rounded-full font-bold text-base md:text-lg transition ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-black text-white hover:bg-pink-500"}`}>
                            {loading ? "Processing..." : "Place Order"}
                        </button>
                    </motion.form>
                </div>

                <div className="lg:col-span-2">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 lg:sticky lg:top-6">
                        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 font-serif">Order Summary</h2>
                        <div className="space-y-3 mb-5 md:mb-6 max-h-48 md:max-h-60 overflow-y-auto">
                            {cart.map((item) => (
                                <div key={item.productSizeId} className="flex justify-between text-sm">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <span className="text-gray-700 font-medium truncate block">{item.name}</span>
                                        <span className="text-gray-400 text-xs">× {item.quantity} {item.size && `(${item.size})`}</span>
                                    </div>
                                    <span className="font-medium text-gray-800 shrink-0">{(item.price * item.quantity).toLocaleString()} DA</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-200 pt-4 space-y-3">
                            <div className="flex justify-between text-gray-600 text-sm md:text-base"><span>Subtotal</span><span>{cartTotal.toLocaleString()} DA</span></div>
                            
                        </div>
                        <div className="border-t border-gray-200 mt-4 pt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-base md:text-lg font-bold">Total</span>
                                <span className="text-xl md:text-2xl font-bold text-pink-500">{finalTotal.toLocaleString()} DA</span>
                            </div>
                        </div>
                        <div className="mt-5 md:mt-6 space-y-2.5 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500"><FaShieldAlt className="text-pink-500 shrink-0" /><span>Secure Payment</span></div>
                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500"><FaTruck className="text-pink-500 shrink-0" /><span>Fast Delivery</span></div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}