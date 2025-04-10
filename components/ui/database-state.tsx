'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DatabaseStateProps {
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
  errorTitle?: string;
  errorDescription?: string;
}

export function DatabaseState({
  isLoading,
  error,
  onRetry,
  children,
  className,
  loadingText = 'Loading data...',
  errorTitle = 'Database Error',
  errorDescription = 'There was a problem loading the data. Please try again.',
}: DatabaseStateProps) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isLoading) {
      timeout = setTimeout(() => {
        setShowFallback(true);
      }, 5000); // Show fallback after 5 seconds
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);

  const handleRetry = async () => {
    if (!onRetry) return;
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
      setShowFallback(false);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive" className={cn('mb-4', className)}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{errorTitle}</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{errorDescription}</span>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading && showFallback) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-8', className)}>
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">{loadingText}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFallback(false)}
          className="mt-4"
        >
          Show Loading State
        </Button>
      </div>
    );
  }

  return <>{children}</>;
} 