interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export default function Loading({ size = 'md', text }: LoadingProps) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }

  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className={`${sizes[size]} border-2 border-outline-variant border-t-primary-container rounded-full animate-spin`} />
      {text && <p className="mt-4 text-sm text-on-surface-variant font-medium">{text}</p>}
    </div>
  )
}
