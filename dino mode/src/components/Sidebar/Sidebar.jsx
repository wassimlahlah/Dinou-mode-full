import {
    FaHome, FaShoppingBag, FaTshirt, FaFire,
    FaShoppingCart, FaPhone, FaUserShield,
    FaInfoCircle, FaBars, FaTimes
} from "react-icons/fa";

import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SidebarItem from "./SidebarItem";

export default function Sidebar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    const items = [
        { title: "Home", icon: <FaHome />, link: "/" },
        { title: "Shop", icon: <FaShoppingBag />, link: "/shop" },
        { title: "Categories", icon: <FaTshirt />, link: "/categories" },
        { title: "Offers", icon: <FaFire />, link: "/offers" },
        { title: "Cart", icon: <FaShoppingCart />, link: "/cart" },
        { title: "About", icon: <FaInfoCircle />, link: "/about" },
    ];

    return (
        <>
            {/* ===== MOBILE TOP BAR ===== */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-[60] bg-[#F7D6DF] shadow-xs">
                <div className="flex items-center justify-between px-6 h-20">

                     {/* Logo - left */}
                    <Link to="/" onClick={() => setMobileOpen(false)} className="px-4">
                         <h1 className="text-2xl font-bold tracking-[0.15em] text-black">
                            Dinou<span className="text-pink-500">Moda</span>
                        </h1>
                    </Link>
                    
                    {/* Menu Button - right */}
                     <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
                    {mobileOpen ? <FaTimes /> : <FaBars />}
                </button>
                </div>
            </div>

            {/* ===== SIDEBAR (Desktop + Mobile Drawer) ===== */}
            <aside
                className={`
                    fixed md:sticky top-0 left-0 z-50
                    w-[280px] md:w-72 
                    bg-[#F7D6DF] min-h-screen h-screen
                    p-6 flex flex-col
                    overflow-y-auto
                    transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
                    md:top-0
                `}
            >
                {/* Desktop Logo */}
                <div className="hidden md:flex flex-col items-center mb-5 select-none pt-2">
                    <Link to="/" onClick={() => setMobileOpen(false)}>
                        <h1 className="text-3xl font-bold tracking-[0.15em] text-black">
                            Dinou<span className="text-pink-500">Moda</span>
                        </h1>
                    </Link>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="w-8 h-[1px] bg-black/40"></div>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-gray-500 font-medium">
                            Luxury Fashion
                        </p>
                        <div className="w-8 h-[1px] bg-black/40"></div>
                    </div>
                </div>

                {/* Mobile: Close button + Small logo inside sidebar */}
                <div className="md:hidden flex items-center justify-between mb-8">
                    <h1 className="text-lg font-bold tracking-[0.1em] text-black">
                        Menu
                    </h1>
                    <button
                        onClick={() => setMobileOpen(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition"
                    >
                        <FaTimes size={14} />
                    </button>
                </div>

                <nav className="flex-1 space-y-1">
                    {items.map((item, i) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                        >
                            <SidebarItem
                                {...item}
                                isActive={location.pathname === item.link}
                                onClick={() => setMobileOpen(false)}
                            />
                        </motion.div>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-black/10">
                    <SidebarItem
                        title="Admin Login"
                        icon={<FaUserShield />}
                        link="/admin"
                        isActive={location.pathname === "/admin"}
                        onClick={() => setMobileOpen(false)}
                    />
                </div>
            </aside>

            {/* ===== MOBILE OVERLAY ===== */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}