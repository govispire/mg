import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './AuthProvider';
import { StudentDataProvider } from './StudentDataProvider';
import { ExamCategoryProvider } from './ExamCategoryProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
        <Router>
            <AuthProvider>
                <StudentDataProvider>
                    <ExamCategoryProvider>
                        {children}
                    </ExamCategoryProvider>
                </StudentDataProvider>
            </AuthProvider>
        </Router>
        </QueryClientProvider>
    );
};
