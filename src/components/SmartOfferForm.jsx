import { useState } from "react";
import AutoComplete from "./AutoComplete";
import { api } from "../api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function put(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro");
  return data;
}

async function findOrCreate(list, apiFn, name) {
  if (!name?.trim()) return null;
  const found = list.find((i) => i.name.toLowerCase() === name.toLowerCase());
  if (found) return found.id;
  const created = await apiFn({ name });
  return created.id;
}

function Inp({ label, value, onChange, type = "text", placeholder, required }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: "var(--gray-600)", fontWeight: 600, display: "block", marginBottom: 4 }}>
        {label}{required && " *"}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-md)", fontSize: 14, outline: "none", color: "var(--gray-900)", background: "var(--white)" }}
        onFocus={(e) => e.target.style.borderColor = "var(--green-400)"}
        onBlur={(e) => e.target.style.borderColor = "var(--gray-200)"} />
    </div>
  );
}

export default function SmartOfferForm({ data, onSuccess, onToast, editOffer, onCancelEdit }) {
  const empty = { product: null, supermarket: null, category: null, brand: null, price: "", image_url: "", valid_from: "", valid_until: "" };
  const [form, setForm] = useState(editOffer ? {
    product: { id: editOffer.product_id, name: editOffer.product },
    supermarket: { id: editOffer.supermarket_id, name: editOffer.supermarket },
    category: null, brand: null,
    price: editOffer.price,
    image_url: "",
    valid_from: editOffer.valid_from ? editOffer.valid_from.slice(0, 10) : "",
    valid_until: editOffer.valid_until ? editOffer.valid_until.slice(0, 10) : "",
  } : empty);
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const setVal = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.product?.name) return onToast("Nome do produto obrigatório", false);
    if (!form.supermarket?.name) return onToast("Supermercado obrigatório", false);
    if (!form.price || Number(form.price) <= 0) return onToast("Preço inválido", false);
    setLoading(true);
    try {
      const category_id = form.category?.name ? await findOrCreate(data.categories, api.createCategory, form.category.name) : null;
      const brand_id = form.brand?.name ? await findOrCreate(data.brands, api.createBrand, form.brand.name) : null;

      let product_id = form.product?.id;
      if (!product_id) {
        const prod = await api.createProduct({ name: form.product.name, category_id, brand_id, image_url: form.image_url || null });
        product_id = prod.id;
      } else if (category_id || brand_id || form.image_url) {
        await put(`/products/${product_id}`, { name: form.product.name, category_id: category_id || undefined, brand_id: brand_id || undefined, image_url: form.image_url || undefined });
      }

      let supermarket_id = form.supermarket?.id;
      if (!supermarket_id) {
        const sup = await api.createSupermarket({ name: form.supermarket.name });
        supermarket_id = sup.id;
      }

      const body = {
        product_id, supermarket_id,
        price: Number(form.price),
        valid_from: form.valid_from || null,
        valid_until: form.valid_until || null,
      };

      if (editOffer) { await put(`/offers/${editOffer.id}`, body); onToast("Oferta atualizada!"); }
      else { await api.createOffer(body); onToast("Oferta criada!"); }

      setForm(empty);
      onSuccess();
    } catch (e) { onToast(e.message || "Erro ao salvar", false); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: "var(--green-50)", border: "1.5px solid var(--green-200)", borderRadius: "var(--radius-lg)", padding: "16px", marginBottom: 16 }}>
      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--green-700)", marginBottom: 14 }}>
        {editOffer ? "✏️ Editando oferta" : "➕ Nova oferta"}
      </p>

      <AutoComplete label="Produto" required value={form.product} onChange={set("product")} options={data.products} placeholder="Ex: Leite Integral 1L" />
      <AutoComplete label="Supermercado" required value={form.supermarket} onChange={set("supermarket")} options={data.supermarkets} placeholder="Ex: Hiper Condor" />
      <Inp label="Preço (R$)" required value={form.price} onChange={setVal("price")} type="number" placeholder="Ex: 4.99" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="Início da oferta" value={form.valid_from} onChange={setVal("valid_from")} type="date" />
        <Inp label="Fim da oferta" value={form.valid_until} onChange={setVal("valid_until")} type="date" />
      </div>

      <div style={{ borderTop: "1px dashed var(--gray-300)", margin: "12px 0", paddingTop: 12 }}>
        <p style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 600, marginBottom: 10 }}>OPCIONAIS — se produto for novo</p>
        <AutoComplete label="Categoria" value={form.category} onChange={set("category")} options={data.categories} placeholder="Ex: Laticínios" />
        <AutoComplete label="Marca" value={form.brand} onChange={set("brand")} options={data.brands} placeholder="Ex: Nestlé" />
        <Inp label="URL da imagem" value={form.image_url} onChange={setVal("image_url")} placeholder="https://..." />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: "12px", background: loading ? "var(--gray-300)" : "var(--green-500)", color: "#fff", borderRadius: "var(--radius-md)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>
          {loading ? "Salvando..." : editOffer ? "Salvar alteração" : "Adicionar oferta"}
        </button>
        {editOffer && (
          <button onClick={onCancelEdit} style={{ padding: "12px 20px", background: "var(--gray-200)", color: "var(--gray-700)", borderRadius: "var(--radius-md)", fontWeight: 700, fontSize: 14 }}>
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
