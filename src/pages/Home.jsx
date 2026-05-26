import { useEffect, useState, useMemo } from "react";
import { api } from "../api";
import ProductCard from "../components/ProductCard";
import PriceSheet from "../components/PriceSheet";

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const end = new Date(dateStr); end.setHours(0,0,0,0);
  return Math.round((end - today) / (1000 * 60 * 60 * 24));
}

export default function Home({ setPage }) {
  const [products, setProducts] = useState([]);
  const [cheapest, setCheapest] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    Promise.all([api.getProducts(), api.getCheapest()])
      .then(([prods, cheap]) => {
        setProducts(prods);
        setCheapest(cheap);
        const cats = [...new Set(prods.map((p) => p.category).filter(Boolean))];
        setCategories(cats);
      }).finally(() => setLoading(false));
  }, []);

  const cheapestMap = useMemo(() => {
    const map = {};
    cheapest.forEach((c) => {
      map[c.id] = { price: c.price, supermarket: c.supermarket, valid_until: c.valid_until, original_price: c.original_price, discount_pct: c.discount_pct };
    });
    return map;
  }, [cheapest]);

  const todayOffers = useMemo(() =>
    cheapest.filter((c) => { const d = getDaysUntil(c.valid_until); return d !== null && d <= 1; }),
  [cheapest]);

  const highlights = cheapest.slice(0, 8);

  const filtered = useMemo(() => {
    let list = products;
    if (activeTab === "today") {
      const ids = new Set(todayOffers.map((o) => o.id));
      list = products.filter((p) => ids.has(p.id));
    }
    return list.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCategory === "all" || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, selectedCategory, activeTab, todayOffers]);

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, var(--green-600) 0%, var(--green-500) 100%)", padding: "20px 16px 24px" }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--white)", marginBottom: 4 }}>
          Encontre o menor preço 🏷️
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 14 }}>
          Compare preços em supermercados de Campo Mourão
        </p>
        <div style={{ position: "relative" }}>
          <svg width="18" height="18" fill="none" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="8" cy="8" r="5"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input type="text" placeholder="Buscar produto..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "13px 16px 13px 42px", borderRadius: "var(--radius-lg)", border: "none", outline: "none", fontSize: 15, background: "var(--white)", color: "var(--gray-900)", boxShadow: "var(--shadow-md)" }} />
        </div>
      </div>

      {/* Destaques */}
      {!loading && highlights.length > 0 && search === "" && activeTab === "all" && (
        <div style={{ padding: "18px 0 0" }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--gray-900)", padding: "0 16px", marginBottom: 10 }}>
            🔥 Melhores preços hoje
          </p>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "0 16px 4px" }}>
            {highlights.map((item) => {
              const days = getDaysUntil(item.valid_until);
              const urgent = days !== null && days <= 1;
              const warning = days !== null && days <= 3 && days > 1;
              return (
                <button key={item.id}
                  onClick={() => { const p = products.find((x) => x.id === item.id); if (p) setSelectedProduct(p); }}
                  style={{ minWidth: 130, background: urgent ? "#fff8f0" : "var(--white)", border: `1px solid ${urgent ? "#f97316" : warning ? "#fbbf24" : "var(--gray-200)"}`, borderRadius: "var(--radius-md)", padding: "12px 14px", textAlign: "left", flexShrink: 0, cursor: "pointer" }}>
                  <p style={{ fontSize: 12, color: "var(--gray-700)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}>{item.product}</p>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "var(--green-600)" }}>R$ {Number(item.price).toFixed(2)}</p>
                  <p style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 2 }}>{item.supermarket}</p>
                  {urgent && <p style={{ fontSize: 10, color: "#f97316", fontWeight: 700, marginTop: 4 }}>⚡ Acaba hoje!</p>}
                  {warning && <p style={{ fontSize: 10, color: "#d97706", fontWeight: 600, marginTop: 4 }}>⏳ {days} dias restantes</p>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, padding: "14px 16px 0", overflowX: "auto" }}>
        {[
          { id: "all", label: "Todas as ofertas" },
          { id: "today", label: `⚡ Ofertas do dia (${todayOffers.length})` },
        ].map((t) => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setSelectedCategory("all"); }}
            style={{ padding: "7px 14px", borderRadius: "var(--radius-full)", border: `1.5px solid ${activeTab === t.id ? "var(--green-500)" : "var(--gray-200)"}`, background: activeTab === t.id ? "var(--green-500)" : "var(--white)", color: activeTab === t.id ? "var(--white)" : "var(--gray-600)", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Categorias - scroll horizontal */}
      {categories.length > 0 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "10px 16px 0", scrollbarWidth: "none" }}>
          {["all", ...categories].map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              style={{ flexShrink: 0, padding: "6px 14px", borderRadius: "var(--radius-full)", border: `1.5px solid ${selectedCategory === cat ? "var(--green-500)" : "var(--gray-200)"}`, background: selectedCategory === cat ? "var(--green-500)" : "var(--white)", color: selectedCategory === cat ? "var(--white)" : "var(--gray-600)", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
              {cat === "all" ? "Todos" : cat}
            </button>
          ))}
        </div>
      )}

      {/* Lista */}
      <div style={{ padding: "12px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? (
          [1,2,3,4].map((i) => (
            <div key={i} style={{ height: 80, borderRadius: "var(--radius-lg)", background: "var(--gray-100)", animation: "pulse 1.2s ease infinite", animationDelay: `${i*0.1}s` }} />
          ))
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--gray-500)" }}>
            <p style={{ fontSize: 36, marginBottom: 10 }}>🔍</p>
            <p style={{ fontWeight: 600 }}>Nenhum produto encontrado</p>
          </div>
        ) : (
          filtered.map((product) => (
            <ProductCard key={product.id} product={product}
              cheapestPrice={cheapestMap[product.id]?.price}
              supermarket={cheapestMap[product.id]?.supermarket}
              validUntil={cheapestMap[product.id]?.valid_until}
              onClick={() => setSelectedProduct(product)} />
          ))
        )}
      </div>

      <PriceSheet product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
