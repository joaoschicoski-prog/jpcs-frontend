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

function AppInner() {
  const { page, setPage, selectedMarket, goToMarket } = useNav();

  const pages = {
    home: <Home setPage={setPage} />,
    ranking: <Ranking onSelectMarket={goToMarket} />,
    login: <Login setPage={setPage} />,
    list: <ShoppingList setPage={setPage} />,
    profile: <Profile setPage={setPage} />,
    admin: <Admin setPage={setPage} />,
    market: <MarketOffers market={selectedMarket} onBack={() => setPage("ranking")} />,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header page={page} setPage={setPage} />
      <main style={{ flex: 1, overflowY: "auto" }}>
        {pages[page] || <Home setPage={setPage} />}
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
