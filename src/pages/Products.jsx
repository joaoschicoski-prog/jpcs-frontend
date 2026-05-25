import { useEffect, useState } from "react";

const API_URL = "http://192.168.18.2:3000";

function Products() {
  const [products, setProducts] = useState([]);
  const [cheapest, setCheapest] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [offers, setOffers] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then(setProducts)
      .finally(() => setLoadingProducts(false));

    fetch(`${API_URL}/offers/cheapest`)
      .then((res) => res.json())
      .then(setCheapest);
  }, []);

  const handleClick = async (product) => {
    setSelectedProduct(product);
    setLoadingOffers(true);

    const res = await fetch(
      `${API_URL}/offers?product_id=${product.id}`
    );
    const data = await res.json();

    setOffers(data);
    setLoadingOffers(false);
  };

  const lowest = offers.length
    ? Math.min(...offers.map((o) => Number(o.price)))
    : null;

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      selectedCategory === "all" || p.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  const categories = [
    "all",
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  return (
    <div style={{ background: "#f2f2f2", minHeight: "100vh" }}>
      
      {/* 🔥 HEADER FIXO */}
      <div
        style={{
          background: "#2e7d32",
          color: "#fff",
          padding: "15px",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "20px",
          position: "sticky",
          top: 0,
        }}
      >
        🛒 JPCSPromo
      </div>

      <div style={{ padding: "15px", maxWidth: "500px", margin: "0 auto" }}>
        
        {/* 🔍 BUSCA */}
        <input
          type="text"
          placeholder="Buscar produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "12px",
            border: "none",
            marginBottom: "15px",
          }}
        />

        {/* 🏷️ CATEGORIAS */}
        <div style={{ display: "flex", overflowX: "auto", marginBottom: "15px" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                marginRight: "8px",
                padding: "8px 15px",
                borderRadius: "20px",
                border: "none",
                whiteSpace: "nowrap",
                background: selectedCategory === cat ? "#2e7d32" : "#ddd",
                color: selectedCategory === cat ? "#fff" : "#000",
              }}
            >
              {cat === "all" ? "Todos" : cat}
            </button>
          ))}
        </div>

        {/* 🔥 MELHORES PREÇOS */}
        <h3 style={{ marginBottom: "10px" }}>🔥 Ofertas em destaque</h3>

        <div style={{ display: "flex", overflowX: "auto", marginBottom: "20px" }}>
          {cheapest.slice(0, 5).map((c) => (
            <div
              key={c.product_id}
              style={{
                minWidth: "140px",
                background: "#fff",
                padding: "10px",
                borderRadius: "12px",
                marginRight: "10px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <strong style={{ fontSize: "14px" }}>{c.product_name}</strong>
              <p style={{ color: "#2e7d32", fontWeight: "bold" }}>
                R$ {c.price}
              </p>
            </div>
          ))}
        </div>

        {/* 🔄 LOADING */}
        {loadingProducts && <p>Carregando produtos...</p>}

        {/* 📦 PRODUTOS */}
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            onClick={() => handleClick(p)}
            style={{
              background: "#fff",
              padding: "15px",
              borderRadius: "15px",
              marginBottom: "10px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              cursor: "pointer",
            }}
          >
            <strong>{p.name}</strong>
            <p style={{ fontSize: "12px", color: "#777" }}>
              {p.category || "Sem categoria"} • {p.brand || "Sem marca"}
            </p>
          </div>
        ))}

        {/* 💰 MODAL SIMPLES */}
        {selectedProduct && (
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              background: "#fff",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px",
              padding: "15px",
              boxShadow: "0 -2px 10px rgba(0,0,0,0.2)",
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            <h3>{selectedProduct.name}</h3>

            {loadingOffers && <p>Carregando preços...</p>}

            {offers
              .sort((a, b) => Number(a.price) - Number(b.price))
              .map((o) => (
                <div
                  key={o.id}
                  style={{
                    background:
                      Number(o.price) === lowest ? "#c8e6c9" : "#f5f5f5",
                    padding: "10px",
                    marginBottom: "8px",
                    borderRadius: "10px",
                  }}
                >
                  {o.supermarket} → R$ {o.price}

                  {Number(o.price) === lowest && (
                    <span style={{ marginLeft: "10px", color: "green" }}>
                      🔥 MELHOR
                    </span>
                  )}
                </div>
              ))}

            {/* FECHAR */}
            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                width: "100%",
                padding: "12px",
                marginTop: "10px",
                borderRadius: "10px",
                border: "none",
                background: "#2e7d32",
                color: "#fff",
              }}
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;