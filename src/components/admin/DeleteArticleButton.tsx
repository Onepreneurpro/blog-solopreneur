'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DeleteArticleButton({ articleId, articleTitle }: { articleId: string; articleTitle: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm(`Voulez-vous vraiment supprimer l article "${articleTitle}" ? Cette action est irréversible.`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Erreur lors de la suppression de l article.');
      }
    } catch (err) {
      console.error('Delete article error:', err);
      alert('Erreur lors de la suppression.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-1 font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
      title="Supprimer l article"
    >
      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
      <span>{loading ? '...' : 'Supprimer'}</span>
    </Button>
  );
}
