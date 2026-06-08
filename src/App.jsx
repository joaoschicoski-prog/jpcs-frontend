import { AuthProvider } from "./context/AuthContext";
import { ListProvider } from "./context/ListContext";
import { NavProvider, useNav } from "./context/NavContext";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import Ranking from "./pages/Ranking";
import Login from "./pages/Login";
import ShoppingList from "./pages/ShoppingList";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import MarketOffers from "./pages/MarketOffers";
import ProductDetail from "./pages/ProductDetail";

function AppInner() {
  const { page, setPage, selectedMarket, marketTab, goToMarket, selectedProduct, goBack } = useNav();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header page={page} setPage={setPage} />
      <main style={{ flex: 1, overflowY: "auto" }}>
        {page === "home" && <Home setPage={setPage} />}
        {page === "ranking" && <Ranking onSelectMarket={goToMarket} />}
        {page === "login" && <Login setPage={setPage} />}
        {page === "list" && <ShoppingList setPage={setPage} />}
        {page === "profile" && <Profile setPage={setPage} />}
        {page === "admin" && <Admin setPage={setPage} />}
        {page === "market" && <MarketOffers key={`${selectedMarket?.name}-${marketTab}-${selectedMarket?._ts || 0}`} market={selectedMarket} initialTab={marketTab} onBack={goBack} />}
        {page === "product" && <ProductDetail product={selectedProduct} onBack={goBack} />}
        {!["home","ranking","login","list","profile","admin","market","product"].includes(page) && <Home setPage={setPage} />}
      </main>
      <BottomNav page={page} setPage={setPage} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavProvider>
        <ListProvider>
          <AppInner />
        </ListProvider>
      </NavProvider>
    </AuthProvider>
  );
}