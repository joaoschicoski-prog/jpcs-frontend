import { useEffect, useState, useMemo } from "react";
import { api } from "../api";
import ProductCard from "../components/ProductCard";
import { useNav } from "../context/NavContext";

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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { goToProduct } = useNav();

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

  // Ordenar por maior desconto
  const highlights = useMemo(() => {
    return [...cheapest]
      .filter((c) => c.discount_pct && Number(c.discount_pct) > 0)
      .sort((a, b) => Number(b.discount_pct) - Number(a.discount_pct))
      .slice(0, 8);
  }, [cheapest]);

  const filtered = useMemo(() => {
    let list = products;
    if (activeTab === "today") {
      const ids = new Set(todayOffers.map((o) => o.id));
      list = products.filter((p) => ids.has(p.id));
    }
    return list.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q);
      const matchCat = selectedCategory === "all" || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, search, selectedCategory, activeTab, todayOffers]);

  return (
    <div style={{ paddingBottom: 80 }}>
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
          <input type="text" placeholder="Buscar produto, marca ou categoria..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "13px 16px 13px 42px", borderRadius: "var(--radius-lg)", border: "none", outline: "none", fontSize: 15, background: "var(--white)", color: "var(--gray-900)", boxShadow: "var(--shadow-md)" }} />
        </div>
      </div>

      {/* Destaques — maior desconto */}
      {!loading && highlights.length > 0 && search === "" && activeTab === "all" && (
        <div style={{ padding: "18px 0 0" }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--gray-900)", padding: "0 16px", marginBottom: 10 }}>
            🔥 Maiores descontos hoje
          </p>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "0 16px 4px", scrollbarWidth: "none" }}>
            {highlights.map((item) => {
              const prod = products.find((p) => p.id === item.id);
              return (
                <button key={item.id}
                  onClick={() => { if (prod) goToProduct(prod); }}
                  style={{ minWidth: 140, background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-md)", textAlign: "left", flexShrink: 0, cursor: "pointer", overflow: "hidden", position: "relative" }}>

                  {/* Badge desconto */}
                  <span style={{ position: "absolute", top: 8, left: 8, background: "#ef4444", color: "white", fontSize: 10, fontWeight: 800, borderRadius: "var(--radius-full)", padding: "2px 8px", zIndex: 1 }}>
                    -{item.discount_pct}% OFF
                  </span>

                  {/* Foto */}
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.product}
                      style={{ width: "100%", height: 90, objectFit: "cover" }}
                      onError={(e) => { e.target.style.display = "none"; }} />
                  ) : (
                    <div style={{ width: "100%", height: 90, background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🛒</div>
                  )}

                  <div style={{ padding: "10px 10px 12px" }}>
                    <p style={{ fontSize: 12, color: "var(--gray-700)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}>{item.product}</p>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "var(--gray-400)", textDecoration: "line-through" }}>
                        R$ {Number(item.original_price).toFixed(2)}
                      </span>
                    </div>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: "#ef4444", margin: "2px 0" }}>
                      R$ {Number(item.price).toFixed(2)}
                    </p>
                    <p style={{ fontSize: 10, color: "var(--gray-400)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.supermarket}</p>
                  </div>
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

      {/* Categorias */}
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
            <p style={{ fontSize: 13, marginTop: 4 }}>Tente buscar por nome, marca ou categoria</p>
          </div>
        ) : (
          filtered.map((product) => (
            <ProductCard key={product.id} product={product}
              cheapestPrice={cheapestMap[product.id]?.price}
              supermarket={cheapestMap[product.id]?.supermarket}
              validUntil={cheapestMap[product.id]?.valid_until}
              originalPrice={cheapestMap[product.id]?.original_price}
              discountPct={cheapestMap[product.id]?.discount_pct} />
          ))
        )}
      </div>
    </div>
  );
}