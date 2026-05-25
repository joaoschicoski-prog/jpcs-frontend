import { useAuth } from "../context/AuthContext";
import { useList } from "../context/ListContext";
import { useNav } from "../context/NavContext";

function getDaysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const end = new Date(dateStr); end.setHours(0,0,0,0);
  return Math.round((end - today) / (1000 * 60 * 60 * 24));
}

export default function ProductCard({ product, cheapestPrice, supermarket, validUntil, onClick }) {
  const { isLogged } = useAuth();
  const { isFavorite, toggleFavorite, isInList, addToList, removeFromList } = useList();
  const { goToMarket } = useNav();
  const fav = isFavorite(product.id);
  const inList = isInList(product.id);
  const days = getDaysUntil(validUntil);
  const isUrgent = days !== null && days <= 1;
  const isWarning = days !== null && days > 1 && days <= 3;

  return (
    <div style={{
      background: "var(--white)",
      border: `2px solid ${isUrgent ? "#f97316" : isWarning ? "#fbbf24" : "var(--gray-200)"}`,
      borderRadius: "var(--radius-lg)",
      animation: "fadeUp 0.3s ease both",
      overflow: "hidden",
    }}>
      {/* Linha principal - clicável */}
      <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 14px 10px", cursor: "pointer" }}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} style={{ width: 54, height: 54, borderRadius: "var(--radius-md)", objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 54, height: 54, borderRadius: "var(--radius-md)", background: "var(--green-50)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>🛒</div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "var(--gray-900)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {product.name}
          </p>
          <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>
            {product.category || "Sem categoria"} · {product.brand || "Sem marca"}
          </p>
          {cheapestPrice && (
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--green-600)" }}>
                R$ {Number(cheapestPrice).toFixed(2)}
              </span>
              {supermarket && (
                <button
                  onClick={(e) => { e.stopPropagation(); goToMarket({ name: supermarket }); }}
                  style={{
                    fontSize: 11, color: "var(--white)",
                    background: "var(--green-600)",
                    borderRadius: "var(--radius-sm)",
                    padding: "2px 8px",
                    border: "none",
                    cursor: "pointer", fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 3,
                  }}>
                  📍 {supermarket}
                </button>
              )}
              {isUrgent && <span style={{ fontSize: 10, color: "#f97316", fontWeight: 700 }}>⚡ Acaba hoje!</span>}
              {isWarning && <span style={{ fontSize: 10, color: "#d97706", fontWeight: 600 }}>⏳ {days} dias</span>}
            </div>
          )}
        </div>

        {/* Seta indicando que é clicável */}
        <svg width="16" height="16" fill="none" stroke="var(--gray-300)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
          <path d="M6 4l4 4-4 4"/>
        </svg>
      </div>

      {/* Botões embaixo — só se logado */}
      {isLogged && (
        <div style={{ display: "flex", borderTop: "1px solid var(--gray-100)" }}>
          <button
            onClick={() => toggleFavorite(product)}
            style={{
              flex: 1, padding: "10px",
              background: fav ? "#e74c3c" : "var(--white)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              borderRight: "1px solid var(--gray-100)",
              cursor: "pointer",
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill={fav ? "white" : "none"} stroke={fav ? "white" : "#e74c3c"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: fav ? "white" : "#e74c3c" }}>
              {fav ? "Favoritado" : "Favoritar"}
            </span>
          </button>

          <button
            onClick={() => inList ? removeFromList(product.id) : addToList(product, cheapestPrice, supermarket)}
            style={{
              flex: 1, padding: "10px",
              background: inList ? "var(--green-500)" : "var(--white)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              cursor: "pointer",
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={inList ? "white" : "var(--green-600)"} strokeWidth="2.5" strokeLinecap="round">
              {inList ? <path d="M5 13l4 4L19 7"/> : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}
            </svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: inList ? "white" : "var(--green-600)" }}>
              {inList ? "Na lista ✓" : "Adicionar"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
