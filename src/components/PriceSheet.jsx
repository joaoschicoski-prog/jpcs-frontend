import { useEffect, useState } from "react";
import { api } from "../api";
import { useNav } from "../context/NavContext";

export default function PriceSheet({ product, onClose }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { goToMarket } = useNav();

  useEffect(() => {
    if (!product) return;
    setLoading(true);
    api.getOffers(product.id)
      .then((data) => setOffers(data.sort((a, b) => Number(a.price) - Number(b.price))))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  }, [product]);

  if (!product) return null;
  const lowest = offers.length ? Number(offers[0].price) : null;

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 200, animation: "fadeIn 0.2s ease" }} />
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "var(--white)", borderTopLeftRadius: 24, borderTopRightRadius: 24, zIndex: 201, maxHeight: "80vh", display: "flex", flexDirection: "column", animation: "slideUp 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 12px", borderBottom: "1px solid var(--gray-100)" }}>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--gray-900)" }}>{product.name}</p>
            <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>Comparando preços em {offers.length} mercado{offers.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "var(--radius-full)", background: "var(--gray-100)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" fill="none" stroke="var(--gray-600)" strokeWidth="2.5" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>
          </button>
        </div>

        <div style={{ overflowY: "auto", padding: "12px 16px 24px" }}>
          {loading ? (
            [1,2,3].map((i) => (
              <div key={i} style={{ height: 64, borderRadius: "var(--radius-md)", background: "var(--gray-100)", marginBottom: 10, animation: "pulse 1.2s ease infinite", animationDelay: `${i*0.15}s` }} />
            ))
          ) : offers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--gray-500)" }}>
              <p style={{ fontSize: 32, marginBottom: 8 }}>😔</p>
              <p>Nenhuma oferta cadastrada para este produto.</p>
            </div>
          ) : offers.map((offer, idx) => {
            const isLowest = Number(offer.price) === lowest;
            const hasDiscount = offer.original_price && Number(offer.original_price) > Number(offer.price);
            const diff = isLowest ? null : (Number(offer.price) - lowest).toFixed(2);
            return (
              <div key={offer.id} style={{ display: "flex", alignItems: "center", padding: "14px 16px", borderRadius: "var(--radius-md)", marginBottom: 8, background: isLowest ? "var(--green-50)" : "var(--gray-50)", border: `1px solid ${isLowest ? "var(--green-200)" : "var(--gray-200)"}`, animation: "fadeUp 0.25s ease both", animationDelay: `${idx*0.05}s` }}>
                <div style={{ flex: 1 }}>
                  <button onClick={() => { onClose(); goToMarket({ name: offer.supermarket, city: offer.city }); }}
                    style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--white)", background: "var(--green-600)", border: "none", borderRadius: "var(--radius-sm)", padding: "4px 12px", cursor: "pointer" }}>
                    📍 {offer.supermarket}
                  </button>
                  {isLowest && (
                    <div style={{ marginTop: 6 }}>
                      <span style={{ background: "var(--green-100)", color: "var(--green-700)", fontSize: 10, fontWeight: 700, borderRadius: "var(--radius-full)", padding: "2px 10px", border: "1px solid var(--green-300)" }}>
                        ✓ Melhor preço
                      </span>
                    </div>
                  )}
                  {!isLowest && diff && (
                    <p style={{ fontSize: 11, color: "var(--gray-400)", marginTop: 4 }}>+R$ {diff} a mais</p>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  {hasDiscount && (
                    <p style={{ fontSize: 12, color: "var(--gray-400)", textDecoration: "line-through", marginBottom: 2 }}>
                      R$ {Number(offer.original_price).toFixed(2)}
                    </p>
                  )}
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: hasDiscount ? "#ef4444" : isLowest ? "var(--green-600)" : "var(--gray-700)" }}>
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
    </>
  );
}
