import { useAuth } from "../context/AuthContext";
import { useList } from "../context/ListContext";

export default function Profile({ setPage }) {
  const { user, logout, isAdmin, isLogged } = useAuth();
  const { list, favorites } = useList();

  if (!isLogged) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "80px 32px", textAlign: "center",
      }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>👤</p>
        <p style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: 20, marginBottom: 8,
        }}>
          Você não está logado
        </p>
        <button
          onClick={() => setPage("login")}
          style={{
            padding: "14px 32px",
            background: "var(--green-500)", color: "var(--white)",
            borderRadius: "var(--radius-md)",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16,
          }}
        >
          Entrar
        </button>
      </div>
    );
  }

  const handleLogout = () => { logout(); setPage("home"); };

  const initials = user.name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "U";

  const stats = [
    { label: "Na lista", value: list.length },
    { label: "Favoritos", value: favorites.length },
  ];

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{
        background: "var(--green-600)",
        padding: "30px 16px 48px",
        textAlign: "center",
      }}>
        <div style={{
          width: 72, height: 72,
          borderRadius: "var(--radius-full)",
          background: "rgba(255,255,255,0.2)",
          border: "3px solid rgba(255,255,255,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: 26, color: "var(--white)",
          margin: "0 auto 12px",
        }}>
          {initials}
        </div>
        <p style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: 20, color: "var(--white)",
        }}>
          {user.name}
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>
          {user.email}
        </p>
        {isAdmin && (
          <span style={{
            display: "inline-block", marginTop: 8,
            background: "var(--amber-400)", color: "var(--white)",
            borderRadius: "var(--radius-full)", padding: "3px 12px",
            fontSize: 11, fontWeight: 700,
          }}>
            ADMIN
          </span>
        )}
      </div>

      <div style={{ margin: "-24px 16px 0", position: "relative", zIndex: 1 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 10, marginBottom: 16,
        }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              background: "var(--white)",
              border: "1px solid var(--gray-200)",
              borderRadius: "var(--radius-lg)",
              padding: "16px", textAlign: "center",
              boxShadow: "var(--shadow-sm)",
            }}>
              <p style={{
                fontFamily: "var(--font-display)", fontWeight: 800,
                fontSize: 28, color: "var(--green-600)",
              }}>
                {s.value}
              </p>
              <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          background: "var(--white)", border: "1px solid var(--gray-200)",
          borderRadius: "var(--radius-lg)", overflow: "hidden",
          boxShadow: "var(--shadow-sm)",
        }}>
          {[
            { label: "Minha lista de compras", icon: "🛒", action: () => setPage("list") },
            { label: "Meus favoritos", icon: "❤️", action: () => setPage("list") },
            isAdmin && { label: "Painel admin", icon: "⚙️", action: () => setPage("admin") },
          ].filter(Boolean).map((item, idx, arr) => (
            <button
              key={item.label}
              onClick={item.action}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 14,
                padding: "16px 20px",
                borderBottom: idx < arr.length - 1 ? "1px solid var(--gray-100)" : "none",
                textAlign: "left",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--gray-50)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "var(--white)"}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontWeight: 600, fontSize: 15, color: "var(--gray-800)", flex: 1 }}>
                {item.label}
              </span>
              <svg width="16" height="16" fill="none" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round">
                <path d="M6 4l4 4-4 4"/>
              </svg>
            </button>
          ))}
        </div>

        <button
          onClick={handleLogout}
          style={{
            width: "100%", marginTop: 16,
            padding: "15px",
            border: "1.5px solid var(--red-400)",
            borderRadius: "var(--radius-md)",
            color: "var(--red-400)",
            fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--red-50)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          Sair da conta
        </button>
      </div>
    </div>
  );
}
