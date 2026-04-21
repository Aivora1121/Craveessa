import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Cake } from '../lib/types';

interface CartContextValue {
  items: CartItem[];
  addItem: (cake: Cake, quantity: number, weight: string, price: number, flavor: string, customization: string) => void;
  removeItem: (cakeId: string, weight: string) => void;
  updateQuantity: (cakeId: string, weight: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  itemCount: 0,
  subtotal: 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('cakeShopCart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cakeShopCart', JSON.stringify(items));
  }, [items]);

  const addItem = (
    cake: Cake,
    quantity: number,
    weight: string,
    price: number,
    flavor: string,
    customization: string
  ) => {
    setItems(prev => {
      const existing = prev.find(i => i.cake.id === cake.id && i.weight === weight);
      if (existing) {
        return prev.map(i =>
          i.cake.id === cake.id && i.weight === weight
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { cake, quantity, weight, price, flavor, customization }];
    });
  };

  const removeItem = (cakeId: string, weight: string) => {
    setItems(prev => prev.filter(i => !(i.cake.id === cakeId && i.weight === weight)));
  };

  const updateQuantity = (cakeId: string, weight: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cakeId, weight);
      return;
    }
    setItems(prev =>
      prev.map(i =>
        i.cake.id === cakeId && i.weight === weight ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
