import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
const ListContext = createContext(null);
export function ListProvider({ children }) {
  const { isLogged } = useAuth();
  const [list, setList] = useState([]);
  useEffect(() => {
    if (isLogged) {
      const l = localStorage.getItem("jpcs_shoppinglist");
      if (l) try { setList(JSON.parse(l)); } catch (_) {}
    } else { setList([]); }
  }, [isLogged]);
  const saveList = (nl) => { setList(nl); localStorage.setItem("jpcs_shoppinglist", JSON.stringify(nl)); };
  const addToList = (product, cheapestPrice, supermarket) => {
    if (list.find((i) => i.id === product.id)) return;
    saveList([...list, { ...product, checked: false, quantity: 1, cheapestPrice: cheapestPrice || null, supermarket: supermarket || "Sem mercado definido" }]);
  };
  const removeFromList = (id) => saveList(list.filter((i) => i.id !== id));
  const toggleChecked = (id) => saveList(list.map((i) => i.id === id ? { ...i, checked: !i.checked } : i));
  const updateQuantity = (id, quantity) => saveList(list.map((i) => i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i));
  const isInList = (id) => list.some((i) => i.id === id);
  return (
    <ListContext.Provider value={{ list, addToList, removeFromList, toggleChecked, updateQuantity, isInList }}>
      {children}
    </ListContext.Provider>
  );
}
export const useList = () => useContext(ListContext);
