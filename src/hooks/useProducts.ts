import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  soldCount: number;
}

interface DbProduct {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  sold_count: number;
  created_at: string;
  updated_at: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const mapDbToProduct = (dbProduct: DbProduct): Product => ({
    id: dbProduct.id,
    name: dbProduct.name,
    category: dbProduct.category || '',
    price: Number(dbProduct.price),
    cost: Number(dbProduct.cost),
    stock: dbProduct.stock,
    minStock: dbProduct.min_stock,
    soldCount: dbProduct.sold_count,
  });

  const fetchProducts = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setProducts((data || []).map(mapDbToProduct));
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Erro ao carregar produtos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          user_id: user.id,
          name: product.name,
          category: product.category || null,
          price: product.price,
          cost: product.cost,
          stock: product.stock,
          min_stock: product.minStock,
          sold_count: product.soldCount,
        })
        .select()
        .single();

      if (error) throw error;

      const newProduct = mapDbToProduct(data);
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast({
        title: 'Erro ao adicionar produto',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id'>>) => {
    try {
      const updateData: Record<string, any> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.category !== undefined) updateData.category = updates.category || null;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.cost !== undefined) updateData.cost = updates.cost;
      if (updates.stock !== undefined) updateData.stock = updates.stock;
      if (updates.minStock !== undefined) updateData.min_stock = updates.minStock;
      if (updates.soldCount !== undefined) updateData.sold_count = updates.soldCount;

      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, ...updates } : p
      ));
      return true;
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: 'Erro ao atualizar produto',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Erro ao excluir produto',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const sellProduct = async (id: string, quantity: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return false;

    return updateProduct(id, {
      stock: Math.max(0, product.stock - quantity),
      soldCount: product.soldCount + quantity,
    });
  };

  return {
    products,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    sellProduct,
    refetch: fetchProducts,
  };
}
