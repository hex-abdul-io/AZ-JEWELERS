import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer, Share2, X, CheckCircle, Layers } from 'lucide-react';
import { formatCurrency, rattiToGrams } from '../utils/goldMath';

function generateMultiItemPrintableSlipHtml(receipt, paperSize) {
  const is58 = paperSize === '58mm';
  const width = is58 ? '52mm' : '76mm';
  const baseFontSize = is58 ? '10px' : '11px';
  const titleSize = is58 ? '16px' : '18px';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AZ JEWELERS - Receipt #${receipt.receiptNo}</title>
      <style>
        @page {
          size: auto;
          margin: 0mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          width: 100%;
          background: #ffffff;
          color: #000000;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          font-size: ${baseFontSize};
          line-height: 1.35;
          margin: 0;
          padding: 0;
        }
        body {
          display: flex;
          justify-content: center;
          padding: 4mm 0;
        }
        .slip-container {
          width: ${width};
          max-width: 100%;
          margin: 0 auto;
          background: #ffffff;
          padding: 6px 8px;
          box-sizing: border-box;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
        
        .header {
          text-align: center;
          border-bottom: 2px dashed #000000;
          padding-bottom: 6px;
          margin-bottom: 8px;
        }
        .header h1 {
          font-size: ${titleSize};
          font-weight: 900;
          letter-spacing: 1px;
          color: #000000;
          margin-bottom: 2px;
          text-transform: uppercase;
        }
        .header p {
          font-size: 9px;
          color: #555555;
          font-family: ui-monospace, monospace;
        }
        .meta-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 9.5px;
          font-weight: bold;
          margin-top: 6px;
          padding: 0 2px;
          color: #1e293b;
        }
        
        .box {
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background: #f8fafc;
          padding: 6px 8px;
          margin-bottom: 8px;
        }
        .box-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3px;
        }
        .box-row:last-child {
          margin-bottom: 0;
        }
        .label {
          color: #64748b;
        }
        .value {
          font-weight: bold;
          color: #0f172a;
        }
        
        .table-wrap {
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: ${baseFontSize};
        }
        th {
          background: #f1f5f9;
          font-weight: bold;
          padding: 5px 6px;
          border-bottom: 1px solid #cbd5e1;
          color: #334155;
          text-align: left;
        }
        td {
          padding: 5px 6px;
          border-bottom: 1px solid #e2e8f0;
          color: #1e293b;
        }
        tr:last-child td {
          border-bottom: none;
        }
        .row-total {
          background: #fefce8;
          font-weight: bold;
          border-top: 1px solid #cbd5e1;
        }
        .row-total td {
          color: #047857;
          font-weight: bold;
        }
        
        .total-box {
          border: 2px solid #000000;
          border-radius: 6px;
          padding: 8px 10px;
          background: #ffffff;
          margin-top: 6px;
        }
        .total-line {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          border-top: 2px dashed #000000;
          padding-top: 6px;
          margin-top: 6px;
          font-size: ${is58 ? '13px' : '15px'};
          font-weight: 900;
          color: #000000;
        }
        .sig-section {
          margin-top: 14px;
          padding-top: 6px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 9px;
          color: #64748b;
        }
        .sig-line {
          border-top: 1px solid #94a3b8;
          width: 90px;
          text-align: center;
          padding-top: 2px;
          color: #334155;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="slip-container">
        <!-- Header -->
        <div class="header">
          <h1>${receipt.shopName || 'AZ JEWELERS'}</h1>
          <p>${receipt.metalType.toUpperCase()} RECEIPT • CALCULATION SLIP</p>
          <div class="meta-bar">
            <span>Rcpt: #${receipt.receiptNo}</span>
            <span>Date: ${receipt.date}</span>
            <span>Time: ${receipt.time}</span>
          </div>
        </div>

        <!-- Customer & Rate Info -->
        <div class="box">
          ${
            receipt.customerName
              ? `
            <div class="box-row">
              <span class="label">Customer:</span>
              <span class="value">${receipt.customerName}</span>
            </div>
          `
              : ''
          }
          <div class="box-row">
            <span class="label">Metal Type:</span>
            <span class="value font-bold">${receipt.metalType.toUpperCase()}</span>
          </div>
          <div class="box-row">
            <span class="label">Rate / Tola:</span>
            <span class="value font-mono font-bold">${formatCurrency(receipt.ratePerTola)}</span>
          </div>
        </div>

        <!-- Items Table -->
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th style="width: 40%;">Item</th>
                <th style="width: 32%; text-align: center;">T-M-R</th>
                <th style="width: 28%; text-align: right;">Grams</th>
              </tr>
            </thead>
            <tbody>
              ${receipt.items
                .map(
                  (item) => `
                <tr>
                  <td style="font-weight: 500;">${item.description || 'Item'}</td>
                  <td style="text-align: center; font-weight: bold;" class="font-mono">${item.tmrFormatted}</td>
                  <td style="text-align: right;" class="font-mono">${item.grams.toFixed(3)}g</td>
                </tr>
              `
                )
                .join('')}
              <tr class="row-total">
                <td>Total Wt</td>
                <td style="text-align: center;" class="font-mono">${receipt.totalTmrFormatted}</td>
                <td style="text-align: right;" class="font-mono">${receipt.totalGrams.toFixed(3)}g</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Extra Charges Table (if any) -->
        ${
          receipt.charges && receipt.charges.length > 0
            ? `
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th style="width: 60%;">Charges / Making</th>
                  <th style="width: 40%; text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${receipt.charges
                  .map(
                    (c) => `
                  <tr>
                    <td>${c.description}</td>
                    <td style="text-align: right;" class="font-mono">${formatCurrency(c.amount)}</td>
                  </tr>
                `
                  )
                  .join('')}
                <tr style="font-weight: bold; background: #f8fafc; border-top: 1px solid #cbd5e1;">
                  <td>Total Extra</td>
                  <td style="text-align: right;" class="font-mono">${formatCurrency(receipt.totalCharges)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        `
            : ''
        }

        <!-- Grand Total Box -->
        <div class="total-box">
          <div class="box-row">
            <span class="label">${receipt.metalType} Amount:</span>
            <span class="value font-mono">${formatCurrency(receipt.metalAmount)}</span>
          </div>
          ${
            receipt.totalCharges !== 0
              ? `
            <div class="box-row">
              <span class="label">Extra Charges:</span>
              <span class="value font-mono">${formatCurrency(receipt.totalCharges)}</span>
            </div>
          `
              : ''
          }
          <div class="total-line">
            <span>GRAND TOTAL:</span>
            <span class="font-mono">${formatCurrency(receipt.grandTotal)}</span>
          </div>
        </div>

        <!-- Signature Section -->
        <div class="sig-section">
          <span>${receipt.shopPhone ? `Tel: ${receipt.shopPhone}` : ''}</span>
          <div class="sig-line">
            ${receipt.signature || 'Authorized Sign'}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default function MultiItemReceiptModal({ receipt, onClose }) {
  const [paperSize, setPaperSize] = useState('80mm');

  if (!receipt) return null;

  const handlePrint = () => {
    const existingIframe = document.getElementById('multi-item-print-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'multi-item-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '400px';
    iframe.style.height = '600px';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const htmlContent = generateMultiItemPrintableSlipHtml(receipt, paperSize);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(htmlContent);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1500);
      }
    }, 250);
  };

  const handleWhatsAppShare = () => {
    let itemsText = receipt.items
      .map(
        (it, idx) =>
          `${idx + 1}. *${it.description || 'Item'}*: ${it.tmrFormatted} (${it.grams.toFixed(3)}g)`
      )
      .join('\n');

    const text = `*--- ${receipt.shopName || 'AZ JEWELERS'} ---*
*Receipt No:* #${receipt.receiptNo}
*Date:* ${receipt.date} | ${receipt.time}
${receipt.customerName ? `*Customer:* ${receipt.customerName}\n` : ''}*Metal:* ${receipt.metalType.toUpperCase()}
*Rate/Tola:* ${formatCurrency(receipt.ratePerTola)}

*ITEMS LIST:*
${itemsText}

*Total Weight:* ${receipt.totalTmrFormatted} (${receipt.totalGrams.toFixed(3)}g)
*${receipt.metalType} Amount:* ${formatCurrency(receipt.metalAmount)}
${receipt.totalCharges ? `*Extra Charges:* ${formatCurrency(receipt.totalCharges)}\n` : ''}------------------------
*GRAND TOTAL:* ${formatCurrency(receipt.grandTotal)}
------------------------
Thank you for your business!`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const modalContent = (
    <div className="receipt-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/65 backdrop-blur-xs">
      <div className="receipt-modal-card bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-[#0099ff] text-white px-5 py-3.5 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-white" />
            <h3 className="font-semibold text-sm tracking-wide">
              Receipt Generated
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paper Size Selector */}
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
                  ? 'bg-blue-600 text-white shadow-xs'
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
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
              }`}
            >
              58mm (Pocket)
            </button>
          </div>
        </div>

        {/* On-screen Preview Slip */}
        <div className="p-4 overflow-y-auto space-y-3 text-slate-800 text-xs bg-white">
          <div className="text-center border-b border-dashed border-slate-300 pb-2">
            <h2 className="text-xl font-black tracking-wider text-slate-900 uppercase">
              ${receipt.shopName || 'AZ JEWELERS'}
            </h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              ${receipt.metalType.toUpperCase()} Receipt • Calculation Slip
            </p>
            <div className="flex justify-between items-center text-xs text-slate-700 mt-2 px-1 font-semibold">
              <span>Rcpt: #{receipt.receiptNo}</span>
              <span>Date: {receipt.date}</span>
              <span>Time: {receipt.time}</span>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
            {receipt.customerName && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Customer:</span>
                <span className="font-bold text-slate-800">{receipt.customerName}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Metal:</span>
              <span className="font-bold text-slate-900">{receipt.metalType.toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Rate / Tola:</span>
              <span className="font-extrabold text-blue-900">
                {formatCurrency(receipt.ratePerTola)}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs text-slate-700 flex justify-between border-b border-slate-200">
              <span className="w-2/5">Item</span>
              <span className="w-1/3 text-center">T-M-R</span>
              <span className="w-1/4 text-right">Grams</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {receipt.items.map((item, idx) => (
                <div key={idx} className="px-3 py-1.5 flex justify-between items-center">
                  <span className="w-2/5 font-medium text-slate-800">{item.description || 'Item'}</span>
                  <span className="w-1/3 text-center font-bold font-mono text-slate-900">{item.tmrFormatted}</span>
                  <span className="w-1/4 text-right font-mono text-slate-600">{item.grams.toFixed(3)}g</span>
                </div>
              ))}
              <div className="px-3 py-1.5 flex justify-between items-center font-bold bg-amber-50/70 border-t border-slate-200 text-emerald-800">
                <span className="w-2/5">Total Weight</span>
                <span className="w-1/3 text-center font-mono">{receipt.totalTmrFormatted}</span>
                <span className="w-1/4 text-right font-mono">{receipt.totalGrams.toFixed(3)}g</span>
              </div>
            </div>
          </div>

          {/* Charges if any */}
          {receipt.charges && receipt.charges.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs text-slate-700 flex justify-between border-b border-slate-200">
                <span>Charges Description</span>
                <span>Amount</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {receipt.charges.map((c, i) => (
                  <div key={i} className="px-3 py-1.5 flex justify-between items-center text-slate-700">
                    <span>{c.description}</span>
                    <span className="font-mono font-medium">{formatCurrency(c.amount)}</span>
                  </div>
                ))}
                <div className="px-3 py-1.5 flex justify-between items-center font-bold bg-slate-50 border-t border-slate-200">
                  <span>Total Extra</span>
                  <span className="font-mono">{formatCurrency(receipt.totalCharges)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Grand Total Box */}
          <div className="border-2 border-slate-900 rounded-xl p-3 space-y-1 bg-white text-slate-900">
            <div className="flex justify-between text-xs text-slate-700">
              <span>{receipt.metalType} Amount:</span>
              <span className="font-mono font-bold">{formatCurrency(receipt.metalAmount)}</span>
            </div>
            {receipt.totalCharges !== 0 && (
              <div className="flex justify-between text-xs text-slate-700">
                <span>Extra Charges:</span>
                <span className="font-mono font-bold">{formatCurrency(receipt.totalCharges)}</span>
              </div>
            )}
            <div className="pt-2 border-t-2 border-dashed border-slate-900 flex justify-between items-baseline">
              <span className="text-xs font-black uppercase tracking-wider">GRAND TOTAL:</span>
              <span className="text-lg font-black font-mono">
                {formatCurrency(receipt.grandTotal)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex gap-2 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-[#0099ff] hover:bg-[#0088ee] text-white text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer active:scale-98"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
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
