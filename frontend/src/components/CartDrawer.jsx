import React, { useState } from 'react'
import { X, Trash2, ShoppingBag, Coins, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export const CartDrawer = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    coinsApplied,
    setCoinsApplied,
    maxApplicableCoins,
    discountAmount,
    total,
    checkout
  } = useCart()

  const { currentUser } = useAuth()
  const [checkoutSuccess, setCheckoutSuccess] = useState(null)

  if (!isCartOpen) return null

  const handleCheckout = () => {
    const res = checkout()
    if (res) {
      setCheckoutSuccess(res)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => {
          setIsCartOpen(false)
          setCheckoutSuccess(null)
        }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 bg-brand-teal text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-amber-light" />
              <h3 className="font-heading font-bold text-lg">Your Wellness Cart</h3>
            </div>
            <button
              onClick={() => {
                setIsCartOpen(false)
                setCheckoutSuccess(null)
              }}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Screen */}
          {checkoutSuccess ? (
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-brand-teal-surface text-brand-teal flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-heading font-extrabold text-2xl text-brand-teal-dark">Order Confirmed!</h4>
              <p className="text-sm text-brand-muted">
                Order <span className="font-mono font-bold text-brand-teal">{checkoutSuccess.orderId}</span> has been placed.
              </p>
              <div className="p-4 rounded-2xl bg-brand-amber-surface border border-brand-amber/30 w-full text-left space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand-amber-dark">
                  <Sparkles className="w-4 h-4 text-brand-amber" />
                  <span>PawCoins Cashback Earned!</span>
                </div>
                <p className="text-xs text-brand-text">
                  You earned <strong className="text-brand-amber font-bold">+{checkoutSuccess.earnedCoins} PawCoins</strong> from this purchase.
                </p>
              </div>
              <button
                onClick={() => {
                  setCheckoutSuccess(null)
                  setIsCartOpen(false)
                }}
                className="w-full py-3 bg-brand-teal text-white font-bold rounded-xl hover:bg-brand-teal-dark transition-all"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-3">
                    <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
                    <p className="text-sm font-semibold">Your cart is currently empty</p>
                    <p className="text-xs text-gray-400">Discover vetted nutritional supplements and food in our store</p>
                  </div>
                ) : (
                  items.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex gap-4 p-3 rounded-2xl border border-gray-100 hover:border-brand-teal/20 transition-all bg-brand-bg/30"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-18 h-18 object-cover rounded-xl border border-gray-200"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-brand-teal-dark line-clamp-1">{product.name}</h4>
                          <p className="text-xs font-extrabold text-brand-text mt-0.5">₹{product.price}</p>
                          {product.coinEligible && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-brand-amber mt-0.5">
                              <Coins className="w-2.5 h-2.5" /> Up to {product.maxCoinsAllowed} coins discount
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-2 py-0.5">
                            <button
                              onClick={() => updateQuantity(product.id, -1)}
                              className="text-xs font-bold text-gray-500 hover:text-brand-teal"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-brand-text">{quantity}</span>
                            <button
                              onClick={() => updateQuantity(product.id, 1)}
                              className="text-xs font-bold text-gray-500 hover:text-brand-teal"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(product.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Order Summary & Coin Redemption */}
              {items.length > 0 && (
                <div className="p-6 bg-brand-bg border-t border-brand-teal/10 space-y-4">
                  
                  {/* PawCoins Discount Slider */}
                  {maxApplicableCoins > 0 && (
                    <div className="p-3.5 rounded-2xl bg-brand-amber-surface border border-brand-amber/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-brand-amber-dark">
                        <span className="flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5 text-brand-amber fill-brand-amber" />
                          Redeem PawCoins (Balance: {currentUser?.coinsBalance || 0})
                        </span>
                        <span>₹{discountAmount} Off</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={maxApplicableCoins}
                        step="10"
                        value={coinsApplied}
                        onChange={(e) => setCoinsApplied(Number(e.target.value))}
                        className="w-full accent-brand-amber cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-brand-muted">
                        <span>0 Coins</span>
                        <span className="font-bold text-brand-amber-dark">{coinsApplied} Coins applied</span>
                        <span>Max {maxApplicableCoins}</span>
                      </div>
                    </div>
                  )}

                  {/* Pricing Breakdown */}
                  <div className="space-y-1.5 text-xs text-brand-muted">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold text-brand-text">₹{subtotal}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-brand-amber-dark font-bold">
                        <span>PawCoins Discount</span>
                        <span>-₹{discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Estimated Shipping</span>
                      <span className="text-emerald-600 font-bold">FREE</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-brand-teal-dark pt-2 border-t border-gray-200">
                      <span>Total Amount</span>
                      <span>₹{total}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full py-3.5 bg-gradient-to-r from-brand-teal to-brand-teal-dark text-white font-heading font-bold text-sm rounded-xl shadow-soft hover:shadow-hover flex items-center justify-center gap-2 group transition-all"
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <p className="text-[10px] text-center text-gray-400">
                    5% of your purchase is rewarded back in PawCoins to fund street-dog care
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  )
}
