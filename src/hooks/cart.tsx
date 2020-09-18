import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cartItems = JSON.parse(
        (await AsyncStorage.getItem('@Cart')) || '[]',
      ) as Product[];

      setProducts(cartItems);
    }

    loadProducts();
  }, [products]);

  const addToCart = useCallback(
    async (product: Product): Promise<void> => {
      const existItem = products.findIndex(item => item.id === product.id);

      const cartItems = products;

      if (existItem > -1) {
        cartItems[existItem].quantity += 1;
      } else {
        cartItems.push({
          id: product.id,
          title: product.title,
          image_url: product.image_url,
          price: product.price,
          quantity: 1,
        });
      }

      await AsyncStorage.setItem('@Cart', JSON.stringify(cartItems));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const existItem = products.findIndex(item => item.id === id);

      const cart = products;

      if (existItem !== -1) cart[existItem].quantity += 1;

      await AsyncStorage.setItem('@Cart', JSON.stringify(cart));
      setProducts(cart);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const existItem = products.findIndex(item => item.id === id);

      const cart = products;

      if (cart[existItem].quantity === 1) cart.splice(existItem, 1);
      else cart[existItem].quantity -= 1;

      await AsyncStorage.setItem('@Cart', JSON.stringify(cart));
      setProducts(cart);
    },
    [products],
  );

  const value = useMemo(() => ({ addToCart, increment, decrement, products }), [
    products,
    addToCart,
    increment,
    decrement,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
