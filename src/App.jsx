import React, { useState } from 'react';
import LabInvoiceForm from './components/LabInvoiceForm';
import GramGoldCalculator from './components/GramGoldCalculator';
import JewelleryReceiptForm from './components/JewelleryReceiptForm';
import DailyRateBar from './components/DailyRateBar';
import { getStoredGoldRate } from './utils/goldMath';
import { Scale, FileText, Calculator } from 'lucide-react';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('calculator'); // 'calculator' | 'invoice' | 'gramCalculator'
  const [dailyRateData, setDailyRateData] = useState(getStoredGoldRate());

  return (
    <div className="min-h-screen bg-slate-900 sm:py-6 flex flex-col items-center justify-start font-sans antialiased">
      {/* Native App Canvas */}
      <div className="w-full sm:max-w-md min-h-screen sm:min-h-[840px] sm:rounded-3xl sm:shadow-2xl sm:border sm:border-slate-800 bg-white flex flex-col relative overflow-hidden">
        {/* Daily Gold Rate Banner */}
        <DailyRateBar
          currentRateData={dailyRateData}
          onRateUpdated={setDailyRateData}
        />

        {/* Active Screen Content */}
        <main className="flex-1 flex flex-col overflow-y-auto pb-20">
          {activeScreen === 'calculator' ? (
            <GramGoldCalculator defaultRate={dailyRateData.rate} />
          ) : activeScreen === 'invoice' ? (
            <LabInvoiceForm defaultRate={dailyRateData.rate} />
          ) : (
            <JewelleryReceiptForm
              defaultRate={dailyRateData.rate}
              onBack={() => setActiveScreen('calculator')}
            />
          )}
        </main>

        {/* Bottom Navigation Bar (100% Native Mobile Bar with 3 Tabs) */}
        <nav className="fixed sm:absolute bottom-0 inset-x-0 w-full sm:max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-3 py-2 flex items-center justify-around z-30 shadow-lg pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          {/* 1. Calculator Tab */}
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
            <span className="text-[10px] font-sans tracking-tight">
              Calculator
            </span>
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200" />

          {/* 2. Lab Invoice Tab */}
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
            <span className="text-[10px] font-sans tracking-tight">
              Lab Invoice
            </span>
          </button>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200" />

          {/* 3. Gram Calculator Tab */}
          <button
            onClick={() => setActiveScreen('gramCalculator')}
            className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
              activeScreen === 'gramCalculator'
                ? 'text-[#0099ff] font-bold scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                activeScreen === 'gramCalculator'
                  ? 'bg-sky-100 text-[#0099ff]'
                  : ''
              }`}
            >
              <Calculator className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-[10px] font-sans tracking-tight">
              Gram Calculator
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
}
