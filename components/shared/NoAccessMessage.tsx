export default function NoAccessMessage({ title, body }: { title: string; body: string }) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 px-4 text-center">
        <h1 className="text-lg font-medium text-foreground">{title}</h1>
        <p className="max-w-md text-sm text-neutral-600 dark:text-neutral-400">
          {body}
        </p>
      </div>
    )
  }
  