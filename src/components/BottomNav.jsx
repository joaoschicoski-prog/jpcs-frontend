import { useAuth } from "../context/AuthContext";

export default function BottomNav({ page, setPage }) {
  const { isLogged } = useAuth();

  const items = [
    {
      id: "home", label: "Ofertas",
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/>
          <path d="M9 21V12h6v9"/>
        </svg>
      ),
    },
    {
      id: "ranking", label: "Mercados",
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3h18M3 3v4l9 4 9-4V3M3 21h18M5 21v-8M19 21v-8M9 21v-5h6v5"/>
        </svg>
      ),
    },
    {
      id: isLogged ? "list" : "login",
      label: "Minha lista",
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path d="M9 12h6M9 16h4"/>
        </svg>
      ),
    },
    {
      id: isLogged ? "profile" : "login",
      label: isLogged ? "Perfil" : "Entrar",
      icon: (
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      ),
    },
  ];

  return (
    <nav style={{
      position: "sticky", bottom: 0,
      background: "var(--white)",
      borderTop: "1px solid var(--gray-200)",
      display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      zIndex: 100,
    }}>
      {items.map((item) => {
        const active = page === item.id;
        return (
          <button
            key={item.id + item.label}
            onClick={() => setPage(item.id)}
            style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 3, padding: "8px 0 10px",
              color: active ? "var(--green-600)" : "var(--gray-500)",
              transition: "color 0.15s",
            }}
          >
            {item.icon}
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400 }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
