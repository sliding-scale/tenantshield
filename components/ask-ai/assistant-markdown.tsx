"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

const components: Components = {
  p: ({ children, className, ...props }) => (
    <p
      {...props}
      className={cn("mb-3 text-[15px] leading-relaxed text-foreground last:mb-0", className)}
    >
      {children}
    </p>
  ),
  strong: ({ children, className, ...props }) => (
    <strong
      {...props}
      className={cn("font-semibold text-foreground", className)}
    >
      {children}
    </strong>
  ),
  em: ({ children, className, ...props }) => (
    <em {...props} className={cn("italic text-ink-warm", className)}>
      {children}
    </em>
  ),
  ul: ({ children, className, ...props }) => (
    <ul
      {...props}
      className={cn(
        "mb-3 list-disc space-y-1 pl-5 text-[15px] text-foreground last:mb-0",
        className,
      )}
    >
      {children}
    </ul>
  ),
  ol: ({ children, className, ...props }) => (
    <ol
      {...props}
      className={cn(
        "mb-3 list-decimal space-y-1 pl-5 text-[15px] text-foreground last:mb-0",
        className,
      )}
    >
      {children}
    </ol>
  ),
  li: ({ children, className, ...props }) => (
    <li {...props} className={cn("leading-relaxed", className)}>
      {children}
    </li>
  ),
  a: ({ children, className, href, ...props }) => (
    <a
      {...props}
      href={href}
      className={cn(
        "text-primary underline underline-offset-2 hover:opacity-90",
        className,
      )}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  h1: ({ children, className, ...props }) => (
    <h1
      {...props}
      className={cn(
        "font-heading mb-2 text-xl font-semibold text-ink-warm first:mt-0",
        className,
      )}
    >
      {children}
    </h1>
  ),
  h2: ({ children, className, ...props }) => (
    <h2
      {...props}
      className={cn(
        "font-heading mb-2 mt-4 text-lg font-semibold text-ink-warm first:mt-0",
        className,
      )}
    >
      {children}
    </h2>
  ),
  h3: ({ children, className, ...props }) => (
    <h3
      {...props}
      className={cn(
        "mb-2 mt-3 text-base font-semibold text-ink-warm first:mt-0",
        className,
      )}
    >
      {children}
    </h3>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = (className ?? "").includes("language-");
    if (isBlock) {
      return (
        <code
          {...props}
          className={cn("font-mono text-sm text-foreground", className)}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        {...props}
        className={cn(
          "rounded-md border border-cream-border bg-cream-surface-soft px-1.5 py-0.5 font-mono text-[0.8125rem] text-foreground",
          className,
        )}
      >
        {children}
      </code>
    );
  },
  pre: ({ children, className, ...props }) => (
    <pre
      {...props}
      className={cn(
        "mb-3 max-w-full overflow-x-auto rounded-xl border border-cream-border bg-cream-surface-soft p-3 text-sm last:mb-0",
        className,
      )}
    >
      {children}
    </pre>
  ),
  blockquote: ({ children, className, ...props }) => (
    <blockquote
      {...props}
      className={cn(
        "border-primary/35 text-ink-warm-muted mb-3 border-l-4 pl-3 text-[15px] italic last:mb-0",
        className,
      )}
    >
      {children}
    </blockquote>
  ),
  hr: ({ className, ...props }) => (
    <hr {...props} className={cn("border-cream-border my-4", className)} />
  ),
};

type AssistantMarkdownProps = {
  text: string;
  className?: string;
};

export function AssistantMarkdown({ text, className }: AssistantMarkdownProps) {
  return (
    <div className={cn("min-w-0 break-words [&_p]:first:mt-0", className)}>
      <ReactMarkdown components={components}>{text}</ReactMarkdown>
    </div>
  );
}
