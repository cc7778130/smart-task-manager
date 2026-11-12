import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { createPortal } from 'react-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import RoutesComponent from './app';
import './index.css';
import { Toaster } from '@client/src/components/ui/sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const MainApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <div className="flex min-h-screen items-center justify-center bg-background p-6">
            <div className="w-full max-w-md space-y-3 rounded-lg border p-6 text-center">
              <h1 className="text-lg font-semibold">页面出错了</h1>
              <p className="break-words text-sm text-muted-foreground">
                {(error as Error)?.message || '发生了未知错误'}
              </p>
              <button
                type="button"
                className="rounded-md border px-4 py-2 text-sm font-medium"
                onClick={resetErrorBoundary}
              >
                重试
              </button>
            </div>
          </div>
        )}
      >
          <RoutesComponent />
          {createPortal(<Toaster />, document.body)}
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById('root')!).render(<MainApp />);
