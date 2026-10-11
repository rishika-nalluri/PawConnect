import React, { createContext, useContext, useState } from 'react'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [coinsApplied, setCoinsApplied] = useState(0)
  const { currentUser, updateCoins } = useAuth()

  const addToCart = (product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i)
      }
      return [...prev, { product, quantity }]
    })
    setIsCartOpen(true)
  }

  const removeFromCart = (productId) => {
    setItems(prev => prev.filter(i => i.product.id !== productId))
  }

  const updateQuantity = (productId, delta) => {
    setItems(prev => prev.map(i => {
      if (i.product.id === productId) {
        const newQty = Math.max(1, i.quantity + delta)
        return { ...i, quantity: newQty }
      }
      return i
    }))
  }

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  
  // Calculate max eligible coins that can be redeemed
  const maxCoinsRedeemable = items.reduce((sum, item) => {
    if (item.product.coinEligible) {
      return sum + ((item.product.maxCoinsAllowed || 50) * item.quantity)
    }
    return sum
  }, 0)

  const userCoins = currentUser?.coinsBalance || 0
  const maxApplicableCoins = Math.min(userCoins, maxCoinsRedeemable, Math.floor(subtotal * 0.4))
  const discountAmount = Math.min(coinsApplied, maxApplicableCoins)
  const total = Math.max(0, subtotal - discountAmount)

  const clearCart = () => {
    setItems([])
    setCoinsApplied(0)
  }

  const checkout = () => {
    if (items.length === 0) return null

    if (discountAmount > 0) {
      updateCoins(-discountAmount, "STORE_PURCHASE_DISCOUNT")
    }

    // Award 5% back in PawCoins for store purchase
    const earnedCoins = Math.floor(total * 0.05)
    if (earnedCoins > 0) {
      updateCoins(earnedCoins, "STORE_ORDER_CASHBACK")
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}`
    clearCart()
    setIsCartOpen(false)
    return { orderId, total, earnedCoins }
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        isCartOpen,
        setIsCartOpen,
        subtotal,
        coinsApplied,
        setCoinsApplied,
        maxApplicableCoins,
        discountAmount,
        total,
        clearCart,
        checkout,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0)
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
