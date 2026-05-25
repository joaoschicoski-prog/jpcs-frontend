import { createContext, useContext, useState } from "react";

const NavContext = createContext(null);

export function NavProvider({ children }) {
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [page, setPageState] = useState("home");

  const setPage = (p) => setPageState(p);

  const goToMarket = (market) => {
    setSelectedMarket(market);
    setPageState("market");
  };

  return (
    <NavContext.Provider value={{ page, setPage, selectedMarket, goToMarket }}>
      {children}
    </NavContext.Provider>
  );
}

export const useNav = () => useContext(NavContext);
