import React, { useState, useRef, useEffect } from 'react'
import { Bot, Send, X, Sparkles, AlertCircle, User, Stethoscope } from 'lucide-react'
import { apiChatAssistant } from '../api/client'
import { useAuth } from '../context/AuthContext'

export const AIChatModal = ({ isOpen, onClose, initialQuery = '' }) => {
  const { currentRole, currentUser } = useAuth()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am your **PawConnect Canine Care Assistant** powered by Groq AI. I can guide you on general wellness, nutrition, vaccine timelines, and explaining your dog's health observations. How can I help you today?"
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery)
    }
  }, [initialQuery])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (!isOpen) return null

  const handleSend = async (textToSend) => {
    const text = textToSend || input
    if (!text.trim() || isLoading) return

    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const reply = await apiChatAssistant(newMessages, { role: currentRole, userName: currentUser?.fullName })
      setMessages([...newMessages, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages([...newMessages, {
        role: 'assistant',
        content: "I'm having trouble connecting right now, but please ensure your dog stays hydrated. If symptoms are severe, consult a vet immediately."
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const quickPrompts = [
    "What human foods are toxic to dogs?",
    "Why does my dog have soft stools?",
    "Puppy core vaccination schedule",
    "How do PawCoins help street dogs?"
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col h-[640px] overflow-hidden border border-brand-teal/20">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-brand-teal to-brand-teal-dark text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-brand-amber-light">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-base">PawConnect AI Care Assistant</h3>
                <span className="text-[10px] bg-brand-amber text-white px-2 py-0.5 rounded-full font-bold">Groq Llama 3</span>
              </div>
              <p className="text-xs text-white/80">Veterinary triage & pet wellness guidance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="bg-brand-amber-surface border-b border-brand-amber/20 px-4 py-2 flex items-center gap-2 text-xs text-brand-amber-dark">
          <AlertCircle className="w-4 h-4 text-brand-amber shrink-0" />
          <span className="text-[11px] leading-tight">
            Educational companion only. Cannot diagnose illnesses or prescribe medication. Consult a licensed vet for medical emergencies.
          </span>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-bg/40">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-brand-teal text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-teal text-white font-medium rounded-tr-none'
                    : 'bg-white text-brand-text shadow-sm border border-gray-100 rounded-tl-none'
                }`}
              >
                <div className="prose prose-sm max-w-none whitespace-pre-line">
                  {msg.content}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-brand-amber text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-brand-muted">
              <div className="w-8 h-8 rounded-full bg-brand-teal text-white flex items-center justify-center animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-teal animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-brand-teal animate-bounce delay-150" />
                <span className="w-2 h-2 rounded-full bg-brand-teal animate-bounce delay-300" />
                <span className="text-xs text-gray-400 ml-1">Analyzing with Groq...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-white border-t border-gray-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 shrink-0">Try asking:</span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-brand-teal-surface text-brand-teal hover:bg-brand-teal hover:text-white transition-all text-[11px] font-semibold border border-brand-teal/10"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="p-3 bg-white border-t border-gray-100 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about dog nutrition, symptoms, vaccinations, or rescue campaigns..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:border-brand-teal"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-2.5 bg-brand-teal hover:bg-brand-teal-dark disabled:bg-gray-300 text-white rounded-xl transition-all flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  )
}
