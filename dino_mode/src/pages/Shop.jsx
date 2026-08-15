// src/pages/Shop.jsx
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSearch, FaArrowLeft } from "react-icons/fa";
import api from "../api/axios";
import ProductCard from "../components/Products/ProductCard";

export default function Shop() {
    const [searchParams] = useSearchParams();
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    const categoryId = searchParams.get("category") || "";

    // ← نجيبو المنتجات مباشرة من API حسب category_id
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // إلا كاين categoryId فـ URL، نجيبو غير منتجات هاد الـ category
                // ولا نجيبو كلشي
                const url = categoryId
                    ? `/products_method/${categoryId}/0/`
                    : `/products_method/0/0/`;

                const response = await api.get(url);
                const prods = (response.data.data || []).map((p) => ({
                    ...p,
                    colors: p.productsInfo?.map((info) => ({
                        id: info.id,
                        color: info.color,
                        image: info.image || "",
                        sizes: info.sizesQte?.map((sq) => ({
                            id: sq.id,
                            label: sq.size,
                            number: null,
                            quantity: sq.qte,
                        })) || [],
                    })) || [],
                }));

                setProducts(prods);

                // إلا كاين categoryId، نجيبو اسم الـ category
                if (categoryId) {
                    const catRes = await api.get(`/category_method/${categoryId}/`);
                    setCategory(catRes.data.data);
                } else {
                    setCategory(null);
                }
            } catch (err) {
                console.error("Failed to fetch:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryId]);

    const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="p-4 md:p-10 max-w-7xl mx-auto bg-pink-50 min-h-screen flex items-center justify-center">
                <p className="text-gray-500 text-lg">Chargement...</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-10 max-w-7xl mx-auto bg-pink-50 min-h-screen">

            {/* ← عنوان + رجوع */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 md:mb-6"
            >
                {category && (
                    <Link to="/category"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-2 transition text-sm">
                        <FaArrowLeft size={12} /> Retour aux catégories
                    </Link>
                )}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif">
                    {category?.name || "Shop"}
                </h1>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-500 mb-6 md:mb-10"
            >
                {filtered.length} product{filtered.length !== 1 ? "s" : ""}
            </motion.p>

            {/* ← Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 md:mb-10">
                <div className="relative flex-1">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        placeholder="Rechercher des produits..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border p-3 md:p-4 pl-11 md:pl-12 rounded-full w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400 text-lg">
                    Aucun produit trouvé
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
                    {filtered.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}