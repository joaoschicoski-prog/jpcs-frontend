import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const ListContext = createContext(null);

export function ListProvider({ children }) {
  const { isLogged } = useAuth();
  const [list, setList] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (isLogged) {
      const l = localStorage.getItem("jpcs_shoppinglist");
      const f = localStorage.getItem("jpcs_favorites");
      if (l) try { setList(JSON.parse(l)); } catch (_) {}
      if (f) try { setFavorites(JSON.parse(f)); } catch (_) {}
    } else { setList([]); setFavorites([]); }
  }, [isLogged]);

  const saveList = (nl) => { setList(nl); localStorage.setItem("jpcs_shoppinglist", JSON.stringify(nl)); };
  const saveFavs = (nf) => { setFavorites(nf); localStorage.setItem("jpcs_favorites", JSON.stringify(nf)); };

  const addToList = (product, cheapestPrice, supermarket) => {
    if (list.find((i) => i.id === product.id)) return;
    saveList([...list, { ...product, checked: false, cheapestPrice: cheapestPrice || null, supermarket: supermarket || "Sem mercado definido" }]);
  };
  const removeFromList = (id) => saveList(list.filter((i) => i.id !== id));
  const toggleChecked = (id) => saveList(list.map((i) => i.id === id ? { ...i, checked: !i.checked } : i));
  const toggleFavorite = (product) => {
    if (favorites.find((f) => f.id === product.id)) saveFavs(favorites.filter((f) => f.id !== product.id));
    else saveFavs([...favorites, product]);
  };
  const isFavorite = (id) => favorites.some((f) => f.id === id);
  const isInList = (id) => list.some((i) => i.id === id);

  return (
    <ListContext.Provider value={{ list, favorites, addToList, removeFromList, toggleChecked, toggleFavorite, isFavorite, isInList }}>
      {children}
    </ListContext.Provider>
  );
}

export const useList = () => useContext(ListContext);
