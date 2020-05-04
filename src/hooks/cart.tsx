import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { Product } from 'src/pages/Cart/styles';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const response = await AsyncStorage.getItem('@GoMarketplace:cart');
      if (response) {
        setProducts(JSON.parse(response));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(
        oldProduct => oldProduct.id === product.id,
      );

      if (productIndex) {
        const newsProducts = products;
        newsProducts[productIndex].quantity =
          products[productIndex].quantity + 1;

        setProducts(newsProducts);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify(newsProducts),
        );
      }

      const newProduct = product;
      newProduct.quantity = 1;

      setProducts([...products, newProduct]);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify([...products, newProduct]),
      );
    },
    [products, setProducts],
  );

  const increment = useCallback(
    async id => {
      const newProduct = products.map(product =>
        product.id === id
          ? { ...product, quantity: product.quantity + 1 }
          : product,
      );

      setProducts(newProduct);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(newProduct),
      );
    },
    [products, setProducts],
  );

  const decrement = useCallback(async id => {
    // teste
  }, []);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

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
