// src/components/Categories/CategoryCard.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function CategoryCard({ category }) {
    const [current, setCurrent] = useState(0);
    const images = category.images || [];

    // ← Slideshow كل 3 ثواني
    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <Link
            to={`/shop?category=${category.id}`}  // ← نبعتو id ماشي name
            className="group relative h-56 md:h-64 rounded-2xl overflow-hidden shadow-md block"
        >
            {/* ← كل الصور، غير وحدة كتبان */}
            {images.map((img, i) => (
                <img
                    key={i}
                    src={img}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                        i === current ? "opacity-100" : "opacity-0"
                    }`}
                    alt={`${category.name} ${i + 1}`}
                />
            ))}

            {/* ← Gradient من التحت */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition" />

            {/* ← النص */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                <h3 className="text-xl md:text-2xl font-serif text-white mb-1">
                    {category.name}
                </h3>
                <span className="text-white/70 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Voir les produits
 →
                </span>
            </div>

            {/* ← نقاط الصور (فالزاوية) */}
            {images.length > 1 && (
                <div className="absolute top-3 right-3 flex gap-1">
                    {images.map((_, i) => (
                        <div key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                                i === current ? "bg-white" : "bg-white/40"
                            }`} />
                    ))}
                </div>
            )}
        </Link>
    );
}