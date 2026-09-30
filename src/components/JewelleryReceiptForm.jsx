import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  PlusCircle,
  DollarSign,
  Plus,
  Minus,
  Trash2,
  FileText,
  Scale,
} from 'lucide-react';
import {
  toTotalRatti,
  fromTotalRatti,
  gramsToTotalRatti,
  rattiToGrams,
  formatCurrency,
  TOLA_TO_RATTI,
} from '../utils/goldMath';
import MultiItemReceiptModal from './MultiItemReceiptModal';

export default function JewelleryReceiptForm({ defaultRate, onBack }) {
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

  // Metal Selection: 'gold' | 'silver' | 'copper' | 'platinum' | 'palladium'
  const [metalType, setMetalType] = useState('gold');

  // Rate and Customer
  const [ratePerTola, setRatePerTola] = useState(
    defaultRate ? defaultRate.toString() : ''
  );
  const [customerName, setCustomerName] = useState('');

  useEffect(() => {
    if (metalType === 'gold' && defaultRate && !ratePerTola) {
      setRatePerTola(defaultRate.toString());
    }
  }, [metalType, defaultRate]);

  // Accordion open/close states
  const [shopOpen, setShopOpen] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [itemsOpen, setItemsOpen] = useState(true); // Open by default for fast input
  const [chargesOpen, setChargesOpen] = useState(false);

  // Shop Details
  const [shopDetails, setShopDetails] = useState({
    name: 'AZ JEWELERS',
    phone: '',
    address: 'Sarafa Bazar',
  });

  // Signature
  const [signatureText, setSignatureText] = useState('AZ JEWELERS');

  // Add Jewellery Items State
  // Mode: 'TMR' | 'Gram' | 'Money to Gold' | 'Wgt per Tola'
  const [itemMode, setItemMode] = useState('TMR');
  const [itemDesc, setItemDesc] = useState('');
  const [itemTmr, setItemTmr] = useState({ tola: '', masha: '', ratti: '' });
  const [itemGramWeight, setItemGramWeight] = useState('');
  const [itemMoneyAmount, setItemMoneyAmount] = useState('');
  const [itemsList, setItemsList] = useState([]);

  // Add Charges State
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargesList, setChargesList] = useState([]);

  // Modal State
  const [createdReceipt, setCreatedReceipt] = useState(null);

  // --- Handlers for Items ---
  const handleAddItem = () => {
    let rattiVal = 0;
    let gramsVal = 0;

    if (itemMode === 'TMR' || itemMode === 'Wgt per Tola') {
      rattiVal = toTotalRatti(itemTmr.tola, itemTmr.masha, itemTmr.ratti);
      gramsVal = parseFloat(rattiToGrams(rattiVal)) || 0;
    } else if (itemMode === 'Gram') {
      const g = parseFloat(itemGramWeight) || 0;
      if (g <= 0) return;
      gramsVal = g;
      rattiVal = gramsToTotalRatti(g);
    } else if (itemMode === 'Money to Gold') {
      const amount = parseFloat(itemMoneyAmount) || 0;
      const rate = parseFloat(ratePerTola) || 0;
      if (amount <= 0 || rate <= 0) return;
      const tolas = amount / rate;
      rattiVal = tolas * TOLA_TO_RATTI;
      gramsVal = parseFloat(rattiToGrams(rattiVal)) || 0;
    }

    if (rattiVal <= 0) return;

    const tmrObj = fromTotalRatti(rattiVal);

    const newItem = {
      id: Date.now(),
      description: itemDesc.trim() || `Item #${itemsList.length + 1}`,
      ratti: rattiVal,
      grams: gramsVal,
      tola: tmrObj.tola,
      masha: tmrObj.masha,
      rattiUnit: tmrObj.ratti,
      tmrFormatted: tmrObj.formatted,
    };

    setItemsList([...itemsList, newItem]);

    // Clear item inputs
    setItemDesc('');
    setItemTmr({ tola: '', masha: '', ratti: '' });
    setItemGramWeight('');
    setItemMoneyAmount('');
  };

  const handleRemoveLastItem = () => {
    if (itemsList.length === 0) return;
    setItemsList(itemsList.slice(0, -1));
  };

  const handleRemoveItemById = (id) => {
    setItemsList(itemsList.filter((it) => it.id !== id));
  };

  // --- Handlers for Charges ---
  const handleAddCharge = () => {
    const amt = parseFloat(chargeAmount);
    if (isNaN(amt) || amt === 0) return;

    const newCharge = {
      id: Date.now(),
      description: chargeDesc.trim() || 'Extra Charge',
      amount: amt,
    };

    setChargesList([...chargesList, newCharge]);
    setChargeDesc('');
    setChargeAmount('');
  };

  const handleRemoveLastCharge = () => {
    if (chargesList.length === 0) return;
    setChargesList(chargesList.slice(0, -1));
  };

  const handleRemoveChargeById = (id) => {
    setChargesList(chargesList.filter((c) => c.id !== id));
  };

  // Total Calculations
  const totalRatti = itemsList.reduce((sum, item) => sum + item.ratti, 0);
  const totalGrams = itemsList.reduce((sum, item) => sum + item.grams, 0);
  const totalTmrObj = fromTotalRatti(totalRatti);

  const rate = parseFloat(ratePerTola) || 0;
  const totalTolas = totalRatti / TOLA_TO_RATTI;
  const metalAmount = totalTolas * rate;

  const totalCharges = chargesList.reduce((sum, c) => sum + (c.amount || 0), 0);
  const grandTotal = metalAmount + totalCharges;

  // Handle Create Receipt
  const handleCreateReceipt = () => {
    if (itemsList.length === 0) {
      alert('Please add at least one jewellery item first!');
      setItemsOpen(true);
      return;
    }

    const receipt = {
      receiptNo: Math.floor(100000 + Math.random() * 900000),
      date: currentDate,
      time: currentTime,
      metalType: metalType.charAt(0).toUpperCase() + metalType.slice(1),
      ratePerTola: rate,
      customerName: customerName.trim(),
      shopName: shopDetails.name,
      shopPhone: shopDetails.phone,
      shopAddress: shopDetails.address,
      signature: signatureText,
      items: itemsList,
      totalRatti,
      totalGrams,
      totalTmrFormatted: totalTmrObj.formatted,
      metalAmount,
      charges: chargesList,
      totalCharges,
      grandTotal,
    };

    setCreatedReceipt(receipt);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-white">
      {/* Top Header Row with Back Button & Title */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-1.5 -ml-1 text-slate-700 hover:text-black hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          title="Back"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <h1 className="text-base font-bold text-slate-900 tracking-tight">
          Create New Receipt
        </h1>

        <div className="w-6" /> {/* spacer for alignment */}
      </div>

      {/* Main Form Body */}
      <div className="flex-1 p-4 space-y-4">
        {/* Metal Selection (2 Rows of Radio Options) */}
        <div className="space-y-2.5 pt-1">
          {/* Row 1: Gold, Silver, Copper */}
          <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-slate-700">
            {['gold', 'silver', 'copper'].map((m) => (
              <label
                key={m}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="metalType"
                  value={m}
                  checked={metalType === m}
                  onChange={() => setMetalType(m)}
                  className="w-4 h-4 text-purple-700 focus:ring-purple-600 border-slate-300 cursor-pointer"
                />
                <span className="capitalize">{m}</span>
              </label>
            ))}
          </div>

          {/* Row 2: Platinum, Palladium */}
          <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-slate-700">
            {['platinum', 'palladium'].map((m) => (
              <label
                key={m}
                className="flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="metalType"
                  value={m}
                  checked={metalType === m}
                  onChange={() => setMetalType(m)}
                  className="w-4 h-4 text-purple-700 focus:ring-purple-600 border-slate-300 cursor-pointer"
                />
                <span className="capitalize">{m}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Rate Per Tola Input */}
        <div>
          <input
            type="number"
            value={ratePerTola}
            onChange={(e) => setRatePerTola(e.target.value)}
            placeholder="Rate Per Tola"
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
          />
        </div>

        {/* Customer Name Input */}
        <div>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer Name"
            className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
          />
        </div>

        {/* ==============================================================
            ACCORDION 1: SHOP DETAILED
            ============================================================== */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setShopOpen(!shopOpen)}
            className={`w-full px-4 py-3 flex items-center justify-between transition-colors cursor-pointer ${
              shopOpen ? 'bg-[#0099ff] text-white' : 'bg-white text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5 font-semibold text-sm">
              <ShoppingCart className={`w-4 h-4 ${shopOpen ? 'text-white' : 'text-sky-500'}`} />
              <span>Shop Detailed</span>
            </div>
            {shopOpen ? (
              <ChevronUp className="w-5 h-5 text-white stroke-[2.5]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-700 stroke-[2.5]" />
            )}
          </button>

          {shopOpen && (
            <div className="p-3 bg-white border-t border-slate-100 space-y-2 text-xs">
              <div>
                <label className="text-slate-500 font-medium block mb-1">Shop Name:</label>
                <input
                  type="text"
                  value={shopDetails.name}
                  onChange={(e) => setShopDetails({ ...shopDetails, name: e.target.value })}
                  placeholder="Shop Name"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-medium"
                />
              </div>
              <div>
                <label className="text-slate-500 font-medium block mb-1">Phone / WhatsApp:</label>
                <input
                  type="text"
                  value={shopDetails.phone}
                  onChange={(e) => setShopDetails({ ...shopDetails, phone: e.target.value })}
                  placeholder="e.g. 0300-1234567"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-medium"
                />
              </div>
              <div>
                <label className="text-slate-500 font-medium block mb-1">Address / City:</label>
                <input
                  type="text"
                  value={shopDetails.address}
                  onChange={(e) => setShopDetails({ ...shopDetails, address: e.target.value })}
                  placeholder="Sarafa Bazar"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-medium"
                />
              </div>
            </div>
          )}
        </div>

        {/* ==============================================================
            ACCORDION 2: SIGNATURE
            ============================================================== */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setSignatureOpen(!signatureOpen)}
            className={`w-full px-4 py-3 flex items-center justify-between transition-colors cursor-pointer ${
              signatureOpen ? 'bg-[#0099ff] text-white' : 'bg-white text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5 font-semibold text-sm">
              <PlusCircle className={`w-4 h-4 ${signatureOpen ? 'text-white' : 'text-sky-500'}`} />
              <span>Signature</span>
            </div>
            {signatureOpen ? (
              <ChevronUp className="w-5 h-5 text-white stroke-[2.5]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-700 stroke-[2.5]" />
            )}
          </button>

          {signatureOpen && (
            <div className="p-3 bg-white border-t border-slate-100 text-xs space-y-2">
              <label className="text-slate-500 font-medium block">Authorized Signatory / Text:</label>
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="AZ JEWELERS"
                className="w-full border border-slate-300 rounded-lg px-3 py-1.5 font-medium"
              />
            </div>
          )}
        </div>

        {/* ==============================================================
            ACCORDION 3: ADD JEWELLERY ITEMS
            ============================================================== */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setItemsOpen(!itemsOpen)}
            className={`w-full px-4 py-3 flex items-center justify-between transition-colors cursor-pointer ${
              itemsOpen ? 'bg-[#0099ff] text-white' : 'bg-white text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5 font-semibold text-sm">
              <PlusCircle className={`w-4 h-4 ${itemsOpen ? 'text-white' : 'text-sky-500'}`} />
              <span>Add Jewellery Items</span>
            </div>
            {itemsOpen ? (
              <ChevronUp className="w-5 h-5 text-white stroke-[2.5]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-700 stroke-[2.5]" />
            )}
          </button>

          {itemsOpen && (
            <div className="p-3 bg-white border-t border-slate-100 space-y-3">
              {/* 4 Mode Radio Options in 2x2 Grid */}
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-semibold text-slate-700 pt-1">
                {['TMR', 'Gram', 'Money to Gold', 'Wgt per Tola'].map((mode) => (
                  <label key={mode} className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="itemMode"
                      value={mode}
                      checked={itemMode === mode}
                      onChange={() => setItemMode(mode)}
                      className="w-4 h-4 text-purple-700 focus:ring-purple-600 border-slate-300 cursor-pointer"
                    />
                    <span>{mode}</span>
                  </label>
                ))}
              </div>

              {/* Description Input */}
              <div>
                <input
                  type="text"
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  placeholder="Description"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                />
              </div>

              {/* Dynamic Inputs according to Mode */}
              <div className="flex items-center gap-2">
                {itemMode === 'TMR' || itemMode === 'Wgt per Tola' ? (
                  <div className="flex-1 grid grid-cols-3 gap-1.5">
                    <input
                      type="number"
                      value={itemTmr.tola}
                      onChange={(e) => setItemTmr({ ...itemTmr, tola: e.target.value })}
                      placeholder="Tola"
                      className="w-full border border-slate-300 rounded-xl px-2 py-2 text-center text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <input
                      type="number"
                      value={itemTmr.masha}
                      onChange={(e) => setItemTmr({ ...itemTmr, masha: e.target.value })}
                      placeholder="Masha"
                      className="w-full border border-slate-300 rounded-xl px-2 py-2 text-center text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <input
                      type="number"
                      value={itemTmr.ratti}
                      onChange={(e) => setItemTmr({ ...itemTmr, ratti: e.target.value })}
                      placeholder="Ratti"
                      className="w-full border border-slate-300 rounded-xl px-2 py-2 text-center text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                ) : itemMode === 'Gram' ? (
                  <div className="flex-1">
                    <input
                      type="number"
                      step="any"
                      value={itemGramWeight}
                      onChange={(e) => setItemGramWeight(e.target.value)}
                      placeholder="Gram Weight"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                ) : (
                  <div className="flex-1">
                    <input
                      type="number"
                      value={itemMoneyAmount}
                      onChange={(e) => setItemMoneyAmount(e.target.value)}
                      placeholder="Amount (PKR)"
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>
                )}

                {/* + and - Action Buttons (Blue rounded pills exactly as in screenshot) */}
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-10 h-9 bg-[#0099ff] hover:bg-[#0088ee] active:scale-95 text-white rounded-xl flex items-center justify-center transition-all shadow-xs cursor-pointer"
                  title="Add Item"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={handleRemoveLastItem}
                  disabled={itemsList.length === 0}
                  className="w-10 h-9 bg-[#0099ff] hover:bg-[#0088ee] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shadow-xs cursor-pointer"
                  title="Remove Last"
                >
                  <Minus className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Items Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden mt-3">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                      <th className="py-2 px-2 text-left w-2/5 border-r border-slate-300">Description</th>
                      <th className="py-2 px-1 text-center border-r border-slate-300">T</th>
                      <th className="py-2 px-1 text-center border-r border-slate-300">M</th>
                      <th className="py-2 px-1 text-center border-r border-slate-300">R</th>
                      <th className="py-2 px-2 text-right border-r border-slate-300">Gram</th>
                      <th className="py-2 px-1 text-center w-7"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-4 text-center text-slate-400 italic text-[11px]"
                        >
                          No items added yet. Click [+] to add.
                        </td>
                      </tr>
                    ) : (
                      itemsList.map((it) => (
                        <tr
                          key={it.id}
                          className="border-b border-slate-200 hover:bg-slate-50 text-slate-800"
                        >
                          <td className="py-1.5 px-2 font-medium border-r border-slate-200 truncate max-w-[90px]">
                            {it.description}
                          </td>
                          <td className="py-1.5 px-1 text-center border-r border-slate-200 font-mono">
                            {it.tola}
                          </td>
                          <td className="py-1.5 px-1 text-center border-r border-slate-200 font-mono">
                            {it.masha}
                          </td>
                          <td className="py-1.5 px-1 text-center border-r border-slate-200 font-mono">
                            {typeof it.rattiUnit === 'number' ? it.rattiUnit.toFixed(1) : it.rattiUnit}
                          </td>
                          <td className="py-1.5 px-2 text-right border-r border-slate-200 font-mono">
                            {it.grams.toFixed(3)}
                          </td>
                          <td className="py-1.5 px-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItemById(it.id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                    {itemsList.length > 0 && (
                      <tr className="bg-amber-50 font-bold text-slate-900 border-t-2 border-slate-300">
                        <td className="py-2 px-2 border-r border-slate-300">Total Wt:</td>
                        <td className="py-2 px-1 text-center border-r border-slate-300 font-mono">
                          {totalTmrObj.tola}
                        </td>
                        <td className="py-2 px-1 text-center border-r border-slate-300 font-mono">
                          {totalTmrObj.masha}
                        </td>
                        <td className="py-2 px-1 text-center border-r border-slate-300 font-mono">
                          {totalTmrObj.rattiFixed}
                        </td>
                        <td className="py-2 px-2 text-right border-r border-slate-300 font-mono text-emerald-800">
                          {totalGrams.toFixed(3)}g
                        </td>
                        <td></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ==============================================================
            ACCORDION 4: ADD CHARGES
            ============================================================== */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <button
            type="button"
            onClick={() => setChargesOpen(!chargesOpen)}
            className={`w-full px-4 py-3 flex items-center justify-between transition-colors cursor-pointer ${
              chargesOpen ? 'bg-[#0099ff] text-white' : 'bg-white text-slate-800 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5 font-semibold text-sm">
              <DollarSign className={`w-4 h-4 ${chargesOpen ? 'text-white' : 'text-sky-500'}`} />
              <span>Add Charges</span>
            </div>
            {chargesOpen ? (
              <ChevronUp className="w-5 h-5 text-white stroke-[2.5]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-700 stroke-[2.5]" />
            )}
          </button>

          {chargesOpen && (
            <div className="p-3 bg-white border-t border-slate-100 space-y-3">
              <div>
                <input
                  type="text"
                  value={chargeDesc}
                  onChange={(e) => setChargeDesc(e.target.value)}
                  placeholder="Description"
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(e.target.value)}
                  placeholder="Amount (e.g. 500 or -100 discount)"
                  className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <button
                  type="button"
                  onClick={handleAddCharge}
                  className="w-10 h-9 bg-[#0099ff] hover:bg-[#0088ee] active:scale-95 text-white rounded-xl flex items-center justify-center transition-all shadow-xs cursor-pointer"
                  title="Add Charge"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={handleRemoveLastCharge}
                  disabled={chargesList.length === 0}
                  className="w-10 h-9 bg-[#0099ff] hover:bg-[#0088ee] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shadow-xs cursor-pointer"
                  title="Remove Last"
                >
                  <Minus className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Charges Table */}
              <div className="border border-slate-300 rounded-xl overflow-hidden mt-3">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-200 text-slate-800 font-bold border-b border-slate-300">
                      <th className="py-2 px-3 text-left border-r border-slate-300">Description</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                      <th className="py-2 px-1 text-center w-7"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {chargesList.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-3 text-center text-slate-400 italic text-[11px]"
                        >
                          No extra charges added.
                        </td>
                      </tr>
                    ) : (
                      chargesList.map((c) => (
                        <tr
                          key={c.id}
                          className="border-b border-slate-200 hover:bg-slate-50 text-slate-800"
                        >
                          <td className="py-1.5 px-3 border-r border-slate-200 font-medium">
                            {c.description}
                          </td>
                          <td
                            className={`py-1.5 px-3 text-right font-mono font-bold ${
                              c.amount < 0 ? 'text-rose-600' : 'text-slate-900'
                            }`}
                          >
                            {c.amount > 0 ? formatCurrency(c.amount) : `- ${formatCurrency(Math.abs(c.amount))}`}
                          </td>
                          <td className="py-1.5 px-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveChargeById(c.id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                    {chargesList.length > 0 && (
                      <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                        <td className="py-2 px-3 border-r border-slate-300">Total Charges:</td>
                        <td className="py-2 px-3 text-right font-mono">
                          {formatCurrency(totalCharges)}
                        </td>
                        <td></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Live Bottom Calculation Summary Pill (if items exist) */}
        {itemsList.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-slate-800 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Weight:</span>
              <span className="font-bold font-mono text-blue-950">
                {totalTmrObj.formatted} ({totalGrams.toFixed(3)}g)
              </span>
            </div>
            {rate > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Est. Total Amount:</span>
                <span className="font-bold font-mono text-emerald-800 text-sm">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ==============================================================
            BOTTOM ACTION BUTTON: CREATE (Blue pill matching screenshot)
            ============================================================== */}
        <div className="pt-2 pb-6 flex justify-center">
          <button
            type="button"
            onClick={handleCreateReceipt}
            className="w-48 py-2.5 px-6 bg-[#0099ff] hover:bg-[#0088ee] active:scale-98 text-white text-sm font-bold rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4 fill-white/20" />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Generated Receipt Modal */}
      {createdReceipt && (
        <MultiItemReceiptModal
          receipt={createdReceipt}
          onClose={() => setCreatedReceipt(null)}
        />
      )}
    </div>
  );
}
