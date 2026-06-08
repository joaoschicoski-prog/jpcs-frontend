import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useList } from "../context/ListContext";
import { useNav } from "../context/NavContext";

const categoryColors = {
  "Laticínios e Ovos": "#3b82f6", "Carnes e Pescados": "#ef4444", "Bebidas": "#8b5cf6",
  "Padaria e Confeitaria": "#f59e0b", "Hortifruti": "#22c55e", "Limpeza e Lavanderia": "#06b6d4",
  "Higiene e Beleza": "#ec4899", "Mercearia": "#f97316", "Frios e Embutidos": "#64748b",
  "Congelados": "#0ea5e9", "Temperos e Molhos": "#84cc16", "Conservas e Enlatados": "#a16207",
  "Doces e Sobremesas": "#d946ef", "Pet Shop": "#fb923c",
};

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const end = new Date(dateStr); end.setHours(0,0,0,0);
  return Math.round((end - today) / (1000 * 60 * 60 * 24));
}

export default function ProductDetail({ product, onBack }) {
  const { isLogged } = useAuth();
  const { isFavorite, toggleFavorite, isInList, addToList, removeFromList } = useList();
  const { goToMarket } = useNav();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!product) return;
    setLoading(true);
    api.getOffers(product.id)
      .then((data) => setOffers(data.sort((a, b) => Number(a.price) - Number(b.price))))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }, [product]);

  if (!product) return null;

  const fav = isFavorite(product.id);
  const inList = isInList(product.id);
  const lowest = offers.length ? offers[0] : null;
  const catColor = categoryColors[product.category] || "var(--green-500)";

  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ background: "var(--green-600)", padding: "16px 16px 20px" }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.85)", fontSize: 13, marginBottom: 12, background: "none", border: "none", cursor: "pointer" }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4l-5 5 5 5"/></svg>
          Voltar
        </button>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--white)", margin: 0 }}>
          Detalhes do produto
        </p>
      </div>

      <div style={{ margin: "16px 16px 0", background: "var(--white)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name}
            style={{ width: "100%", height: 220, objectFit: "cover" }}
            onError={(e) => { e.target.style.display = "none"; }} />
        ) : (
          <div style={{ width: "100%", height: 220, background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>🛍️</div>
        )}

        <div style={{ padding: "16px" }}>
          {product.category && (
            <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: "white", background: catColor, borderRadius: "var(--radius-full)", padding: "3px 10px", marginBottom: 8 }}>
              {product.category}
            </span>
          )}
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--gray-900)", margin: "0 0 4px" }}>{product.name}</p>
          {product.brand && <p style={{ fontSize: 14, color: "var(--gray-500)", margin: "0 0 8px" }}>Marca: {product.brand}</p>}
          {product.description && <p style={{ fontSize: 13, color: "var(--gray-600)", lineHeight: 1.5, margin: 0 }}>{product.description}</p>}

          {lowest && (
            <div style={{ marginTop: 14, padding: "12px 14px", background: "var(--green-50)", borderRadius: "var(--radius-md)", border: "1px solid var(--green-200)" }}>
              <p style={{ fontSize: 12, color: "var(--green-700)", margin: "0 0 6px", fontWeight: 600 }}>💰 Melhor preço encontrado</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                {lowest.original_price && Number(lowest.original_price) > Number(lowest.price) && (
                  <span style={{ fontSize: 14, color: "var(--gray-400)", textDecoration: "line-through" }}>
                    R$ {Number(lowest.original_price).toFixed(2)}
                  </span>
                )}
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--green-600)" }}>
                  R$ {Number(lowest.price).toFixed(2)}
                </span>
                {lowest.discount_pct && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: "white", background: "#ef4444", borderRadius: "var(--radius-full)", padding: "2px 8px" }}>
                    -{lowest.discount_pct}% OFF
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12, color: "var(--green-600)", margin: "6px 0 0" }}>📍 {lowest.supermarket}</p>
              {lowest.valid_until && (
                <p style={{ fontSize: 11, color: "var(--gray-400)", margin: "4px 0 0" }}>
                  Válido até {new Date(lowest.valid_until).toLocaleDateString("pt-BR")}
                </p>
              )}
            </div>
          )}
        </div>

        {isLogged && (
          <div style={{ display: "flex", borderTop: "1px solid var(--gray-100)" }}>
            <button onClick={() => toggleFavorite(product)}
              style={{ flex: 1, padding: "14px", background: fav ? "#e74c3c" : "var(--white)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRight: "1px solid var(--gray-100)", cursor: "pointer" }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill={fav ? "white" : "none"} stroke={fav ? "white" : "#e74c3c"} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: fav ? "white" : "#e74c3c" }}>{fav ? "Favoritado" : "Favoritar"}</span>
            </button>
            <button onClick={() => inList ? removeFromList(product.id) : addToList(product, lowest?.price, lowest?.supermarket)}
              style={{ flex: 1, padding: "14px", background: inList ? "var(--green-500)" : "var(--white)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer" }}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke={inList ? "white" : "var(--green-600)"} strokeWidth="2.5" strokeLinecap="round">
                {inList ? <path d="M5 13l4 4L19 7"/> : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: inList ? "white" : "var(--green-600)" }}>{inList ? "Na lista ✓" : "Adicionar à lista"}</span>
            </button>
          </div>
        )}
      </div>

      <div style={{ margin: "16px 16px 0" }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)", marginBottom: 12 }}>
          🏪 Preços por mercado ({offers.length})
        </p>
        {loading ? (
          [1,2,3].map((i) => (
            <div key={i} style={{ height: 72, borderRadius: "var(--radius-lg)", background: "var(--gray-100)", marginBottom: 10, animation: "pulse 1.2s ease infinite", animationDelay: `${i*0.1}s` }} />
          ))
        ) : offers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--gray-400)" }}>
            <p style={{ fontSize: 32, marginBottom: 8 }}>😔</p>
            <p>Nenhuma oferta cadastrada para este produto.</p>
          </div>
        ) : offers.map((offer, idx) => {
          const isLowest = Number(offer.price) === Number(lowest?.price);
          const hasDiscount = offer.original_price && Number(offer.original_price) > Number(offer.price);
          const diff = isLowest ? null : (Number(offer.price) - Number(lowest?.price)).toFixed(2);
          const days = getDaysUntil(offer.valid_until);
          const isUrgent = days !== null && days <= 1;
          const isWarning = days !== null && days > 1 && days <= 3;
          return (
            <div key={offer.id}
              style={{ background: isLowest ? "var(--green-50)" : "var(--white)", border: `1.5px solid ${isUrgent ? "#f97316" : isLowest ? "var(--green-300)" : "var(--gray-200)"}`, borderRadius: "var(--radius-lg)", padding: "14px 16px", marginBottom: 10, display: "flex", alignItems: "center", animation: "fadeUp 0.25s ease both", animationDelay: `${idx*0.05}s` }}>
              <div style={{ flex: 1 }}>
                <button onClick={() => goToMarket({ name: offer.supermarket, city: offer.city })}
                  style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "white", background: "var(--green-600)", border: "none", borderRadius: "var(--radius-sm)", padding: "4px 12px", cursor: "pointer", marginBottom: 8 }}>
                  📍 {offer.supermarket}
                </button>

                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {isLowest && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green-700)", background: "var(--green-100)", borderRadius: "var(--radius-full)", padding: "2px 10px", border: "1px solid var(--green-300)", alignSelf: "flex-start" }}>
                      ✓ Melhor preço
                    </span>
                  )}
                  {!isLowest && diff && (
                    <p style={{ fontSize: 11, color: "var(--gray-400)", margin: 0 }}>+R$ {diff} a mais</p>
                  )}
                  {offer.valid_until && (
                    <p style={{ fontSize: 11, margin: 0, color: isUrgent ? "#f97316" : isWarning ? "#d97706" : "var(--gray-400)", fontWeight: isUrgent ? 700 : 400 }}>
                      {isUrgent ? "⚡ Acaba hoje!" : isWarning ? `⏳ ${days} dias restantes` : `Válido até ${new Date(offer.valid_until).toLocaleDateString("pt-BR")}`}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                {hasDiscount && (
                  <p style={{ fontSize: 12, color: "var(--gray-400)", textDecoration: "line-through", margin: "0 0 2px" }}>
                    R$ {Number(offer.original_price).toFixed(2)}
                  </p>
                )}
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: hasDiscount ? "#ef4444" : isLowest ? "var(--green-600)" : "var(--gray-700)", margin: 0 }}>
                  R$ {Number(offer.price).toFixed(2)}
                </p>
                {hasDiscount && offer.discount_pct && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "white", background: "#ef4444", borderRadius: "var(--radius-full)", padding: "1px 7px" }}>
                    -{offer.discount_pct}% OFF
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}