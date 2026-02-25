import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './AuthProvider';
import { StudentDataProvider } from './StudentDataProvider';
import { ExamCategoryProvider } from './ExamCategoryProvider';

/**
 * Composed provider component that wraps all global providers
 * in the correct order to avoid prop drilling and context issues.
 * 
 * Provider Order:
 * 1. Router - for navigation
 * 2. Auth - user authentication state
 * 3. StudentData - global student data management
 * 4. ExamCategory - globally selected exam categories
 */
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <Router>
            <AuthProvider>
                <StudentDataProvider>
                    <ExamCategoryProvider>
                        {children}
                    </ExamCategoryProvider>
                </StudentDataProvider>
            </AuthProvider>
        </Router>
    );
};
