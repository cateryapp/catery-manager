import { redirect } from 'next/navigation'

export default async function CatalogPage({ params }: { params: { workspaceId: string } }) {
    const { workspaceId } = await params
    redirect(`/w/${workspaceId}/catalog/products`)
}
