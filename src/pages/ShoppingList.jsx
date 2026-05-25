import { useState, useMemo } from "react";
import { useList } from "../context/ListContext";
import { useAuth } from "../context/AuthContext";

export default function ShoppingList({ setPage }) {
  const { isLogged } = useAuth();
  const { list, favorites, removeFromList, toggleChecked, toggleFavorite } = useList();
  const [tab, setTab] = useState("list");

  if (!isLogged) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>🔒</p>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--gray-900)", marginBottom: 8 }}>Faça login para usar esta função</p>
        <p style={{ fontSize: 14, color: "var(--gray-500)", marginBottom: 24 }}>Crie uma conta gratuita para montar sua lista de compras e favoritar produtos.</p>
        <button onClick={() => setPage("login")} style={{ padding: "14px 32px", background: "var(--green-500)", color: "var(--white)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>
          Criar conta / Entrar
        </button>
      </div>
    );
  }

  const checked = list.filter((i) => i.checked).length;

  // Agrupar lista por supermercado (usando o primeiro mercado disponível do produto)
  const grouped = useMemo(() => {
    const groups = {};
    list.forEach((item) => {
      const market = item.supermarket || "Sem mercado definido";
      if (!groups[market]) groups[market] = [];
      groups[market].push(item);
    });
    return groups;
  }, [list]);

  // Total da lista
  const total = useMemo(() => {
    return list.reduce((sum, item) => {
      const price = parseFloat(item.cheapestPrice || item.price || 0);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
  }, [list]);

  const items = tab === "list" ? list : favorites;

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

      {/* Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--gray-100)", margin: "16px 16px 0", borderRadius: "var(--radius-md)", padding: 4 }}>
        {[
          { id: "list", label: `Lista (${list.length})` },
          { id: "favorites", label: `Favoritos (${favorites.length})` },
        ].map((t) => (
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
              {/* Total */}
              {total > 0 && (
                <div style={{ background: "var(--green-50)", border: "1px solid var(--green-200)", borderRadius: "var(--radius-lg)", padding: "14px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: "var(--green-700)" }}>💰 Total estimado</p>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--green-600)" }}>
                    R$ {total.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Agrupado por mercado */}
              {Object.entries(grouped).map(([market, items]) => (
                <div key={market} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 14 }}>🏪</span>
                    <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--gray-700)" }}>{market}</p>
                    <span style={{ fontSize: 12, color: "var(--gray-400)", background: "var(--gray-100)", borderRadius: "var(--radius-full)", padding: "2px 8px" }}>
                      {items.length} item{items.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {items.map((item) => (
                      <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-md)", padding: "12px 14px", opacity: item.checked ? 0.5 : 1 }}>
                        {/* Checkbox */}
                        <button onClick={() => toggleChecked(item.id)}
                          style={{ width: 24, height: 24, borderRadius: "var(--radius-full)", border: `2px solid ${item.checked ? "var(--green-500)" : "var(--gray-300)"}`, background: item.checked ? "var(--green-500)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                          {item.checked && <svg width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M2 6l3 3 5-5"/></svg>}
                        </button>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: 14, color: "var(--gray-900)", textDecoration: item.checked ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                          <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>{item.category || "Sem categoria"}</p>
                        </div>

                        {/* Preço */}
                        {item.cheapestPrice && (
                          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--green-600)", flexShrink: 0 }}>
                            R$ {Number(item.cheapestPrice).toFixed(2)}
                          </p>
                        )}

                        {/* Botão remover claro */}
                        <button onClick={() => removeFromList(item.id)}
                          style={{ width: 34, height: 34, borderRadius: "var(--radius-full)", background: "var(--red-50)", border: "1.5px solid #fca5a5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                          title="Remover da lista">
                          <svg width="14" height="14" fill="none" stroke="var(--red-400)" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M4 4l8 8M12 4l-8 8"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {checked > 0 && (
                <button onClick={() => list.filter((i) => i.checked).forEach((i) => removeFromList(i.id))}
                  style={{ width: "100%", marginTop: 8, padding: "12px", border: "1.5px dashed var(--gray-300)", borderRadius: "var(--radius-md)", color: "var(--gray-500)", fontSize: 14, fontWeight: 600 }}>
                  Limpar itens marcados ({checked})
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {favorites.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "var(--gray-500)" }}>
              <p style={{ fontSize: 36, marginBottom: 10 }}>❤️</p>
              <p style={{ fontWeight: 600, marginBottom: 6 }}>Nenhum favorito ainda</p>
              <p style={{ fontSize: 13 }}>Toque no coração em qualquer produto para favoritar.</p>
              <button onClick={() => setPage("home")} style={{ marginTop: 20, padding: "12px 28px", background: "var(--green-500)", color: "var(--white)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-display)", fontWeight: 700 }}>Ver ofertas</button>
            </div>
          ) : (
            favorites.map((item, idx) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-lg)", padding: "14px 16px", animation: "fadeUp 0.25s ease both", animationDelay: `${idx*0.05}s` }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 15, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                  <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>{item.category || "Sem categoria"} · {item.brand || "Sem marca"}</p>
                </div>
                <button onClick={() => toggleFavorite(item)}
                  style={{ width: 34, height: 34, borderRadius: "var(--radius-full)", background: "var(--red-50)", border: "1.5px solid #fca5a5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                  title="Remover favorito">
                  <svg width="14" height="14" fill="none" stroke="var(--red-400)" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M4 4l8 8M12 4l-8 8"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
