import { useAuth } from "../context/AuthContext";
import { useList } from "../context/ListContext";
import { useNav } from "../context/NavContext";

export default function Header({ page, setPage }) {
  const { user, isLogged } = useAuth();
  const { list } = useList();
  const { goBack } = useNav();

  const showBack = !["home"].includes(page);

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "var(--green-600)",
      padding: "0 16px",
      height: 56,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {showBack && (
          <button onClick={goBack} style={{ display: "flex", alignItems: "center", gap: 4, color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: "8px 4px 8px 0", marginRight: 4 }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 4l-6 6 6 6"/></svg>
            Voltar
          </button>
        )}
        <button onClick={() => setPage("home")} style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: "var(--white)", letterSpacing: "-0.5px", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ background: "var(--green-400)", borderRadius: "var(--radius-sm)", padding: "2px 7px", fontSize: 13, fontWeight: 700, color: "var(--white)" }}>JPCS</span>
          Promo
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {isLogged && (
          <button onClick={() => setPage("list")} style={{ position: "relative", width: 40, height: 40, borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center", background: page === "list" ? "rgba(255,255,255,0.2)" : "transparent" }} aria-label="Minha lista">
            <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <path d="M9 12h6M9 16h4"/>
            </svg>
            {list.length > 0 && (
              <span style={{ position: "absolute", top: 4, right: 4, background: "var(--amber-400)", color: "var(--white)", borderRadius: "var(--radius-full)", width: 16, height: 16, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {list.length}
              </span>
            )}
          </button>
        )}
        <button onClick={() => setPage(isLogged ? "profile" : "login")} style={{ width: 40, height: 40, borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center", background: (page === "profile" || page === "login") ? "rgba(255,255,255,0.2)" : "transparent" }} aria-label={isLogged ? "Perfil" : "Entrar"}>
          {isLogged ? (
            <div style={{ width: 28, height: 28, borderRadius: "var(--radius-full)", background: "var(--green-400)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12, color: "var(--white)" }}>
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
          ) : (
            <svg width="22" height="22" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}