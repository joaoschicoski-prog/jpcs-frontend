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

function Inp({ label, value, onChange, type = "text", placeholder, hint, error }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: error ? "#ef4444" : "var(--gray-600)", fontWeight: 600, display: "block", marginBottom: 4 }}>
        {label} *
        {hint && <span style={{ fontSize: 11, color: "var(--gray-400)", fontWeight: 400, marginLeft: 6 }}>{hint}</span>}
      </label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{ width: "100%", padding: "10px 14px", border: `1.5px solid ${error ? "#ef4444" : "var(--gray-200)"}`, borderRadius: "var(--radius-md)", fontSize: 14, outline: "none", color: "var(--gray-900)", background: error ? "#fff5f5" : "var(--white)" }}
        onFocus={(e) => e.target.style.borderColor = error ? "#ef4444" : "var(--green-400)"}
        onBlur={(e) => e.target.style.borderColor = error ? "#ef4444" : "var(--gray-200)"} />
      {error && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>⚠ {error}</p>}
    </div>
  );
}

function AutoField({ label, value, onChange, options, placeholder, error }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: error ? "#ef4444" : "var(--gray-600)", fontWeight: 600, display: "block", marginBottom: 4 }}>{label} *</label>
      <div style={{ border: `1.5px solid ${error ? "#ef4444" : "var(--gray-200)"}`, borderRadius: "var(--radius-md)", background: error ? "#fff5f5" : "var(--white)" }}>
        <AutoComplete value={value} onChange={onChange} options={options} placeholder={placeholder} />
      </div>
      {error && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>⚠ {error}</p>}
    </div>
  );
}

export default function SmartOfferForm({ data, onSuccess, onToast, editOffer, onCancelEdit }) {
  const empty = { product: null, supermarket: null, category: null, brand: null, price: "", original_price: "", image_url: "", valid_from: "", valid_until: "" };

  const [form, setForm] = useState(editOffer ? {
    product: { id: editOffer.product_id, name: editOffer.product },
    supermarket: { id: editOffer.supermarket_id, name: editOffer.supermarket },
    category: editOffer.category ? { name: editOffer.category } : null,
    brand: editOffer.brand ? { name: editOffer.brand } : null,
    price: editOffer.price || "",
    original_price: editOffer.original_price || "",
    image_url: editOffer.image_url || "",
    valid_from: editOffer.valid_from ? editOffer.valid_from.slice(0, 10) : "",
    valid_until: editOffer.valid_until ? editOffer.valid_until.slice(0, 10) : "",
  } : empty);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k) => (v) => { setForm((f) => ({ ...f, [k]: v })); if (touched) validate({ ...form, [k]: v }); };
  const setVal = (k) => (e) => { const v = e.target.value; setForm((f) => ({ ...f, [k]: v })); if (touched) validate({ ...form, [k]: v }); };

  const discountPct = form.original_price && form.price && Number(form.original_price) > Number(form.price)
    ? Math.round(((Number(form.original_price) - Number(form.price)) / Number(form.original_price)) * 100)
    : null;

  const validate = (f = form) => {
    const e = {};
    if (!f.product?.name) e.product = "Produto obrigatório";
    if (!f.supermarket?.name) e.supermarket = "Supermercado obrigatório";
    if (!f.price || Number(f.price) <= 0) e.price = "Preço promocional obrigatório";
    if (!f.original_price || Number(f.original_price) <= 0) e.original_price = "Preço original obrigatório";
    if (f.original_price && f.price && Number(f.original_price) <= Number(f.price)) e.original_price = "Deve ser maior que o preço promocional";
    if (!f.valid_from) e.valid_from = "Data de início obrigatória";
    if (!f.valid_until) e.valid_until = "Data de fim obrigatória";
    if (!f.category?.name) e.category = "Categoria obrigatória";
    if (!f.brand?.name) e.brand = "Marca obrigatória";
    if (!f.image_url?.trim()) e.image_url = "URL da imagem obrigatória";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setTouched(true);
    if (!validate()) return onToast("Preencha todos os campos obrigatórios", false);
    setLoading(true);
    try {
      const category_id = await findOrCreate(data.categories, api.createCategory, form.category.name);
      const brand_id = await findOrCreate(data.brands, api.createBrand, form.brand.name);

      let product_id = form.product?.id;
      if (!product_id) {
        const prod = await api.createProduct({ name: form.product.name, category_id, brand_id, image_url: form.image_url });
        product_id = prod.id;
      } else {
        await put(`/products/${product_id}`, { name: form.product.name, category_id, brand_id, image_url: form.image_url });
      }

      let supermarket_id = form.supermarket?.id;
      if (!supermarket_id) {
        const sup = await api.createSupermarket({ name: form.supermarket.name });
        supermarket_id = sup.id;
      }

      const body = {
        product_id, supermarket_id,
        price: Number(form.price),
        original_price: Number(form.original_price),
        valid_from: form.valid_from,
        valid_until: form.valid_until,
      };

      if (editOffer) { await put(`/offers/${editOffer.id}`, body); onToast("Oferta atualizada!"); }
      else { await api.createOffer(body); onToast("Oferta criada!"); }

      setForm(empty);
      setErrors({});
      setTouched(false);
      onSuccess();
    } catch (e) { onToast(e.message || "Erro ao salvar", false); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ background: "var(--green-50)", border: "1.5px solid var(--green-200)", borderRadius: "var(--radius-lg)", padding: "16px", marginBottom: 16 }}>
      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--green-700)", marginBottom: 14 }}>
        {editOffer ? "✏️ Editando oferta" : "➕ Nova oferta"}
      </p>

      <AutoField label="Produto" value={form.product} onChange={set("product")} options={data.products} placeholder="Ex: Leite Integral 1L" error={errors.product} />
      <AutoField label="Supermercado" value={form.supermarket} onChange={set("supermarket")} options={data.supermarkets} placeholder="Ex: Hiper Condor" error={errors.supermarket} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="Preço promocional (R$)" value={form.price} onChange={setVal("price")} type="number" placeholder="Ex: 4.59" error={errors.price} />
        <Inp label="Preço original (R$)" value={form.original_price} onChange={setVal("original_price")} type="number" placeholder="Ex: 8.99" error={errors.original_price} />
      </div>

      {discountPct && (
        <div style={{ background: "#fff0f0", border: "1px solid #fca5a5", borderRadius: "var(--radius-md)", padding: "8px 12px", marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: "#ef4444", fontWeight: 700 }}>🏷️ Desconto de {discountPct}% OFF será exibido no app!</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Inp label="Início da oferta" value={form.valid_from} onChange={setVal("valid_from")} type="date" error={errors.valid_from} />
        <Inp label="Fim da oferta" value={form.valid_until} onChange={setVal("valid_until")} type="date" error={errors.valid_until} />
      </div>

      <div style={{ borderTop: "1px dashed var(--gray-300)", margin: "12px 0", paddingTop: 12 }}>
        <p style={{ fontSize: 11, color: "var(--gray-500)", fontWeight: 600, marginBottom: 10 }}>INFORMAÇÕES DO PRODUTO</p>
        <AutoField label="Categoria" value={form.category} onChange={set("category")} options={data.categories} placeholder="Ex: Laticínios e Ovos" error={errors.category} />
        <AutoField label="Marca" value={form.brand} onChange={set("brand")} options={data.brands} placeholder="Ex: Nestlé" error={errors.brand} />
        <Inp label="URL da imagem" value={form.image_url} onChange={setVal("image_url")} placeholder="https://..." error={errors.image_url} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleSubmit} disabled={loading}
          style={{ flex: 1, padding: "12px", background: loading ? "var(--gray-300)" : "var(--green-500)", color: "#fff", borderRadius: "var(--radius-md)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>
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