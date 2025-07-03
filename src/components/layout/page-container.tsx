'use client'

import React from 'react';

interface PageContainerProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * A consistent page container for all app pages
 * Provides consistent styling, responsive layout, and page heading
 */
export function PageContainer({ title, description, children }: PageContainerProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 bg-gradient-to-r from-theme-primary to-theme-secondary bg-clip-text text-transparent">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm sm:text-base text-gray-600">
            {description}
          </p>
        )}
      </header>
      
      <div className="bg-white shadow-sm rounded-lg border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
