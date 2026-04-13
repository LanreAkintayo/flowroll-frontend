interface Props {
  children: React.ReactNode
  className?: string
}

// Wraps page content with consistent max-width and padding.
// Use this inside every employer/employee page.
export default function PageShell({ children, className = '' }: Props) {
  return (
    <main className={`max-w-7xl mx-auto px-4 py-8 ${className}`}>
      {children}
    </main>
  )
}