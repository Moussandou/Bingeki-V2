import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] p-6 text-white text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 animate-pulse blur-3xl rounded-full bg-red-600/20" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-sm">
              <AlertCircle size={48} className="text-red-500" />
            </div>
          </div>

          <h1 className="mb-4 font-outfit text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
            Aventure Interrompue
          </h1>
          
          <p className="mb-12 max-w-md font-medium text-gray-400">
            Une erreur inattendue a perturbé votre lecture. Ne vous inquiétez pas, votre progression est en sécurité.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={this.handleReset}
              className="group flex items-center justify-center gap-2 rounded-xl bg-red-600 px-8 py-4 font-bold text-white transition-all hover:bg-red-500 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(239,68,68,0.3)]"
            >
              <RefreshCw size={20} className="transition-transform group-hover:rotate-180" />
              Réessayer
            </button>

            <button
              onClick={this.handleGoHome}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-8 py-4 font-bold text-white transition-all hover:bg-white/10 hover:border-white/20"
            >
              <Home size={20} />
              Retour Accueil
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-20 w-full max-w-2xl rounded-xl border border-white/5 bg-white/5 p-6 text-left">
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-gray-500">Developer Info</p>
              <p className="font-mono text-sm text-red-400 break-words">{this.state.error.toString()}</p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
