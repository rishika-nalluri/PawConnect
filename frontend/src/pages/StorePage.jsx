import React, { useState } from 'react'
import {
  Search,
  Filter,
  Coins,
  ShoppingBag,
  Star,
  CheckCircle,
  X,
  Sparkles,
  ShieldAlert
} from 'lucide-react'
import { store } from '../api/client'
import { useCart } from '../context/CartContext'

export const StorePage = () => {
  const products = store.getProducts()
  const { addToCart } = useCart()

  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [coinsOnly, setCoinsOnly] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const categories = ['ALL', 'Supplements & Health', 'Food & Nutrition', 'Treats & Chews', 'Grooming & Hygiene', 'Accessories & Bedding', 'Toys & Training']

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory
    const matchesCoin = !coinsOnly || p.coinEligible
    return matchesSearch && matchesCat && matchesCoin
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-teal-dark to-brand-teal text-white rounded-3xl p-8 sm:p-10 shadow-premium relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-amber-light flex items-center gap-1.5">
            <Coins className="w-4 h-4 fill-current" /> PawCoins Powered Store
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Canine Wellness & Health Marketplace
          </h1>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Every product is handpicked for nutritional safety and digestive health. Use your earned PawCoins for instant checkout discounts.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-soft border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search probiotics, food, toys..."
            className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-brand-teal"
          />
        </div>

        {/* Categories Horizontal */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-teal text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Coin Eligible Toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-brand-amber-dark shrink-0">
          <input
            type="checkbox"
            checked={coinsOnly}
            onChange={(e) => setCoinsOnly(e.target.checked)}
            className="rounded text-brand-amber focus:ring-brand-amber cursor-pointer"
          />
          <span className="flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-brand-amber fill-brand-amber" /> Coin Eligible Only
          </span>
        </label>

      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-3xl p-5 border border-gray-100 hover:border-brand-teal/20 hover:shadow-hover transition-all flex flex-col justify-between group"
          >
            <div>
              <div
                onClick={() => setSelectedProduct(product)}
                className="relative rounded-2xl overflow-hidden aspect-square bg-gray-50 mb-4 cursor-pointer"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {product.coinEligible && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-brand-amber text-white text-[10px] font-extrabold flex items-center gap-1 shadow-sm">
                    <Coins className="w-3 h-3 fill-current" /> Save up to ₹{product.maxCoinsAllowed}
                  </span>
                )}
                <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-gray-700 flex items-center gap-1 shadow-sm">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {product.rating} ({product.reviewsCount})
                </span>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">{product.category}</span>
              <h3
                onClick={() => setSelectedProduct(product)}
                className="font-heading font-bold text-base text-brand-teal-dark mt-1 cursor-pointer hover:text-brand-teal transition-colors"
              >
                {product.name}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-gray-400 font-medium">Price</span>
                <p className="font-heading font-extrabold text-xl text-brand-text">₹{product.price}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="px-3 py-2 text-xs font-bold text-brand-teal hover:bg-brand-teal-surface rounded-xl transition-all"
                >
                  Details
                </button>
                <button
                  onClick={() => addToCart(product)}
                  className="px-4 py-2 bg-brand-teal text-white font-heading font-bold text-xs rounded-xl hover:bg-brand-teal-dark shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h4 className="font-heading font-bold text-gray-600">No products matched your criteria</h4>
          <p className="text-xs text-gray-400 mt-1">Try clearing search terms or selecting another category.</p>
        </div>
      )}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 relative shadow-2xl border border-brand-teal/20">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-4">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-brand-amber tracking-wider">{selectedProduct.category}</span>
              <h3 className="font-heading font-bold text-xl text-brand-teal-dark">{selectedProduct.name}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{selectedProduct.description}</p>
            </div>

            {selectedProduct.coinEligible && (
              <div className="my-4 p-3 rounded-2xl bg-brand-amber-surface border border-brand-amber/30 flex items-center gap-3">
                <Coins className="w-6 h-6 text-brand-amber fill-brand-amber shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-brand-amber-dark">PawCoins Discount Enabled</p>
                  <p className="text-gray-600">Redeem up to {selectedProduct.maxCoinsAllowed} PawCoins at checkout for ₹{selectedProduct.maxCoinsAllowed} off!</p>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
              <p className="font-heading font-black text-2xl text-brand-text">₹{selectedProduct.price}</p>
              <button
                onClick={() => {
                  addToCart(selectedProduct)
                  setSelectedProduct(null)
                }}
                className="px-6 py-3 bg-brand-teal text-white font-heading font-bold text-xs rounded-xl hover:bg-brand-teal-dark shadow-soft flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
