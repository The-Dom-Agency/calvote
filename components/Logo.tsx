import Image from 'next/image'

export function Logo({ className = '', height = 36 }: { className?: string; height?: number }) {
  const width = Math.round(height * (426 / 164))
  return (
    <Image
      src="/logo2.png"
      alt="calvote"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}
