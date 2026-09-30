import React, { useState, useEffect } from 'react';
import { Trash2, FileText, ArrowRight } from 'lucide-react';
import {
  gramsToTotalRatti,
  fromTotalRatti,
  formatNumber,
  TOLA_TO_RATTI,
} from '../utils/goldMath';

export default function GramGoldCalculator({ defaultRate }) {
  // Input States
  const [gramWeight, setGramWeight] = useState('');
  const [cutMasha, setCutMasha] = useState('');
  const [cutRatti, setCutRatti] = useState('');
  const [ratePerTola, setRatePerTola] = useState(defaultRate ? defaultRate.toString() : '');

  useEffect(() => {
    if (defaultRate) {
      setRatePerTola(defaultRate.toString());
    }
  }, [defaultRate]);

  // Calculations
  const grams = parseFloat(gramWeight) || 0;
  const rate = parseFloat(ratePerTola) || 0;
  const cMasha = parseFloat(cutMasha) || 0;
  const cRatti = parseFloat(cutRatti) || 0;

  // 1. Total Weight from Grams to Ratti
  const totalWeightRatti = gramsToTotalRatti(grams);
  const totalWeightObj = fromTotalRatti(totalWeightRatti);

  // 2. Cut per tola in Ratti = (Masha * 8) + Ratti
  const cutPerTolaRatti = cMasha * 8 + cRatti;

  // Total Cut in Ratti = Total Tolas * cutPerTolaRatti
  const totalTolas = totalWeightRatti / TOLA_TO_RATTI;
  const totalCutRatti = totalTolas * cutPerTolaRatti;
  const totalCutObj = fromTotalRatti(totalCutRatti);

  // 3. Pure / Net Weight in Ratti = max(0, Total Weight Ratti - Total Cut Ratti)
  const netWeightRatti = Math.max(0, totalWeightRatti - totalCutRatti);
  const netWeightObj = fromTotalRatti(netWeightRatti);

  // 4. Total Amount = (Net Tolas) * Rate per Tola
  const netTolas = netWeightRatti / TOLA_TO_RATTI;
  const totalAmount = netTolas * rate;

  // Reset / Clear handler
  const handleClear = () => {
    setGramWeight('');
    setCutMasha('');
    setCutRatti('');
    setRatePerTola('');
  };

  // Sample data for quick testing
  const handleFillDemo = () => {
    setGramWeight('25.50');
    setCutMasha('0');
    setCutRatti('2');
    setRatePerTola('275000');
  };

  return (
    <div
      className="w-full flex-1 flex flex-col bg-white p-4 select-none"
      dir="rtl"
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-400 font-sans tracking-wide">
          GOLD CALCULATOR
        </span>

        <button
          type="button"
          onClick={handleFillDemo}
          className="text-[11px] font-medium text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-full border border-amber-200 transition-colors cursor-pointer"
        >
          مثال لوڈ کریں
        </button>
      </div>

      {/* Input Section */}
      <div className="space-y-4 pt-4">
        {/* Row 1: Total Weight (کل وزن) in Grams */}
        <div className="flex items-center gap-3">
          <span className="w-24 text-right text-base font-semibold text-slate-800 shrink-0">
            کل وزن
          </span>
          <div className="flex-1">
            <input
              type="number"
              step="any"
              value={gramWeight}
              onChange={(e) => setGramWeight(e.target.value)}
              placeholder="گرام وزن"
              className="w-full h-13 border border-slate-400/90 rounded-2xl px-5 text-right text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition-all font-medium"
            />
          </div>
        </div>

        {/* Row 2: Cut per tola (کاٹ فی تولہ) in Masha & Ratti */}
        <div className="flex items-center gap-3">
          <span className="w-24 text-right text-base font-semibold text-slate-800 shrink-0">
            کاٹ فی تولہ
          </span>
          <div className="flex-1 grid grid-cols-2 gap-3">
            {/* Ratti (Right side in RTL) */}
            <input
              type="number"
              step="any"
              value={cutRatti}
              onChange={(e) => setCutRatti(e.target.value)}
              placeholder="رتی"
              className="w-full h-13 border border-slate-400/90 rounded-2xl px-4 text-center text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition-all font-medium"
            />
            {/* Masha (Left side in RTL) */}
            <input
              type="number"
              step="any"
              value={cutMasha}
              onChange={(e) => setCutMasha(e.target.value)}
              placeholder="ماشہ"
              className="w-full h-13 border border-slate-400/90 rounded-2xl px-4 text-center text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition-all font-medium"
            />
          </div>
        </div>

        {/* Row 3: Rate per tola (ریٹ فی تولہ) */}
        <div className="flex items-center gap-3">
          <span className="w-24 text-right text-base font-semibold text-slate-800 shrink-0">
            ریٹ فی تولہ
          </span>
          <div className="flex-1 relative">
            <input
              type="number"
              step="any"
              value={ratePerTola}
              onChange={(e) => setRatePerTola(e.target.value)}
              placeholder="ریٹ فی تولہ"
              className="w-full h-13 border border-slate-400/90 rounded-2xl px-5 text-right text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-600 transition-all font-medium"
            />
            {defaultRate && ratePerTola !== defaultRate.toString() && (
              <button
                type="button"
                onClick={() => setRatePerTola(defaultRate.toString())}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                title="آج کا ریٹ لگائیں"
              >
                آج کا ریٹ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Calculations & Results Table */}
      <div className="mt-7 pt-2">
        {/* Table Header Row: Blank (for Row Label on right) | رتی | ماشہ | تولہ */}
        <div className="grid grid-cols-4 items-center text-center pb-3 text-slate-800 text-lg font-bold">
          <span className="text-right pr-2"></span>
          <span>رتی</span>
          <span>ماشہ</span>
          <span>تولہ</span>
        </div>

        {/* Table Rows */}
        <div className="space-y-4 text-slate-900 text-lg font-bold">
          {/* Row 1: Total Weight (کل وزن) */}
          <div className="grid grid-cols-4 items-center text-center">
            <span className="text-right pr-2 text-slate-800 font-semibold text-base">
              کل وزن
            </span>
            <span className="font-mono text-xl">{totalWeightObj.rattiFixed}</span>
            <span className="font-mono text-xl">{totalWeightObj.masha}</span>
            <span className="font-mono text-xl">{totalWeightObj.tola}</span>
          </div>

          {/* Row 2: Total Cut (کل کاٹ) */}
          <div className="grid grid-cols-4 items-center text-center">
            <span className="text-right pr-2 text-slate-800 font-semibold text-base">
              کل کاٹ
            </span>
            <span className="font-mono text-xl">{totalCutObj.rattiFixed}</span>
            <span className="font-mono text-xl">{totalCutObj.masha}</span>
            <span className="font-mono text-xl">{totalCutObj.tola}</span>
          </div>

          {/* Row 3: Net Weight (خالص وزن) */}
          <div className="grid grid-cols-4 items-center text-center">
            <span className="text-right pr-2 text-slate-800 font-semibold text-base">
              خالص وزن
            </span>
            <span className="font-mono text-xl text-emerald-700">
              {netWeightObj.rattiFixed}
            </span>
            <span className="font-mono text-xl text-emerald-700">
              {netWeightObj.masha}
            </span>
            <span className="font-mono text-xl text-emerald-700">
              {netWeightObj.tola}
            </span>
          </div>

          {/* Row 4: Total Amount (کل رقم) */}
          <div className="flex items-center justify-between pt-5 pb-2 px-3 border-t border-slate-200 mt-2">
            <span className="text-right text-slate-800 font-bold text-lg">
              کل رقم
            </span>
            <span className="font-mono text-2xl font-black text-slate-900 tracking-tight">
              {formatNumber(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1 min-h-[40px]"></div>

      {/* Bottom Clear Button (صاف کریں) */}
      <div className="pt-3 pb-2">
        <button
          type="button"
          onClick={handleClear}
          className="w-full h-13 bg-[#b08428] hover:bg-[#9c7421] active:scale-[0.99] text-white font-bold text-lg rounded-full shadow-lg shadow-amber-900/15 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-5 h-5 stroke-[2.2]" />
          <span>صاف کریں</span>
        </button>
      </div>
    </div>
  );
}
