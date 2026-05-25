import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

export default function Login({ setPage }) {
  const { login } = useAuth();
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async () => {
    setError(""); setSuccess("");
    if (!form.email || !form.password) {
      setError("Preencha todos os campos."); return;
    }
    if (tab === "register" && !form.name) {
      setError("Informe seu nome."); return;
    }
    setLoading(true);
    try {
      if (tab === "login") {
        const data = await api.login({ email: form.email, password: form.password });
        login(data.user || data);
        setPage("home");
      } else {
        await api.register({ name: form.name, email: form.email, password: form.password });
        setSuccess("Conta criada! Faça login para continuar.");
        setTab("login");
        setForm({ ...form, name: "" });
      }
    } catch (err) {
      setError(err.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "14px 16px",
    borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--gray-200)",
    fontSize: 15, outline: "none",
    background: "var(--white)",
    color: "var(--gray-900)",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{
        background: "var(--green-600)",
        padding: "40px 24px 48px",
        textAlign: "center",
      }}>
        <p style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: 28, color: "var(--white)", marginBottom: 6,
          letterSpacing: "-0.5px",
        }}>
          Bem-vindo ao<br />
          <span style={{ color: "var(--green-200)" }}>JPCSPromo</span>
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
          {tab === "login"
            ? "Entre para criar listas e favoritar produtos"
            : "Crie sua conta gratuita"}
        </p>
      </div>

      <div style={{
        margin: "-20px 20px 0",
        background: "var(--white)",
        borderRadius: "var(--radius-xl)",
        padding: "24px",
        boxShadow: "var(--shadow-lg)",
        position: "relative", zIndex: 1,
      }}>
        {/* Tabs */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          background: "var(--gray-100)", borderRadius: "var(--radius-md)",
          padding: 4, marginBottom: 24,
        }}>
          {["login", "register"].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); setSuccess(""); }}
              style={{
                padding: "10px",
                borderRadius: "var(--radius-sm)",
                fontWeight: 600, fontSize: 14,
                background: tab === t ? "var(--white)" : "transparent",
                color: tab === t ? "var(--green-600)" : "var(--gray-500)",
                boxShadow: tab === t ? "var(--shadow-sm)" : "none",
                transition: "all 0.2s",
              }}
            >
              {t === "login" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {tab === "register" && (
            <input
              placeholder="Seu nome"
              value={form.name}
              onChange={set("name")}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "var(--green-400)"}
              onBlur={(e) => e.target.style.borderColor = "var(--gray-200)"}
            />
          )}
          <input
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={set("email")}
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = "var(--green-400)"}
            onBlur={(e) => e.target.style.borderColor = "var(--gray-200)"}
          />
          <input
            type="password"
            placeholder="Senha"
            value={form.password}
            onChange={set("password")}
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = "var(--green-400)"}
            onBlur={(e) => e.target.style.borderColor = "var(--gray-200)"}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />

          {error && (
            <div style={{
              background: "var(--red-50)", border: "1px solid #fca5a5",
              borderRadius: "var(--radius-sm)", padding: "10px 14px",
              fontSize: 13, color: "var(--red-400)",
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{
              background: "var(--green-50)", border: "1px solid var(--green-200)",
              borderRadius: "var(--radius-sm)", padding: "10px 14px",
              fontSize: 13, color: "var(--green-600)",
            }}>
              {success}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              padding: "15px",
              background: loading ? "var(--gray-300)" : "var(--green-500)",
              color: "var(--white)",
              borderRadius: "var(--radius-md)",
              fontFamily: "var(--font-display)",
              fontWeight: 700, fontSize: 16,
              transition: "background 0.15s",
              marginTop: 4,
            }}
          >
            {loading ? "Aguarde..." : tab === "login" ? "Entrar" : "Criar conta"}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--gray-500)", marginTop: 20 }}>
          Continue sem conta e{" "}
          <button
            onClick={() => setPage("home")}
            style={{ color: "var(--green-600)", fontWeight: 600, fontSize: 13 }}
          >
            veja as ofertas
          </button>
        </p>
      </div>
    </div>
  );
}
