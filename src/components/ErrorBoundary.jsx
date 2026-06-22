import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen grid place-items-center p-6">
          <div className="card max-w-lg">
            <h1 className="text-lg font-bold text-red-400 mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-400 mb-3">
              The app hit an unexpected error. Details below:
            </p>
            <pre className="text-xs text-red-300 bg-ink-950/60 border border-white/10 rounded-lg p-3 whitespace-pre-wrap overflow-auto max-h-64">
              {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
            </pre>
            <button className="btn-ghost mt-4" onClick={() => location.reload()}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
