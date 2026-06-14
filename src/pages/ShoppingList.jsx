import { useState, useMemo, useEffect } from "react";
import { useList } from "../context/ListContext";
import { useAuth } from "../context/AuthContext";
import { useNav } from "../context/NavContext";
import { api } from "../api";

const categoryColors = {
  "Laticínios": "#3b82f6", "Carnes": "#ef4444", "Bebidas": "#8b5cf6",
  "Padaria": "#f59e0b", "Hortifruti": "#22c55e", "Limpeza": "#06b6d4",
  "Higiene": "#ec4899", "Mercearia": "#f97316", "Frios": "#64748b", "Congelados": "#0ea5e9",
  "Laticínios e Ovos": "#3b82f6", "Carnes e Pescados": "#ef4444", "Limpeza e Lavanderia": "#06b6d4",
  "Higiene e Beleza": "#ec4899",
};

export default function ShoppingList({ setPage }) {
  const { isLogged } = useAuth();
  const { list, favorites, removeFromList, toggleChecked, toggleFavorite, updateQuantity, addToList, isInList, isFavorite } = useList();
  const { goToMarket } = useNav();
  const [tab, setTab] = useState("list");
  const [sortBy, setSortBy] = useState("default");
  const [searchList, setSearchList] = useState("");
  const [searchFav, setSearchFav] = useState("");
  const [activeCatList, setActiveCatList] = useState("Todos");
  const [activeCatFav, setActiveCatFav] = useState("Todos");
  const [simMode, setSimMode] = useState("one");
  const [allOffers, setAllOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);
  const [showSim, setShowSim] = useState(false);

  useEffect(() => {
    if (list.length > 0 && allOffers.length === 0) {
      setLoadingOffers(true);
      api.getOffers("").then(setAllOffers).catch(() => {}).finally(() => setLoadingOffers(false));
    }
  }, [list.length]);

  if (!isLogged) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🛒</p>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)", marginBottom: 8 }}>Faça login para usar esta função</p>
        <p style={{ fontSize: 14, color: "var(--gray-500)", marginBottom: 24 }}>Crie uma conta gratuita para montar sua lista de compras e favoritar produtos.</p>
        <button onClick={() => setPage("login")} style={{ padding: "14px 32px", background: "var(--green-500)", color: "var(--white)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>
          Criar conta / Entrar
        </button>
      </div>
    );
  }

  const checked = list.filter((i) => i.checked).length;

  const listCategories = useMemo(() => {
    const cats = [...new Set(list.map((i) => i.category).filter(Boolean))];
    return ["Todos", ...cats];
  }, [list]);

  const favCategories = useMemo(() => {
    const cats = [...new Set(favorites.map((i) => i.category).filter(Boolean))];
    return ["Todos", ...cats];
  }, [favorites]);

  const filteredList = useMemo(() => {
    return list.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchList.toLowerCase());
      const matchCat = activeCatList === "Todos" || item.category === activeCatList;
      return matchSearch && matchCat;
    });
  }, [list, searchList, activeCatList]);

  const grouped = useMemo(() => {
    const groups = {};
    filteredList.forEach((item) => {
      const market = item.supermarket || "Sem mercado definido";
      if (!groups[market]) groups[market] = [];
      groups[market].push(item);
    });
    return groups;
  }, [filteredList]);

  const total = useMemo(() => {
    return list.reduce((sum, item) => {
      const price = parseFloat(item.cheapestPrice || item.price || 0);
      const qty = item.quantity || 1;
      return sum + (isNaN(price) ? 0 : price * qty);
    }, 0);
  }, [list]);

  const offersByMarket = useMemo(() => {
    const markets = {};
    allOffers.forEach((o) => {
      if (!markets[o.supermarket]) markets[o.supermarket] = {};
      markets[o.supermarket][o.product_id] = Number(o.price);
    });
    return markets;
  }, [allOffers]);

  const marketSimData = useMemo(() => {
    if (!allOffers.length || !list.length) return [];
    return Object.entries(offersByMarket).map(([name, offers]) => {
      let total = 0; let withOffer = 0; let withoutOffer = [];
      list.forEach((item) => {
        const price = offers[item.id];
        const qty = item.quantity || 1;
        if (price) { total += price * qty; withOffer++; }
        else { withoutOffer.push(item); }
      });
      return { name, total, withOffer, withoutOffer, totalItems: list.length };
    })
    .filter((m) => m.withOffer > 0)
    .sort((a, b) => {
      const scoreA = a.withOffer / a.totalItems;
      const scoreB = b.withOffer / b.totalItems;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return a.total - b.total;
    });
  }, [allOffers, list, offersByMarket]);

  const bestSplit = useMemo(() => {
    if (marketSimData.length < 2 || !allOffers.length) return null;
    const m1 = marketSimData[0];
    const m2 = marketSimData[1];
    const offers1 = offersByMarket[m1.name] || {};
    const offers2 = offersByMarket[m2.name] || {};
    const m1Items = []; const m2Items = [];
    const bothItems1 = []; const bothItems2 = [];
    const neitherItems = [];
    let total1 = 0; let total2 = 0;
    list.forEach((item) => {
      const price1 = offers1[item.id];
      const price2 = offers2[item.id];
      const qty = item.quantity || 1;
      if (price1 && price2) {
        if (price1 <= price2) { bothItems1.push({ ...item, splitPrice: price1 }); total1 += price1 * qty; }
        else { bothItems2.push({ ...item, splitPrice: price2 }); total2 += price2 * qty; }
      } else if (price1) {
        m1Items.push({ ...item, splitPrice: price1 }); total1 += price1 * qty;
      } else if (price2) {
        m2Items.push({ ...item, splitPrice: price2 }); total2 += price2 * qty;
      } else {
        neitherItems.push(item);
      }
    });
    return { m1: { ...m1, splitItems: [...m1Items, ...bothItems1], splitTotal: total1 }, m2: { ...m2, splitItems: [...m2Items, ...bothItems2], splitTotal: total2 }, neitherItems, totalSplit: total1 + total2 };
  }, [marketSimData, list, offersByMarket]);

  const filteredFavorites = useMemo(() => {
    let arr = favorites.filter((item) => {
      const matchSearch = item.name.toLowerCase().includes(searchFav.toLowerCase());
      const matchCat = activeCatFav === "Todos" || item.category === activeCatFav;
      return matchSearch && matchCat;
    });
    if (sortBy === "name") arr = arr.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "price") arr = arr.sort((a, b) => (parseFloat(a.cheapestPrice) || 0) - (parseFloat(b.cheapestPrice) || 0));
    if (sortBy === "category") arr = arr.sort((a, b) => (a.category || "").localeCompare(b.category || ""));
    return arr;
  }, [favorites, searchFav, activeCatFav, sortBy]);

  const chipStyle = (active, color) => ({
    padding: "6px 14px", borderRadius: "var(--radius-full)", fontSize: 12, fontWeight: 600,
    whiteSpace: "nowrap", border: "none", cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
    background: active ? (color || "var(--green-500)") : "var(--gray-100)",
    color: active ? "var(--white)" : "var(--gray-600)",
  });

  const searchBarStyle = {
    width: "100%", padding: "10px 14px 10px 38px", borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--gray-200)", fontSize: 14, background: "var(--white)",
    color: "var(--gray-900)", outline: "none", boxSizing: "border-box",
  };

  const SearchIcon = () => (
    <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="16" height="16" fill="none" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round">
      <circle cx="7" cy="7" r="5"/><path d="M12 12l3 3"/>
    </svg>
  );

  const ClearBtn = ({ onClick }) => (
    <button onClick={onClick} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "var(--gray-200)", border: "none", borderRadius: "var(--radius-full)", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
      <svg width="10" height="10" fill="none" stroke="var(--gray-600)" strokeWidth="2.5" strokeLinecap="round"><path d="M2 2l6 6M8 2l-6 6"/></svg>
    </button>
  );

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: "var(--green-600)", padding: "20px 16px 24px" }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--white)", marginBottom: 4 }}>
          {tab === "list" ? "Minha lista 🛒" : "Favoritos ❤️"}
        </p>
        {tab === "list" && list.length > 0 && (
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
            {checked} de {list.length} item{list.length !== 1 ? "s" : ""} marcado{checked !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--gray-100)", margin: "16px 16px 0", borderRadius: "var(--radius-md)", padding: 4 }}>
        {[{ id: "list", label: `Lista (${list.length})` }, { id: "favorites", label: `Favoritos (${favorites.length})` }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: "10px", borderRadius: "var(--radius-sm)", fontWeight: 600, fontSize: 14, background: tab === t.id ? "var(--white)" : "transparent", color: tab === t.id ? "var(--green-600)" : "var(--gray-500)", boxShadow: tab === t.id ? "var(--shadow-sm)" : "none", transition: "all 0.2s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "list" ? (
        <div style={{ padding: "12px 16px" }}>
          {list.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--gray-500)" }}>
              <p style={{ fontSize: 36, marginBottom: 10 }}>🛒</p>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>Sua lista está vazia</p>
              <p style={{ fontSize: 13 }}>Adicione produtos ao navegar pelas ofertas.</p>
              <button onClick={() => setPage("home")} style={{ marginTop: 20, padding: "12px 28px", background: "var(--green-500)", color: "var(--white)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-display)", fontWeight: 700 }}>Ver ofertas</button>
            </div>
          ) : (
            <>
              {/* SIMULADOR */}
              <div style={{ borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
                <button onClick={() => setShowSim(!showSim)} style={{ width: "100%", border: "none", cursor: "pointer", padding: 0, display: "block" }}>
                  <div style={{ background: "#166634", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, textAlign: "left", marginLeft: 12 }}>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "white", margin: 0 }}>Onde comprar?</p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: "2px 0 0" }}>
                        {loadingOffers ? "Calculando..." : marketSimData.length > 0 ? `${marketSimData.length} mercados analisados` : "Toque para analisar"}
                      </p>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, padding: "4px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>{showSim ? "Fechar" : "Ver"}</span>
                      <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ transform: showSim ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                        <path d="M2 4l5 5 5-5"/>
                      </svg>
                    </div>
                  </div>
                  <div style={{ background: "#14532d", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "white", margin: 0 }}>
                        {total > 0 ? `R$ ${total.toFixed(2)}` : "—"}
                      </p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", margin: "1px 0 0" }}>melhor estimativa</p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: 0 }}>{list.length}</p>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", margin: 0 }}>itens</p>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 8, padding: "6px 10px", textAlign: "center" }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: 0 }}>{marketSimData.length || "—"}</p>
                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", margin: 0 }}>mercados</p>
                      </div>
                    </div>
                  </div>
                </button>

                {showSim && (
                  <div style={{ background: "var(--green-50)", border: "1.5px solid var(--green-300)", borderTop: "none", borderRadius: "0 0 14px 14px", padding: "14px" }}>
                    <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
                      {[{ id: "one", label: "1 mercado", icon: "🏪" }, { id: "two", label: "Dividir em 2", icon: "✂️" }].map((m) => (
                        <button key={m.id} onClick={() => setSimMode(m.id)}
                          style={{ flex: 1, padding: "8px 4px", borderRadius: "var(--radius-md)", border: `1.5px solid ${simMode === m.id ? "var(--green-500)" : "var(--gray-200)"}`, background: simMode === m.id ? "var(--green-500)" : "var(--white)", color: simMode === m.id ? "var(--white)" : "var(--gray-600)", fontSize: 11, fontWeight: 600, cursor: "pointer", textAlign: "center" }}>
                          <span style={{ display: "block", fontSize: 14, marginBottom: 2 }}>{m.icon}</span>
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {loadingOffers ? (
                      <div style={{ textAlign: "center", padding: "20px 0", color: "var(--gray-400)" }}><p style={{ fontSize: 13 }}>Analisando mercados...</p></div>
                    ) : marketSimData.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "16px 0", color: "var(--gray-400)" }}><p style={{ fontSize: 13 }}>Nenhum dado de oferta encontrado.</p></div>
                    ) : (
                      <>
                        {simMode === "one" && (
                          <div>
                            {marketSimData.slice(0, 4).map((m, idx) => (
                              <div key={m.name} style={{ background: idx === 0 ? "#f0fdf4" : "var(--white)", border: `1.5px solid ${idx === 0 ? "var(--green-300)" : "var(--gray-200)"}`, borderRadius: "var(--radius-md)", padding: "12px 14px", marginBottom: 8, cursor: "pointer" }} onClick={() => goToMarket({ name: m.name, initialTab: "list", _ts: Date.now() })}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 18 }}>{["🥇","🥈","🥉","4️⃣"][idx]}</span>
                                    <div>
                                      <p style={{ fontWeight: 700, fontSize: 14, color: "var(--gray-900)", margin: 0 }}>{m.name}</p>
                                      <p style={{ fontSize: 11, color: "var(--gray-500)", margin: 0 }}>{m.withOffer} de {m.totalItems} itens em oferta</p>
                                    </div>
                                  </div>
                                  <div style={{ textAlign: "right" }}>
                                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: idx === 0 ? "var(--green-600)" : "var(--gray-700)", margin: 0 }}>R$ {m.total.toFixed(2)}</p>
                                    {idx > 0 && <p style={{ fontSize: 11, color: "var(--gray-400)", margin: 0 }}>+R$ {(m.total - marketSimData[0].total).toFixed(2)}</p>}
                                    {idx === 0 && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green-700)", background: "var(--green-100)", borderRadius: "var(--radius-full)", padding: "2px 8px" }}>melhor opção</span>}
                                  </div>
                                </div>
                                <div style={{ display: "flex", gap: 6 }}>
                                  <span style={{ fontSize: 11, color: "#166534", background: "#dcfce7", borderRadius: "var(--radius-full)", padding: "2px 8px", fontWeight: 600 }}>✓ {m.withOffer} com oferta</span>
                                  {m.withoutOffer.length > 0 && <span style={{ fontSize: 11, color: "#92400e", background: "#fef3c7", borderRadius: "var(--radius-full)", padding: "2px 8px", fontWeight: 600 }}>⚠️ {m.withoutOffer.length} sem oferta</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {simMode === "two" && bestSplit && (
                          <div>
                            <div style={{ background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: "var(--radius-md)", padding: "10px 12px", marginBottom: 12 }}>
                              <p style={{ fontSize: 13, fontWeight: 700, color: "#1e3a8a", margin: "0 0 2px" }}>✨ Divisão inteligente</p>
                              <p style={{ fontSize: 12, color: "#1d4ed8", margin: 0 }}>
                                Total estimado: R$ {bestSplit.totalSplit.toFixed(2)} · {bestSplit.neitherItems.length > 0 ? `⚠️ ${bestSplit.neitherItems.length} sem oferta em nenhum` : "✓ Todos cobertos"}
                              </p>
                            </div>

                            {[{ market: bestSplit.m1, num: 1 }, { market: bestSplit.m2, num: 2 }].map(({ market, num }) => (
                              <div key={market.name} style={{ background: "var(--white)", border: "1.5px solid var(--green-300)", borderRadius: "var(--radius-lg)", marginBottom: 10, overflow: "hidden" }}>
                                <div style={{ background: "var(--green-600)", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => goToMarket({ name: market.name, initialTab: "list" })}>
                                  <div>
                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0 }}>Parada {num}</p>
                                    <p style={{ fontWeight: 700, fontSize: 14, color: "white", margin: 0 }}>{market.name}</p>
                                  </div>
                                  <div style={{ textAlign: "right" }}>
                                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "white", margin: 0 }}>R$ {market.splitTotal.toFixed(2)}</p>
                                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", margin: 0 }}>{market.splitItems.length} itens</p>
                                  </div>
                                </div>
                                <div style={{ padding: "8px 14px" }}>
                                  {market.splitItems.map((item) => {
                                    const fav = isFavorite(item.id);
                                    return (
                                      <div key={item.id} style={{ background: "var(--white)", border: "1.5px solid var(--gray-200)", borderLeft: "4px solid var(--green-500)", borderRadius: "var(--radius-lg)", marginBottom: 8, overflow: "hidden" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
                                          {item.image_url ? (
                                            <img src={item.image_url} alt={item.name} style={{ width: 46, height: 46, borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }} onError={(e) => { e.target.style.display = "none"; }} />
                                          ) : (
                                            <div style={{ width: 46, height: 46, borderRadius: "var(--radius-md)", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>🛍️</div>
                                          )}
                                          <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 700, fontSize: 14, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>{item.name}</p>
                                            <p style={{ fontSize: 11, color: "var(--gray-400)", margin: "2px 0 0" }}>{item.brand || "Sem marca"}</p>
                                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--green-600)", margin: "4px 0 0" }}>R$ {Number(item.splitPrice).toFixed(2)}</p>
                                          </div>
                                          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                            <button onClick={() => toggleFavorite(item)} style={{ width: 30, height: 30, borderRadius: "var(--radius-full)", background: fav ? "#e74c3c" : "#fff1f2", border: `1.5px solid ${fav ? "#e74c3c" : "#fca5a5"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                              <svg viewBox="0 0 24 24" width="13" height="13" fill={fav ? "white" : "none"} stroke={fav ? "white" : "#f87171"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                                            </button>
                                            <button onClick={() => removeFromList(item.id)} style={{ width: 30, height: 30, borderRadius: "var(--radius-full)", background: "#fff1f2", border: "1.5px solid #fca5a5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                              <svg width="11" height="11" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"><path d="M2 2l7 7M9 2l-7 7"/></svg>
                                            </button>
                                          </div>
                                        </div>
                                        <div style={{ borderTop: "1px solid var(--gray-100)", padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--gray-50)" }}>
                                          <p style={{ fontSize: 12, color: "var(--gray-500)", fontWeight: 500, margin: 0 }}>Quantidade</p>
                                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                            <button onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))} style={{ width: 28, height: 28, borderRadius: "var(--radius-full)", border: "1.5px solid var(--gray-300)", background: "var(--white)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "var(--gray-600)", cursor: "pointer" }}>−</button>
                                            <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--gray-900)", minWidth: 20, textAlign: "center" }}>{item.quantity || 1}</span>
                                            <button onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)} style={{ width: 28, height: 28, borderRadius: "var(--radius-full)", border: "1.5px solid var(--green-400)", background: "var(--green-500)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "var(--white)", cursor: "pointer" }}>+</button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  {market.splitItems.length === 0 && (
                                    <p style={{ fontSize: 12, color: "var(--gray-400)", textAlign: "center", padding: "8px 0" }}>Nenhum item para este mercado</p>
                                  )}
                                </div>
                              </div>
                            ))}

                            {bestSplit.neitherItems.length > 0 && (
                              <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "var(--radius-md)", padding: "10px 12px" }}>
                                <p style={{ fontSize: 12, color: "#92400e", fontWeight: 700, margin: "0 0 6px" }}>⚠️ Sem oferta nos 2 mercados ({bestSplit.neitherItems.length})</p>
                                {bestSplit.neitherItems.map((item) => (
                                  <p key={item.id} style={{ fontSize: 12, color: "#92400e", margin: "2px 0" }}>• {item.name}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div style={{ position: "relative", marginBottom: 10 }}>
                <SearchIcon />
                <input type="text" placeholder="Buscar na lista..." value={searchList} onChange={(e) => setSearchList(e.target.value)} style={searchBarStyle} />
                {searchList && <ClearBtn onClick={() => setSearchList("")} />}
              </div>

              {listCategories.length > 1 && (
                <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 10, scrollbarWidth: "none" }}>
                  {listCategories.map((cat) => (
                    <button key={cat} onClick={() => setActiveCatList(cat)} style={chipStyle(activeCatList === cat, categoryColors[cat])}>
                      {cat === "Todos" ? "🛒 Todos" : cat}
                    </button>
                  ))}
                </div>
              )}

              {total > 0 && (
                <div style={{ background: "var(--green-50)", border: "1px solid var(--green-200)", borderRadius: "var(--radius-lg)", padding: "14px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14, color: "var(--green-700)", margin: 0 }}>💰 Total estimado</p>
                    {(searchList || activeCatList !== "Todos") && <p style={{ fontSize: 11, color: "var(--green-500)", marginTop: 2 }}>Mostrando {filteredList.length} de {list.length} itens</p>}
                  </div>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--green-600)", margin: 0 }}>R$ {total.toFixed(2)}</p>
                </div>
              )}

              {filteredList.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 0", color: "var(--gray-400)" }}>
                  <p style={{ fontSize: 28, marginBottom: 8 }}>🔍</p>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>Nenhum item encontrado</p>
                </div>
              )}

              {Object.entries(grouped).map(([market, items]) => {
                const marketChecked = items.filter(i => i.checked).length;
                const allChecked = marketChecked === items.length;
                const marketTotal = items.reduce((sum, i) => sum + (Number(i.cheapestPrice || 0) * (i.quantity || 1)), 0);
                return (
                  <div key={market} style={{ marginBottom: 24 }}>
                    <div style={{ background: "var(--green-700)", borderRadius: "var(--radius-lg)", padding: "12px 16px", marginBottom: 10, display: "flex", alignItems: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                      <span style={{ fontSize: 20, marginRight: 10 }}>🏪</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16, color: "white", margin: 0 }}>{market}</p>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", margin: "2px 0 0" }}>
                          {marketChecked}/{items.length} itens marcados · R$ {marketTotal.toFixed(2)}
                        </p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: "white", background: "rgba(255,255,255,0.2)", borderRadius: "var(--radius-full)", padding: "3px 10px", fontWeight: 700 }}>
                          {marketChecked}/{items.length}
                        </span>
                        <button onClick={() => items.forEach(i => { if (allChecked || !i.checked) toggleChecked(i.id); })}
                          style={{ fontSize: 11, fontWeight: 700, color: "var(--green-700)", background: "white", border: "none", borderRadius: "var(--radius-full)", padding: "4px 10px", cursor: "pointer" }}>
                          {allChecked ? "Desmarcar" : "Marcar todos"}
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {items.map((item) => {
                        const fav = isFavorite(item.id);
                        return (
                          <div key={item.id} style={{ background: "var(--white)", border: `1.5px solid ${item.checked ? "var(--green-200)" : "var(--gray-200)"}`, borderRadius: "var(--radius-lg)", overflow: "hidden", opacity: item.checked ? 0.65 : 1, transition: "all 0.2s", boxShadow: item.checked ? "none" : "var(--shadow-sm)", marginLeft: 8, borderLeft: "4px solid var(--green-400)" }}>
                            <div style={{ display: "flex", gap: 12, padding: "12px 14px", alignItems: "center" }}>
                              <button onClick={() => toggleChecked(item.id)}
                                style={{ width: 26, height: 26, borderRadius: "var(--radius-full)", border: `2px solid ${item.checked ? "var(--green-500)" : "var(--gray-300)"}`, background: item.checked ? "var(--green-500)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
                                {item.checked && <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>}
                              </button>
                              {item.image_url ? (
                                <img src={item.image_url} alt={item.name} style={{ width: 54, height: 54, borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }} onError={(e) => { e.target.style.display = "none"; }} />
                              ) : (
                                <div style={{ width: 54, height: 54, borderRadius: "var(--radius-md)", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>🛍️</div>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                {item.category && (
                                  <span style={{ fontSize: 10, fontWeight: 700, color: "white", background: categoryColors[item.category] || "var(--green-500)", borderRadius: "var(--radius-full)", padding: "1px 7px", marginBottom: 4, display: "inline-block" }}>{item.category}</span>
                                )}
                                <p style={{ fontWeight: 700, fontSize: 14, color: "var(--gray-900)", textDecoration: item.checked ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>{item.name}</p>
                                <p style={{ fontSize: 11, color: "var(--gray-400)", margin: "2px 0 0" }}>{item.brand || "Sem marca"}</p>
                                {item.cheapestPrice && (
                                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--green-600)", margin: "4px 0 0" }}>
                                    R$ {(Number(item.cheapestPrice) * (item.quantity || 1)).toFixed(2)}
                                    {(item.quantity || 1) > 1 && <span style={{ fontSize: 11, fontWeight: 400, color: "var(--gray-400)", marginLeft: 4 }}>({Number(item.cheapestPrice).toFixed(2)} un.)</span>}
                                  </p>
                                )}
                              </div>
                              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                <button onClick={() => toggleFavorite(item)} style={{ width: 30, height: 30, borderRadius: "var(--radius-full)", background: fav ? "#e74c3c" : "#fff1f2", border: `1.5px solid ${fav ? "#e74c3c" : "#fca5a5"}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                  <svg viewBox="0 0 24 24" width="13" height="13" fill={fav ? "white" : "none"} stroke={fav ? "white" : "#f87171"} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                                </button>
                                <button onClick={() => removeFromList(item.id)} style={{ width: 30, height: 30, borderRadius: "var(--radius-full)", background: "#fff1f2", border: "1.5px solid #fca5a5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                                  <svg width="12" height="12" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
                                </button>
                              </div>
                            </div>
                            <div style={{ borderTop: "1px solid var(--gray-100)", padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--gray-50)" }}>
                              <p style={{ fontSize: 12, color: "var(--gray-500)", fontWeight: 500, margin: 0 }}>Quantidade</p>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <button onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                                  style={{ width: 28, height: 28, borderRadius: "var(--radius-full)", border: "1.5px solid var(--gray-300)", background: "var(--white)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "var(--gray-600)", cursor: "pointer" }}>−</button>
                                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--gray-900)", minWidth: 20, textAlign: "center" }}>{item.quantity || 1}</span>
                                <button onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                                  style={{ width: 28, height: 28, borderRadius: "var(--radius-full)", border: "1.5px solid var(--green-400)", background: "var(--green-500)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "var(--white)", cursor: "pointer" }}>+</button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {checked > 0 && (
                <button onClick={() => list.filter((i) => i.checked).forEach((i) => removeFromList(i.id))}
                  style={{ width: "100%", marginTop: 8, padding: "12px", border: "1.5px dashed var(--gray-300)", borderRadius: "var(--radius-md)", color: "var(--gray-500)", fontSize: 14, fontWeight: 600, cursor: "pointer", background: "transparent" }}>
                  🗑️ Limpar itens marcados ({checked})
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div style={{ padding: "12px 16px" }}>
          {favorites.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--gray-500)" }}>
              <p style={{ fontSize: 36, marginBottom: 10 }}>❤️</p>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>Nenhum favorito ainda</p>
              <p style={{ fontSize: 13 }}>Toque no coração em qualquer produto para favoritar.</p>
              <button onClick={() => setPage("home")} style={{ marginTop: 20, padding: "12px 28px", background: "var(--green-500)", color: "var(--white)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-display)", fontWeight: 700 }}>Ver ofertas</button>
            </div>
          ) : (
            <>
              <div style={{ position: "relative", marginBottom: 10 }}>
                <SearchIcon />
                <input type="text" placeholder="Buscar favoritos..." value={searchFav} onChange={(e) => setSearchFav(e.target.value)} style={searchBarStyle} />
                {searchFav && <ClearBtn onClick={() => setSearchFav("")} />}
              </div>
              {favCategories.length > 1 && (
                <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 10, scrollbarWidth: "none" }}>
                  {favCategories.map((cat) => (
                    <button key={cat} onClick={() => setActiveCatFav(cat)} style={chipStyle(activeCatFav === cat, categoryColors[cat])}>
                      {cat === "Todos" ? "❤️ Todos" : cat}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
                <span style={{ fontSize: 12, color: "var(--gray-400)", fontWeight: 600, alignSelf: "center", flexShrink: 0 }}>Ordenar:</span>
                {[{ id: "default", label: "Padrão" }, { id: "name", label: "A-Z" }, { id: "price", label: "Menor preço" }, { id: "category", label: "Categoria" }].map((s) => (
                  <button key={s.id} onClick={() => setSortBy(s.id)} style={chipStyle(sortBy === s.id)}>{s.label}</button>
                ))}
              </div>
              {filteredFavorites.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 0", color: "var(--gray-400)" }}>
                  <p style={{ fontSize: 28, marginBottom: 8 }}>🔍</p>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>Nenhum favorito encontrado</p>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {filteredFavorites.map((item, idx) => {
                  const inList = isInList(item.id);
                  const catColor = categoryColors[item.category] || "var(--green-500)";
                  return (
                    <div key={item.id} style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)", display: "flex", flexDirection: "column", animation: "fadeUp 0.25s ease both", animationDelay: `${idx * 0.04}s` }}>
                      <div style={{ position: "relative", width: "100%", paddingTop: "70%", overflow: "hidden", background: "var(--gray-50)" }}>
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
                        ) : (
                          <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>🛍️</div>
                        )}
                        <span style={{ position: "absolute", top: 6, left: 6, background: catColor, color: "white", fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: "var(--radius-full)" }}>{item.category || "Geral"}</span>
                        <button onClick={() => toggleFavorite(item)} style={{ position: "absolute", top: 6, right: 6, width: 28, height: 28, borderRadius: "var(--radius-full)", background: "white", border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.15)", cursor: "pointer" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#f87171" stroke="#f87171" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        </button>
                      </div>
                      <div style={{ padding: "10px 10px 6px", flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: 13, color: "var(--gray-900)", marginBottom: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{item.name}</p>
                        <p style={{ fontSize: 11, color: "var(--gray-400)", marginBottom: 4 }}>{item.brand || "Sem marca"}</p>
                        {item.cheapestPrice && (
                          <div>
                            <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--green-600)", margin: 0 }}>R$ {Number(item.cheapestPrice).toFixed(2)}</p>
                            {item.supermarket && <p style={{ fontSize: 10, color: "var(--gray-400)", marginTop: 1 }}>📍 {item.supermarket}</p>}
                          </div>
                        )}
                      </div>
                      <button onClick={() => inList ? removeFromList(item.id) : addToList(item, item.cheapestPrice, item.supermarket)}
                        style={{ margin: "0 10px 10px", padding: "8px", borderRadius: "var(--radius-md)", background: inList ? "var(--green-500)" : "var(--green-50)", border: `1.5px solid ${inList ? "var(--green-500)" : "var(--green-300)"}`, color: inList ? "white" : "var(--green-700)", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer" }}>
                        {inList ? <><svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg> Na lista ✓</> : <><svg width="12" height="12" fill="none" stroke="var(--green-700)" strokeWidth="2.5" strokeLinecap="round"><line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg> Adicionar à lista</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}