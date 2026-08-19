import { useState, useEffect } from "react";
import DashboardSidebar from "../components/Dashboard/DashboardSidebar";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaEdit, FaTrash, FaPlus, FaHome, FaStore, FaExclamationTriangle } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../api/axios";

// ─── API Helpers ───
const getLivraisonPrices = async () => {
    const response = await api.get("/livrison_method/0/");
    return response.data;
};

const createLivraisonPrice = async (data) => {
    const response = await api.post("/livrison_method/0/", data);
    return response.data;
};

const updateLivraisonPrice = async (id, data) => {
    const response = await api.put(`/livrison_method/${id}/`, data);
    return response.data;
};

const deleteLivraisonPrice = async (id) => {
    const response = await api.delete(`/livrison_method/${id}/`);
    return response.data;
};

export default function DashboardLivraison() {
    const [prices, setPrices] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // 🔥 Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [formData, setFormData] = useState({
        willya: "",
        baladiya: "",
        is_birou: false,
        price: ""
    });

    const fetchPrices = async () => {
        setLoading(true);
        try {
            const res = await getLivraisonPrices();
            if (res.status === "success") {
                setPrices(res.data || []);
            } else {
                toast.error(res.message || "Erreur de chargement");
            }
        } catch (err) {
            console.error(err);
            toast.error("Erreur réseau");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrices();
    }, []);

    const resetForm = () => {
        setFormData({ willya: "", baladiya: "", is_birou: false, price: "" });
        setEditingId(null);
    };

    const openAdd = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEdit = (item) => {
        setFormData({
            willya: item.willya,
            baladiya: item.baladiya || "",
            is_birou: item.is_birou,
            price: item.price
        });
        setEditingId(item.id);
        setModalOpen(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.willya.trim()) {
            toast.error("Wilaya obligatoire");
            return;
        }
        if (formData.price === "" || parseFloat(formData.price) < 0) {
            toast.error("Prix invalide");
            return;
        }

        const payload = [{
            willya: formData.willya.trim(),
            baladiya: formData.baladiya.trim() || null,
            is_birou: formData.is_birou,
            price: parseFloat(formData.price)
        }];

        try {
            let res;
            if (editingId) {
                res = await updateLivraisonPrice(editingId, payload[0]);
            } else {
                res = await createLivraisonPrice(payload);
            }

            if (res.status === "success") {
                toast.success(editingId ? "Modifié avec succès" : "Ajouté avec succès");
                setModalOpen(false);
                resetForm();
                fetchPrices();
            } else {
                toast.error(res.message || "Erreur");
            }
        } catch (err) {
            console.error("🔥 Full error:", err);
            const backendData = err.response?.data;
            if (backendData?.error && typeof backendData.error === 'object') {
                console.error("🔥 Validation errors:", JSON.stringify(backendData.error, null, 2));
                const errors = Object.entries(backendData.error)
                    .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                    .join(' | ');
                toast.error(errors || "Validation failed");
            } else {
                const msg = backendData?.message || backendData?.error || err.message;
                toast.error(msg || "Erreur serveur");
            }
        }
    };

    // 🔥 Delete handlers
    const handleDeleteClick = (item) => {
        setDeleteTarget(item);
        setShowDeleteModal(true);
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setDeleteTarget(null);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            const res = await deleteLivraisonPrice(deleteTarget.id);
            if (res.status === "success") {
                toast.success("Supprimé");
                fetchPrices();
            } else {
                toast.error(res.message || "Erreur de suppression");
            }
        } catch (err) {
            toast.error("Erreur réseau");
        } finally {
            setShowDeleteModal(false);
            setDeleteTarget(null);
        }
    };

    const filtered = prices.filter(p =>
        (p.willya?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (p.baladiya?.toLowerCase() || "").includes(search.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-pink-50 mt-2">
            <DashboardSidebar />
            <main className="flex-1 p-4 md:p-10 overflow-x-hidden">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
                    <h1 className="text-2xl md:text-4xl font-serif font-bold">Prix de Livraison</h1>
                    <button onClick={openAdd}
                        className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-pink-500 transition text-sm md:text-base font-medium">
                        <FaPlus size={14} /> Ajouter un prix
                    </button>
                </div>

                {/* Search */}
                <div className="relative mb-6 max-w-md">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input placeholder="Rechercher par wilaya ou baladiya..."
                        value={search} onChange={(e) => setSearch(e.target.value)}
                        className="w-full border p-3 md:p-4 pl-11 md:pl-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] text-sm md:text-base bg-white" />
                </div>

                {loading && <p className="text-center text-gray-400 py-4">Chargement...</p>}

                {/* ===== MOBILE CARDS ===== */}
                <div className="md:hidden space-y-3">
                    {filtered.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">Aucun prix trouvé</p>
                    ) : (
                        filtered.map((item) => (
                            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-gray-900">{item.willya}</p>
                                        <p className="text-xs text-gray-500">{item.baladiya || "—"}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.is_birou ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                                        {item.is_birou ? "Bureau" : "Domicile"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                    <span className="text-lg font-bold text-pink-500">
                                        {parseFloat(item.price).toLocaleString()} DA
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => openEdit(item)}
                                            className="p-2 text-gray-500 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition">
                                            <FaEdit size={16} />
                                        </button>
                                        <button onClick={() => handleDeleteClick(item)}
                                            className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition">
                                            <FaTrash size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* ===== DESKTOP TABLE ===== */}
                <div className="hidden md:block bg-white rounded-3xl shadow-sm p-6 border border-gray-100 overflow-x-auto">
                    {filtered.length === 0 ? (
                        <p className="text-gray-400 text-center py-10">Aucun prix trouvé</p>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-gray-400 text-sm border-b">
                                    <th className="pb-3 pr-4">Wilaya</th>
                                    <th className="pb-3 pr-4">Baladiya</th>
                                    <th className="pb-3 pr-4">Type</th>
                                    <th className="pb-3 pr-4">Prix</th>
                                    <th className="pb-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item) => (
                                    <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="border-b last:border-0 hover:bg-gray-50 transition text-sm">
                                        <td className="py-4 pr-4 font-medium">{item.willya}</td>
                                        <td className="py-4 pr-4 text-gray-500">{item.baladiya || "—"}</td>
                                        <td className="py-4 pr-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${item.is_birou ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                                                {item.is_birou ? <><FaStore size={10} /> Bureau</> : <><FaHome size={10} /> Domicile</>}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-4 font-bold text-pink-500">
                                            {parseFloat(item.price).toLocaleString()} DA
                                        </td>
                                        <td className="py-4 text-right">
                                            <button onClick={() => openEdit(item)}
                                                className="p-2 text-gray-500 hover:bg-pink-50 hover:text-pink-600 rounded-lg transition mr-1">
                                                <FaEdit size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteClick(item)}
                                                className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition">
                                                <FaTrash size={16} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ===== MODAL ADD/EDIT ===== */}
                <AnimatePresence>
                    {modalOpen && (
                        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 w-full max-w-md">

                                <h2 className="text-xl md:text-2xl font-bold mb-6">
                                    {editingId ? "Modifier le prix" : "Ajouter un prix"}
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Wilaya <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="willya"
                                            required
                                            value={formData.willya}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] transition"
                                            placeholder="Ex: Alger, Oran, Tamanrasset..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Baladiya <span className="text-gray-400 font-normal">(optionnel)</span>
                                        </label>
                                        <input type="text" name="baladiya" value={formData.baladiya} onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] transition"
                                            placeholder="Ex: Bab Ezzouar" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Type de livraison</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button type="button" onClick={() => setFormData(p => ({ ...p, is_birou: false }))}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition ${!formData.is_birou ? "border-pink-500 bg-pink-50 text-pink-600" : "border-gray-200 hover:border-pink-200"}`}>
                                                <FaHome /> Domicile
                                            </button>
                                            <button type="button" onClick={() => setFormData(p => ({ ...p, is_birou: true }))}
                                                className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition ${formData.is_birou ? "border-pink-500 bg-pink-50 text-pink-600" : "border-gray-200 hover:border-pink-200"}`}>
                                                <FaStore /> Bureau
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Prix (DA) <span className="text-red-500">*</span>
                                        </label>
                                        <input type="number" name="price" required min="0" step="0.01"
                                            value={formData.price} onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#F7D6DF] transition"
                                            placeholder="0.00" />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setModalOpen(false)}
                                            className="flex-1 py-3 rounded-full border border-gray-300 font-medium hover:bg-gray-50 transition">
                                            Annuler
                                        </button>
                                        <button type="submit"
                                            className="flex-1 py-3 rounded-full bg-black text-white font-medium hover:bg-pink-500 transition">
                                            {editingId ? "Enregistrer" : "Ajouter"}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

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
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Supprimer le prix ?
                                </h3>
                                <p className="text-gray-500 text-sm mb-6">
                                    Êtes-vous sûr de vouloir supprimer le prix pour <span className="font-semibold text-gray-700">"{deleteTarget.willya}"</span> {deleteTarget.baladiya ? `— ${deleteTarget.baladiya}` : ""} ? Cette action ne peut être annulée.
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={cancelDelete} className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition cursor-pointer">
                                        Annuler
                                    </button>
                                    <button onClick={confirmDelete} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition cursor-pointer shadow-lg shadow-red-200">
                                        Supprimer
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