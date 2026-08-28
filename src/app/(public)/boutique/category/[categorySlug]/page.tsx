import { redirect } from 'next/navigation';

interface Props {
  params: { categorySlug: string };
}

export default function BoutiqueCategoryAliasPage({ params }: Props) {
  redirect(`/boutique/categorie/${params.categorySlug}`);
}
