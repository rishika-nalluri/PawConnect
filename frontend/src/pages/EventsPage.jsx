import React, { useState } from 'react'
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  Plus,
  PawPrint,
  Clock,
  Sparkles
} from 'lucide-react'
import { store } from '../api/client'

export const EventsPage = () => {
  const [events, setEvents] = useState(store.getEvents())
  const [rsvps, setRsvps] = useState({})

  const toggleRsvp = (eventId) => {
    setRsvps(prev => {
      const isRsvped = Boolean(prev[eventId])
      const nextState = { ...prev, [eventId]: !isRsvped }

      // Update event attendee count in store
      const updated = events.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            currentRsvps: isRsvped ? e.currentRsvps - 1 : e.currentRsvps + 1
          }
        }
        return e
      })
      setEvents(updated)
      store.saveEvents(updated)

      return nextState
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-teal-dark to-brand-teal text-white rounded-3xl p-8 sm:p-12 shadow-premium relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-brand-amber-light flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> Canine Community Gatherings
          </span>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Adoption Drives & Mobile Veterinary Camps
          </h1>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Connect with grassroots animal advocates, meet healthy rescue puppies, or get free preventative rabies vaccinations administered by registered clinics.
          </p>
        </div>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {events.map((ev) => {
          const isGoing = Boolean(rsvps[ev.id])
          return (
            <div
              key={ev.id}
              className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-brand-teal/20 hover:shadow-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={ev.bannerUrl}
                    alt={ev.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-brand-teal text-white text-[10px] font-extrabold uppercase shadow-sm flex items-center gap-1">
                    {ev.eventType === 'ADOPTION_DRIVE' ? '🐶 Puppy Adoption' : '💉 Free Vaccination'}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <span className="text-[11px] font-bold text-brand-amber uppercase tracking-wider">{ev.organizer}</span>
                  <h3 className="font-heading font-bold text-xl text-brand-teal-dark">{ev.title}</h3>
                  <p className="text-xs text-brand-muted leading-relaxed">{ev.description}</p>

                  <div className="space-y-1.5 pt-3 text-xs text-brand-text">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand-teal shrink-0" />
                      <span>{new Date(ev.eventDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-coral shrink-0" />
                      <span>{ev.location}, {ev.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-brand-amber shrink-0" />
                      <span className="font-semibold text-brand-teal-dark">{ev.currentRsvps} pet parents attending</span>
                      <span className="text-gray-400">({ev.maxParticipants} max capacity)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => toggleRsvp(ev.id)}
                  className={`w-full py-3.5 rounded-xl font-heading font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isGoing
                      ? 'bg-emerald-600 text-white'
                      : 'bg-brand-teal hover:bg-brand-teal-dark text-white'
                  }`}
                >
                  {isGoing ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>RSVP Confirmed (See You There!)</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Reserve Free Spot</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )
        })}
      </div>

    </div>
  )
}
