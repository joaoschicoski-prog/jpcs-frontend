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

export default function ProductCard({ product, cheapestPrice, supermarket, validUntil, originalPrice, discountPct }) {
  const { isLogged } = useAuth();
  const { isInList, addToList, removeFromList, updateQuantity, list } = useList();
  const { goToMarket, goToProduct } = useNav();
  const inList = isInList(product.id);
  const listItem = list.find((i) => i.id === product.id);
  const quantity = listItem?.quantity || 1;
  const days = getDaysUntil(validUntil);
  const isUrgent = days !== null && days <= 1;
  const isWarning = days !== null && days > 1 && days <= 3;
  const catColor = categoryColors[product.category] || "var(--green-500)";
  const hasDiscount = originalPrice && Number(originalPrice) > Number(cheapestPrice);

  return (
    <div style={{ background: "var(--white)", border: `2px solid ${isUrgent ? "#f97316" : isWarning ? "#fbbf24" : "var(--gray-200)"}`, borderRadius: "var(--radius-lg)", animation: "fadeUp 0.3s ease both", overflow: "hidden" }}>
      <div onClick={() => goToProduct(product)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 14px 10px", cursor: "pointer" }}>
        {product.image_url ? (
          <div style={{ position: "relative", flexShrink: 0 }}>
            <img src={product.image_url} alt={product.name} style={{ width: 54, height: 54, borderRadius: "var(--radius-md)", objectFit: "cover" }} />
            {hasDiscount && discountPct && (
              <span style={{ position: "absolute", top: -6, right: -6, background: "#ef4444", color: "white", fontSize: 9, fontWeight: 800, borderRadius: "var(--radius-full)", padding: "2px 5px", lineHeight: 1 }}>-{discountPct}%</span>
            )}
          </div>
        ) : (
          <div style={{ width: 54, height: 54, borderRadius: "var(--radius-md)", background: "var(--green-50)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>🛒</div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          {product.category && (
            <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, color: "white", background: catColor, borderRadius: "var(--radius-full)", padding: "1px 8px", marginBottom: 3 }}>{product.category}</span>
          )}
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</p>
          <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>{product.brand || "Sem marca"}</p>
          {cheapestPrice && (
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                {hasDiscount && <span style={{ fontSize: 12, color: "var(--gray-400)", textDecoration: "line-through" }}>R$ {Number(originalPrice).toFixed(2)}</span>}
                <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)", color: hasDiscount ? "#ef4444" : "var(--green-600)" }}>R$ {Number(cheapestPrice).toFixed(2)}</span>
              </div>
              {supermarket && (
                <button onClick={(e) => { e.stopPropagation(); goToMarket({ name: supermarket }); }}
                  style={{ fontSize: 11, color: "var(--white)", background: "var(--green-600)", borderRadius: "var(--radius-sm)", padding: "2px 8px", border: "none", cursor: "pointer", fontWeight: 600 }}>
                  📍 {supermarket}
                </button>
              )}
              {isUrgent && <span style={{ fontSize: 10, color: "#f97316", fontWeight: 700 }}>⚡ Acaba hoje!</span>}
              {isWarning && <span style={{ fontSize: 10, color: "#d97706", fontWeight: 600 }}>⏳ {days} dias</span>}
            </div>
          )}
        </div>
        <svg width="16" height="16" fill="none" stroke="var(--gray-300)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M6 4l4 4-4 4"/></svg>
      </div>

      {isLogged && (
        <div style={{ borderTop: "1px solid var(--gray-100)" }}>
          {inList ? (
            <div style={{ display: "flex" }}>
              <button onClick={() => removeFromList(product.id)}
                style={{ flex: 1, padding: "11px", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", border: "none", borderRight: "1px solid rgba(0,0,0,0.1)" }}>
                <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M2 2l10 10M12 2l-10 10"/></svg>
                <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>Remover da lista</span>
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "var(--gray-50)" }}>
                <button onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1))}
                  style={{ width: 28, height: 28, borderRadius: "var(--radius-full)", border: "1.5px solid var(--gray-300)", background: "var(--white)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "var(--gray-600)", cursor: "pointer" }}>−</button>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--gray-900)", minWidth: 20, textAlign: "center" }}>{quantity}</span>
                <button onClick={() => updateQuantity(product.id, quantity + 1)}
                  style={{ width: 28, height: 28, borderRadius: "var(--radius-full)", border: "1.5px solid var(--green-400)", background: "var(--green-500)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "var(--white)", cursor: "pointer" }}>+</button>
              </div>
            </div>
          ) : (
            <button onClick={() => addToList(product, cheapestPrice, supermarket)}
              style={{ width: "100%", padding: "11px", background: "var(--white)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", border: "none" }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--green-600)" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--green-600)" }}>Adicionar à lista</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}