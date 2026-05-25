import { useEffect, useState } from "react";
import { api } from "../api";

export default function Ranking({ onSelectMarket }) {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const medals = ["🥇", "🥈", "🥉"];

  useEffect(() => {
    api.getRanking().then(setRanking).catch(() => setRanking([])).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: "var(--green-600)", padding: "20px 16px 24px" }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--white)", marginBottom: 4 }}>Ranking de mercados 🏪</p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>Toque no mercado para ver suas ofertas</p>
      </div>
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? [1,2,3].map((i) => (
          <div key={i} style={{ height: 96, borderRadius: "var(--radius-lg)", background: "var(--gray-100)", animation: "pulse 1.2s ease infinite", animationDelay: `${i*0.1}s` }} />
        )) : ranking.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--gray-500)" }}>
            <p style={{ fontSize: 36, marginBottom: 10 }}>🏪</p>
            <p>Nenhum mercado com ofertas ainda.</p>
          </div>
        ) : ranking.map((market, idx) => (
          <button key={market.id} onClick={() => onSelectMarket(market)}
            style={{ background: idx === 0 ? "var(--green-50)" : "var(--white)", border: `1px solid ${idx === 0 ? "var(--green-200)" : "var(--gray-200)"}`, borderRadius: "var(--radius-lg)", padding: "16px", animation: "fadeUp 0.3s ease both", animationDelay: `${idx*0.06}s`, textAlign: "left", width: "100%", cursor: "pointer" }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--green-400)"}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = idx === 0 ? "var(--green-200)" : "var(--gray-200)"}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ fontSize: 28 }}>{medals[idx] || `#${idx+1}`}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)" }}>{market.name}</p>
                <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 2 }}>{market.total_offers} oferta{market.total_offers !== 1 ? "s" : ""} · Toque para ver</p>
              </div>
              {idx === 0 && <span style={{ background: "var(--green-400)", color: "var(--white)", fontSize: 10, fontWeight: 700, borderRadius: "var(--radius-full)", padding: "4px 10px" }}>MAIS BARATO</span>}
              <svg width="16" height="16" fill="none" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round"><path d="M6 4l4 4-4 4"/></svg>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { label: "Preço médio", value: `R$ ${Number(market.average_price).toFixed(2)}` },
                { label: "Menor preço", value: `R$ ${Number(market.cheapest_price).toFixed(2)}` },
                { label: "Ofertas", value: market.total_offers },
              ].map((stat) => (
                <div key={stat.label} style={{ background: "var(--gray-50)", borderRadius: "var(--radius-sm)", padding: "10px 12px", textAlign: "center" }}>
                  <p style={{ fontSize: 10, color: "var(--gray-500)", marginBottom: 4 }}>{stat.label}</p>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "var(--gray-800)" }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
