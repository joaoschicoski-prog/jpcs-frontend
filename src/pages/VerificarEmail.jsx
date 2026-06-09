import { useEffect, useState } from "react";
import { api } from "../api";

export default function VerificarEmail() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Link inválido. Nenhum token encontrado.");
      return;
    }

    api.verifyEmail(token)
      .then((data) => {
        setStatus("success");
        setMessage(data.message || "Email confirmado com sucesso!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Link inválido ou já utilizado.");
      });
  }, []);

  const icon = status === "loading" ? "⏳" : status === "success" ? "✅" : "❌";
  const color = status === "success" ? "var(--green-600)" : status === "error" ? "var(--red-400)" : "var(--gray-500)";

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
          Verificação de email
        </p>
      </div>

      <div style={{
        margin: "-20px 20px 0",
        background: "var(--white)",
        borderRadius: "var(--radius-xl)",
        padding: "32px 24px",
        boxShadow: "var(--shadow-lg)",
        position: "relative", zIndex: 1,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>

        {status === "loading" && (
          <p style={{ fontSize: 15, color: "var(--gray-500)" }}>
            Verificando seu email...
          </p>
        )}

        {status !== "loading" && (
          <>
            <p style={{ fontSize: 16, fontWeight: 700, color, marginBottom: 8 }}>
              {status === "success" ? "Email confirmado!" : "Algo deu errado"}
            </p>
            <p style={{ fontSize: 14, color: "var(--gray-500)", marginBottom: 24 }}>
              {message}
            </p>
            {status === "success" && (
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
            )}
            {status === "error" && (
              <button
                onClick={() => window.location.href = "/"}
                style={{
                  padding: "14px 32px",
                  background: "var(--gray-200)",
                  color: "var(--gray-700)",
                  borderRadius: "var(--radius-md)",
                  fontWeight: 700, fontSize: 15,
                }}
              >
                Voltar para login
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}