import { useState, useEffect } from "react";
import DashboardSidebar from "../components/Dashboard/DashboardSidebar";
import { motion } from "framer-motion";
import { FaSearch, FaEye, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaBox } from "react-icons/fa";

const statusColors = {
    Delivered: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Cancelled: "bg-red-100 text-red-700",
};

const statusOptions = ["All", "Pending","Delivered", "Cancelled"];

export default function DashboardOrders() {
    const [orders, setOrders] = useState([]);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('dinou_orders') || '[]');
        setOrders(saved);
    }, []);

    const filtered = orders.filter((o) => {
        const matchesSearch = (o.customer?.toLowerCase() || "").includes(search.toLowerCase()) ||
                              (o.id?.toLowerCase() || "").includes(search.toLowerCase());
        const matchesStatus = filter === "All" || o.status === filter;
        return matchesSearch && matchesStatus;
    });

    const updateStatus = (id, newStatus) => {
        const updated = orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o));
        setOrders(updated);
        localStorage.setItem('dinou_orders', JSON.stringify(updated));
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />
            <main className="flex-1 p-4 md:p-10 overflow-x-hidden">
                <h1 className="text-2xl md:text-4xl font-serif font-bold mb-6 md:mb-8">Orders</h1>

                {/* Search & Filter */}
                <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
                            className="w-full border p-3 md:p-4 pl-11 md:pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] text-sm md:text-base" />
                    </div>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}
                        className="border p-3 md:p-4 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] text-sm md:text-base">
                        {statusOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                </div>

                {/* ===== MOBILE: Cards ===== */}
                <div className="md:hidden space-y-3">
                    {filtered.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">No orders found</p>
                    ) : (
                        filtered.map((order) => (
                            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                                
                                {/* Header: ID + Status */}
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-sm">{order.id}</span>
                                    <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[order.status] || "bg-gray-100"}`}>
                                        {statusOptions.slice(1).map((s) => (<option key={s} value={s}>{s}</option>))}
                                    </select>
                                </div>

                                {/* Customer */}
                                <div>
                                    <p className="font-semibold text-gray-900">{order.customer}</p>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                        <FaPhone size={10} /> {order.phone}
                                    </div>
                                </div>

                                {/* Wilaya & Address */}
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <FaMapMarkerAlt size={10} /> {order.wilaya} {order.commune && `• ${order.commune}`}
                                </div>

                                {/* Date & Items */}
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><FaCalendarAlt size={10} /> {order.date}</span>
                                    <span className="flex items-center gap-1"><FaBox size={10} /> {order.items} items</span>
                                </div>

                                {/* Total */}
                                <div className="border-t pt-3 flex justify-between items-center">
                                    <span className="text-xs text-gray-500">Total</span>
                                    <span className="text-lg font-bold text-pink-500">{order.total?.toLocaleString()} DA</span>
                                </div>

                                {/* View Details */}
                                <button onClick={() => setSelectedOrder(order)}
                                    className="w-full py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition flex items-center justify-center gap-2">
                                    <FaEye size={12} /> View Details
                                </button>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* ===== DESKTOP: Table + View Details ===== */}
                <div className="hidden md:block bg-white rounded-3xl shadow-sm p-6 border border-gray-100 overflow-x-auto">
                    {filtered.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">No orders found</p>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-400 text-sm border-b">
                                    <th className="pb-3 pr-4">Order ID</th>
                                    <th className="pb-3 pr-4">Customer</th>
                                    <th className="pb-3 pr-4">Phone</th>
                                    <th className="pb-3 pr-4">Wilaya</th>
                                    <th className="pb-3 pr-4">Total</th>
                                    <th className="pb-3 pr-4">Status</th>
                                    <th className="pb-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((order) => (
                                    <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="border-b last:border-0 hover:bg-gray-50 transition text-sm">
                                        <td className="py-4 pr-4 font-medium">{order.id}</td>
                                        <td className="py-4 pr-4">
                                            <p className="font-medium">{order.customer}</p>
                                        </td>
                                        <td className="py-4 pr-4 text-gray-500">{order.phone}</td>
                                        <td className="py-4 pr-4 text-gray-500">{order.wilaya}</td>
                                        <td className="py-4 pr-4 font-bold">{order.total?.toLocaleString()} DA</td>
                                        <td className="py-4 pr-4">
                                            <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[order.status] || "bg-gray-100"}`}>
                                                {statusOptions.slice(1).map((s) => (<option key={s} value={s}>{s}</option>))}
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

                {/* ===== MODAL FOR BOTH ===== */}
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                            
                            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Order Details</h2>
                            
                            {/* Customer Info */}
                            <div className="space-y-2 md:space-y-3 text-xs md:text-sm mb-6">
                                <p><span className="text-gray-400">ID:</span> <span className="font-medium">{selectedOrder.id}</span></p>
                                <p><span className="text-gray-400">Customer:</span> <span className="font-medium">{selectedOrder.customer}</span></p>
                                <p><span className="text-gray-400">Phone:</span> {selectedOrder.phone}</p>
                                <p><span className="text-gray-400">Address:</span> {selectedOrder.address}</p>
                                <p><span className="text-gray-400">Date:</span> {selectedOrder.date}</p>
                            </div>

                            {/* Products List */}
                            <div className="border-t border-gray-200 pt-4 mb-6">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Products</h3>
                                <div className="space-y-3">
                                    {selectedOrder.cart?.map((item, idx) => (
                                        <div key={idx} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                                            <img src={item.colors?.[0]?.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                                                    <span>Qty: {item.quantity}</span>
                                                    {item.size && <span>Size: {item.size}</span>}
                                                    {item.color && <span>Color: {item.color}</span>}
                                                </div>
                                                <p className="text-sm font-bold text-pink-500 mt-1">
                                                    {(item.price * item.quantity).toLocaleString()} DA
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                                <span className="text-gray-500 text-sm">Total</span>
                                <span className="text-xl md:text-2xl font-bold text-pink-500">
                                    {selectedOrder.total?.toLocaleString()} DA
                                </span>
                            </div>

                            <button onClick={() => setSelectedOrder(null)}
                                className="mt-6 w-full bg-black text-white py-3 rounded-full hover:bg-pink-500 transition">Close</button>
                        </motion.div>
                    </div>
                )}
            </main>
        </div>
    );
}