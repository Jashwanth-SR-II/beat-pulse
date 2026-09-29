import { Play } from 'lucide-react'

export default function PlaylistCard({ title, subtitle, gradient, onClick, isActive }) {
  return (
    <div
      onClick={onClick}
      className={`group relative rounded-2xl overflow-hidden cursor-pointer transition
        ${isActive ? 'ring-2 ring-accent/60' : 'hover:scale-[1.02]'}`}
    >
      <div className={`aspect-square bg-gradient-to-br ${gradient} p-5 flex flex-col justify-between`}>
        <div />
        <div>
          <h3 className="text-xl font-bold text-black/90">{title}</h3>
          <p className="text-sm text-black/60 font-medium">{subtitle}</p>
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClick?.()
        }}
        className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-black/70 backdrop-blur
                   flex items-center justify-center opacity-0 translate-y-2
                   group-hover:opacity-100 group-hover:translate-y-0 transition-all"
        aria-label={`Play ${title}`}
      >
        <Play className="w-5 h-5 text-accent fill-accent" />
      </button>
    </div>
  )
}