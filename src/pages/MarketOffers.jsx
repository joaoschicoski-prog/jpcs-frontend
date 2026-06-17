import { useEffect, useState, useMemo, useRef } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useList } from "../context/ListContext";
import { useNav } from "../context/NavContext";

const categoryColors = {
  "Laticínios": "#3b82f6", "Carnes": "#ef4444", "Bebidas": "#8b5cf6",
  "Padaria": "#f59e0b", "Hortifruti": "#22c55e", "Limpeza": "#06b6d4",
  "Higiene": "#ec4899", "Mercearia": "#f97316", "Frios": "#64748b", "Congelados": "#0ea5e9",
  "Laticínios e Ovos": "#3b82f6", "Carnes e Pescados": "#ef4444", "Limpeza e Lavanderia": "#06b6d4",
  "Higiene e Beleza": "#ec4899",
};

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const end = new Date(dateStr); end.setHours(0,0,0,0);
  return Math.round((end - today) / (1000 * 60 * 60 * 24));
}

export default function MarketOffers({ market, onBack, initialTab }) {
  const { isLogged } = useAuth();
  const { isInList, addToList, removeFromList, updateQuantity, list, manualItems, addManualItem, removeManualItem, toggleManualChecked, updateManualQuantity, clearAll } = useList();
  const { goToProduct } = useNav();
  const [offers, setOffers] = useState([]);
  const [allProducts, setAllProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [activeTab, setActiveTab] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [newItem, setNewItem] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const inputRef = useRef(null);

  const tab = activeTab !== null ? activeTab : (initialTab || "offers");

  useEffect(() => {
    if (!market) return;
    setActiveCategory(market.filterCategory || "Todos");
    setSearch(""); setCheckedItems({}); setActiveTab(null); setLoading(true);
    Promise.all([api.getOffers(""), api.getProducts()]).then(([all, prods]) => {
      setOffers(all.filter((o) => o.supermarket === market.name));
      const map = {}; prods.forEach((p) => { map[p.id] = p; }); setAllProducts(map);
    }).finally(() => setLoading(false));
  }, [market?.name, market?._ts]);

  const offerCategories = useMemo(() => {
    const cats = [...new Set(offers.map((o) => allProducts[o.product_id]?.category).filter(Boolean))];
    return ["Todos", ...cats];
  }, [offers, allProducts]);

  const offersByProductId = useMemo(() => {
    const map = {}; offers.forEach((o) => { map[o.product_id] = o; }); return map;
  }, [offers]);

  const listWithOffers = useMemo(() => list.filter((i) => offersByProductId[i.id]), [list, offersByProductId]);
  const listWithoutOffers = useMemo(() => list.filter((i) => !offersByProductId[i.id]), [list, offersByProductId]);

  const listTotal = useMemo(() => {
    return listWithOffers.reduce((sum, item) => {
      const offer = offersByProductId[item.id];
      return sum + (Number(offer?.price || 0) * (item.quantity || 1));
    }, 0);
  }, [listWithOffers, offersByProductId]);

  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      const matchSearch = (o.product || "").toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === "Todos" || allProducts[o.product_id]?.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [offers, search, activeCategory, allProducts]);

  const toggleCheck = (id) => setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleAddManual = () => {
    if (!newItem.trim()) return;
    addManualItem(newItem);
    setNewItem("");
    inputRef.current?.focus();
  };

  const OfferRow = ({ o, idx }) => {
    const prod = allProducts[o.product_id] || { id: o.product_id, name: o.product };
    const inList = isInList(o.product_id);
    const days = getDaysUntil(o.valid_until);
    const urgent = days !== null && days <= 1;
    const warning = days !== null && days > 1 && days <= 3;
    const hasDiscount = o.original_price && Number(o.original_price) > Number(o.price);
    const catColor = categoryColors[prod?.category] || "var(--green-400)";

    return (
      <div style={{ background: "var(--white)", border: `1.5px solid ${urgent ? "#f97316" : warning ? "#fbbf24" : "var(--gray-200)"}`, borderRadius: "var(--radius-lg)", marginBottom: 8, overflow: "hidden", animation: "fadeUp 0.25s ease both", animationDelay: `${idx*0.04}s`, boxShadow: "var(--shadow-sm)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px" }}>
          {prod?.image_url ? (
            <img src={prod.image_url} alt={o.product} style={{ width: 52, height: 52, borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }} onError={(e) => { e.target.style.display="none"; }} />
          ) : (
            <div style={{ width: 52, height: 52, borderRadius: "var(--radius-md)", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>🛍️</div>
          )}
          <button onClick={() => goToProduct(prod)} style={{ flex: 1, textAlign: "left", background: "none", minWidth: 0, border: "none", cursor: "pointer" }}>
            {prod?.category && <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, color: "white", background: catColor, borderRadius: "var(--radius-full)", padding: "1px 7px", marginBottom: 3 }}>{prod.category}</span>}
            <p style={{ fontWeight: 700, fontSize: 14, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>{o.product}</p>
            <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 2, flexWrap: "wrap" }}>
              {o.valid_until && <p style={{ fontSize: 11, color: "var(--gray-400)", margin: 0 }}>Até {new Date(o.valid_until).toLocaleDateString("pt-BR")}</p>}
              {urgent && <span style={{ fontSize: 10, color: "#f97316", fontWeight: 700 }}>⚡ Acaba hoje!</span>}
              {warning && <span style={{ fontSize: 10, color: "#d97706", fontWeight: 600 }}>⏳ {days} dias</span>}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
              {hasDiscount && <span style={{ fontSize: 12, color: "var(--gray-400)", textDecoration: "line-through" }}>R$ {Number(o.original_price).toFixed(2)}</span>}
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17, color: hasDiscount ? "#ef4444" : "var(--green-600)" }}>R$ {Number(o.price).toFixed(2)}</span>
              {hasDiscount && o.discount_pct && <span style={{ fontSize: 10, fontWeight: 700, color: "white", background: "#ef4444", borderRadius: "var(--radius-full)", padding: "1px 6px" }}>-{o.discount_pct}%</span>}
            </div>
          </button>
          {isLogged && (
            <button onClick={() => inList ? removeFromList(o.product_id) : addToList(prod, o.price, market.name)}
              style={{ width: 36, height: 36, borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center", background: inList ? "var(--green-500)" : "#f1f5f9", border: "none", cursor: "pointer", flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={inList ? "white" : "var(--green-600)"} strokeWidth="2.5" strokeLinecap="round">
                {inList ? <path d="M5 13l4 4L19 7"/> : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  };

  const ListTab = () => {
    const checkedCount = listWithOffers.filter((i) => checkedItems[i.id]).length;
    const manualChecked = manualItems.filter((i) => i.checked).length;

    return (
      <div>
        {list.length === 0 && manualItems.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--gray-400)" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>🛒</p>
            <p>Sua lista está vazia.</p>
          </div>
        ) : (
          <>
            {list.length > 0 && (
              <>
                <div style={{ background: "var(--green-50)", border: "1px solid var(--green-200)", borderRadius: "var(--radius-lg)", padding: "12px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, color: "var(--green-700)", margin: 0 }}>💰 Total estimado neste mercado</p>
                    <p style={{ fontSize: 11, color: "var(--green-600)", margin: "2px 0 0" }}>{checkedCount} de {listWithOffers.length} itens marcados</p>
                  </div>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--green-600)", margin: 0 }}>R$ {listTotal.toFixed(2)}</p>
                </div>

                {listWithOffers.length > 0 && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "var(--radius-full)", background: "var(--green-500)", flexShrink: 0 }} />
                      <p style={{ fontSize: 12, fontWeight: 700, color: "var(--green-700)", margin: 0 }}>Em oferta neste mercado ({listWithOffers.length})</p>
                    </div>
                    {listWithOffers.filter((i) => (i.name || "").toLowerCase().includes(search.toLowerCase())).map((item) => {
                      const offer = offersByProductId[item.id];
                      const checked = checkedItems[item.id];
                      return (
                        <div key={item.id} style={{ background: checked ? "var(--green-50)" : "var(--white)", border: `1.5px solid ${checked ? "var(--green-300)" : "var(--green-200)"}`, borderLeft: "4px solid var(--green-500)", borderRadius: "var(--radius-lg)", marginBottom: 8, overflow: "hidden", opacity: checked ? 0.7 : 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
                            <button onClick={() => toggleCheck(item.id)} style={{ width: 26, height: 26, borderRadius: "var(--radius-full)", border: `2px solid ${checked ? "var(--green-500)" : "var(--gray-300)"}`, background: checked ? "var(--green-500)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
                              {checked && <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>}
                            </button>
                            {item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: 46, height: 46, borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }} onError={(e) => { e.target.style.display="none"; }} /> : <div style={{ width: 46, height: 46, borderRadius: "var(--radius-md)", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>🛍️</div>}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--gray-900)", textDecoration: checked ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>{item.name}</p>
                              <p style={{ fontSize: 11, color: "var(--gray-400)", margin: "2px 0 0" }}>{item.brand || "Sem marca"}</p>
                              <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--green-600)", margin: "4px 0 0" }}>R$ {Number(offer?.price || 0).toFixed(2)}</p>
                            </div>
                            <button onClick={() => removeFromList(item.id)} style={{ width: 28, height: 28, borderRadius: "var(--radius-full)", background: "#fff1f2", border: "1.5px solid #fca5a5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
                              <svg width="11" height="11" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"><path d="M2 2l7 7M9 2l-7 7"/></svg>
                            </button>
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
                  </>
                )}

                {listWithoutOffers.length > 0 && (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 10px" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "var(--radius-full)", background: "#f59e0b", flexShrink: 0 }} />
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#92400e", margin: 0 }}>Sem oferta neste mercado ({listWithoutOffers.length})</p>
                    </div>
                    <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "var(--radius-md)", padding: "10px 12px", marginBottom: 12 }}>
                      <p style={{ fontSize: 12, color: "#92400e", margin: 0 }}>💡 Estes produtos podem estar disponíveis no mercado mas sem oferta cadastrada. Verifique o preço no local.</p>
                    </div>
                    {listWithoutOffers.filter((i) => (i.name || "").toLowerCase().includes(search.toLowerCase())).map((item) => {
                      const checked = checkedItems[item.id];
                      return (
                        <div key={item.id} style={{ background: checked ? "#fffbeb" : "var(--white)", border: `1.5px solid ${checked ? "#fcd34d" : "var(--gray-200)"}`, borderLeft: "4px solid #f59e0b", borderRadius: "var(--radius-lg)", marginBottom: 8, overflow: "hidden", opacity: checked ? 0.7 : 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px" }}>
                            <button onClick={() => toggleCheck(item.id)} style={{ width: 26, height: 26, borderRadius: "var(--radius-full)", border: `2px solid ${checked ? "#f59e0b" : "var(--gray-300)"}`, background: checked ? "#f59e0b" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
                              {checked && <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>}
                            </button>
                            {item.image_url ? <img src={item.image_url} alt={item.name} style={{ width: 46, height: 46, borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }} onError={(e) => { e.target.style.display="none"; }} /> : <div style={{ width: 46, height: 46, borderRadius: "var(--radius-md)", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>🛍️</div>}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontWeight: 700, fontSize: 14, color: "var(--gray-900)", textDecoration: checked ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>{item.name}</p>
                              <p style={{ fontSize: 11, color: "var(--gray-400)", margin: "2px 0 0" }}>{item.brand || "Sem marca"}</p>
                              <p style={{ fontSize: 11, color: "#d97706", margin: "4px 0 0", fontWeight: 600 }}>⚠️ Sem oferta cadastrada</p>
                            </div>
                            <button onClick={() => removeFromList(item.id)} style={{ width: 28, height: 28, borderRadius: "var(--radius-full)", background: "#fff1f2", border: "1.5px solid #fca5a5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
                              <svg width="11" height="11" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"><path d="M2 2l7 7M9 2l-7 7"/></svg>
                            </button>
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
                  </>
                )}
              </>
            )}

            {/* OUTROS ITENS */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "20px 0 10px" }}>
              <div style={{ width: 10, height: 10, borderRadius: "var(--radius-full)", background: "var(--gray-400)", flexShrink: 0 }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-600)", margin: 0 }}>Outros itens ({manualItems.length})</p>
            </div>

            <div style={{ background: "var(--white)", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-lg)", padding: "12px 14px", marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddManual()}
                  placeholder="Ex: Ovos, leite, queijo..."
                  style={{ flex: 1, padding: "10px 12px", borderRadius: "var(--radius-md)", border: "1.5px solid var(--gray-200)", fontSize: 14, color: "var(--gray-900)", outline: "none", background: "var(--white)" }}
                />
                <button onClick={handleAddManual}
                  style={{ padding: "10px 16px", background: "var(--green-500)", border: "none", borderRadius: "var(--radius-md)", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
                  <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="7" y1="1" x2="7" y2="13"/><line x1="1" y1="7" x2="13" y2="7"/></svg>
                  Adicionar
                </button>
              </div>
            </div>

            {manualItems.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--gray-400)", textAlign: "center", padding: "8px 0 16px" }}>Nenhum item manual adicionado ainda.</p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {manualItems.map((item) => (
                <div key={item.id} style={{ background: "var(--white)", border: `1.5px solid ${item.checked ? "var(--gray-300)" : "var(--gray-200)"}`, borderRadius: "var(--radius-lg)", overflow: "hidden", opacity: item.checked ? 0.65 : 1, transition: "all 0.2s", marginLeft: 8, borderLeft: "4px solid var(--gray-400)" }}>
                  <div style={{ display: "flex", gap: 12, padding: "12px 14px", alignItems: "center" }}>
                    <button onClick={() => toggleManualChecked(item.id)} style={{ width: 26, height: 26, borderRadius: "var(--radius-full)", border: `2px solid ${item.checked ? "var(--gray-500)" : "var(--gray-300)"}`, background: item.checked ? "var(--gray-500)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
                      {item.checked && <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>}
                    </button>
                    <div style={{ width: 46, height: 46, borderRadius: "var(--radius-md)", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 20 }}>📝</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: "var(--gray-900)", textDecoration: item.checked ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", margin: 0 }}>{item.name}</p>
                      <p style={{ fontSize: 11, color: "var(--gray-400)", margin: "2px 0 0" }}>Item manual</p>
                    </div>
                    <button onClick={() => removeManualItem(item.id)} style={{ width: 30, height: 30, borderRadius: "var(--radius-full)", background: "#fff1f2", border: "1.5px solid #fca5a5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer" }}>
                      <svg width="12" height="12" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
                    </button>
                  </div>
                  <div style={{ borderTop: "1px solid var(--gray-100)", padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--gray-50)" }}>
                    <p style={{ fontSize: 12, color: "var(--gray-500)", fontWeight: 500, margin: 0 }}>Quantidade</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button onClick={() => updateManualQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))} style={{ width: 28, height: 28, borderRadius: "var(--radius-full)", border: "1.5px solid var(--gray-300)", background: "var(--white)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "var(--gray-600)", cursor: "pointer" }}>−</button>
                      <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--gray-900)", minWidth: 20, textAlign: "center" }}>{item.quantity || 1}</span>
                      <button onClick={() => updateManualQuantity(item.id, (item.quantity || 1) + 1)} style={{ width: 28, height: 28, borderRadius: "var(--radius-full)", border: "1.5px solid var(--gray-300)", background: "var(--gray-500)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "var(--white)", cursor: "pointer" }}>+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {manualChecked > 0 && (
              <button onClick={() => manualItems.filter((i) => i.checked).forEach((i) => removeManualItem(i.id))} style={{ width: "100%", marginTop: 8, padding: "12px", border: "1.5px dashed var(--gray-300)", borderRadius: "var(--radius-md)", color: "var(--gray-500)", fontSize: 14, fontWeight: 600, cursor: "pointer", background: "transparent" }}>
                🗑️ Limpar itens marcados ({manualChecked})
              </button>
            )}

            {/* LIMPAR LISTA COMPLETA */}
            <div style={{ marginTop: 24, borderTop: "1px solid var(--gray-100)", paddingTop: 16 }}>
              {!confirmClear ? (
                <button onClick={() => setConfirmClear(true)}
                  style={{ width: "100%", padding: "13px", border: "1.5px solid #fca5a5", borderRadius: "var(--radius-md)", color: "#ef4444", fontSize: 14, fontWeight: 700, cursor: "pointer", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg width="16" height="16" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  Limpar lista completa
                </button>
              ) : (
                <div style={{ background: "#fff1f2", border: "1.5px solid #fca5a5", borderRadius: "var(--radius-md)", padding: "14px 16px" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#b91c1c", textAlign: "center", margin: "0 0 12px" }}>Tem certeza? Isso apaga todos os itens!</p>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setConfirmClear(false)}
                      style={{ flex: 1, padding: "10px", border: "1.5px solid var(--gray-300)", borderRadius: "var(--radius-md)", color: "var(--gray-600)", fontWeight: 600, fontSize: 14, cursor: "pointer", background: "var(--white)" }}>
                      Cancelar
                    </button>
                    <button onClick={() => { clearAll(); setConfirmClear(false); }}
                      style={{ flex: 1, padding: "10px", background: "#ef4444", border: "none", borderRadius: "var(--radius-md)", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                      Sim, limpar tudo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: "var(--green-600)", padding: "16px 16px 20px" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.8)", fontSize: 13, marginBottom: 12, background: "none", border: "none", cursor: "pointer" }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 4l-4 4 4 4"/></svg>
          Voltar
        </button>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--white)", marginBottom: 2 }}>{market?.name}</p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{market?.address || "Campo Mourão - PR"}</p>
      </div>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--gray-200)", background: "var(--white)" }}>
        {[
          { id: "offers", label: `Ofertas (${offers.length})` },
          ...(isLogged ? [{ id: "list", label: `🛒 Lista (${list.length + manualItems.length})` }] : []),
        ].map((t) => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setSearch(""); }}
            style={{ flex: 1, padding: "12px 8px", fontSize: 13, fontWeight: 600, color: tab === t.id ? "var(--green-600)" : "var(--gray-500)", borderBottom: `2px solid ${tab === t.id ? "var(--green-500)" : "transparent"}`, background: "none", whiteSpace: "nowrap", cursor: "pointer" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: "12px 16px 0" }}>
        <div style={{ position: "relative", marginBottom: 10 }}>
          <svg width="15" height="15" fill="none" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="6" cy="6" r="4"/><path d="M14 14l-3-3"/>
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produto..."
            style={{ width: "100%", padding: "10px 36px 10px 34px", border: "1.5px solid var(--gray-200)", borderRadius: "var(--radius-md)", fontSize: 14, outline: "none", color: "var(--gray-900)", boxSizing: "border-box" }}
            onFocus={(e) => e.target.style.borderColor = "var(--green-400)"}
            onBlur={(e) => e.target.style.borderColor = "var(--gray-200)"} />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "var(--gray-200)", border: "none", borderRadius: "var(--radius-full)", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="10" height="10" fill="none" stroke="var(--gray-600)" strokeWidth="2.5" strokeLinecap="round"><path d="M2 2l6 6M8 2l-6 6"/></svg>
            </button>
          )}
        </div>

        {tab === "offers" && offerCategories.length > 1 && (
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 10, scrollbarWidth: "none" }}>
            {offerCategories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{ padding: "6px 14px", borderRadius: "var(--radius-full)", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0, border: "none", cursor: "pointer", background: activeCategory === cat ? (cat === "Todos" ? "var(--green-500)" : categoryColors[cat] || "var(--green-500)") : "var(--gray-100)", color: activeCategory === cat ? "white" : "var(--gray-600)" }}>
                {cat === "Todos" ? "🛍️ Todos" : cat}
              </button>
            ))}
          </div>
        )}

        {loading ? [1,2,3].map((i) => (
          <div key={i} style={{ height: 80, borderRadius: "var(--radius-lg)", background: "var(--gray-100)", marginBottom: 10, animation: "pulse 1.2s ease infinite" }} />
        )) : tab === "offers" ? (
          filteredOffers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--gray-500)" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
              <p>Nenhuma oferta encontrada.</p>
            </div>
          ) : filteredOffers.map((o, idx) => <OfferRow key={o.id} o={o} idx={idx} />)
        ) : (
          <ListTab />
        )}
      </div>
    </div>
  );
}