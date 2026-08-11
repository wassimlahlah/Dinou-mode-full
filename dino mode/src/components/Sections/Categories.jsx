import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { categories } from "../../data/categories";
import { useState, useEffect } from "react";

export default function Categories() {
  return (
    <section className="py-20 bg-pink-50">
      <h2 className="text-center text-5xl font-serif mb-12">Categories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 px-6 md:px-10 max-w-7xl mx-auto">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <CategoryCard category={cat} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ✅ Composant séparé pour gérer le slideshow auto par catégorie
function CategoryCard({ category }) {
  const [current, setCurrent] = useState(0);
  const images = category.images || [];
  
  // ✅ Auto slideshow toutes les 2 secondes
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [images.length]);

  const image = images.length > 0 ? images[current] : "";

  return (
    <Link
      to={`/shop?category=${encodeURIComponent(category.name)}`}
      className="group relative h-60 rounded-3xl overflow-hidden shadow-md flex items-center justify-center block"
    >
      <img
        src={image}
        className="absolute inset-0 w-full h-full object-cover transition duration-700 group-hover:scale-110"
        alt={category.name}
      />
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition" />
      <div className="relative z-10 text-center">
        <span className="text-2xl font-semibold text-white block">
          {category.name}
        </span>
        <span className="text-white/80 text-sm mt-1 opacity-0 group-hover:opacity-100 transition">
          View products
        </span>
      </div>
      
      {/* ✅ Dots indicateurs */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {images.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === current ? "bg-white w-3" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </Link>
  );
}