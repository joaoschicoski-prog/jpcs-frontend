import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import SmartOfferForm from "../components/SmartOfferForm";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function del(path) {
  const res = await fetch(`${API_URL}${path}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erro ao deletar");
  return res.json();
}

async function put(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Erro ao atualizar");
  return data;
}

function Toast({ msg, ok }) {
  if (!msg) return null;
  return (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: ok ? "var(--green-600)" : "var(--red-400)", color: "#fff", borderRadius: "var(--radius-full)", padding: "10px 24px", fontSize: 14, fontWeight: 600, zIndex: 999, whiteSpace: "nowrap", boxShadow: "var(--shadow-lg)" }}>
      {ok ? "✓" : "✗"} {msg}
    </div>
  );
}

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", marginBottom: 14 }}>
      <svg width="15" height="15" fill="none" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
        <circle cx="6" cy="6" r="4"/><path d="M14 14l-3-3"/>
      </svg>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "Buscar..."}
        style={{ width: "100%", padding: "9px 14px 9px 34px", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-md)", fontSize: 13, outline: "none", color: "var(--gray-900)", background: "var(--gray-50)" }}
        onFocus={(e) => e.target.style.borderColor = "var(--green-400)"}
        onBlur={(e) => e.target.style.borderColor = "var(--gray-200)"} />
    </div>
  );
}

function Inp({ label, value, onChange, type = "text", placeholder, required }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: "var(--gray-600)", fontWeight: 600, display: "block", marginBottom: 4 }}>{label}{required && " *"}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder || label}
        style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-md)", fontSize: 14, outline: "none", color: "var(--gray-900)", background: "var(--white)" }}
        onFocus={(e) => e.target.style.borderColor = "var(--green-400)"}
        onBlur={(e) => e.target.style.borderColor = "var(--gray-200)"} />
    </div>
  );
}

function Sel({ label, value, onChange, options, placeholder }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ fontSize: 12, color: "var(--gray-600)", fontWeight: 600, display: "block", marginBottom: 4 }}>{label}</label>
      <select value={value} onChange={onChange} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-md)", fontSize: 14, outline: "none", color: "var(--gray-900)", background: "var(--white)" }}>
        <option value="">{placeholder || "Selecione..."}</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, onClick, color = "green", small, disabled }) {
  const bg = color === "green" ? "var(--green-500)" : color === "red" ? "var(--red-400)" : "var(--gray-200)";
  const txt = color === "gray" ? "var(--gray-700)" : "#fff";
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: small ? "6px 14px" : "11px 20px", background: disabled ? "var(--gray-300)" : bg, color: disabled ? "var(--gray-500)" : txt, borderRadius: "var(--radius-md)", fontWeight: 700, fontSize: small ? 12 : 14 }}>
      {children}
    </button>
  );
}

function Section({ title, icon, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: "1px solid var(--gray-200)", borderRadius: "var(--radius-lg)", marginBottom: 12, overflow: "hidden" }}>
      <button onClick={() => setOpen(!open)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: "var(--gray-50)", textAlign: "left" }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, flex: 1, color: "var(--gray-900)" }}>{title}</span>
        <span style={{ color: "var(--gray-400)", fontSize: 18 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && <div style={{ padding: "16px 20px", borderTop: "1px solid var(--gray-100)" }}>{children}</div>}
    </div>
  );
}

function Row({ label, sub, onEdit, onDelete }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid var(--gray-100)" }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</p>
        {sub && <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>{sub}</p>}
      </div>
      <Btn small color="gray" onClick={onEdit}>Editar</Btn>
      <Btn small color="red" onClick={onDelete}>Apagar</Btn>
    </div>
  );
}

export default function Admin({ setPage }) {
  const { isAdmin, isLogged } = useAuth();
  const [toast, setToast] = useState(null);
  const [data, setData] = useState({ products: [], supermarkets: [], categories: [], brands: [], offers: [] });

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const reload = async () => {
    const [products, supermarkets, categories, brands, offers] = await Promise.all([
      api.getProducts(), api.getSupermarkets(), api.getCategories(), api.getBrands(), api.getOffers(""),
    ]);
    setData({ products, supermarkets, categories, brands, offers });
  };

  useEffect(() => { if (isAdmin) reload(); }, [isAdmin]);

  if (!isLogged || !isAdmin) {
    return (
      <div style={{ textAlign: "center", padding: "80px 32px" }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>🔒</p>
        <p style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>Acesso restrito a administradores</p>
        <Btn onClick={() => setPage("home")}>Voltar</Btn>
      </div>
    );
  }

  function CategoriesSection() {
    const [form, setForm] = useState({ name: "" });
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");
    const filtered = data.categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    const save = async () => {
      if (!form.name.trim()) return showToast("Nome obrigatório", false);
      try {
        editId ? await put(`/categories/${editId}`, form) : await api.createCategory(form);
        showToast(editId ? "Categoria atualizada!" : "Categoria criada!");
        setForm({ name: "" }); setEditId(null); reload();
      } catch (e) { showToast(e.message, false); }
    };
    return (
      <Section title={`Categorias (${data.categories.length})`} icon="🏷️">
        <Inp label="Nome *" value={form.name} onChange={(e) => setForm({ name: e.target.value })} placeholder="Ex: Laticínios" />
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Btn onClick={save}>{editId ? "Salvar" : "Adicionar"}</Btn>
          {editId && <Btn color="gray" onClick={() => { setEditId(null); setForm({ name: "" }); }}>Cancelar</Btn>}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar categoria..." />
        {filtered.map((c) => (
          <Row key={c.id} label={c.name}
            onEdit={() => { setEditId(c.id); setForm({ name: c.name }); }}
            onDelete={async () => { if (!confirm("Apagar?")) return; try { await del(`/categories/${c.id}`); showToast("Removida!"); reload(); } catch (e) { showToast(e.message, false); } }} />
        ))}
        {filtered.length === 0 && <p style={{ fontSize: 13, color: "var(--gray-400)", textAlign: "center", padding: "12px 0" }}>Nenhum resultado</p>}
      </Section>
    );
  }

  function BrandsSection() {
    const [form, setForm] = useState({ name: "" });
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");
    const filtered = data.brands.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));
    const save = async () => {
      if (!form.name.trim()) return showToast("Nome obrigatório", false);
      try {
        editId ? await put(`/brands/${editId}`, form) : await api.createBrand(form);
        showToast(editId ? "Marca atualizada!" : "Marca criada!");
        setForm({ name: "" }); setEditId(null); reload();
      } catch (e) { showToast(e.message, false); }
    };
    return (
      <Section title={`Marcas (${data.brands.length})`} icon="®️">
        <Inp label="Nome *" value={form.name} onChange={(e) => setForm({ name: e.target.value })} placeholder="Ex: Nestlé" />
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Btn onClick={save}>{editId ? "Salvar" : "Adicionar"}</Btn>
          {editId && <Btn color="gray" onClick={() => { setEditId(null); setForm({ name: "" }); }}>Cancelar</Btn>}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar marca..." />
        {filtered.map((b) => (
          <Row key={b.id} label={b.name}
            onEdit={() => { setEditId(b.id); setForm({ name: b.name }); }}
            onDelete={async () => { if (!confirm("Apagar?")) return; try { await del(`/brands/${b.id}`); showToast("Removida!"); reload(); } catch (e) { showToast(e.message, false); } }} />
        ))}
        {filtered.length === 0 && <p style={{ fontSize: 13, color: "var(--gray-400)", textAlign: "center", padding: "12px 0" }}>Nenhum resultado</p>}
      </Section>
    );
  }

  function SupermarketsSection() {
    const empty = { name: "", city: "", address: "", phone: "", cnpj: "" };
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");
    const filtered = data.supermarkets.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || (s.city || "").toLowerCase().includes(search.toLowerCase()));
    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
    const save = async () => {
      if (!form.name.trim()) return showToast("Nome obrigatório", false);
      try {
        editId ? await put(`/supermarkets/${editId}`, form) : await api.createSupermarket(form);
        showToast(editId ? "Supermercado atualizado!" : "Supermercado criado!");
        setForm(empty); setEditId(null); reload();
      } catch (e) { showToast(e.message, false); }
    };
    return (
      <Section title={`Supermercados (${data.supermarkets.length})`} icon="🏪">
        <Inp label="Nome *" value={form.name} onChange={set("name")} placeholder="Ex: Hiper Condor" />
        <Inp label="Cidade" value={form.city} onChange={set("city")} placeholder="Ex: Campo Mourão" />
        <Inp label="Endereço" value={form.address} onChange={set("address")} placeholder="Ex: Av. Brasil, 740" />
        <Inp label="Telefone" value={form.phone} onChange={set("phone")} placeholder="Ex: (44) 3523-8781" />
        <Inp label="CNPJ" value={form.cnpj} onChange={set("cnpj")} placeholder="Ex: 00.000.000/0001-00" />
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Btn onClick={save}>{editId ? "Salvar" : "Adicionar"}</Btn>
          {editId && <Btn color="gray" onClick={() => { setEditId(null); setForm(empty); }}>Cancelar</Btn>}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar supermercado ou cidade..." />
        {filtered.map((s) => (
          <Row key={s.id} label={s.name} sub={[s.city, s.address, s.phone].filter(Boolean).join(" · ")}
            onEdit={() => { setEditId(s.id); setForm({ name: s.name || "", city: s.city || "", address: s.address || "", phone: s.phone || "", cnpj: s.cnpj || "" }); }}
            onDelete={async () => { if (!confirm("Apagar?")) return; try { await del(`/supermarkets/${s.id}`); showToast("Removido!"); reload(); } catch (e) { showToast(e.message, false); } }} />
        ))}
        {filtered.length === 0 && <p style={{ fontSize: 13, color: "var(--gray-400)", textAlign: "center", padding: "12px 0" }}>Nenhum resultado</p>}
      </Section>
    );
  }

  function ProductsSection() {
    const empty = { name: "", description: "", image_url: "", category_id: "", brand_id: "" };
    const [form, setForm] = useState(empty);
    const [editId, setEditId] = useState(null);
    const [search, setSearch] = useState("");
    const filtered = data.products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.category || "").toLowerCase().includes(search.toLowerCase()) || (p.brand || "").toLowerCase().includes(search.toLowerCase()));
    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
    const save = async () => {
      if (!form.name.trim()) return showToast("Nome obrigatório", false);
      const body = { ...form, category_id: form.category_id ? Number(form.category_id) : null, brand_id: form.brand_id ? Number(form.brand_id) : null };
      try {
        editId ? await put(`/products/${editId}`, body) : await api.createProduct(body);
        showToast(editId ? "Produto atualizado!" : "Produto criado!");
        setForm(empty); setEditId(null); reload();
      } catch (e) { showToast(e.message, false); }
    };
    return (
      <Section title={`Produtos (${data.products.length})`} icon="📦">
        <Inp label="Nome *" value={form.name} onChange={set("name")} placeholder="Ex: Leite Integral 1L" />
        <Inp label="Descrição" value={form.description} onChange={set("description")} placeholder="Ex: Leite integral longa vida" />
        <Inp label="URL da imagem" value={form.image_url} onChange={set("image_url")} placeholder="https://..." />
        <Sel label="Categoria" value={form.category_id} onChange={set("category_id")} options={data.categories} placeholder="Sem categoria" />
        <Sel label="Marca" value={form.brand_id} onChange={set("brand_id")} options={data.brands} placeholder="Sem marca" />
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Btn onClick={save}>{editId ? "Salvar" : "Adicionar"}</Btn>
          {editId && <Btn color="gray" onClick={() => { setEditId(null); setForm(empty); }}>Cancelar</Btn>}
        </div>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar produto, categoria ou marca..." />
        {filtered.map((p) => (
          <Row key={p.id} label={p.name} sub={[p.category, p.brand].filter(Boolean).join(" · ")}
            onEdit={() => { setEditId(p.id); const cat = data.categories.find((c) => c.name === p.category); const brd = data.brands.find((b) => b.name === p.brand); setForm({ name: p.name || "", description: p.description || "", image_url: p.image_url || "", category_id: cat?.id || "", brand_id: brd?.id || "" }); }}
            onDelete={async () => { if (!confirm("Apagar?")) return; try { await del(`/products/${p.id}`); showToast("Removido!"); reload(); } catch (e) { showToast(e.message, false); } }} />
        ))}
        {filtered.length === 0 && <p style={{ fontSize: 13, color: "var(--gray-400)", textAlign: "center", padding: "12px 0" }}>Nenhum resultado</p>}
      </Section>
    );
  }

  function OffersSection() {
    const [editOffer, setEditOffer] = useState(null);
    const [search, setSearch] = useState("");
    const filtered = data.offers.filter((o) =>
      (o.product || "").toLowerCase().includes(search.toLowerCase()) ||
      (o.supermarket || "").toLowerCase().includes(search.toLowerCase())
    );
    return (
      <Section title={`Ofertas (${data.offers.length})`} icon="💰">
        <SmartOfferForm
          key={editOffer?.id || "new"}
          data={data}
          editOffer={editOffer}
          onCancelEdit={() => setEditOffer(null)}
          onToast={showToast}
          onSuccess={() => { setEditOffer(null); reload(); }}
        />
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por produto ou mercado..." />
        {filtered.map((o) => (
          <Row key={o.id}
            label={`${o.product} → ${o.supermarket}`}
            sub={[
              `R$ ${Number(o.price).toFixed(2)}`,
              o.original_price ? `Original: R$ ${Number(o.original_price).toFixed(2)}` : null,
              o.valid_from ? `De: ${new Date(o.valid_from).toLocaleDateString("pt-BR")}` : null,
              o.valid_until ? `Até: ${new Date(o.valid_until).toLocaleDateString("pt-BR")}` : null,
            ].filter(Boolean).join(" · ")}
            onEdit={() => setEditOffer(o)}
            onDelete={async () => { if (!confirm("Apagar esta oferta?")) return; try { await del(`/offers/${o.id}`); showToast("Removida!"); reload(); } catch (e) { showToast(e.message, false); } }} />
        ))}
        {filtered.length === 0 && <p style={{ fontSize: 13, color: "var(--gray-400)", textAlign: "center", padding: "12px 0" }}>Nenhum resultado</p>}
      </Section>
    );
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: "var(--green-700)", padding: "20px 16px 24px" }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--white)", marginBottom: 4 }}>Painel admin ⚙️</p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Gerencie todos os dados do sistema</p>
      </div>
      <div style={{ padding: "16px" }}>
        <CategoriesSection />
        <BrandsSection />
        <SupermarketsSection />
        <ProductsSection />
        <OffersSection />
      </div>
      <Toast msg={toast?.msg} ok={toast?.ok} />
    </div>
  );
}