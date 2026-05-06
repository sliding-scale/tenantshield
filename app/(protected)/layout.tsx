/** Convex + Clerk data is user-specific; avoid build-time static prerender for this subtree. */
export const dynamic = "force-dynamic"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
