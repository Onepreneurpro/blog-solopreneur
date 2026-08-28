import { redirect } from 'next/navigation';

interface Props {
  params: { categorySlug: string };
  searchParams: { [key: string]: string | undefined };
}

export default function BlogCategoryEnglishAliasPage({ params, searchParams }: Props) {
  const queryStr = new URLSearchParams(searchParams as Record<string, string>).toString();
  const targetUrl = `/blog/categorie/${params.categorySlug}${queryStr ? `?${queryStr}` : ''}`;
  redirect(targetUrl);
}
