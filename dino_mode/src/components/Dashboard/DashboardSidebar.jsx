import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaChartBar, FaBox, FaShoppingBag, FaTags,
    FaCog, FaSignOutAlt, FaBars, FaTimes
} from "react-icons/fa";

export default function DashboardSidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => { setMobileOpen(false); }, [location.pathname]);
    useEffect(() => {
        if (mobileOpen) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    const items = [
        { name: "Overview", icon: <FaChartBar />, link: "/dashboard" },
        { name: "Orders", icon: <FaShoppingBag />, link: "/dashboard/orders" },
        { name: "Products", icon: <FaBox />, link: "/dashboard/products" },      
        { name: "Categories", icon: <FaTags />, link: "/dashboard/categories" },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-[60] bg-black text-white h-16 flex items-center justify-between px-4">
                <h1 className="text-lg font-serif font-bold tracking-wider">Dinou <span className="text-[#F7D6DF] ">Admin</span></h1>
                <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
                    {mobileOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed md:sticky top-0 left-0 z-50
                w-[260px] md:w-64 bg-black text-white min-h-screen h-screen
                p-5 md:p-6 flex flex-col
                transition-transform duration-300 ease-out
                ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                md:top-0 pt-20 md:pt-6
            `}>
                <h1 className="hidden md:block text-2xl font-serif mb-8 tracking-wider">Dinou <span className="text-[#F7D6DF] ">Admin</span> </h1>

                <nav className="space-y-1 flex-1">
                    {items.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.link}
                            className={({ isActive }) => `
                                flex items-center gap-3 md:gap-4 px-3 md:px-4 py-3 rounded-xl transition text-sm md:text-base
                                ${isActive ? "bg-[#F7D6DF] text-black font-semibold" : "hover:bg-white/10 text-gray-300"}
                            `}
                        >
                            <span className="text-base md:text-lg">{item.icon}</span>
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <button onClick={() => navigate("/")}
                    className="flex items-center gap-3 md:gap-4 cursor-pointer px-3 md:px-4 py-3 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition text-sm md:text-base mt-auto text-gray-400">
                    <FaSignOutAlt /> Exit Dashboard
                </button>
            </aside>

            {/* Overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
                )}
            </AnimatePresence>
        </>
    );
}