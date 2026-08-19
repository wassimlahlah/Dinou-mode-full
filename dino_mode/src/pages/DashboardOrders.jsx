import { useState, useEffect } from "react";
import DashboardSidebar from "../components/Dashboard/DashboardSidebar";
import { motion } from "framer-motion";
import { FaSearch, FaEye, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaBox, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../api/axios";

const statusColors = {
    DELIVERED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    CANCELED: "bg-red-100 text-red-700",
};

const statusOptions = ["ALL", "PENDING", "DELIVERED", "CANCELED"];
const statusDisplay = { PENDING: "Pending", DELIVERED: "Delivered", CANCELED: "Canceled" };

export default function DashboardOrders() {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchOrders = async (status) => {
        try {
            const res = await api.get(`/commends_orders_method/${status}/0/`);
            if (res.data.status === "success") {
                return res.data.data;
            }
            return [];
        } catch (err) {
            console.error("Fetch error:", err);
            toast.error("Failed to load orders");
            return [];
        }
    };

    const loadAllOrders = async () => {
        setLoading(true);
        let allOrders = [];
        
        if (filter === "All") {
            const [pending, delivered, canceled] = await Promise.all([
                fetchOrders("PENDING"),
                fetchOrders("DELIVERED"),
                fetchOrders("CANCELED")
            ]);
            allOrders = [...pending, ...delivered, ...canceled];
        } else {
            allOrders = await fetchOrders(filter);
        }

        const transformed = allOrders.map(commend => ({
            id: commend.id,
            displayId: `#CMD-${commend.id}`,
            customer: commend.fullName,
            phone: commend.phone,
            willya: commend.willya,
            baladiya: commend.baladiya,
            date: new Date(commend.commend_date).toLocaleDateString(),
            status: commend.status,
            image_url: commend.image_url,
            is_birou: commend.is_birou,
            total: commend.commend_orders.reduce(
                (sum, o) => sum + (parseFloat(o.price) * o.quantity), 0
            ),
            items: commend.commend_orders.reduce((sum, o) => sum + o.quantity, 0),
            orders: commend.commend_orders.map(o => ({
                id: o.id,
                name: o.productSize?.productColor?.product?.name || "Product",
                size: o.productSize?.size,
                color: o.productSize?.productColor?.color,
                quantity: o.quantity,
                unitPrice: parseFloat(o.price) || 0,
                totalPrice: (parseFloat(o.price) || 0) * o.quantity,
                image: o.productSize?.productColor?.image || null
            }))
        }));

        setOrders(transformed);
        setLoading(false);
    };

    useEffect(() => {
        loadAllOrders();
    }, [filter]);

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await api.put(`/update_commend_status_or_delete/${id}/${newStatus}/`);
            if (res.data.status === "success") {
                toast.success(`Status updated to ${statusDisplay[newStatus]}`);
                loadAllOrders();
            } else {
                toast.error(res.data.message || "Update failed");
            }
        } catch (err) {
            console.error("Update error:", err);
            toast.error(err.response?.data?.message || "Network error");
        }
    };

    // 🔧 status زايد في URL، الباك اند يلقاه بـ order_id فقط
    const deleteOrder = async (orderId) => {
        try {
            const res = await api.delete(`/commends_orders_method/DELETE/${orderId}/`);
            if (res.data.status === "success") {
                toast.success("Order deleted");
                loadAllOrders();
                setSelectedOrder(null);
            } else {
                toast.error(res.data.message || "Delete failed");
            }
        } catch (err) {
            console.error("Delete error:", err);
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };

    const deleteCommend = async (commendId) => {
        try {
            const res = await api.delete(`/update_commend_status_or_delete/${commendId}/delete/`);
            if (res.data.status === "success") {
                toast.success("Commend deleted");
                loadAllOrders();
                setSelectedOrder(null);
            } else {
                toast.error(res.data.message || "Delete failed");
            }
        } catch (err) {
            console.error("Delete error:", err);
            toast.error(err.response?.data?.message || "Delete failed");
        }
    };

    const filtered = orders.filter((o) => {
        const matchesSearch = (o.customer?.toLowerCase() || "").includes(search.toLowerCase()) ||
                              (o.displayId?.toLowerCase() || "").includes(search.toLowerCase());
        const matchesStatus = filter === "All" || o.status === filter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="flex min-h-screen bg-pink-50 mt-2">
            <DashboardSidebar />
            <main className="flex-1 p-4 md:p-10 overflow-x-hidden">
                <h1 className="text-2xl md:text-4xl font-serif font-bold mb-6 md:mb-8">Commandes</h1>

                <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input placeholder="Search by name or order ID..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full border p-3 md:p-4 pl-11 md:pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] text-sm md:text-base" />
                    </div>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}
                        className="border p-3 md:p-4 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] text-sm md:text-base">
                        {statusOptions.map((s) => (<option key={s} value={s}>{s === "All" ? "All" : statusDisplay[s]}</option>))}
                    </select>
                </div>

                {loading && <p className="text-center text-gray-400 py-4">Chargement des commandes...</p>}

                {/* MOBILE */}
                <div className="md:hidden space-y-3">
                    {filtered.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">Aucune commande trouvée</p>
                    ) : (
                        filtered.map((order) => (
                            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                                
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-sm">{order.displayId}</span>
                                    <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[order.status] || "bg-gray-100"}`}>
                                        {statusOptions.slice(1).map((s) => (<option key={s} value={s}>{statusDisplay[s]}</option>))}
                                    </select>
                                </div>

                                <div>
                                    <p className="font-semibold text-gray-900">{order.customer}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <FaPhone size={10} /> {order.phone}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <FaMapMarkerAlt size={10} /> {order.willya}
                                    {order.baladiya && ` — ${order.baladiya}`}
                                    {order.is_birou && <span className="ml-1 text-pink-500">(Stop Desk)</span>}
                                </div>

                                <div className="flex justify-between text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><FaCalendarAlt size={10} /> {order.date}</span>
                                    <span className="flex items-center gap-1"><FaBox size={10} /> {order.items} articles</span>
                                </div>

                                <div className="border-t pt-3 flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Total</span>
                                    <span className="text-lg font-bold text-pink-500">{order.total?.toLocaleString()} DA</span>
                                </div>

                                <button onClick={() => setSelectedOrder(order)}
                                    className="w-full py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition flex items-center justify-center gap-2">
                                    <FaEye size={12} /> Voir les détails
                                </button>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* DESKTOP */}
                <div className="hidden md:block bg-white rounded-3xl shadow-sm p-6 border border-gray-100 overflow-x-auto">
                    {filtered.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">Aucune commande trouvée</p>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-400 text-sm border-b">
                                    <th className="pb-3 pr-4">ID de la commande</th>
                                    <th className="pb-3 pr-4">Client</th>
                                    <th className="pb-3 pr-4">Téléphone</th>
                                    <th className="pb-3 pr-4">Wilaya</th>
                                    <th className="pb-3 pr-4">Baladiya</th>
                                    <th className="pb-3 pr-4">Total</th>
                                    <th className="pb-3 pr-4">Statut</th>
                                    <th className="pb-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((order) => (
                                    <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="border-b last:border-0 hover:bg-gray-50 transition text-sm">
                                        <td className="py-4 pr-4 font-medium">{order.displayId}</td>
                                        <td className="py-4 pr-4">
                                            <p className="font-medium">{order.customer}</p>
                                        </td>
                                        <td className="py-4 pr-4 text-gray-500">{order.phone}</td>
                                        <td className="py-4 pr-4 text-gray-500">
                                            {order.willya}
                                            {order.baladiya && <span className="block text-xs text-gray-400">{order.baladiya}</span>}
                                        </td>
                                        <td className="py-4 pr-4 font-bold">{order.total?.toLocaleString()} DA</td>
                                        <td className="py-4 pr-4">
                                            <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[order.status] || "bg-gray-100"}`}>
                                                {statusOptions.slice(1).map((s) => (<option key={s} value={s}>{statusDisplay[s]}</option>))}
                                            </select>
                                        </td>
                                        <td className="py-4 text-right">
                                            <button onClick={() => setSelectedOrder(order)}
                                                className="p-2 text-gray-500 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition">
                                                <FaEye size={16} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* MODAL */}
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-8" onClick={() => setSelectedOrder(null)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl md:rounded-3xl p-8 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl md:text-2xl font-bold">Détails de la commande</h2>
                                <button onClick={() => deleteCommend(selectedOrder.id)}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition">
                                    <FaTrash size={16} />
                                </button>
                            </div>
                            
                            {selectedOrder.image_url && (
                                <div className="mb-4">
                                    <img src={selectedOrder.image_url} alt="Receipt" className="w-full h-48 object-cover rounded-xl" />
                                </div>
                            )}

                            <div className="space-y-2 md:space-y-3 text-xs md:text-sm mb-6">
                                <p><span className="text-gray-400">ID:</span> <span className="font-medium">{selectedOrder.displayId}</span></p>
                                <p><span className="text-gray-400">Client:</span> <span className="font-medium">{selectedOrder.customer}</span></p>
                                <p><span className="text-gray-400">Téléphone:</span> {selectedOrder.phone}</p>
                                <p><span className="text-gray-400">Wilaya:</span> {selectedOrder.willya}</p>
                                {selectedOrder.baladiya && (
                                    <p><span className="text-gray-400">Baladiya:</span> {selectedOrder.baladiya}</p>
                                )}
                                <p><span className="text-gray-400">Type:</span> 
                                    {selectedOrder.is_birou ? " Stop Desk" : " Domicile"}
                                </p>
                                <p><span className="text-gray-400">Date:</span> {selectedOrder.date}</p>
                                <p><span className="text-gray-400">Statut:</span> 
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${statusColors[selectedOrder.status]}`}>
                                        {statusDisplay[selectedOrder.status]}
                                    </span>
                                </p>
                            </div>

                            <div className="border-t border-gray-200 pt-4 mb-6">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Produits</h3>
                                <div className="space-y-3">
                                    {selectedOrder.orders?.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                                            <div className="w-14 h-14 rounded-lg bg-gray-200 shrink-0 flex items-center justify-center text-gray-400 text-xs overflow-hidden">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    "N/A"
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                                                    <span>Qty: {item.quantity}</span>
                                                    {item.size && <span>Size: {item.size}</span>}
                                                    {item.color && <span>Color: {item.color}</span>}
                                                </div>
                                                <p className="text-sm font-bold text-pink-500 mt-1">
                                                    {item.totalPrice.toLocaleString()} DA
                                                    <span className="text-xs font-normal text-gray-400 ml-1">
                                                        ({item.unitPrice.toLocaleString()} × {item.quantity})
                                                    </span>
                                                </p>
                                            </div>
                                            <button onClick={() => deleteOrder(item.id)}
                                                className="text-red-400 hover:text-red-600 p-1">
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Total</span>
                                <span className="text-xl md:text-2xl font-bold text-pink-500">
                                    {selectedOrder.total?.toLocaleString()} DA
                                </span>
                            </div>

                            <button onClick={() => setSelectedOrder(null)}
                                className="mt-6 w-full bg-black text-white py-3 rounded-full hover:bg-pink-500 transition">Fermer</button>
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
}