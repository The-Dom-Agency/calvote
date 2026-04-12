export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-8 h-8 bg-[#1A5C52] rounded-lg flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45" />
      </div>
      <span className="text-[#1C2B3A] font-bold text-xl tracking-tight">calvote</span>
    </div>
  )
}
