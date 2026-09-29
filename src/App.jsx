import React, { useState } from 'react';
import LabInvoiceForm from './components/LabInvoiceForm';
import GramGoldCalculator from './components/GramGoldCalculator';
import DailyRateBar from './components/DailyRateBar';
import { getStoredGoldRate } from './utils/goldMath';
import { Smartphone, Monitor, Gem, Scale, FileText } from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState('mobile'); // 'mobile' | 'responsive'
  const [activeScreen, setActiveScreen] = useState('calculator'); // 'calculator' | 'invoice'
  const [dailyRateData, setDailyRateData] = useState(getStoredGoldRate());

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950">
              <Gem className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                AZ JEWELERS
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {activeScreen === 'calculator' ? 'گرام کیلکولیٹر' : 'لیب انوائس'}
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Gold & Silver Calculation System
              </p>
            </div>
          </div>

          {/* Device View Mode Switcher */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 text-xs">
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'mobile'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile Frame</span>
            </button>
            <button
              onClick={() => setViewMode('responsive')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewMode === 'responsive'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Full Screen</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {viewMode === 'mobile' ? (
          /* Realistic Mobile Phone Mockup */
          <div className="relative my-2">
            {/* Phone Outer Shell */}
            <div className="w-[395px] max-w-full bg-[#0a0a0a] rounded-[50px] p-3 shadow-2xl ring-1 ring-white/10 ring-offset-4 ring-offset-slate-900 flex flex-col">
              {/* Dynamic Island / Speaker Notch */}
              <div className="w-28 h-4 bg-black rounded-full mx-auto mb-2 flex items-center justify-center shrink-0">
                <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800 mr-2" />
                <div className="w-2 h-2 rounded-full bg-blue-950" />
              </div>

              {/* Mobile Screen Container */}
              <div className="bg-slate-100 rounded-[38px] overflow-hidden text-slate-900 min-h-[770px] flex flex-col relative">
                {/* Daily Gold Rate Banner */}
                <DailyRateBar
                  currentRateData={dailyRateData}
                  onRateUpdated={setDailyRateData}
                />

                {/* Active Screen View */}
                <div className="flex-1 overflow-y-auto pb-16">
                  {activeScreen === 'calculator' ? (
                    <GramGoldCalculator defaultRate={dailyRateData.rate} />
                  ) : (
                    <LabInvoiceForm defaultRate={dailyRateData.rate} />
                  )}
                </div>

                {/* Mobile Bottom Navigation Bar */}
                <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-6 py-2.5 flex items-center justify-around z-30 shadow-lg">
                  {/* Gram Calculator Tab */}
                  <button
                    onClick={() => setActiveScreen('calculator')}
                    className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      activeScreen === 'calculator'
                        ? 'text-[#b08428] font-bold scale-105'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-xl transition-all ${
                        activeScreen === 'calculator'
                          ? 'bg-amber-100/70 text-[#b08428]'
                          : ''
                      }`}
                    >
                      <Scale className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-[11px] font-sans tracking-tight">
                      گرام کاٹ
                    </span>
                  </button>

                  {/* Divider */}
                  <div className="h-6 w-px bg-slate-200" />

                  {/* Lab Invoice Tab */}
                  <button
                    onClick={() => setActiveScreen('invoice')}
                    className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      activeScreen === 'invoice'
                        ? 'text-[#081e3a] font-bold scale-105'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-xl transition-all ${
                        activeScreen === 'invoice'
                          ? 'bg-blue-100/70 text-[#081e3a]'
                          : ''
                      }`}
                    >
                      <FileText className="w-5 h-5 stroke-[2.2]" />
                    </div>
                    <span className="text-[11px] font-sans tracking-tight">
                      لیب انوائس
                    </span>
                  </button>
                </div>
              </div>

              {/* Bottom Home Indicator Bar */}
              <div className="w-32 h-1 bg-white/30 rounded-full mx-auto mt-2.5 shrink-0" />
            </div>
          </div>
        ) : (
          /* Full Responsive View */
          <div className="w-full max-w-lg flex flex-col">
            {/* Daily Gold Rate Banner */}
            <div className="rounded-2xl overflow-hidden mb-3 shadow-md">
              <DailyRateBar
                currentRateData={dailyRateData}
                onRateUpdated={setDailyRateData}
              />
            </div>

            {/* Screen Content */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-4">
              {activeScreen === 'calculator' ? (
                <GramGoldCalculator defaultRate={dailyRateData.rate} />
              ) : (
                <LabInvoiceForm defaultRate={dailyRateData.rate} />
              )}
            </div>

            {/* Bottom Nav Bar for Full Screen */}
            <div className="bg-slate-800 rounded-2xl p-2 flex items-center justify-around shadow-lg border border-slate-700">
              <button
                onClick={() => setActiveScreen('calculator')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                  activeScreen === 'calculator'
                    ? 'bg-[#b08428] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>گرام کاٹ کیلکولیٹر</span>
              </button>

              <button
                onClick={() => setActiveScreen('invoice')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                  activeScreen === 'invoice'
                    ? 'bg-[#081e3a] text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>لیب انوائس (Lab Invoice)</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="py-2.5 text-center text-xs text-slate-500 border-t border-slate-800/60 bg-slate-950/40">
        Ready for Android APK Export via Capacitor • Offline First Architecture
      </footer>
    </div>
  );
}
