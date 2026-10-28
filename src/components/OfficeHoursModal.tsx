import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, CheckCircle2, AlertCircle, Phone, Sparkles } from 'lucide-react';
import { OfficeStatusResult } from '../types';
import { getOfficeStatus } from '../utils/officeHours';

interface OfficeHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  helplineNumber: string;
}

export const OfficeHoursModal: React.FC<OfficeHoursModalProps> = ({
  isOpen,
  onClose,
  helplineNumber,
}) => {
  const [status, setStatus] = useState<OfficeStatusResult>(getOfficeStatus());

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setStatus(getOfficeStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-900 text-white p-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
              <Clock className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight font-kannada">
                ಗ್ರಾಮ ಪಂಚಾಯತಿ ಕಚೇರಿ ವೇಳಾಪಟ್ಟಿ
              </h3>
              <p className="text-xs text-emerald-200">
                Official Gram Panchayat Working Hours & Schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Operational Status Banner */}
        <div className="p-5 space-y-4">
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              status.isOpen
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : status.isLunchTime
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}
          >
            {status.isOpen ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{status.statusText}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/80 font-mono font-semibold shadow-2xs">
                  {status.currentTimeString}
                </span>
              </div>
              <p className="text-xs opacity-90 font-kannada">{status.statusTextKn}</p>
              <p className="text-xs font-medium text-slate-700 pt-0.5">{status.hoursDetail}</p>
            </div>
          </div>

          {/* Detailed Timetable according to exact user mandate */}
          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
            <div className="bg-slate-50 px-4 py-2.5 font-bold text-slate-700 flex justify-between items-center">
              <span>ದಿನಗಳು / Working Days</span>
              <span>ವೇಳೆ / Timings</span>
            </div>

            {/* Mon - Thu Full Day */}
            <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50">
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-900">ಸೋಮವಾರದಿಂದ ಗುರುವಾರ (Mon – Thu)</div>
                <div className="text-[11px] text-slate-500">ಪೂರ್ಣ ದಿನದ ಕಚೇರಿ ಕಾರ್ಯನಿರ್ವಹಣೆ (Full Day)</div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  10:00 AM – 5:00 PM
                </span>
              </div>
            </div>

            {/* Friday Full Day */}
            <div className="px-4 py-3 flex items-center justify-between hover:bg-slate-50/50">
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-900">ಶುಕ್ರವಾರ (Friday)</div>
                <div className="text-[11px] text-slate-500">ನಿಯಮಿತ ಪೂರ್ಣ ದಿನ (Full Day Working)</div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  10:00 AM – 5:00 PM
                </span>
              </div>
            </div>

            {/* Saturday Half Day Closed at 1 PM */}
            <div className="px-4 py-3 flex items-center justify-between bg-amber-50/40">
              <div className="space-y-0.5">
                <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                  <span>ಶನಿವಾರ (Saturday)</span>
                  <span className="bg-amber-200/80 text-amber-900 text-[10px] px-1.5 py-0.2 rounded font-bold">
                    ಅರ್ಧದಿನ / Half Day
                  </span>
                </div>
                <div className="text-[11px] text-amber-800">
                  ಮಧ್ಯಾಹ್ನ 1:00ಕ್ಕೆ ಕಚೇರಿ ಮುಕ್ತಾಯ (Closes sharp at 1:00 PM)
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  10:00 AM – 1:00 PM
                </span>
              </div>
            </div>

            {/* Sunday Holiday */}
            <div className="px-4 py-3 flex items-center justify-between bg-rose-50/40">
              <div className="space-y-0.5">
                <div className="font-semibold text-rose-900">ಭಾನುವಾರ (Sunday)</div>
                <div className="text-[11px] text-rose-700">ಸಾಪ್ತಾಹಿಕ ರಜಾದಿನ (Weekly Holiday)</div>
              </div>
              <div className="text-right">
                <span className="font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300 text-[11px]">
                  ರಜೆ / CLOSED
                </span>
              </div>
            </div>

            {/* Lunch Break Rule */}
            <div className="px-4 py-2.5 bg-slate-100 flex items-center justify-between text-slate-700 font-medium">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>ಮಧ್ಯಾಹ್ನದ ಊಟದ ವಿರಾಮ (Lunch Break - Mon to Fri):</span>
              </div>
              <span className="font-mono font-bold text-slate-900">1:00 PM – 2:00 PM</span>
            </div>
          </div>

          {/* 24x7 Portal & Helpline Support */}
          <div className="bg-emerald-950 text-white p-3.5 rounded-xl flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-emerald-300">
                24x7 ಜನಹಿತ ಆನ್‌ಲೈನ್ ದೂರು ಸಲ್ಲಿಕೆ ಸದಾ ಲಭ್ಯ
              </div>
              <div className="text-[11px] text-slate-300">
                Online grievance filing and alerts operate 24 hours a day
              </div>
            </div>
            <a
              href={`tel:${helplineNumber}`}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{helplineNumber}</span>
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
          >
            ಸರಿ / Understand & Close
          </button>
        </div>
      </div>
    </div>
  );
};
