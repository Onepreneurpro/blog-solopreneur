'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Voulez-vous vraiment supprimer définitivement le produit "${productName}" ?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/produits/${productId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la suppression du produit.');
      }

      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={loading}
      onClick={handleDelete}
      className="p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
      title="Supprimer ce produit"
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
