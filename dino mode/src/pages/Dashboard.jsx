import { useState, useEffect } from "react";
import DashboardSidebar from "../components/Dashboard/DashboardSidebar";
import { motion } from "framer-motion";
import { FaBox, FaShoppingBag, FaUsers, FaMoneyBillWave } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Dashboard() {
    const [orders, setOrders] = useState([]);
    const [productsCount, setProductsCount] = useState(0);

    useEffect(() => {
        const savedOrders = JSON.parse(localStorage.getItem('dinou_orders') || '[]');
        setOrders(savedOrders);
        const savedProducts = JSON.parse(localStorage.getItem('dinou_products') || '[]');
        setProductsCount(savedProducts.length || 8);
    }, []);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const uniqueCustomers = [...new Set(orders.map(o => o.phone))].length;
    const recentOrders = orders.slice(0, 5);

    const statusColors = {
        Pending: "bg-yellow-100 text-yellow-700",
        Processing: "bg-blue-100 text-blue-700",
        Delivered: "bg-green-100 text-green-700",
        Cancelled: "bg-red-100 text-red-700",
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />
            <main className="flex-1 p-4 md:p-10 overflow-x-hidden">
                <h1 className="text-2xl md:text-4xl font-serif font-bold mb-6 md:mb-8">Dashboard Overview</h1>

                {/* Stats — بدون أسهم */}
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6 mb-8 md:mb-10">
                    <StatCard title="Products" number={productsCount} icon={<FaBox />} />
                    <StatCard title="Orders" number={orders.length} icon={<FaShoppingBag />} />
                    <StatCard title="Customers" number={uniqueCustomers || 0} icon={<FaUsers />} />
                    <StatCard title="Revenue" number={`${totalRevenue.toLocaleString()} DA`} icon={<FaMoneyBillWave />} />
                </div>

                {/* Recent Orders */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl md:rounded-3xl shadow-sm p-4 md:p-6 border border-gray-100">
                    <div className="flex justify-between items-center mb-4 md:mb-6">
                        <h2 className="text-lg md:text-xl font-bold">Recent Orders</h2>
                        <Link to="/dashboard/orders" className="text-xs md:text-sm text-pink-600 hover:underline font-medium">View All</Link>
                    </div>

                    {recentOrders.length === 0 ? (
                        <p className="text-gray-400 text-center py-10 text-sm">No orders yet</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-gray-400 text-xs md:text-sm border-b">
                                        <th className="pb-3 pr-4">ID</th>
                                        <th className="pb-3 pr-4">Customer</th>
                                        <th className="pb-3 pr-4 hidden md:table-cell">Wilaya</th>
                                        <th className="pb-3 pr-4">Total</th>
                                        <th className="pb-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition text-xs md:text-sm">
                                            <td className="py-3 pr-4 font-medium">{order.id}</td>
                                            <td className="py-3 pr-4">
                                                <p className="font-medium truncate max-w-[80px] md:max-w-none">{order.customer}</p>
                                                <p className="text-[10px] md:text-xs text-gray-400">{order.phone}</p>
                                            </td>
                                            <td className="py-3 pr-4 hidden md:table-cell text-gray-500">{order.wilaya}</td>
                                            <td className="py-3 pr-4 font-bold">{order.total?.toLocaleString()} DA</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium ${statusColors[order.status] || "bg-gray-100"}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </main>
        </div>
    );
}

/* ✅ StatCard نقي — بدون trend */
function StatCard({ title, number, icon }) {
    return (
        <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl md:rounded-3xl shadow-sm p-4 md:p-6 border border-gray-100">
            <div className="mb-3 md:mb-4">
                <div className="p-2 md:p-3 bg-[#F7D6DF] rounded-xl md:rounded-2xl text-pink-600 text-lg md:text-xl inline-block">
                    {icon}
                </div>
            </div>
            <h3 className="text-gray-500 text-xs md:text-sm">{title}</h3>
            <p className="text-xl md:text-3xl font-bold mt-1">{number}</p>
        </motion.div>
    );
}