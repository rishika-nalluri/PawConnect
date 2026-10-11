import React from 'react'
import { Heart, Sparkles } from 'lucide-react'

export const PromoBar = () => {
  return (
    <div className="bg-brand-teal-dark text-white text-xs py-2 px-4 font-medium transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1 text-center sm:text-left">
        <div className="flex items-center gap-2">
          <span className="bg-brand-amber text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> PawCoins Active
          </span>
          <span>Earn 100 PawCoins per vaccination logged • 100% of redeemed coins fund street-dog meals</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-brand-surface text-[11px]">
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3 text-brand-coral fill-brand-coral" /> 14,200+ street dogs fed this quarter
          </span>
          <span>•</span>
          <span>Verified Veterinary Network</span>
        </div>
      </div>
    </div>
  )
}
