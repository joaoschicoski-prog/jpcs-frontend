import { useState, useRef, useEffect } from "react";

export default function AutoComplete({ label, value, onChange, options, placeholder, required }) {
  const [query, setQuery] = useState(value?.name || "");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setQuery(value?.name || "");
  }, [value]);

  useEffect(() => {
    const handleClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = query.length === 0 ? options : options.filter((o) =>
    o.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleInput = (e) => {
    setQuery(e.target.value);
    setOpen(true);
    onChange({ id: null, name: e.target.value });
  };

  const select = (opt) => {
    setQuery(opt.name);
    onChange(opt);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ marginBottom: 12, position: "relative" }}>
      <label style={{ fontSize: 12, color: "var(--gray-600)", fontWeight: 600, display: "block", marginBottom: 4 }}>
        {label}{required && " *"}
      </label>
      <input
        value={query}
        onChange={handleInput}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "10px 14px",
          border: "1.5px solid var(--gray-200)",
          borderRadius: "var(--radius-md)",
          fontSize: 14, outline: "none", color: "var(--gray-900)",
          background: "var(--white)",
        }}
        onFocus2={(e) => e.target.style.borderColor = "var(--green-400)"}
      />
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
          background: "var(--white)", border: "1.5px solid var(--gray-200)",
          borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md)",
          maxHeight: 200, overflowY: "auto", marginTop: 4,
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "10px 14px", fontSize: 13, color: "var(--gray-500)" }}>
              Nenhum resultado — será criado como novo
            </div>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.id}
                onClick={() => select(opt)}
                style={{
                  width: "100%", textAlign: "left", padding: "10px 14px",
                  fontSize: 14, color: "var(--gray-900)",
                  borderBottom: "1px solid var(--gray-100)",
                  background: "transparent",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--green-50)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                {opt.name}
              </button>
            ))
          )}
          {query && !filtered.find((o) => o.name.toLowerCase() === query.toLowerCase()) && (
            <button
              onClick={() => { onChange({ id: null, name: query }); setOpen(false); }}
              style={{
                width: "100%", textAlign: "left", padding: "10px 14px",
                fontSize: 13, color: "var(--green-600)", fontWeight: 600,
                background: "var(--green-50)",
              }}
            >
              + Criar "{query}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
