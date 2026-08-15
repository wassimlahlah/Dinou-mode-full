import { useState, useEffect } from "react";
import DashboardSidebar from "../components/Dashboard/DashboardSidebar";
import { motion } from "framer-motion";
import { FaBox, FaShoppingBag, FaUsers, FaMoneyBillWave } from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function Dashboard() {
    const [stats, setStats] = useState({
        productsCount: 0,
        ordersCount: 0,
        customersCount: 0,
        revenue: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;  // ← flag باش تتجنب setState على unmounted component

        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const productsRes = await api.get("/products_method/0/0/");
                const products = productsRes.data?.data || [];

                const [pendingRes, deliveredRes, canceledRes] = await Promise.all([
                    api.get("/commends_orders_method/PENDING/0/"),
                    api.get("/commends_orders_method/DELIVERED/0/"),
                    api.get("/commends_orders_method/CANCELED/0/"),
                ]);

                const pending = pendingRes.data?.data || [];
                const delivered = deliveredRes.data?.data || [];
                const canceled = canceledRes.data?.data || [];
                const allOrders = [...pending, ...delivered, ...canceled];

                // ✅ حساب Revenue
                const calculatedRevenue = delivered.reduce((total, o) => {
                    const orderTotal = (o.commend_orders || []).reduce((s, order) => {
                        return s + (parseFloat(order?.price) || 0);
                    }, 0);
                    return total + orderTotal;
                }, 0);

                console.log("🔥 CALCULATED REVENUE:", calculatedRevenue);

                const uniquePhones = new Set(
                    allOrders.map(o => o.phone).filter(Boolean)
                );

                if (isMounted) {
                    setStats({
                        productsCount: products.length || 0,
                        ordersCount: allOrders.length || 0,
                        customersCount: uniquePhones.size || 0,
                        revenue: calculatedRevenue || 0,
                    });

                    const sorted = allOrders.sort((a, b) => 
                        new Date(b.commend_date || 0) - new Date(a.commend_date || 0)
                    );
                    setRecentOrders(sorted.slice(0, 5));
                }

            } catch (err) {
                console.error("Dashboard error:", err);
                toast.error("Failed to load dashboard data");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDashboardData();

        return () => { isMounted = false; };  // cleanup
    }, []);

    const statusColors = {
        PENDING: "bg-yellow-100 text-yellow-700",
        DELIVERED: "bg-green-100 text-green-700",
        CANCELED: "bg-red-100 text-red-700",
    };

    const statusDisplay = {
        PENDING: "Pending",
        DELIVERED: "Delivered",
        CANCELED: "Canceled",
    };

    return (
        <div className="flex min-h-screen bg-pink-50">
            <DashboardSidebar />
            <main className="flex-1 p-4 md:p-10 overflow-x-hidden">
                <h1 className="text-2xl md:text-4xl font-serif font-bold mb-6 md:mb-8">Présentation du tableau de bord
</h1>

                {loading && <p className="text-center text-gray-400 py-4">Chargement...</p>}

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-10">
                    <StatCard title="Produits" number={stats.productsCount} icon={<FaBox />} />
                    <StatCard title="Commandes" number={stats.ordersCount} icon={<FaShoppingBag />} />
                    <StatCard title="Clients" number={stats.customersCount} icon={<FaUsers />} />
                    <StatCard title="Revenus" number={stats.revenue} suffix=" DA" icon={<FaMoneyBillWave />} />
                </div>

                {/* Recent Orders */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl md:rounded-3xl shadow-sm p-4 md:p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4 md:mb-6">
                        <h2 className="text-lg md:text-xl font-bold">Commandes récentes
</h2>
                        <Link to="/dashboard/orders" className="text-xs md:text-sm text-pink-600 hover:underline font-medium">Voir tout</Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <p className="text-gray-400 text-center py-10 text-sm">Aucune commande pour le moment</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-gray-400 text-xs md:text-sm border-b">
                                        <th className="pb-3 pr-4">ID</th>
                                        <th className="pb-3 pr-4">Cliente</th>
                                        <th className="pb-3 pr-4 hidden md:table-cell">Wilaya</th>
                                        <th className="pb-3 pr-4">Total</th>
                                        <th className="pb-3">Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => {
                                        const orderTotal = (order.commend_orders || []).reduce(
                                            (sum, o) => sum + (parseFloat(o?.price) || 0), 0
                                        );

                                        return (
                                            <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition text-xs md:text-sm">
                                                <td className="py-3 pr-4 font-medium">#CMD-{order.id}</td>
                                                <td className="py-3 pr-4">
                                                    <p className="font-medium truncate max-w-[80px] md:max-w-none">{order.fullName || "N/A"}</p>
                                                    <p className="text-[10px] md:text-xs text-gray-400">{order.phone || "-"}</p>
                                                </td>
                                                <td className="py-3 pr-4 hidden md:table-cell text-gray-500">{order.willya || "-"}</td>
                                                <td className="py-3 pr-4 font-bold">{orderTotal.toLocaleString()} DA</td>
                                                <td className="py-3">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium ${statusColors[order.status] || "bg-gray-100"}`}>
                                                        {statusDisplay[order.status] || order.status || "Unknown"}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}

/* StatCard */
function StatCard({ title, number, icon, suffix = "" }) {
    // ✅ تأكد number رقم صحيح
    const displayNumber = Number(number) || 0;
    
    return (
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl md:rounded-3xl shadow-sm p-4 md:p-6 border border-gray-100">
            <div className="mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-[#F7D6DF] rounded-xl md:rounded-2xl text-pink-600 text-lg md:text-xl inline-block">
                    {icon}
                </div>
            </div>
            <h3 className="text-gray-500 text-xs md:text-sm">{title}</h3>
            <p className="text-xl md:text-3xl font-bold mt-1">
                {displayNumber.toLocaleString()}{suffix}
            </p>
        </motion.div>
    );
}