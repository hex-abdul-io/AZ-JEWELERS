import React, { useState } from 'react';
import { Edit3, Check, X, TrendingUp, Sparkles, Clock, Gem } from 'lucide-react';
import {
  formatCurrency,
  formatNumber,
  getKaratRates,
  saveStoredGoldRate,
} from '../utils/goldMath';

export default function DailyRateBar({ currentRateData, onRateUpdated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newRateInput, setNewRateInput] = useState(currentRateData.rate.toString());

  const handleSave = (e) => {
    e.preventDefault();
    const val = parseFloat(newRateInput);
    if (!val || val <= 0) return;

    const updated = saveStoredGoldRate(val);
    onRateUpdated(updated);
    setIsOpen(false);
  };

  const previewKarats = getKaratRates(parseFloat(newRateInput) || currentRateData.rate);

  return (
    <>
      {/* Daily Gold Rate Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 text-slate-950 px-3.5 py-2 flex items-center justify-between shadow-xs select-none">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-slate-950/15 flex items-center justify-center shrink-0">
            <TrendingUp className="w-3.5 h-3.5 stroke-[2.5] text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="text-[11px] font-bold tracking-tight">آج کا ریٹ:</span>
              <span className="text-xs font-black font-mono">
                {formatCurrency(currentRateData.rate)}
              </span>
              <span className="text-[9px] font-semibold text-slate-900/80">/ تولہ</span>
            </div>
            <span className="text-[9px] font-medium text-slate-900/70 block">
              آپڈیٹ: {currentRateData.lastUpdated}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setNewRateInput(currentRateData.rate.toString());
            setIsOpen(true);
          }}
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-950 hover:bg-slate-900 active:scale-95 text-amber-300 hover:text-amber-200 text-[10px] font-bold rounded-full shadow-xs transition-all cursor-pointer"
          title="ریٹ تبدیل کریں"
        >
          <Edit3 className="w-3 h-3" />
          <span>تبدیل کریں</span>
        </button>
      </div>

      {/* Edit Rate Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div
            className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col p-5"
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <Gem className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">
                  آج کا ریٹ سیٹ کریں (Daily Rate)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  24K ریٹ فی تولہ (PKR):
                </label>
                <input
                  type="number"
                  autoFocus
                  value={newRateInput}
                  onChange={(e) => setNewRateInput(e.target.value)}
                  placeholder="مثال: 275000"
                  className="w-full h-12 border-2 border-amber-400/80 rounded-2xl px-4 text-center font-mono font-bold text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                />
              </div>

              {/* Automatic Karat Breakdown Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block border-b border-slate-200 pb-1">
                  خودکار عیار ریٹ (Auto Karat Rates):
                </span>
                <div className="flex justify-between items-center text-slate-700">
                  <span>22 Karat (زیورات ریٹ):</span>
                  <span className="font-mono font-bold">{formatCurrency(previewKarats.k22)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span>21 Karat:</span>
                  <span className="font-mono font-bold">{formatCurrency(previewKarats.k21)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span>فی 10 گرام (10 Grams):</span>
                  <span className="font-mono font-bold">{formatCurrency(previewKarats.per10Grams)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#081e3a] hover:bg-[#0c2a52] active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>محفوظ کریں (Save)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                >
                  منسوخ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
