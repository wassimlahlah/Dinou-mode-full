// src/pages/CategoryList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaImage } from "react-icons/fa";
import api from "../api/axios";

export default function CategoryList() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get("/category_method/0/");
                const cats = response.data.data || [];
                const adapted = cats.map((cat) => ({
                    ...cat,
                    images: cat.image_url1 ? [cat.image_url1] : [],
                }));
                setCategories(adapted);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-pink-50 flex items-center justify-center">
                <p className="text-gray-500 text-lg">Chargement des catégories...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-pink-50 p-4 md:p-10">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8 md:mb-12"
                >
                    <h1 className="text-3xl md:text-5xl font-serif mb-2">Nos Catégories</h1>
                    <p className="text-gray-500 text-sm md:text-base">Choisissez votre style</p>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <Link
                                to={`/shop?category=${cat.id}`}
                                className="group relative h-56 md:h-64 rounded-2xl overflow-hidden shadow-md block"
                            >
                                {cat.images?.[0] ? (
                                    <img
                                        src={cat.images[0]}
                                        className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110"
                                        alt={cat.name}
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                                        <FaImage size={40} className="text-gray-400" />
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition" />

                                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                                    <h3 className="text-xl md:text-2xl font-serif text-white mb-1">
                                        {cat.name}
                                    </h3>
                                    <span className="text-white/70 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        Voir les produits →
                                    </span>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}