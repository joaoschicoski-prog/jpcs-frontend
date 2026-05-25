import { useEffect, useState, useMemo } from "react";
import { api } from "../api";
import PriceSheet from "../components/PriceSheet";
import { useAuth } from "../context/AuthContext";
import { useList } from "../context/ListContext";

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const end = new Date(dateStr); end.setHours(0,0,0,0);
  return Math.round((end - today) / (1000 * 60 * 60 * 24));
}

export default function MarketOffers({ market, onBack }) {
  const { isLogged } = useAuth();
  const { isFavorite, toggleFavorite, isInList, addToList, removeFromList, favorites, list } = useList();
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tab, setTab] = useState("offers"); // offers | favorites | list

  useEffect(() => {
    if (!market) return;
    Promise.all([api.getOffers(""), api.getProducts()]).then(([all, prods]) => {
      setOffers(all.filter((o) => o.supermarket === market.name));
      const map = {};
      prods.forEach((p) => { map[p.id] = p; });
      setProducts(map);
    }).finally(() => setLoading(false));
  }, [market]);

  const filtered = useMemo(() => {
    if (tab === "favorites") return favorites.filter((p) => (p.name || "").toLowerCase().includes(search.toLowerCase()));
    if (tab === "list") return list.filter((p) => (p.name || "").toLowerCase().includes(search.toLowerCase()));
    return offers.filter((o) => (o.product || "").toLowerCase().includes(search.toLowerCase()));
  }, [offers, favorites, list, search, tab]);

  const OfferRow = ({ o, idx }) => {
    const prod = products[o.product_id] || { id: o.product_id, name: o.product };
    const fav = isFavorite(o.product_id);
    const inList = isInList(o.product_id);
    const days = getDaysUntil(o.valid_until);
    const urgent = days !== null && days <= 1;
    const warning = days !== null && days > 1 && days <= 3;

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--white)", border: `1px solid ${urgent ? "#f97316" : warning ? "#fbbf24" : "var(--gray-200)"}`, borderRadius: "var(--radius-md)", marginBottom: 8, animation: "fadeUp 0.25s ease both", animationDelay: `${idx*0.04}s` }}>
        <button onClick={() => setSelectedProduct(prod)} style={{ flex: 1, textAlign: "left", background: "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{o.product}</p>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 3, flexWrap: "wrap" }}>
                {o.valid_until && <p style={{ fontSize: 11, color: "var(--gray-400)" }}>Até {new Date(o.valid_until).toLocaleDateString("pt-BR")}</p>}
                {urgent && <span style={{ fontSize: 10, color: "#f97316", fontWeight: 700 }}>⚡ Acaba hoje!</span>}
                {warning && <span style={{ fontSize: 10, color: "#d97706", fontWeight: 600 }}>⏳ {days} dias</span>}
              </div>
            </div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--green-600)", flexShrink: 0, marginLeft: 8 }}>
              R$ {Number(o.price).toFixed(2)}
            </p>
          </div>
        </button>

        {isLogged && (
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button onClick={() => toggleFavorite(prod)}
              style={{ width: 40, height: 40, borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center", background: fav ? "#e74c3c" : "#f1f5f9", border: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.15)", cursor: "pointer" }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill={fav ? "white" : "none"} stroke={fav ? "white" : "#e74c3c"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <button onClick={() => inList ? removeFromList(o.product_id) : addToList(prod, o.price, market.name)}
              style={{ width: 40, height: 40, borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center", background: inList ? "var(--green-500)" : "#f1f5f9", border: "none", boxShadow: "0 1px 4px rgba(0,0,0,0.15)", cursor: "pointer" }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={inList ? "white" : "var(--green-600)"} strokeWidth="2.5" strokeLinecap="round">
                {inList ? <path d="M5 13l4 4L19 7"/> : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  };

  const FavListRow = ({ item, isFavTab }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-md)", marginBottom: 8 }}>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: "var(--gray-900)" }}>{item.name}</p>
        <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>{item.category || "Sem categoria"}</p>
      </div>
      <button onClick={() => isFavTab ? toggleFavorite(item) : removeFromList(item.id)}
        style={{ width: 34, height: 34, borderRadius: "var(--radius-full)", background: "var(--red-50)", border: "1.5px solid #fca5a5", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="13" height="13" fill="none" stroke="var(--red-400)" strokeWidth="2.5" strokeLinecap="round">
          <path d="M4 4l8 8M12 4l-8 8"/>
        </svg>
      </button>
    </div>
  );

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: "var(--green-600)", padding: "16px 16px 20px" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.8)", fontSize: 13, marginBottom: 12 }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 4l-4 4 4 4"/></svg>
          Voltar ao ranking
        </button>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--white)", marginBottom: 2 }}>{market.name}</p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{market.address || "Campo Mourão - PR"}</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--gray-200)", background: "var(--white)" }}>
        {[
          { id: "offers", label: `Ofertas (${offers.length})` },
          ...(isLogged ? [
            { id: "favorites", label: `❤️ Favoritos (${favorites.length})` },
            { id: "list", label: `🛒 Lista (${list.length})` },
          ] : []),
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ flex: 1, padding: "12px 8px", fontSize: 12, fontWeight: 600, color: tab === t.id ? "var(--green-600)" : "var(--gray-500)", borderBottom: `2px solid ${tab === t.id ? "var(--green-500)" : "transparent"}`, background: "none", whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <svg width="15" height="15" fill="none" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="6" cy="6" r="4"/><path d="M14 14l-3-3"/>
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produto..."
            style={{ width: "100%", padding: "10px 14px 10px 34px", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-md)", fontSize: 14, outline: "none", color: "var(--gray-900)" }}
            onFocus={(e) => e.target.style.borderColor = "var(--green-400)"}
            onBlur={(e) => e.target.style.borderColor = "var(--gray-200)"} />
        </div>

        {loading ? [1,2,3].map((i) => (
          <div key={i} style={{ height: 64, borderRadius: "var(--radius-md)", background: "var(--gray-100)", marginBottom: 10, animation: "pulse 1.2s ease infinite" }} />
        )) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--gray-500)" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>😔</p>
            <p>Nenhum item encontrado.</p>
          </div>
        ) : tab === "offers" ? (
          filtered.map((o, idx) => <OfferRow key={o.id} o={o} idx={idx} />)
        ) : (
          filtered.map((item) => <FavListRow key={item.id} item={item} isFavTab={tab === "favorites"} />)
        )}
      </div>

      <PriceSheet product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  );
}
