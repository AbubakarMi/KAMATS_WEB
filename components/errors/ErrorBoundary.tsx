'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  level?: 'page' | 'section';
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const isPage = this.props.level === 'page';

    return (
      <div className={`flex flex-col items-center justify-center text-center ${isPage ? 'py-24' : 'py-12'}`}>
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h3 className="text-xl font-bold font-[family-name:var(--font-display)] text-slate-900 mb-2">
          Something went wrong
        </h3>
        <p className="text-slate-500 text-sm mb-6 max-w-sm">
          {this.state.error?.message || 'An unexpected error occurred.'}
        </p>
        <Button onClick={() => { this.setState({ hasError: false, error: null }); }}>
          Try Again
        </Button>
      </div>
    );
  }
}
