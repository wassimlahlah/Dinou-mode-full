import { useState, useEffect, useRef } from "react";
import { useShop } from "../context/ShopContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaTruck, FaShieldAlt, FaUpload, FaHome, FaStore } from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { createOrder} from "../api/productService";

const LIVRAISON_PRICES = [
  { wilaya: "Alger", zone: 0, delai: 1, domicile: 590, stopDesk: 450, retour: 0 },
  { wilaya: "Blida", zone: 1, delai: 1, domicile: 700, stopDesk: 550, retour: 0 },
  { wilaya: "Boumerdès", zone: 1, delai: 1, domicile: 700, stopDesk: 550, retour: 0 },
  { wilaya: "Tipaza", zone: 1, delai: 1, domicile: 700, stopDesk: 550, retour: 0 },
  { wilaya: "Chlef", zone: 2, delai: 1, domicile: 700, stopDesk: 550, retour: 0 },
  { wilaya: "Oum El Bouaghi", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Batna", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Béjaïa", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Bouira", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Tlemcen", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Tiaret", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Tizi Ouzou", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Jijel", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Sétif", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Saïda", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Skikda", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Sidi Bel Abbès", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Annaba", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Guelma", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Constantine", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Médéa", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Mostaganem", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "M'Sila", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Mascara", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Oran", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Bordj Bou Arreridj", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "El Tarf", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Tissemsilt", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Khenchela", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Souk Ahras", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Mila", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Aïn Defla", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Aïn Témouchent", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Relizane", zone: 2, delai: 1, domicile: 900, stopDesk: 650, retour: 0 },
  { wilaya: "Laghouat", zone: 3, delai: 1, domicile: 950, stopDesk: 750, retour: 0 },
  { wilaya: "Biskra", zone: 3, delai: 1, domicile: 950, stopDesk: 750, retour: 0 },
  { wilaya: "Tébessa", zone: 3, delai: 1, domicile: 950, stopDesk: 750, retour: 0 },
  { wilaya: "Djelfa", zone: 3, delai: 1, domicile: 950, stopDesk: 750, retour: 0 },
  { wilaya: "Ouargla", zone: 3, delai: 2, domicile: 950, stopDesk: 750, retour: 0 },
  { wilaya: "El Oued", zone: 3, delai: 1, domicile: 950, stopDesk: 750, retour: 0 },
  { wilaya: "Ghardaïa", zone: 3, delai: 2, domicile: 950, stopDesk: 750, retour: 0 },
  { wilaya: "Ouled Djellal", zone: 3, delai: 1, domicile: 950, stopDesk: 750, retour: 0 },
  { wilaya: "Touggourt", zone: 3, delai: 2, domicile: 950, stopDesk: 750, retour: 0 },
  { wilaya: "El M'Ghair", zone: 3, delai: 1, domicile: 950, stopDesk: 750, retour: 0 },
  { wilaya: "El Menia", zone: 3, delai: 2, domicile: 950, stopDesk: 750, retour: 0 },
  { wilaya: "Adrar", zone: 4, delai: 3, domicile: 1050, stopDesk: 850, retour: 0 },
  { wilaya: "Béchar", zone: 4, delai: 3, domicile: 1050, stopDesk: 850, retour: 0 },
  { wilaya: "El Bayadh", zone: 4, delai: 2, domicile: 1050, stopDesk: 850, retour: 0 },
  { wilaya: "Naâma", zone: 4, delai: 3, domicile: 1050, stopDesk: 850, retour: 0 },
  { wilaya: "Timimoun", zone: 4, delai: 3, domicile: 1050, stopDesk: 850, retour: 0 },
  { wilaya: "Bordj Badji Mokhtar", zone: 4, delai: 3, domicile: 1050, stopDesk: 850, retour: 0 },
  { wilaya: "Béni Abbès", zone: 4, delai: 3, domicile: 1050, stopDesk: 850, retour: 0 },
  { wilaya: "Tamanrasset", zone: 5, delai: 5, domicile: 1600, stopDesk: 1400, retour: 0 },
  { wilaya: "Illizi", zone: 5, delai: 6, domicile: 1600, stopDesk: 1400, retour: 0 },
  { wilaya: "Tindouf", zone: 5, delai: 5, domicile: 1600, stopDesk: 1400, retour: 0 },
  { wilaya: "In Salah", zone: 5, delai: 5, domicile: 1600, stopDesk: 1400, retour: 0 },
  { wilaya: "In Guezzam", zone: 5, delai: 5, domicile: 1600, stopDesk: 1400, retour: 0 },
  { wilaya: "Djanet", zone: 5, delai: 6, domicile: 1600, stopDesk: 1400, retour: 0 }
];

const WILAYAS = LIVRAISON_PRICES.map(p => p.wilaya).sort();

const WS_URL = "wss://icommers-backend.onrender.com/ws/products/";

export default function Checkout() {
    const { cart, cartTotal, clearCart } = useShop();
    
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        willya: "",
        baladiya: "",
        deliveryType: false,
    });
    
    const [receiptImage, setReceiptImage] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [livraison, setLivraison] = useState(0);
    const [wsStatus, setWsStatus] = useState('disconnected');
    
    const ws = useRef(null);

    const subtotal = cartTotal;
    const finalTotal = subtotal + livraison;

    // حساب سعر التوصيل
    useEffect(() => {
        if (!formData.willya) {
            setLivraison(0);
            return;
        }
        const priceData = LIVRAISON_PRICES.find(
            p => p.wilaya.toLowerCase() === formData.willya.toLowerCase()
        );
        if (priceData) {
            const price = formData.deliveryType === "stopDesk" 
                ? priceData.stopDesk 
                : priceData.domicile;
            setLivraison(price);
        } else {
            setLivraison(0);
        }
    }, [formData.willya, formData.deliveryType]);

    // WebSocket
    useEffect(() => {
        const isLocalhost = window.location.hostname === 'localhost';
        const wsUrl = isLocalhost 
            ? `ws://localhost:8000/ws/products/`
            : WS_URL;
        
        try {
            ws.current = new WebSocket(wsUrl);
            ws.current.onopen = () => setWsStatus('connected');
            ws.current.onclose = () => setWsStatus('disconnected');
            ws.current.onerror = (err) => {
                console.error("WS Error:", err);
                setWsStatus('error');
            };
            ws.current.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'stock_updated') {
                    console.log('Stock updated:', data.product_size_id, '→', data.new_quantity);
                }
            };
        } catch (err) {
            console.error("Failed to create WS:", err);
        }
        return () => ws.current?.close();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDeliveryTypeChange = (type) => {
        setFormData(prev => ({ ...prev, deliveryType: type }));
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
        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        setLoading(true);

        try {
            // 🔧 بناء commend_orders بشكل موافق للباك اند
            const commend_orders = cart.map(item => {
                const psId = parseInt(item.productSizeId, 10);
                if (isNaN(psId) || psId <= 0) {
                    throw new Error(`Invalid productSizeId for item: ${item.name}`);
                }
                return {
                    productSize: psId,
                    quantity: parseInt(item.quantity, 10) || 1
                };
            });

            // 🔧 بناء الـ payload كامل مع baladiya و is_birou
            const orderPayload = {
                fullName: formData.fullName.trim(),
                phone: formData.phone.trim(),
                willya: formData.willya,
                baladiya: formData.baladiya.trim() || null,
                is_birou: formData.deliveryType === "stopDesk", // ← true للمكتب، false للمنزل
                commend_orders: commend_orders
            };

            console.log("📤 Sending payload:", orderPayload);

            // 🔧 استعمال createOrder من api.js
            const res = await createOrder(orderPayload, receiptImage);

            console.log("📥 Response:", res);

            if (res.status === "success") {
                toast.success("Order placed successfully!");
                setSubmitted(true);
                clearCart();
            } else {
                toast.error(res.message || "Failed to place order");
            }
        } catch (err) {
            console.error("🔥 Full error:", err);
            
            if (err.response) {
                console.error("🔥 Status:", err.response.status);
                console.error("🔥 Data:", JSON.stringify(err.response.data, null, 2));
            }

            const backendError = err.response?.data;
            if (backendError?.error) {
                toast.error(backendError.error);
            } else if (backendError?.message) {
                toast.error(backendError.message);
            } else if (typeof backendError === 'object' && backendError !== null) {
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
                <p className="text-xl md:text-2xl text-gray-400 mb-6">سلة التسوق الخاصة بك فارغة</p>
                <Link to="/shop" className="inline-block bg-black text-white px-8 py-3 rounded-full hover:bg-pink-500 transition">
                    العودة إلى المتجر
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
                <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">تم تأكيد الطلب!</h2>
                <p className="text-gray-500 mb-2 text-sm md:text-base">شكرًا لك <span className="font-semibold text-gray-800">{formData.fullName}</span>,</p>
                <p className="text-gray-500 mb-2 text-sm md:text-base">سنقوم بالتواصل معك قريبًا على <span className="font-semibold text-gray-800">{formData.phone}</span>.</p>
                
                <div className="bg-gray-50 rounded-xl p-4 mt-4 mb-6 text-left">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">المجموع:</span>
                        <span className="font-medium">{subtotal.toLocaleString()} DA</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">التوصيل ({formData.deliveryType === 'domicile' ? 'المنزل' : 'المكتب'}):</span>
                        <span className="font-medium">{livraison.toLocaleString()} DA</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold">
                        <span>الإجمالي:</span>
                        <span className="text-pink-500">{finalTotal.toLocaleString()} DA</span>
                    </div>
                </div>

                <Link to="/shop" className="inline-block bg-black text-white px-8 py-3 rounded-full hover:bg-pink-500 transition">
                    مواصلة التسوق
                </Link>
            </motion.div>
        );
    }

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto">
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="text-2xl md:text-4xl font-serif font-bold mb-6 md:mb-10">Complétez votre commande</motion.h1>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-10">
                <div className="lg:col-span-3">
                    <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 md:p-8 shadow-sm border border-gray-100">
                        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">معلومات الشحن</h2>
                        
                        <div className="space-y-4 md:space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الاسم الكامل <span className="text-red-500">*</span>
                                </label>
                                <input type="text" name="fullName" required 
                                    value={formData.fullName} onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] transition" 
                                    placeholder="اسمك الكامل" />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الهاتف <span className="text-red-500">*</span>
                                    </label>
                                    <input type="tel" name="phone" required 
                                        value={formData.phone} onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] transition" 
                                        placeholder="05XX XX XX XX" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الولاية <span className="text-red-500">*</span>
                                    </label>
                                    <select name="willya" required 
                                        value={formData.willya} onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] transition bg-white">
                                        <option value="">اختر ولاية</option>
                                        {WILAYAS.map((w) => (<option key={w} value={w}>{w}</option>))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    البلدية <span className="text-gray-400 font-normal">(اختياري)</span>
                                </label>
                                <input 
                                    type="text" 
                                    name="baladiya" 
                                    value={formData.baladiya} 
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] transition" 
                                    placeholder="مثال: Bab Ezzouar, El Harrach..." 
                                />
                            </div>

                            {formData.willya && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="space-y-3"
                                >
                                    <label className="block text-sm font-medium text-gray-700">
                                        نوع التوصيل <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => handleDeliveryTypeChange("domicile")}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                                                formData.deliveryType === "domicile"
                                                    ? "border-pink-500 bg-pink-50 text-pink-600"
                                                    : "border-gray-200 hover:border-pink-200"
                                            }`}
                                        >
                                            <FaHome className="text-xl" />
                                            <span className="font-medium text-sm">المنزل</span>
                                            <span className="text-xs text-gray-400">Domicile</span>
                                            {formData.willya && (
                                                <span className="text-xs font-bold text-pink-500">
                                                    +{LIVRAISON_PRICES.find(p => p.wilaya === formData.willya)?.domicile || 0} DA
                                                </span>
                                            )}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleDeliveryTypeChange("stopDesk")}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                                                formData.deliveryType === "stopDesk"
                                                    ? "border-pink-500 bg-pink-50 text-pink-600"
                                                    : "border-gray-200 hover:border-pink-200"
                                            }`}
                                        >
                                            <FaStore className="text-xl" />
                                            <span className="font-medium text-sm">المكتب</span>
                                            <span className="text-xs text-gray-400">Stop Desk</span>
                                            {formData.willya && (
                                                <span className="text-xs font-bold text-pink-500">
                                                    +{LIVRAISON_PRICES.find(p => p.wilaya === formData.willya)?.stopDesk || 0} DA
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            <AnimatePresence>
                                {formData.willya && formData.willya !== "Alger" && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="border-2 border-dashed border-pink-200 rounded-xl p-4 text-center"
                                    >
                                        <div className="mb-4">
                                            <p className="text-sm font-semibold text-gray-700">
                                                دفع مسبق (اختياري)
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                CCP: <span className="font-bold text-gray-700">00799999004183356066</span>
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                إذا دفعت مسبقًا، أرفق صورة الإيصال. أو ادفع عند الاستلام.
                                            </p>
                                        </div>

                                        <label className="cursor-pointer block">
                                            <FaUpload className="mx-auto text-pink-400 text-2xl mb-2" />
                                            <span className="text-sm text-gray-600 font-medium">
                                                {receiptImage ? "تغيير الصورة" : "تحميل الإيصال (اختياري)"}
                                            </span>
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>

                                        {receiptImage && (
                                            <p className="text-xs text-green-600 mt-2">✓ {receiptImage.name}</p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        <button type="submit" disabled={loading}
                            className={`w-full mt-6 md:mt-8 py-3.5 md:py-4 rounded-full font-bold text-base md:text-lg transition ${loading ? "bg-gray-300 cursor-not-allowed" : "bg-black text-white hover:bg-pink-500"}`}>
                            {loading ? "قيد المعالجة..." : "اتمام الطلب"}
                        </button>
                    </motion.form>
                </div>

                <div className="lg:col-span-2">
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100 lg:sticky lg:top-6">
                        <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 font-serif">Récapitulatif de la commande</h2>
                        
                        <div className="space-y-3 mb-5 md:mb-6 max-h-48 md:max-h-60 overflow-y-auto">
                            {cart.map((item) => (
                                <div key={item.productSizeId} className="flex justify-between text-sm">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <span className="text-gray-700 font-medium truncate block">{item.name}</span>
                                        <span className="text-gray-400 text-xs">
                                            × {item.quantity} 
                                            {item.size && ` (${item.size})`}
                                            {item.color && ` - ${item.color}`}
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-800 shrink-0">
                                        {(item.price * item.quantity).toLocaleString()} DA
                                    </span>
                                </div>
                            ))}
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4 space-y-3">
                            <div className="flex justify-between text-gray-600 text-sm md:text-base">
                                <span>Sous-total</span>
                                <span>{cartTotal.toLocaleString()} DA</span>
                            </div>
                            
                            <div className="flex justify-between text-gray-600 text-sm md:text-base">
                                <span>
                                    Livraison ({formData.deliveryType === 'domicile' ? 'Domicile' : 'Stop Desk'})
                                </span>
                                <span>{livraison.toLocaleString()} DA</span>
                            </div>
                        </div>
                        
                        <div className="border-t border-gray-200 mt-4 pt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-base md:text-lg font-bold">Total</span>
                                <span className="text-xl md:text-2xl font-bold text-pink-500">
                                    {finalTotal.toLocaleString()} DA
                                </span>
                            </div>
                        </div>

                        {wsStatus === 'connected' && (
                            <p className="text-xs text-green-500 mt-2 text-center">🟢 متصل بالمخزن المباشر</p>
                        )}
                        {wsStatus === 'error' && (
                            <p className="text-xs text-red-400 mt-2 text-center">🔴 مشكلة في الاتصال</p>
                        )}

                        <div className="mt-5 md:mt-6 space-y-2.5 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                                <FaShieldAlt className="text-pink-500 shrink-0" />
                                <span>Paiement sécurisé</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                                <FaTruck className="text-pink-500 shrink-0" />
                                <span>Livraison rapide</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}