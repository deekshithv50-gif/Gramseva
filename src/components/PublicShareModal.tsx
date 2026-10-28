import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Globe,
  QrCode,
  Printer,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { KarnatakaEmblem } from '../utils/karnatakaEmblem';
import { GramPanchayatInfo } from '../types';

interface PublicShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  panchayat: GramPanchayatInfo;
}

export const PublicShareModal: React.FC<PublicShareModalProps> = ({
  isOpen,
  onClose,
  panchayat,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Use the actual current URL or fallback to the provided Cloud Run public URL
  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-ls3ksksswgbildezkvbgth-559513034842.asia-southeast1.run.app';
  const cleanPublicUrl = currentUrl.replace(/#.*$/, '');

  const shareText = `🏛️ ಕರ್ನಾಟಕ ಸರ್ಕಾರ - ${panchayat.nameKn} ಜನಹಿತ ಕುಂದುಕೊರತೆ ಪೋರ್ಟಲ್\n\nಗ್ರಾಮ ಪಂಚಾಯತಿ ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ (ನೀರು, ರಸ್ತೆ, ಕಸ, ವಿದ್ಯುತ್, ಸಾಲ, ಇ-ಸ್ವತ್ತು) ದೂರುಗಳನ್ನು ದಾಖಲಿಸಲು ಮತ್ತು ಪರಿಹಾರ ಸ್ಥಿತಿ ತಿಳಿಯಲು ಈ ಸಾರ್ವಜನಿಕ ಲಿಂಕ್ ಕ್ಲಿಕ್ ಮಾಡಿ:\n${cleanPublicUrl}\n\nಸಹಾಯವಾಣಿ: ${panchayat.helplineNumber} (100% ಅನಾಮಧೇಯ ದೂರುದಾರರ ಗೌಪ್ಯತೆ)`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(cleanPublicUrl);
      } else {
        const input = document.createElement('input');
        input.value = cleanPublicUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate standard QR code URL using public QR server
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(cleanPublicUrl)}&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/20">
              <Globe className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                <span>ಸಾರ್ವಜನಿಕ ಲೈವ್ ಲಿಂಕ್ / Public Access URL</span>
              </div>
              <h3 className="text-base font-extrabold font-kannada mt-1">
                ಸಾರ್ವಜನಿಕ ಪೋರ್ಟಲ್ ಹಂಚಿಕೊಳ್ಳಿ (Public Share)
              </h3>
              <p className="text-xs text-emerald-200">
                Share portal link with citizens, village WhatsApp groups & notice boards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Public Access Link Box */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5 font-kannada">
              ನೇರ ಸಾರ್ವಜನಿಕ ವೆಬ್ ವಿಳಾಸ (Direct Public Web URL):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={cleanPublicUrl}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs text-slate-800 select-all"
              />
              <button
                onClick={handleCopy}
                className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-2xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ಕಾಪಿ ಆಗಿದೆ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Anyone with this link can freely open, read guidelines, lodge grievances, and track their applications.
            </p>
          </div>

          {/* Quick Sharing Channels */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handleWhatsAppShare}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>WhatsApp ನಲ್ಲಿ ಹಂಚಿ</span>
            </button>

            <a
              href={cleanPublicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-4 h-4 text-amber-300" />
              <span>Open in New Tab</span>
            </a>
          </div>

          {/* Notice Board QR Code Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-slate-700 font-bold font-kannada">
              <QrCode className="w-4 h-4 text-emerald-700" />
              <span>ಗ್ರಾಮ ಪಂಚಾಯತಿ ಸೂಚನಾ ಫಲಕ QR ಕೋಡ್ (Notice Board QR)</span>
            </div>

            <div className="flex justify-center">
              <div className="p-3 bg-white border-2 border-emerald-700 rounded-xl shadow-xs inline-block">
                <img
                  src={qrCodeUrl}
                  alt="Gram Panchayat Public Portal QR Code"
                  className="w-36 h-36 mx-auto"
                />
                <div className="text-[10px] font-bold text-slate-700 mt-1 font-mono">
                  SCAN TO LODGE GRIEVANCE
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
              Print this QR code to paste in Gram Panchayat offices, village bus stops, fair price shops (PDS), and milk dairies so citizens can instantly scan and submit complaints.
            </p>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-600 text-slate-700 font-semibold rounded-lg inline-flex items-center gap-1.5 transition cursor-pointer text-xs"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-700" />
              <span>Print Notice Board Poster / ಮುದ್ರಿಸಿ</span>
            </button>
          </div>

          {/* AI Studio Public Hosting & Publishing Instructions */}
          <div className="bg-amber-50/80 border border-amber-300 rounded-xl p-3.5 text-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950 font-kannada">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Google AI Studio ನಲ್ಲಿ ಪಬ್ಲಿಕ್ ಮಾಡುವ ವಿಧಾನ (Publish / Share Steps):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700 leading-relaxed pl-1">
              <li>
                <strong>Share Button</strong>: AI Studio ನ ಮೇಲ್ಭಾಗದ ಬಲ ಮೂಲೆಯಲ್ಲಿರುವ (top-right) <strong>Share</strong> ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.
              </li>
              <li>
                <strong>Anyone with Link</strong>: "Share App" ವಿಭಾಗದಲ್ಲಿ ಲಿಂಕ್ ಪ್ರವೇಶವನ್ನು ಸಾರ್ವಜನಿಕವಾಗಿ (Public) ಸಕ್ರಿಯಗೊಳಿಸಿ.
              </li>
              <li>
                <strong>Cloud Run Deployment</strong>: ಸೆಟ್ಟಿಂಗ್ಸ್ ಮೆನುವಿನಿಂದ ನೇರವಾಗಿ Cloud Run ಗೆ ಶಾಶ್ವತವಾಗಿ ಡೆಪ್ಲಾಯ್ ಮಾಡಬಹುದು.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            Helpline: {panchayat.helplineNumber}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition cursor-pointer"
          >
            ಮುಚ್ಚಿ / Close
          </button>
        </div>
      </div>
    </div>
  );
};
