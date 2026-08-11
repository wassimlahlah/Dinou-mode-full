import { useState } from "react";
import { useShop } from "../context/ShopContext";
import { motion } from "framer-motion";
import { FaCheck, FaTruck, FaShieldAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const WILAYAS = [
  "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Bejaia",
  "Biskra", "Bechar", "Blida", "Bouira", "Tamanrasset", "Tebessa",
  "Tlemcen", "Tiaret", "Tizi Ouzou", "Algiers", "Djelfa", "Jijel",
  "Setif", "Saida", "Skikda", "Sidi Bel Abbes", "Annaba", "Guelma",
  "Constantine", "Medea", "Mostaganem", "M'Sila", "Mascara", "Ouargla",
  "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdes",
  "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela",
  "Souk Ahras", "Tipaza", "Mila", "Ain Defla", "Naama",
  "Ain Temouchent", "Ghardaia", "Relizane", "Timimoun",
  "Bordj Badji Mokhtar", "Ouled Djellal", "Beni Abbes", "In Salah",
  "In Guezzam", "Touggourt", "Djanet", "El M'Ghair", "El Meniaa"
];

const SHIPPING_RATES = {
  "Chlef": 400, "Oum El Bouaghi": 400, "Batna": 400, "Bejaia": 400,
  "Biskra": 400, "Bechar": 400, "Blida": 400, "Bouira": 400,
  "Tebessa": 400, "Tlemcen": 400, "Tizi Ouzou": 400, "Algiers": 400,
  "Jijel": 400, "Setif": 400, "Saida": 400, "Skikda": 400,
  "Sidi Bel Abbes": 400, "Annaba": 400, "Guelma": 400, "Constantine": 400,
  "Medea": 400, "Mostaganem": 400, "Mascara": 400, "Oran": 400,
  "Bordj Bou Arreridj": 400, "Boumerdes": 400, "El Tarf": 400,
  "Souk Ahras": 400, "Tipaza": 400, "Mila": 400, "Ain Defla": 400,
  "Ain Temouchent": 400, "Relizane": 400, "Khenchela": 400,
  "Laghouat": 600, "Tiaret": 600, "Djelfa": 600, "Tissemsilt": 600,
  "El Bayadh": 600, "Naama": 600, "Ouargla": 600, "Ghardaia": 600,
  "M'Sila": 600, "El Oued": 600, "Ouled Djellal": 600, "Touggourt": 600,
  "El M'Ghair": 600,
  "Adrar": 1000, "Tamanrasset": 1000, "Illizi": 1000, "Timimoun": 1000,
  "Bordj Badji Mokhtar": 1000, "Beni Abbes": 1000, "In Salah": 1000,
  "In Guezzam": 1000, "Djanet": 1000, "El Meniaa": 1000, "Tindouf": 1000
};

export default function Checkout() {
    const { cart, cartTotal, clearCart } = useShop();
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        wilaya: "",
        commune: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const delivery = formData.wilaya ? (SHIPPING_RATES[formData.wilaya] || 500) : 0;
    const finalTotal = cartTotal + delivery;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.wilaya) {
            toast.error("Please select your wilaya");
            return;
        }

        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const orderData = {
            id: "#ORD-" + Date.now().toString().slice(-4),
            customer: formData.fullName || "Guest",
            phone: formData.phone,
            wilaya: formData.wilaya,
            commune: formData.commune,
            address: `${formData.commune || ""}, ${formData.wilaya}`.replace(/^, /, ""),
            items: cart.reduce((sum, i) => sum + i.quantity, 0),
            total: finalTotal,
            status: "Pending",
            date: new Date().toISOString().split('T')[0],
            cart: cart,
        };

        const existing = JSON.parse(localStorage.getItem('dinou_orders') || '[]');
        localStorage.setItem('dinou_orders', JSON.stringify([orderData, ...existing]));

        console.log("🧾 ORDER TOTAL:", finalTotal.toLocaleString(), "DA");
        toast.success(`Order placed! Total: ${finalTotal.toLocaleString()} DA`);

        setSubmitted(true);
        setLoading(false);
        clearCart();
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
                                    <select name="wilaya" required value={formData.wilaya} onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] transition bg-white">
                                        <option value="">Select a wilaya</option>
                                        {WILAYAS.map((w) => (<option key={w} value={w}>{w}</option>))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Commune</label>
                                <input type="text" name="commune" value={formData.commune} onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] transition" placeholder="Optional" />
                            </div>
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
                                <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between text-sm">
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
                            <div className="flex justify-between text-gray-600 text-sm md:text-base"><span>Delivery</span><span>{delivery === 0 ? <span className="text-gray-400">—</span> : `${delivery.toLocaleString()} DA`}</span></div>
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