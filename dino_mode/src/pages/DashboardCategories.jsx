import { useState, useEffect, useRef } from "react";
import DashboardSidebar from "../components/Dashboard/DashboardSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaTrash, FaTimes, FaImage, FaUpload, FaExclamationTriangle } from "react-icons/fa";  // ← أضف FaExclamationTriangle
import toast from "react-hot-toast";
import api from "../api/axios";

export default function DashboardCategories() {
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [form, setForm] = useState({
        name: "",
        images: [],
        imageFiles: [],
    });

    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchCategories();
    }, []);

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
            toast.error("Failed to load categories");
        }
    };

    const openAdd = () => {
        setEditingId(null);
        setForm({ name: "", images: [], imageFiles: [] });
        setShowModal(true);
    };

    const openEdit = (category) => {
        setEditingId(category.id);
        setForm({
            name: category.name || "",
            images: Array.isArray(category.images) ? [...category.images] : [],
            imageFiles: [],
        });
        setShowModal(true);
    };

    // ← جديد: handleDelete اللي كانت ناقصة
    const handleDelete = (id, name) => {
        setDeleteTarget({ id, name });
        setShowDeleteModal(true);
    };

    const handleSave = async () => {
        if (!form.name.trim()) {
            toast.error("Category name is required");
            return;
        }

        if (editingId === null && form.imageFiles.length === 0) {
            toast.error("Image is required for new category");
            return;
        }

        try {
            if (editingId !== null) {
                const formData = new FormData();
                formData.append("json", JSON.stringify({ name: form.name.trim() }));

                if (form.imageFiles.length > 0) {
                    formData.append("image", form.imageFiles[0]);
                }

                await api.put(`/category_method/${editingId}/`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                toast.success("Category updated");
            } else {
                const formData = new FormData();
                formData.append("json", JSON.stringify({ name: form.name.trim() }));
                formData.append("image", form.imageFiles[0]);

                await api.post("/category_method/0/", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });

                toast.success("Category added");
            }

            setShowModal(false);
            fetchCategories();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.response?.data?.error || "Something went wrong";
            toast.error(msg);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            // ← صحيح: category_id هو ID ديال category (ماشي 0)
            await api.delete(`/category_method/${deleteTarget.id}/`);
            toast.success("Category deleted");
            fetchCategories();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to delete category");
        } finally {
            setShowDeleteModal(false);
            setDeleteTarget(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteTarget(null);
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        files.forEach((file) => {
            if (!file.type.startsWith("image/")) {
                toast.error(`${file.name} is not an image`);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} is too large (max 5MB)`);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result;
                setForm((prev) => {
                    if (prev.images.includes(base64)) {
                        toast.error("Image already added");
                        return prev;
                    }
                    return {
                        ...prev,
                        images: [...prev.images, base64],
                        imageFiles: [...prev.imageFiles, file],
                    };
                });
            };
            reader.readAsDataURL(file);
        });

        e.target.value = "";
    };

    const removeImage = (imgIndex) => {
        setForm((prev) => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== imgIndex),
            imageFiles: prev.imageFiles.filter((_, i) => i !== imgIndex),
        }));
    };

    return (
        <div className="flex min-h-screen bg-pink-50 mt-2">
            <DashboardSidebar />
            <main className="flex-1 p-4 md:p-6 lg:p-10 overflow-x-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 md:mb-8">
                    <h1 className="text-2xl md:text-4xl font-serif font-bold">catégories</h1>
                    <button onClick={openAdd}
                        className="bg-black text-white mt-2 cursor-pointer px-5 md:px-6 py-2.5 md:py-3 rounded-full flex items-center gap-2 hover:bg-pink-200 hover:text-black transition text-sm md:text-base w-full sm:w-auto justify-center">
                        <FaPlus size={14} /> Ajouter catégorie

                    </button>
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition"
                        >
                            <div className="relative h-48 bg-gray-100">
                                {cat?.images?.length > 0 ? (
                                    <CategoryImageAuto images={cat.images} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <FaImage size={40} />
                                    </div>
                                )}
                            </div>

                            <div className="p-4 md:p-5 flex items-center justify-between">
                                <span className="font-semibold text-sm md:text-base">{cat.name}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(cat)}
                                        className="p-2 text-gray-400 cursor-pointer hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                                    </button>
                                    <button onClick={() => handleDelete(cat.id, cat.name)}  // ← استعمل handleDelete
                                        className="p-2 text-gray-400 cursor-pointer hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                        <FaTrash size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                    {categories.map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="relative h-44 bg-gray-100">
                                {cat?.images?.length > 0 ? (
                                    <CategoryImageAuto images={cat.images} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <FaImage size={32} />
                                    </div>
                                )}
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <span className="font-semibold text-sm">{cat.name}</span>
                                <span className="text-xs text-gray-400">{cat?.images?.length || 0} photos</span>
                            </div>
                            <div className="px-4 pb-4 flex gap-2">
                                <button onClick={() => openEdit(cat)}
                                    className="flex-1 py-2.5 text-blue-500 cursor-pointer bg-blue-50 rounded-xl text-sm font-medium flex items-center justify-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                                    Modifier
                                </button>
                                <button onClick={() => handleDelete(cat.id, cat.name)}  // ← استعمل handleDelete
                                    className="flex-1 py-2.5 text-red-500 cursor-pointer bg-red-50 rounded-xl text-sm font-medium flex items-center justify-center gap-1">
                                    <FaTrash size={12} /> Supprimer
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ========== DELETE CONFIRMATION MODAL (برا .map() كامل) ========== */}
                <AnimatePresence>
                    {showDeleteModal && deleteTarget && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4"
                            onClick={cancelDelete}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-sm text-center shadow-2xl"
                            >
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaExclamationTriangle className="text-red-500 text-2xl" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Supprimer la catégorie
                                    ?</h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    Êtes-vous sûr de vouloir supprimer la catégorie <span className="font-semibold text-gray-700">"{deleteTarget.name}"</span> ? Cette action ne peut être annulée.
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={cancelDelete} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition cursor-pointer">Annuler</button>
                                    <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition cursor-pointer shadow-lg shadow-red-200">Supprimer</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Add/Edit Modal */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
                            onClick={() => setShowModal(false)}
                        >
                            <motion.div
                                initial={{ y: "100%", opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: "100%", opacity: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
                            >
                                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4 sm:hidden" />

                                <div className="flex justify-between items-center mb-5 sm:mb-6">
                                    <h2 className="text-xl sm:text-2xl font-bold">
                                        {editingId !== null ? "Modifier la catégorie" : "Ajouter une catégorie"}
                                    </h2>
                                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                        <FaTimes />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Nom de la catégorie"
                                        className="w-full border p-3.5 sm:p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm sm:text-base"
                                    />

                                    <div className="border rounded-xl p-3 sm:p-4 space-y-3">
                                        <h3 className="font-semibold text-sm flex items-center gap-2">
                                            <FaImage className="text-pink-400" /> Images
                                        </h3>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-pink-400 hover:bg-pink-50 transition cursor-pointer"
                                        >
                                            <FaUpload size={20} className="text-gray-400" />
                                            <span className="text-sm text-gray-500">Cliquez pour télécharger des images</span>
                                            <span className="text-xs text-gray-400">JPG, PNG, WEBP (max 5MB)</span>
                                        </button>

                                        {(form.images?.length || 0) === 0 && (
                                            <p className="text-xs text-gray-400 text-center py-4">Aucune image ajoutée pour le moment</p>
                                        )}
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {form.images?.map((img, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border group">
                                                    <img src={img} className="w-full h-full object-cover" alt={`Preview ${idx}`} />
                                                    <button
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                                                    >
                                                        <FaTimes size={8} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleSave}
                                        className="w-full bg-black text-white py-3.5 sm:py-4 rounded-full hover:bg-pink-200 hover:text-black transition font-medium text-sm sm:text-base"
                                    >
                                        {editingId !== null ? "Modifier la catégorie" : "Ajouter une catégorie"}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

function CategoryImageAuto({ images }) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!images || images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [images]);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
                <FaImage size={40} />
            </div>
        );
    }

    if (images.length === 1) {
        return <img src={images[0]} className="w-full h-full object-cover" alt="Category" />;
    }

    return (
        <div className="relative w-full h-full">
            {images.map((img, i) => (
                <img
                    key={i}
                    src={img}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"
                        }`}
                    alt={`Slide ${i + 1}`}
                />
            ))}

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "bg-white w-3" : "bg-white/50 w-1.5"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}