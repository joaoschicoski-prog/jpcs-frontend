import { useState } from "react";
import { api } from "../api";

export default function RedefinirSenha() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const inputStyle = {
    width: "100%", padding: "14px 16px",
    borderRadius: "var(--radius-md)",
    border: "1.5px solid var(--gray-200)",
    fontSize: 15, outline: "none",
    background: "var(--white)",
    color: "var(--gray-900)",
    transition: "border-color 0.15s",
  };

  const handleSubmit = async () => {
    setError(""); setSuccess("");

    if (!token) {
      setError("Link inválido. Solicite um novo link de redefinição."); return;
    }
    if (!password || !confirm) {
      setError("Preencha todos os campos."); return;
    }
    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres."); return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem."); return;
    }

    setLoading(true);
    try {
      const data = await api.resetPassword({ token, password });
      setSuccess(data.message || "Senha redefinida com sucesso!");
    } catch (err) {
      setError(err.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
          <span style={{ color: "var(--green-200)" }}>JPCSPromo</span>
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
          Redefinir senha
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
        <h3 style={{ fontWeight: 700, fontSize: 17, color: "var(--gray-900)", marginBottom: 4 }}>
          Nova senha
        </h3>
        <p style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 20 }}>
          Digite sua nova senha abaixo.
        </p>

        {!success ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              type="password"
              placeholder="Nova senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              onFocus={(e) => e.target.style.borderColor = "var(--green-400)"}
              onBlur={(e) => e.target.style.borderColor = "var(--gray-200)"}
            />
            <input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
              {loading ? "Aguarde..." : "Redefinir senha"}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--green-600)", marginBottom: 8 }}>
              Senha redefinida!
            </p>
            <p style={{ fontSize: 14, color: "var(--gray-500)", marginBottom: 24 }}>
              {success}
            </p>
            <button
              onClick={() => window.location.href = "/"}
              style={{
                padding: "14px 32px",
                background: "var(--green-500)",
                color: "var(--white)",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-display)",
                fontWeight: 700, fontSize: 15,
              }}
            >
              Fazer login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}