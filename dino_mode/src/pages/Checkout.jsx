import { useState, useEffect, useRef } from "react";
import { useShop } from "../context/ShopContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheck, FaTruck, FaShieldAlt, FaUpload } from "react-icons/fa";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

const WILAYAS = [
    "01 - Adrar", "02 - Chlef", "03 - Laghouat", "04 - Oum El Bouaghi",
    "05 - Batna", "06 - Bejaia", "07 - Biskra", "08 - Bechar",
    "09 - Blida", "10 - Bouira", "11 - Tamanrasset", "12 - Tebessa",
    "13 - Tlemcen", "14 - Tiaret", "15 - Tizi Ouzou", "16 - Alger",
    "17 - Djelfa", "18 - Jijel", "19 - Setif", "20 - Saida",
    "21 - Skikda", "22 - Sidi Bel Abbes", "23 - Annaba", "24 - Guelma",
    "25 - Constantine", "26 - Medea", "27 - Mostaganem", "28 - M'Sila",
    "29 - Mascara", "30 - Ouargla", "31 - Oran", "32 - El Bayadh",
    "33 - Illizi", "34 - Bordj Bou Arreridj", "35 - Boumerdes",
    "36 - El Tarf", "37 - Tindouf", "38 - Tissemsilt", "39 - El Oued",
    "40 - Khenchela", "41 - Souk Ahras", "42 - Tipaza", "43 - Mila",
    "44 - Ain Defla", "45 - Naama", "46 - Ain Temouchent",
    "47 - Ghardaia", "48 - Relizane", "49 - Timimoun",
    "50 - Bordj Badji Mokhtar", "51 - Ouled Djellal", "52 - Beni Abbes",
    "53 - In Salah", "54 - In Guezzam", "55 - Touggourt",
    "56 - Djanet", "57 - El M'Ghair", "58 - El Meniaa"
];

const WS_URL = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws/products/`;

export default function Checkout() {
    const { cart, cartTotal, clearCart } = useShop();
    
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        willya: "",
        baladiya: "",
    });
    
    const [receiptImage, setReceiptImage] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [livraison, setLivraison] = useState(0);
    const [livraisonLoading, setLivraisonLoading] = useState(false);
    const [wsStatus, setWsStatus] = useState('disconnected');
    
    const ws = useRef(null);

    const subtotal = cartTotal;
    const finalTotal = subtotal + livraison;

    // جيب سعر التوصيل
    useEffect(() => {
        if (!formData.willya) {
            setLivraison(0);
            return;
        }

        const fetchLivraison = async () => {
            setLivraisonLoading(true);
            try {
                const res = await api.get("/livrison_method/0/");
                const prices = res.data.data || [];
                const willyaName = formData.willya.replace(/^\d+\s*-\s*/, '').trim();
                
                let match;
                if (willyaName.toLowerCase() === "alger" && formData.baladiya) {
                    match = prices.find(p => 
                        p.willya?.trim().toLowerCase() === willyaName.toLowerCase() &&
                        p.baladiya?.trim().toLowerCase() === formData.baladiya.trim().toLowerCase()
                    );
                } else {
                    match = prices.find(p => 
                        p.willya?.trim().toLowerCase() === willyaName.toLowerCase()
                    );
                }
                
                setLivraison(match ? parseFloat(match.price) : 0);
            } catch (err) {
                console.warn("Livraison fetch failed:", err);
                setLivraison(0);
            } finally {
                setLivraisonLoading(false);
            }
        };

        const timer = setTimeout(fetchLivraison, 300);
        return () => clearTimeout(timer);
    }, [formData.willya, formData.baladiya]);

    // WebSocket
    useEffect(() => {
        ws.current = new WebSocket(WS_URL);
        ws.current.onopen = () => setWsStatus('connected');
        ws.current.onclose = () => setWsStatus('disconnected');
        ws.current.onerror = (err) => console.error('WS Error:', err);
        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'stock_updated') {
                console.log('Stock updated:', data.product_size_id, '→', data.new_quantity);
            }
        };
        return () => ws.current?.close();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === "willya" && value !== "16 - Alger") {
            setReceiptImage(null);
        }
        if (name === "willya" && value === "16 - Alger") {
            setFormData(prev => ({ ...prev, baladiya: "" }));
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
        if (formData.willya === "16 - Alger" && !formData.baladiya.trim()) {
            toast.error("Please enter your baladiya for Alger");
            return;
        }
        if (formData.willya !== "16 - Alger" && !receiptImage) {
            toast.error("Please upload a receipt image");
            return;
        }
        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        setLoading(true);

        try {
            const commendOrders = cart.map(item => {
                const psId = parseInt(item.productSizeId, 10);
                if (isNaN(psId) || psId <= 0) {
                    throw new Error(`Invalid productSizeId for item: ${item.name}`);
                }
                return {
                    productSize: psId,
                    quantity: parseInt(item.quantity, 10) || 1
                };
            });

            const jsonPayload = {
                fullName: formData.fullName.trim(),
                phone: formData.phone.trim(),
                willya: formData.willya.replace(/^\d+\s*-\s*/, '').trim(),
                baladiya: formData.baladiya.trim() || null,
                commend_orders: commendOrders
            };

            const formPayload = new FormData();
            formPayload.append("json", JSON.stringify(jsonPayload));
            if (receiptImage) {
                formPayload.append("recipte", receiptImage);
            }

            // 1. CREATE ORDER
            const res = await api.post("/commends_orders_method/pending/0/", formPayload);

            if (res.data.status === "success") {
                // 2. UPDATE STOCK
                const updatePromises = cart.map(item => {
                    const colorId = item.productColorId || 0;
                    return api.get(`/update_qte/${item.productSizeId}/${colorId}/`);
                });
                
                await Promise.all(updatePromises).catch(err => {
                    console.warn("Some stock updates failed:", err);
                });

                toast.success("Order placed successfully!");
                setSubmitted(true);
                clearCart();
            } else {
                toast.error(res.data.message || "Failed");
            }
        } catch (err) {
            console.error("Error:", err);
            const backendError = err.response?.data;
            if (backendError?.error) {
                toast.error(backendError.error);
            } else if (backendError?.message) {
                toast.error(backendError.message);
            } else if (typeof backendError === 'object') {
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
                        <span className="text-gray-500">التوصيل:</span>
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

                            {/* حقل البلدية — يظهر فقط للجزائر العاصمة */}
                            <AnimatePresence>
                                {formData.willya === "16 - Alger" && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            البلدية <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            type="text" 
                                            name="baladiya" 
                                            required
                                            value={formData.baladiya} 
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] transition" 
                                            placeholder="مثال: Bab Ezzouar, El Harrach..." 
                                        />
                                        <p className="text-xs text-gray-400 mt-1">لازم باش نحسبو سعر التوصيل</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Receipt Upload للولايات الأخرى */}
                            <AnimatePresence>
                                {formData.willya && formData.willya !== "16 - Alger" && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="border-2 border-dashed border-pink-200 rounded-xl p-4 text-center"
                                    >
                                        <div className="mb-4">
                                            <p className="text-sm font-semibold text-gray-700">
                                                التوصيل خارج الجزائر العاصمة
                                            </p>
                                            <p className="text-sm text-pink-600 font-bold mt-1">
                                                للتأكيد الطلب يجب دفع 1000 دينار مسبقا
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                CCP: <span className="font-bold text-gray-700">00799999004183356066</span>
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                قم بتحويل 1000 DA إلى حساب CCP أعلاه ثم أرفق صورة الإيصال.
                                            </p>
                                        </div>

                                        <label className="cursor-pointer block">
                                            <FaUpload className="mx-auto text-pink-400 text-2xl mb-2" />
                                            <span className="text-sm text-gray-600 font-medium">تحميل الإيصال</span>
                                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>

                                        {receiptImage && (
                                            <p className="text-xs text-green-600 mt-2">✓ {receiptImage.name}</p>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        <button type="submit" disabled={loading || livraisonLoading}
                            className={`w-full mt-6 md:mt-8 py-3.5 md:py-4 rounded-full font-bold text-base md:text-lg transition ${loading || livraisonLoading ? "bg-gray-300 cursor-not-allowed" : "bg-black text-white hover:bg-pink-500"}`}>
                            {loading ? "قيد المعالجة..." : livraisonLoading ? "جاري حساب التوصيل..." : "اتمام الطلب"}
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
                                <span className="flex items-center gap-1">
                                    Livraison
                                    {livraisonLoading && <span className="text-xs text-pink-500">(جاري الحساب...)</span>}
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