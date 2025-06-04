import React, { Component, ErrorInfo, ReactNode } from "react";
import { useToast } from "../contexts/ToastContext";

interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    console.error("Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <h2>Something went wrong.</h2>;
    }
    return this.props.children;
  }
}

export function ErrorBoundaryWithToast({ children }: { children: ReactNode }) {
  const { showToast } = useToast();
  return (
    <ErrorBoundary
      fallback={<h2>Something went wrong.</h2>}
      onError={() => showToast("An unexpected error occurred.")}
    >
      {children}
    </ErrorBoundary>
  );
}
