import React, { useEffect } from 'react';
import { Bell, X, ShieldCheck, MapPin, ExternalLink } from 'lucide-react';
import { Complaint } from '../types';

interface NotificationToastProps {
  complaint: Complaint | null;
  onDismiss: () => void;
  onView: (complaint: Complaint) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  complaint,
  onDismiss,
  onView,
}) => {
  useEffect(() => {
    if (!complaint) return;

    // Optional audio chime using Web Audio API synthesize short gentle tone
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // Audio context might be restricted before interaction
    }

    const timer = setTimeout(() => {
      onDismiss();
    }, 9000);

    return () => clearTimeout(timer);
  }, [complaint, onDismiss]);

  if (!complaint) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full bg-slate-900/95 backdrop-blur text-white p-4 rounded-2xl shadow-2xl border border-amber-400/40 animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-amber-500 text-slate-950 rounded-xl shrink-0 animate-bounce">
          <Bell className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-300 tracking-wide font-kannada">
              ಹೊಸ ದೂರು ಎಚ್ಚರಿಕೆ / New Grievance Alert
            </span>
            <span className="text-[10px] font-mono text-slate-400">Just Now</span>
          </div>

          <h4 className="text-xs font-bold text-white leading-snug line-clamp-1">
            {complaint.title}
          </h4>

          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              {complaint.village}
            </span>
            <span>•</span>
            <span className="font-mono text-amber-200">{complaint.citizenMaskedId}</span>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => {
                onView(complaint);
                onDismiss();
              }}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition inline-flex items-center gap-1 shadow-2xs"
            >
              <span>ವೀಕ್ಷಿಸಿ / View Complaint</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={onDismiss}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-white transition"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
