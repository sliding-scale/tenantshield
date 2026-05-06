/** Instant feedback while navigating between protected routes (RSC streaming). */
export default function ProtectedLoading() {
  return (
    <div className="flex min-h-[50dvh] items-center justify-center bg-cream-page px-4 md:min-h-[calc(100vh-5rem)]">
      <div
        className="size-9 animate-spin rounded-full border-2 border-primary border-t-transparent"
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}
