'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { toast } from '@/hooks/use-toast';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Call the optional onError callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Update state to include errorInfo
    this.setState({
      errorInfo
    });
  }

  // Reset the error state
  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  // If resetOnPropsChange is true, reset when props change
  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (
      this.state.hasError &&
      this.props.resetOnPropsChange &&
      prevProps.children !== this.props.children
    ) {
      this.resetErrorBoundary();
    }
  }

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Show custom fallback UI if provided
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-gray-200 shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
          <div className="text-amber-500 mb-4">
            <AlertTriangle className="h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Something went wrong</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md text-center">
            {error?.message || 'An unexpected error occurred. We\'ve been notified and are working to fix the issue.'}
          </p>
          <Button 
            className="mt-4"
            onClick={() => {
              this.resetErrorBoundary();
              toast({
                title: "Attempting recovery",
                description: "The page is reloading to recover from the error.",
              });
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      );
    }

    return children;
  }
}

/**
 * Wrap a component with error boundary functionality using a hook-like pattern
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps: Omit<ErrorBoundaryProps, 'children'> = {}
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
  
  WrappedComponent.displayName = `withErrorBoundary(${displayName})`;
  
  return WrappedComponent;
} 