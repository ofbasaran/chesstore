import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../api/axiosInstance";

interface AdminCategory {
  id: string;
  name: string;
  description?: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState<AdminCategory | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get<AdminCategory[]>("/catalog/api/categories");
      setCategories(res.data);
    } catch {
      toast.error("Kategoriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setEditCategory(null);
    setName("");
    setDescription("");
    setModalOpen(true);
  };

  const openEdit = (category: AdminCategory) => {
    setEditCategory(category);
    setName(category.name);
    setDescription(category.description ?? "");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Kategori adı zorunludur.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
      };
      if (editCategory) {
        await api.put(`/catalog/api/categories/${editCategory.id}`, payload);
        toast.success("Kategori güncellendi.");
      } else {
        await api.post("/catalog/api/categories", payload);
        toast.success("Kategori oluşturuldu.");
      }
      setModalOpen(false);
      setEditCategory(null);
      await loadCategories();
    } catch {
      toast.error(editCategory ? "Kategori güncellenemedi." : "Kategori oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/catalog/api/categories/${deleteId}`);
      toast.success("Kategori silindi.");
      setDeleteId(null);
      await loadCategories();
    } catch {
      toast.error("Kategori silinemedi.");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Kategoriler</h2>
          <p className="text-sm text-gray-400">{categories.length} kategori listeleniyor</p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-yellow-400"
        >
          + Yeni Kategori Ekle
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-yellow-500" />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center text-gray-500">Henüz kategori yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-800 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4">Ad</th>
                  <th className="px-6 py-4">Açıklama</th>
                  <th className="px-6 py-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {categories.map((c) => (
                  <tr key={c.id} className="transition-colors hover:bg-gray-800/40">
                    <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                    <td className="px-6 py-4 text-gray-300">{c.description || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(c)}
                          className="rounded-lg border border-gray-600 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-gray-700"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => setDeleteId(c.id)}
                          className="rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
            <h3 className="mb-5 text-lg font-bold text-white">
              {editCategory ? "Kategoriyi Düzenle" : "Yeni Kategori Ekle"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-300">Ad *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-300">Açıklama</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); setEditCategory(null); }}
                  className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-yellow-500 px-5 py-2 text-sm font-semibold text-gray-900 transition-colors hover:bg-yellow-400 disabled:opacity-60"
                >
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
            <h3 className="mb-2 text-lg font-bold text-white">Kategoriyi Sil</h3>
            <p className="mb-6 text-sm text-gray-400">
              Bu kategoriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800"
              >
                İptal
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-400"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
