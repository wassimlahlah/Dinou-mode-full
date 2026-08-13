// src/components/Categories/CategoryHero.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function CategoryHero({ categories }) {
    // ← current: index ديال الصورة لي كتضهر دابا
    const [current, setCurrent] = useState(0);
    
    // ← نفلترو غير categories لي عندهم صور
    const visibleCats = categories.filter((c) => c.images?.length > 0);

    // ← Auto-slide كل 5 ثواني
    useEffect(() => {
        if (visibleCats.length <= 1) return;
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % visibleCats.length);
        }, 5000);
        return () => clearInterval(interval); // ← cleanup
    }, [visibleCats.length]);

    if (visibleCats.length === 0) return null;

    const cat = visibleCats[current];

    const goNext = () => setCurrent((prev) => (prev + 1) % visibleCats.length);
    const goPrev = () => setCurrent((prev) => (prev - 1 + visibleCats.length) % visibleCats.length);

    return (
        <section className="relative h-[300px] md:h-[450px] lg:h-[550px] overflow-hidden rounded-3xl mx-4 md:mx-10 max-w-7xl xl:mx-auto mb-8">
            
            {/* AnimatePresence → باش الانتقال بين الصور يكون smooth */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, scale: 1.05 }}      // ← بداية: شفاف + كبير شوية
                    animate={{ opacity: 1, scale: 1 }}          // ← نهاية: واضح + حجم طبيعي
                    exit={{ opacity: 0, scale: 0.95 }}          // ← خروج: شفاف + صغير شوية
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                >
                    {/* الصورة */}
                    <img
                        src={cat.images[0]}
                        className="w-full h-full object-cover"
                        alt={cat.name}
                    />
                    
                    {/* Gradient overlay → باش النص يبان */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                    
                    {/* المحتوى (نص + زر) */}
                    <div className="absolute inset-0 flex items-center p-8 md:p-16">
                        <div className="max-w-lg">
                            <motion.span
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-pink-300 text-sm md:text-base font-medium tracking-wider uppercase mb-2 block"
                            >
                                Collection
                            </motion.span>
                            
                            <motion.h2
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl md:text-5xl lg:text-6xl font-serif text-white mb-4"
                            >
                                {cat.name}
                            </motion.h2>
                            
                            <motion.p
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-white/80 text-sm md:text-base mb-6"
                            >
                                Discover our exclusive {cat.name} collection
                            </motion.p>
                            
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                <Link
                                    to={`/shop?category=${cat.id}`}
                                    className="inline-block bg-white text-black px-6 md:px-8 py-3 rounded-full font-medium hover:bg-pink-200 transition text-sm md:text-base"
                                >
                                    Shop Now
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* ← سهام التنقل (غير إلا كاين أكثر من category) */}
            {visibleCats.length > 1 && (
                <>
                    <button onClick={goPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition">
                        <FaChevronLeft size={18} />
                    </button>
                    <button onClick={goNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition">
                        <FaChevronRight size={18} />
                    </button>
                    
                    {/* ← النقاط اللي تحت */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {visibleCats.map((_, i) => (
                            <button key={i} onClick={() => setCurrent(i)}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    i === current ? "bg-white w-8" : "bg-white/50 w-2"
                                }`} />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}