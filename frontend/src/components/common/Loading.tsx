interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

export default function Loading({ size = 'md', text }: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 animate-fade-in">
      <div className="relative">
        <div className={`${sizeClasses[size]} border-2 border-neutral-200 dark:border-neutral-700 rounded-full`} />
        <div className={`${sizeClasses[size]} border-2 border-transparent border-t-primary-600 rounded-full absolute inset-0 animate-spin`} />
      </div>
      {text && <p className="mt-4 text-sm text-neutral-500 dark:text-neutral-400">{text}</p>}
    </div>
  )
}
