import React, { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { KarnatakaEmblem } from '../utils/karnatakaEmblem';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends (React.Component as any) {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error('[GramaSeva Portal] Uncaught application error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetData = () => {
    try {
      localStorage.removeItem('gp_panchayat_info');
      localStorage.removeItem('gp_complaints_list');
      localStorage.removeItem('gp_council_members');
      localStorage.removeItem('gp_user_session');
      localStorage.removeItem('gp_accessibility_settings');
      localStorage.removeItem('gp_portal_language');
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
          <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-red-200 overflow-hidden">
            {/* Government Banner */}
            <div className="bg-gradient-to-r from-red-800 to-amber-800 text-white p-6 flex items-center gap-4">
              <KarnatakaEmblem className="w-14 h-14 shrink-0 drop-shadow" />
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-200 font-semibold block">
                  ಕರ್ನಾಟಕ ಸರ್ಕಾರ | Government of Karnataka
                </span>
                <h1 className="text-xl font-bold font-serif">
                  ಗ್ರಾಮ ಪಂಚಾಯತ್ ಜನಹಿತ ಪೋರ್ಟಲ್
                </h1>
                <p className="text-xs text-slate-200">
                  Karnataka Gram Panchayat Grievance & Citizen Service Portal
                </p>
              </div>
            </div>

            {/* Error Body */}
            <div className="p-6">
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-900 mb-6">
                <AlertTriangle className="w-6 h-6 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <h2 className="font-bold text-base">
                    ಪುಟ ಲೋಡ್ ಮಾಡುವಾಗ ದೋಷ ಸಂಭವಿಸಿದೆ / Portal Error Encountered
                  </h2>
                  <p className="text-sm mt-1 text-red-800">
                    The portal encountered an unexpected display issue. Your saved complaints and data can be restored safely by refreshing or clearing temporary browser cache.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl font-semibold shadow-sm transition-colors text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>ಮರುಲೋಡ್ ಮಾಡಿ / Reload</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleResetData}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-red-50 active:bg-red-100 text-red-700 border border-slate-300 hover:border-red-300 rounded-xl font-semibold transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ಡೇಟಾ ತೆರವುಗೊಳಿಸಿ / Reset Cache</span>
                </button>
              </div>

              {/* Technical error details dropdown */}
              <details className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
                <summary className="cursor-pointer font-medium text-slate-700 select-none">
                  ತಾಂತ್ರಿಕ ವಿವರ / Technical Details (Click to inspect)
                </summary>
                <div className="mt-2 font-mono whitespace-pre-wrap bg-slate-900 text-red-400 p-3 rounded-lg overflow-x-auto text-[11px] leading-relaxed">
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </div>
              </details>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 text-center text-xs text-slate-500">
              ಗ್ರಾಮೀಣಾಭಿವೃದ್ಧಿ ಮತ್ತು ಪಂಚಾಯತ್ ರಾಜ್ ಇಲಾಖೆ (RDPR), ಕರ್ನಾಟಕ ಸರ್ಕಾರ
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
