import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Minus, Trash2, Sparkles, Scale, Info } from 'lucide-react';
import {
  toTotalRatti,
  fromTotalRatti,
  rattiToGrams,
  formatCurrency,
  TOLA_TO_RATTI,
} from '../utils/goldMath';
import InvoiceReceiptModal from './InvoiceReceiptModal';

export default function LabInvoiceForm({ defaultRate }) {
  // Current Date and Time
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(
        `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`
      );
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Form State
  const [ratePerTola, setRatePerTola] = useState(defaultRate ? defaultRate.toString() : '');
  const [invoiceDescription, setInvoiceDescription] = useState('');

  useEffect(() => {
    if (defaultRate) {
      setRatePerTola(defaultRate.toString());
    }
  }, [defaultRate]);

  // Weight State
  const [weight, setWeight] = useState({ tola: '', masha: '', ratti: '' });

  // Cut State (Kaat / Wastage / Nag)
  const [cut, setCut] = useState({ tola: '', masha: '', ratti: '' });

  // Additional Charges State
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargesList, setChargesList] = useState([]);

  // Generated Invoice for Modal
  const [createdInvoice, setCreatedInvoice] = useState(null);

  // Real-time Calculations
  const grossRatti = toTotalRatti(weight.tola, weight.masha, weight.ratti);
  const cutRatti = toTotalRatti(cut.tola, cut.masha, cut.ratti);
  const netRatti = Math.max(0, grossRatti - cutRatti);

  const grossWeightObj = fromTotalRatti(grossRatti);
  const cutWeightObj = fromTotalRatti(cutRatti);
  const netWeightObj = fromTotalRatti(netRatti);

  // Price Calculation: Rate per tola * (Net Ratti / 96)
  const rate = parseFloat(ratePerTola) || 0;
  const netTolas = netRatti / TOLA_TO_RATTI;
  const goldAmount = netTolas * rate;

  // Extra charges sum
  const totalCharges = chargesList.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const grandTotal = goldAmount + totalCharges;

  // Add Charge handler
  const handleAddCharge = () => {
    if (!chargeDesc.trim() && !chargeAmount) return;
    const amountVal = parseFloat(chargeAmount) || 0;
    if (amountVal <= 0) return;

    setChargesList([
      ...chargesList,
      {
        id: Date.now(),
        description: chargeDesc.trim() || 'Extra Charge',
        amount: amountVal,
      },
    ]);
    setChargeDesc('');
    setChargeAmount('');
  };

  // Remove last or specific charge
  const handleRemoveLastCharge = () => {
    if (chargesList.length === 0) return;
    setChargesList(chargesList.slice(0, -1));
  };

  const handleRemoveChargeById = (id) => {
    setChargesList(chargesList.filter((item) => item.id !== id));
  };

  // Reset or Quick Sample Fill for testing
  const handleFillSample = () => {
    setRatePerTola('275000');
    setInvoiceDescription('Gold Ring 21K Testing');
    setWeight({ tola: '1', masha: '4', ratti: '2' });
    setCut({ tola: '0', masha: '1', ratti: '4' });
    setChargesList([
      { id: 1, description: 'Lab Testing Fee', amount: 500 },
      { id: 2, description: 'Acid Test & Polish', amount: 350 },
    ]);
  };

  const handleReset = () => {
    setRatePerTola('');
    setInvoiceDescription('');
    setWeight({ tola: '', masha: '', ratti: '' });
    setCut({ tola: '', masha: '', ratti: '' });
    setChargesList([]);
    setChargeDesc('');
    setChargeAmount('');
  };

  // Create Invoice
  const handleCreate = () => {
    const invoice = {
      invoiceNo: Math.floor(100000 + Math.random() * 900000),
      date: currentDate,
      time: currentTime,
      ratePerTola: rate,
      description: invoiceDescription,
      grossWeight: grossWeightObj,
      grossRatti,
      cutWeight: cutWeightObj,
      cutRatti,
      netWeight: netWeightObj,
      netRatti,
      goldAmount,
      charges: chargesList,
      totalCharges,
      grandTotal,
    };
    setCreatedInvoice(invoice);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-white">
      {/* Top Mobile Bar with Back Arrow and Switcher */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <button
          onClick={handleReset}
          className="p-1.5 -ml-1 text-slate-700 hover:text-black hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          title="Back / Reset"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          onClick={handleFillSample}
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 transition-colors"
        >
          Demo
        </button>
      </div>

      {/* Main Card */}
      <div className="flex-1 flex flex-col px-3 pb-4">
        {/* Navy Blue Header Banner */}
        <div className="bg-[#081e3a] text-white py-3.5 px-4 rounded-t-2xl text-center shadow-md">
          <h1 className="text-base font-bold tracking-wide">
            Create Lab Invoice
          </h1>
        </div>

        {/* Content Box */}
        <div className="border border-t-0 border-slate-300 rounded-b-2xl p-3.5 space-y-3.5 bg-white">
          {/* Date & Time Row */}
          <div className="border border-slate-300 rounded-xl py-2 px-4 flex justify-between items-center text-xs font-medium text-slate-700 bg-slate-50/50">
            <span>
              Date : <span className="font-semibold">{currentDate}</span>
            </span>
            <span>
              Time : <span className="font-semibold">{currentTime}</span>
            </span>
          </div>

          {/* Rate per tola input */}
          <div className="relative">
            <input
              type="number"
              value={ratePerTola}
              onChange={(e) => setRatePerTola(e.target.value)}
              placeholder="Rate per tola"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
            />
            {defaultRate && ratePerTola !== defaultRate.toString() && (
              <button
                type="button"
                onClick={() => setRatePerTola(defaultRate.toString())}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                title="آج کا ریٹ لگائیں"
              >
                آج کا ریٹ
              </button>
            )}
          </div>

          {/* Invoice Description input */}
          <div>
            <input
              type="text"
              value={invoiceDescription}
              onChange={(e) => setInvoiceDescription(e.target.value)}
              placeholder="Invoice Description"
              className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Weight Section (Tola, Masha, Ratti) */}
          <div className="flex items-center gap-2 pt-1">
            <span className="w-20 text-xs font-semibold text-slate-700">
              Weight
            </span>
            <div className="flex-1 grid grid-cols-3 gap-2">
              <input
                type="number"
                value={weight.tola}
                onChange={(e) =>
                  setWeight({ ...weight, tola: e.target.value })
                }
                placeholder="Tola"
                className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-center text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
              />
              <input
                type="number"
                value={weight.masha}
                onChange={(e) =>
                  setWeight({ ...weight, masha: e.target.value })
                }
                placeholder="Mas..."
                className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-center text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
              />
              <input
                type="number"
                value={weight.ratti}
                onChange={(e) =>
                  setWeight({ ...weight, ratti: e.target.value })
                }
                placeholder="Ratti"
                className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-center text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Total Cut Section (Tola, Masha, Ratti) */}
          <div className="flex items-center gap-2">
            <span className="w-20 text-xs font-semibold text-slate-700">
              Total Cut
            </span>
            <div className="flex-1 grid grid-cols-3 gap-2">
              <input
                type="number"
                value={cut.tola}
                onChange={(e) => setCut({ ...cut, tola: e.target.value })}
                placeholder="Tola"
                className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-center text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
              />
              <input
                type="number"
                value={cut.masha}
                onChange={(e) => setCut({ ...cut, masha: e.target.value })}
                placeholder="Mas..."
                className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-center text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
              />
              <input
                type="number"
                value={cut.ratti}
                onChange={(e) => setCut({ ...cut, ratti: e.target.value })}
                placeholder="Ratti"
                className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-center text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Realtime Live Calculation Summary Pill */}
          {(grossRatti > 0 || rate > 0) && (
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 text-xs text-amber-950 flex flex-col gap-1 transition-all">
              <div className="flex justify-between items-center font-medium">
                <span className="text-amber-800 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5" /> Net Weight:
                </span>
                <span className="font-bold font-mono">
                  {netWeightObj.formatted} ({rattiToGrams(netRatti)}g)
                </span>
              </div>
              {rate > 0 && (
                <div className="flex justify-between items-center pt-1 border-t border-amber-200/60 font-medium">
                  <span className="text-amber-800">Gold Value:</span>
                  <span className="font-bold text-[#081e3a] font-mono">
                    {formatCurrency(goldAmount)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Charges Card Box */}
          <div className="border border-slate-300 rounded-xl p-3 space-y-2.5 bg-slate-50/30">
            {/* Charges Description */}
            <div>
              <input
                type="text"
                value={chargeDesc}
                onChange={(e) => setChargeDesc(e.target.value)}
                placeholder="Charges Description"
                className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
              />
            </div>

            {/* Amount input & (+) (-) Buttons */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCharge();
                }}
                placeholder="Amount"
                className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
              />
              <button
                type="button"
                onClick={handleAddCharge}
                className="w-10 h-9 bg-[#2196f3] hover:bg-[#1976d2] active:scale-95 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm transition-all cursor-pointer"
                title="Add charge"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
              </button>
              <button
                type="button"
                onClick={handleRemoveLastCharge}
                disabled={chargesList.length === 0}
                className="w-10 h-9 bg-[#2196f3] hover:bg-[#1976d2] disabled:bg-slate-300 disabled:cursor-not-allowed active:scale-95 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm transition-all cursor-pointer"
                title="Remove last charge"
              >
                <Minus className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Description & Amount Table */}
            <div className="border border-slate-300 rounded-lg overflow-hidden bg-white mt-1">
              {/* Header */}
              <div className="bg-[#cfd8dc] px-3 py-1.5 flex justify-between items-center text-xs font-bold text-slate-700 border-b border-slate-300">
                <span className="w-1/2">Description</span>
                <span className="w-1/2 text-right">Amount</span>
              </div>

              {/* Rows */}
              <div className="min-h-[75px] max-h-[140px] overflow-y-auto divide-y divide-slate-100">
                {chargesList.length === 0 ? (
                  <div className="py-5 text-center text-xs text-slate-400 italic">
                    No extra charges added yet
                  </div>
                ) : (
                  chargesList.map((item) => (
                    <div
                      key={item.id}
                      className="px-3 py-1.5 flex justify-between items-center text-xs text-slate-700 hover:bg-slate-50 group"
                    >
                      <span className="truncate pr-2">{item.description}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-medium">
                          {formatCurrency(item.amount)}
                        </span>
                        <button
                          onClick={() => handleRemoveChargeById(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-0.5 rounded transition-opacity"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Charges Subtotal Footer */}
              {chargesList.length > 0 && (
                <div className="bg-slate-100 px-3 py-1 flex justify-between items-center text-[11px] font-semibold text-slate-700 border-t border-slate-200">
                  <span>Total Extra:</span>
                  <span className="font-mono text-blue-700">
                    {formatCurrency(totalCharges)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grand Total Bar */}
        {(rate > 0 || totalCharges > 0) && (
          <div className="mt-3 px-4 py-2.5 bg-slate-900 text-white rounded-2xl flex justify-between items-center shadow-md">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                Estimated Total
              </p>
              <p className="text-base font-extrabold text-amber-400 font-mono tracking-tight">
                {formatCurrency(grandTotal)}
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-300 font-mono">
              Net: {netWeightObj.formatted}
            </div>
          </div>
        )}

        {/* Create Button */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleCreate}
            className="w-full py-3 bg-[#081e3a] hover:bg-[#0c2a52] active:scale-[0.99] text-white font-semibold text-sm rounded-full shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            Create
          </button>
        </div>
      </div>

      {/* Invoice Slip Preview Modal */}
      {createdInvoice && (
        <InvoiceReceiptModal
          invoice={createdInvoice}
          onClose={() => setCreatedInvoice(null)}
        />
      )}
    </div>
  );
}
