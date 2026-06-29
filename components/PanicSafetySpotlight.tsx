'use client'

import { useState } from 'react'
import { ShieldAlert, PhoneCall, AlertTriangle, CheckCircle, Radio, Clock, Loader2 } from 'lucide-react'

export default function PanicSafetySpotlight() {
  const [panicActivated, setPanicActivated] = useState(false)
  const [panicLoading, setPanicLoading] = useState(false)

  const triggerPanic = () => {
    setPanicLoading(true)
    setTimeout(() => {
      setPanicLoading(false)
      setPanicActivated(true)
    }, 1500)
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto text-left">
      
      {/* Left side: Safety features listing */}
      <div className="lg:col-span-7 space-y-6">
        <div>
          <span className="text-xs font-extrabold tracking-widest uppercase text-brand-600">Active Safeguards</span>
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1 leading-tight">
            In-person sessions secured by our active dispatch safety API.
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mt-3">
            Your safety is our absolute priority. When meeting local providers for physical skill sessions (like fitness, music, or cooking), GetHumane runs real-time monitoring and quick emergency dispatches.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0 text-teal-700">
              <CheckCircle size={16} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Pre-Session Safety Guidelines</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-relaxed">
                Platform rules mandate meeting in public spaces (such as libraries, coffee shops, or parks) for initial classes.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 text-amber-700">
              <Clock size={16} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Auto Check-In Monitoring</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-relaxed">
                Receive automated SMS and app check-ins halfway through your session. If you don't respond, our safety desk is notified.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0 text-rose-700">
              <ShieldAlert size={16} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm">In-Session Instant Panic Button</h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1 leading-relaxed">
                If you ever feel uncomfortable, press the Panic Button to share live GPS coords with our emergency response desk and dispatch services.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Interactive Smartphone Simulator */}
      <div className="lg:col-span-5 flex justify-center">
        <div className="w-full max-w-[280px] bg-white border border-gray-200 rounded-3xl overflow-hidden p-3 relative flex flex-col justify-between min-h-[380px]">
          {/* Phone Header */}
          <div className="flex justify-between items-center px-2 py-1.5 border-b border-gray-100">
            <span className="text-[10px] font-bold text-gray-500">GetHumane App</span>
            <div className="flex gap-1 items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[9px] font-semibold text-emerald-600">Active</span>
            </div>
          </div>

          {/* Phone Screen Content */}
          <div className="flex-1 flex flex-col justify-center items-center p-4 text-center">
            {!panicActivated ? (
              <div className="space-y-5 w-full">
                <div>
                  <p className="text-xs font-bold text-gray-900">Current Session</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Guitar Lessons with Sarah K.</p>
                </div>

                <div className="border border-brand-100 bg-brand-50/50 rounded-xl p-2.5 flex items-center justify-between text-[9px] font-bold text-brand-800">
                  <span className="flex items-center gap-1"><Radio size={10} className="animate-pulse text-brand-600" /> Share Live Location</span>
                  <span className="text-emerald-700">Enabled</span>
                </div>

                <button
                  onClick={triggerPanic}
                  disabled={panicLoading}
                  className="w-full py-4 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs sm:text-sm transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {panicLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-rose-600" />
                      <span>Sending Alerts...</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={20} className="text-rose-600 animate-bounce" />
                      <span>Trigger Safety Panic</span>
                    </>
                  )}
                </button>
                <p className="text-[9px] text-gray-400">Simulate platform emergency dispatch</p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in text-left">
                <div className="w-10 h-10 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 mx-auto">
                  <PhoneCall size={20} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-rose-700">SOS ALERTS TRIGGERED</p>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                    Emergency response dispatch notified. Sharing live location logs.
                  </p>
                </div>
                <div className="bg-rose-50/80 border border-rose-100 rounded-lg p-2.5 text-[9px] text-rose-800 space-y-1.5">
                  <p className="font-bold flex items-center gap-1">🚨 GPS Coords Sent: {coordsInfo()}</p>
                  <p className="font-semibold">📞 Calling Safety Desk...</p>
                  <p className="font-semibold">✉️ Alerting Emergency Contacts...</p>
                </div>
                <button
                  onClick={() => setPanicActivated(false)}
                  className="w-full py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-bold text-[10px] text-center hover:bg-gray-50 cursor-pointer"
                >
                  Reset Simulator
                </button>
              </div>
            )}
          </div>

          {/* Phone Footer Home Bar */}
          <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto mt-2" />
        </div>
      </div>

    </div>
  )
}

function coordsInfo() {
  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    return 'User GPS logs active'
  }
  return '30.2672° N, 97.7431° W'
}
