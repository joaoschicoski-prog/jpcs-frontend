import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useList } from "../context/ListContext";
import { api } from "../api";

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export default function Profile({ setPage }) {
  const { user, logout, isAdmin, isLogged, login } = useAuth();
  const { list, favorites } = useList();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [error, setError] = useState(null);

  if (!isLogged) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 32px", textAlign: "center" }}>
        <p style={{ fontSize: 48, marginBottom: 16 }}>👤</p>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Você não está logado</p>
        <button onClick={() => setPage("login")} style={{ padding: "14px 32px", background: "var(--green-500)", color: "var(--white)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>
          Entrar
        </button>
      </div>
    );
  }

  const handleLogout = () => { logout(); setPage("home"); };
  const initials = user.name?.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "U";

  const handleSave = async () => {
    setError(null);
    setMsg(null);
    if (!name.trim() && !newPassword) { setError("Preencha pelo menos um campo para atualizar."); return; }
    if (newPassword && newPassword.length < 6) { setError("Nova senha deve ter pelo menos 6 caracteres."); return; }
    if (newPassword && newPassword !== confirmPassword) { setError("As senhas não coincidem."); return; }
    if (newPassword && !currentPassword) { setError("Informe sua senha atual para trocar a senha."); return; }
    try {
      setLoading(true);
      const token = localStorage.getItem("jpcs_token") || user.token;
      const body = {};
      if (name.trim()) body.name = name.trim();
      if (newPassword) { body.currentPassword = currentPassword; body.newPassword = newPassword; }
      const res = await api.updateProfile(body, token);
      login({ ...user, name: res.user.name });
      setMsg("Perfil atualizado com sucesso!");
      setEditMode(false);
      setName(""); setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Na lista", value: list.length },
    { label: "Favoritos", value: favorites.length },
  ];

  const inputWrap = { position: "relative", marginBottom: 10 };
  const inputStyle = {
    width: "100%", padding: "12px 42px 12px 14px", borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--gray-200)", fontSize: 14, color: "var(--gray-900)",
    outline: "none", boxSizing: "border-box", background: "var(--white)",
  };
  const eyeBtn = {
    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", color: "var(--gray-400)",
    display: "flex", alignItems: "center", padding: 0,
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: "var(--green-600)", padding: "30px 16px 48px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "var(--radius-full)", background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, color: "var(--white)", margin: "0 auto 12px" }}>
          {initials}
        </div>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "var(--white)" }}>{user.name}</p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{user.email}</p>
        {isAdmin && <span style={{ display: "inline-block", marginTop: 8, background: "var(--amber-400)", color: "var(--white)", borderRadius: "var(--radius-full)", padding: "3px 12px", fontSize: 11, fontWeight: 700 }}>ADMIN</span>}
      </div>

      <div style={{ margin: "-24px 16px 0", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-lg)", padding: "16px", textAlign: "center", boxShadow: "var(--shadow-sm)" }}>
              <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: "var(--green-600)" }}>{s.value}</p>
              <p style={{ fontSize: 12, color: "var(--gray-500)", marginTop: 4 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {msg && (
          <div style={{ background: "#f0fdf4", border: "1px solid var(--green-300)", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: 12 }}>
            <p style={{ fontSize: 13, color: "var(--green-700)", fontWeight: 600 }}>✅ {msg}</p>
          </div>
        )}

        {editMode ? (
          <div style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-lg)", padding: "20px 16px", marginBottom: 12, boxShadow: "var(--shadow-sm)" }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--gray-900)", marginBottom: 16 }}>✏️ Editar perfil</p>

            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-600)", marginBottom: 6 }}>Novo nome</p>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={user.name}
                style={{ ...inputStyle, padding: "12px 14px" }} />
            </div>

            <div style={{ height: 1, background: "var(--gray-100)", margin: "16px 0" }} />
            <p style={{ fontSize: 12, fontWeight: 700, color: "var(--gray-500)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Trocar senha</p>

            <div style={inputWrap}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-600)", marginBottom: 6 }}>Senha atual</p>
              <input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
              <button style={eyeBtn} onClick={() => setShowCurrent(!showCurrent)}><EyeIcon open={showCurrent} /></button>
            </div>

            <div style={inputWrap}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-600)", marginBottom: 6 }}>Nova senha</p>
              <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
              <button style={eyeBtn} onClick={() => setShowNew(!showNew)}><EyeIcon open={showNew} /></button>
            </div>

            <div style={{ ...inputWrap, marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--gray-600)", marginBottom: 6 }}>Confirmar nova senha</p>
              <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" style={inputStyle} />
              <button style={eyeBtn} onClick={() => setShowConfirm(!showConfirm)}><EyeIcon open={showConfirm} /></button>
            </div>

            {error && <p style={{ fontSize: 13, color: "#ef4444", marginBottom: 12, fontWeight: 600 }}>⚠️ {error}</p>}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setEditMode(false); setError(null); setName(""); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }}
                style={{ flex: 1, padding: "12px", border: "1.5px solid var(--gray-300)", borderRadius: "var(--radius-md)", color: "var(--gray-600)", fontWeight: 600, fontSize: 14, cursor: "pointer", background: "var(--white)" }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={loading}
                style={{ flex: 1, padding: "12px", background: "var(--green-500)", border: "none", borderRadius: "var(--radius-md)", color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
                {loading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: "var(--white)", border: "1px solid var(--gray-200)", borderRadius: "var(--radius-lg)", overflow: "hidden", boxShadow: "var(--shadow-sm)", marginBottom: 12 }}>
            {[
              { label: "Editar perfil", icon: "✏️", action: () => { setEditMode(true); setMsg(null); } },
              { label: "Minha lista de compras", icon: "🛒", action: () => setPage("list") },
              { label: "Meus favoritos", icon: "❤️", action: () => setPage("list") },
              isAdmin && { label: "Painel admin", icon: "⚙️", action: () => setPage("admin") },
            ].filter(Boolean).map((item, idx, arr) => (
              <button key={item.label} onClick={item.action}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", borderBottom: idx < arr.length - 1 ? "1px solid var(--gray-100)" : "none", textAlign: "left", transition: "background 0.1s", background: "var(--white)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--gray-50)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "var(--white)"}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 15, color: "var(--gray-800)", flex: 1 }}>{item.label}</span>
                <svg width="16" height="16" fill="none" stroke="var(--gray-400)" strokeWidth="2" strokeLinecap="round"><path d="M6 4l4 4-4 4"/></svg>
              </button>
            ))}
          </div>
        )}

        <button onClick={handleLogout}
          style={{ width: "100%", marginTop: 4, padding: "15px", border: "1.5px solid var(--red-400)", borderRadius: "var(--radius-md)", color: "var(--red-400)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, transition: "all 0.15s", background: "transparent" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--red-50)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
          Sair da conta
        </button>
      </div>
    </div>
  );
}