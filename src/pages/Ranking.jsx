import { useEffect, useState, useMemo } from "react";
import { api } from "../api";

const categoryColors = {
  "Laticínios": "#3b82f6", "Carnes": "#ef4444", "Bebidas": "#8b5cf6",
  "Padaria": "#f59e0b", "Hortifruti": "#22c55e", "Limpeza": "#06b6d4",
  "Higiene": "#ec4899", "Mercearia": "#f97316", "Frios": "#64748b", "Congelados": "#0ea5e9",
};

export default function Ranking({ onSelectMarket }) {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const medals = ["🥇", "🥈", "🥉"];

  useEffect(() => {
    api.getRanking().then(setRanking).catch(() => setRanking([])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return ranking.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));
  }, [ranking, search]);

  const categories = ["Todos", ...Object.keys(categoryColors)];

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: "var(--green-600)", padding: "20px 16px 24px" }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--white)", marginBottom: 4 }}>Ranking de mercados 🏪</p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 14 }}>Toque no mercado para ver suas ofertas</p>
        {/* Busca */}
        <div style={{ position: "relative" }}>
          <svg width="16" height="16" fill="none" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            <circle cx="7" cy="7" r="5"/><path d="M12 12l3 3"/>
          </svg>
          <input type="text" placeholder="Buscar mercado..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "11px 16px 11px 36px", borderRadius: "var(--radius-lg)", border: "none", outline: "none", fontSize: 14, background: "var(--white)", color: "var(--gray-900)", boxSizing: "border-box" }} />
          {search && (
            <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "var(--gray-200)", border: "none", borderRadius: "var(--radius-full)", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <svg width="10" height="10" fill="none" stroke="var(--gray-600)" strokeWidth="2.5" strokeLinecap="round"><path d="M2 2l6 6M8 2l-6 6"/></svg>
            </button>
          )}
        </div>
      </div>

      {/* Chips de categoria */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", padding: "12px 16px 4px", scrollbarWidth: "none" }}>
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{ padding: "6px 14px", borderRadius: "var(--radius-full)", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0, border: "none", cursor: "pointer", transition: "all 0.15s",
              background: activeCategory === cat ? (cat === "Todos" ? "var(--green-500)" : categoryColors[cat]) : "var(--gray-100)",
              color: activeCategory === cat ? "white" : "var(--gray-600)" }}>
            {cat === "Todos" ? "🏪 Todos" : cat}
          </button>
        ))}
      </div>

      {activeCategory !== "Todos" && (
        <div style={{ margin: "4px 16px 0", padding: "8px 12px", background: "#fff8e1", border: "1px solid #fbbf24", borderRadius: "var(--radius-md)" }}>
          <p style={{ fontSize: 12, color: "#92400e", fontWeight: 600 }}>
            💡 Mostrando mercados com ofertas em <strong>{activeCategory}</strong>. Toque para ver os preços específicos.
          </p>
        </div>
      )}

      <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? [1,2,3].map((i) => (
          <div key={i} style={{ height: 96, borderRadius: "var(--radius-lg)", background: "var(--gray-100)", animation: "pulse 1.2s ease infinite", animationDelay: `${i*0.1}s` }} />
        )) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--gray-500)" }}>
            <p style={{ fontSize: 36, marginBottom: 10 }}>🔍</p>
            <p style={{ fontWeight: 600 }}>Nenhum mercado encontrado</p>
          </div>
        ) : filtered.map((market, idx) => (
          <button key={market.id} onClick={() => onSelectMarket({ ...market, filterCategory: activeCategory !== "Todos" ? activeCategory : null })}
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
