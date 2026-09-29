import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Printer,
  Share2,
  X,
  CheckCircle,
  Layers,
} from 'lucide-react';
import { formatCurrency, rattiToGrams } from '../utils/goldMath';

export default function InvoiceReceiptModal({ invoice, onClose }) {
  const [paperSize, setPaperSize] = useState('80mm'); // '80mm' | '58mm'

  if (!invoice) return null;

  // Bulletproof Isolated Print Handler
  const handlePrint = () => {
    const slipElement = document.getElementById('printable-invoice');
    if (!slipElement) {
      window.print();
      return;
    }

    // Create an isolated hidden iframe for pure 1-page print
    const existingIframe = document.getElementById('receipt-print-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'receipt-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const printWidth = paperSize === '58mm' ? '54mm' : '78mm';
    const slipHtml = slipElement.outerHTML;

    // Collect all stylesheets from main document
    let stylesHtml = `
      <style>
        @page {
          size: auto;
          margin: 0mm;
        }
        html, body {
          margin: 0;
          padding: 0;
          background: #ffffff;
          color: #000000;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          width: 100%;
        }
        body {
          padding: 4px;
          display: flex;
          justify-content: center;
        }
        #printable-invoice {
          width: ${printWidth} !important;
          max-width: 100% !important;
          margin: 0 auto !important;
          box-shadow: none !important;
          border: none !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          page-break-after: avoid !important;
          break-after: avoid !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      </style>
    `;

    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      stylesHtml += node.outerHTML;
    });

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>AZ JEWELERS - Invoice #${invoice.invoiceNo}</title>
        ${stylesHtml}
      </head>
      <body>
        ${slipHtml}
      </body>
      </html>
    `);
    doc.close();

    // Trigger print
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        // Fallback to standard window.print if iframe print is restricted
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 350);
  };

  const handleWhatsAppShare = () => {
    const text = `*--- AZ JEWELERS (LAB INVOICE) ---*
*Invoice No:* #${invoice.invoiceNo}
*Date:* ${invoice.date} | ${invoice.time}
*Description:* ${invoice.description || 'N/A'}
*Rate/Tola:* ${formatCurrency(invoice.ratePerTola)}

*Gross Weight:* ${invoice.grossWeight.formatted} (${rattiToGrams(invoice.grossRatti)}g)
*Total Cut:* ${invoice.cutWeight.formatted} (${rattiToGrams(invoice.cutRatti)}g)
*Net Weight:* ${invoice.netWeight.formatted} (${rattiToGrams(invoice.netRatti)}g)

*Gold Amount:* ${formatCurrency(invoice.goldAmount)}
*Extra Charges:* ${formatCurrency(invoice.totalCharges)}
------------------------
*GRAND TOTAL:* ${formatCurrency(invoice.grandTotal)}
------------------------
Thank you for your business!`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const modalContent = (
    <div className="receipt-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/65 backdrop-blur-xs">
      <div className="receipt-modal-card bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header (Hidden in Print) */}
        <div className="bg-[#0b213f] text-white px-5 py-3.5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-sm tracking-wide">
              Invoice Generated
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Size Selector (Hidden in Print) */}
        <div className="bg-slate-100 px-4 py-2 flex items-center justify-between border-b border-slate-200 text-xs no-print">
          <span className="text-slate-600 font-medium flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-500" /> پرنٹر سائز:
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setPaperSize('80mm')}
              className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                paperSize === '80mm'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              80mm (Table POS)
            </button>
            <button
              type="button"
              onClick={() => setPaperSize('58mm')}
              className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition-all cursor-pointer ${
                paperSize === '58mm'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              58mm (Pocket)
            </button>
          </div>
        </div>

        {/* THE ONLY PRINTABLE INVOICE SLIP (Matches image exactly) */}
        <div
          id="printable-invoice"
          className={`size-${paperSize} p-5 overflow-y-auto space-y-3 text-slate-800 text-xs print:p-2 print:space-y-2.5 print:overflow-visible print:text-black bg-white`}
        >
          {/* Slip Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-2">
            <h2 className="text-xl font-black tracking-wider text-[#0e2442] uppercase">
              AZ JEWELERS
            </h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Lab Invoice • Gold Testing & Calculation Slip
            </p>
            <div className="flex justify-between items-center text-xs text-slate-700 mt-2 px-1 font-semibold">
              <span>
                Inv: #{invoice.invoiceNo}
              </span>
              <span>
                Date: {invoice.date}
              </span>
              <span>
                Time: {invoice.time}
              </span>
            </div>
          </div>

          {/* Description & Rate Box */}
          <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/90 text-xs space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">
                Description:
              </span>
              <span className="font-bold text-slate-800">
                {invoice.description || 'Gold Ring 21K Testing'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">
                Rate / Tola:
              </span>
              <span className="font-extrabold text-[#0e2442]">
                {formatCurrency(invoice.ratePerTola)}
              </span>
            </div>
          </div>

          {/* Weight Breakdown Table */}
          <div className="border border-slate-200/90 rounded-xl overflow-hidden">
            <div className="bg-slate-100/80 px-3 py-1.5 font-bold text-xs text-slate-700 flex justify-between border-b border-slate-200/90">
              <span className="w-1/3">Type</span>
              <span className="w-1/3 text-center">T-M-R</span>
              <span className="w-1/3 text-right">Grams</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              <div className="px-3 py-2 flex justify-between items-center">
                <span className="w-1/3 text-slate-700 font-medium">
                  Gross Wt
                </span>
                <span className="w-1/3 text-center font-bold font-mono">
                  {invoice.grossWeight.formatted}
                </span>
                <span className="w-1/3 text-right text-slate-500 font-mono">
                  {rattiToGrams(invoice.grossRatti)}g
                </span>
              </div>
              <div className="px-3 py-2 flex justify-between items-center text-rose-600 bg-rose-50/30">
                <span className="w-1/3 font-semibold">
                  (-) Total Cut
                </span>
                <span className="w-1/3 text-center font-bold font-mono">
                  {invoice.cutWeight.formatted}
                </span>
                <span className="w-1/3 text-right font-mono">
                  {rattiToGrams(invoice.cutRatti)}g
                </span>
              </div>
              <div className="px-3 py-2 flex justify-between items-center font-bold bg-amber-50/50 border-t border-slate-200/90">
                <span className="w-1/3 text-slate-900">
                  Net Weight
                </span>
                <span className="w-1/3 text-center font-mono text-emerald-700 font-bold">
                  {invoice.netWeight.formatted}
                </span>
                <span className="w-1/3 text-right font-mono text-emerald-700 font-bold">
                  {rattiToGrams(invoice.netRatti)}g
                </span>
              </div>
            </div>
          </div>

          {/* Extra Charges Table (if charges exist) */}
          {invoice.charges && invoice.charges.length > 0 && (
            <div className="border border-slate-200/90 rounded-xl overflow-hidden">
              <div className="bg-slate-100/80 px-3 py-1.5 font-bold text-xs text-slate-700 flex justify-between border-b border-slate-200/90">
                <span>Charges Description</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {invoice.charges.map((c, i) => (
                  <div
                    key={i}
                    className="px-3 py-1.5 flex justify-between items-center text-slate-700"
                  >
                    <span>{c.description}</span>
                    <span className="font-mono font-medium">
                      {formatCurrency(c.amount)}
                    </span>
                  </div>
                ))}
                <div className="px-3 py-1.5 flex justify-between items-center font-bold bg-slate-50 border-t border-slate-200/90">
                  <span>Total Extra</span>
                  <span className="font-mono font-bold">
                    {formatCurrency(invoice.totalCharges)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Financial Calculation Box (Clean B&W Thermal Style) */}
          <div className="border-2 border-slate-900 rounded-xl p-3 space-y-1.5 bg-white text-slate-900">
            <div className="flex justify-between text-xs text-slate-700">
              <span className="font-medium">Gold Amount:</span>
              <span className="font-mono font-bold text-slate-900">
                {formatCurrency(invoice.goldAmount)}
              </span>
            </div>
            {invoice.totalCharges > 0 && (
              <div className="flex justify-between text-xs text-slate-700">
                <span className="font-medium">Extra Charges:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatCurrency(invoice.totalCharges)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t-2 border-dashed border-slate-900 flex justify-between items-baseline">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                GRAND TOTAL:
              </span>
              <span className="text-lg font-black text-slate-900 font-mono tracking-tight">
                {formatCurrency(invoice.grandTotal)}
              </span>
            </div>
          </div>

        </div>

        {/* Modal Action Buttons (Hidden in Print) */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex gap-2 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-[#0b213f] hover:bg-[#08182f] text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer active:scale-98"
          >
            <Printer className="w-4 h-4" />
            Print Slip (1 Page)
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer active:scale-98"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
