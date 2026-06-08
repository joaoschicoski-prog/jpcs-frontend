import { createContext, useContext, useState } from "react";

const NavContext = createContext(null);

export function NavProvider({ children }) {
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [marketTab, setMarketTab] = useState("offers");
  const [page, setPageState] = useState("home");
  const [prevPage, setPrevPage] = useState("home");

  const setPage = (p) => { setPrevPage(page); setPageState(p); };

  const goToMarket = (market) => {
    setSelectedMarket({ ...market, _ts: Date.now() });
    setMarketTab(market.initialTab || "offers");
    setPrevPage(page);
    setPageState("market");
  };

  const goToProduct = (product) => {
    setSelectedProduct(product);
    setPrevPage(page);
    setPageState("product");
  };

  const goBack = () => setPageState(prevPage || "home");

  return (
    <NavContext.Provider value={{ page, setPage, selectedMarket, marketTab, goToMarket, selectedProduct, goToProduct, goBack }}>
      {children}
    </NavContext.Provider>
  );
}

export const useNav = () => useContext(NavContext);