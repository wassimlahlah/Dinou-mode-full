// src/components/Categories/Categories.jsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getCategories } from "../../api/categoryService";
import CategoryCard from "./CategoryCard";
import CategoryHero from "./CategoryHero";

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getCategories();
                const cats = response.data || [];
                // ← نحولوا image_url1 → images array
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
            <section className="py-20 bg-pink-50">
                <h2 className="text-center text-4xl md:text-5xl font-serif mb-12">Catégories</h2>
                <div className="text-center text-gray-500">Chargement...</div>
            </section>
        );
    }

    return (
        <section className="py-12 md:py-20 bg-pink-50">
            {/* ← البنر الإعلاني */}
            <CategoryHero categories={categories} />

            <div className="px-4 md:px-10 max-w-7xl mx-auto">
                {/* ← العنوان */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-8 md:mb-12"
                >
                    <h2 className="text-3xl md:text-5xl font-serif mb-2">Parcourir les catégories</h2>
                    <p className="text-gray-500 text-sm md:text-base">Trouvez votre style parfait</p>
                </motion.div>

                {/* ← Grid ديال الكارتات */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                        >
                            <CategoryCard category={cat} />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}