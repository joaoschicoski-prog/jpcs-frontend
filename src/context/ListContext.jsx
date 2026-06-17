import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
const ListContext = createContext(null);
export function ListProvider({ children }) {
  const { isLogged } = useAuth();
  const [list, setList] = useState([]);
  const [manualItems, setManualItems] = useState([]);

  useEffect(() => {
    if (isLogged) {
      const l = localStorage.getItem("jpcs_shoppinglist");
      const m = localStorage.getItem("jpcs_manualitems");
      if (l) try { setList(JSON.parse(l)); } catch (_) {}
      if (m) try { setManualItems(JSON.parse(m)); } catch (_) {}
    } else { setList([]); setManualItems([]); }
  }, [isLogged]);

  const saveList = (nl) => { setList(nl); localStorage.setItem("jpcs_shoppinglist", JSON.stringify(nl)); };
  const saveManual = (nm) => { setManualItems(nm); localStorage.setItem("jpcs_manualitems", JSON.stringify(nm)); };

  const addToList = (product, cheapestPrice, supermarket) => {
    if (list.find((i) => i.id === product.id)) return;
    saveList([...list, { ...product, checked: false, quantity: 1, cheapestPrice: cheapestPrice || null, supermarket: supermarket || "Sem mercado definido" }]);
  };
  const removeFromList = (id) => saveList(list.filter((i) => i.id !== id));
  const toggleChecked = (id) => saveList(list.map((i) => i.id === id ? { ...i, checked: !i.checked } : i));
  const updateQuantity = (id, quantity) => saveList(list.map((i) => i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i));
  const isInList = (id) => list.some((i) => i.id === id);
  const clearAll = () => { saveList([]); saveManual([]); };

  const addManualItem = (name) => {
    if (!name.trim()) return;
    const id = `manual_${Date.now()}`;
    saveManual([...manualItems, { id, name: name.trim(), checked: false, quantity: 1 }]);
  };
  const removeManualItem = (id) => saveManual(manualItems.filter((i) => i.id !== id));
  const toggleManualChecked = (id) => saveManual(manualItems.map((i) => i.id === id ? { ...i, checked: !i.checked } : i));
  const updateManualQuantity = (id, quantity) => saveManual(manualItems.map((i) => i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i));

  return (
    <ListContext.Provider value={{ list, manualItems, addToList, removeFromList, toggleChecked, updateQuantity, isInList, addManualItem, removeManualItem, toggleManualChecked, updateManualQuantity }}>
      {children}
    </ListContext.Provider>
  );
}
export const useList = () => useContext(ListContext);