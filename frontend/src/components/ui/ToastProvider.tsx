'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: '',
        duration: 4000,
        style: {
          background: 'hsl(var(--b1))',
          color: 'hsl(var(--bc))',
          border: '1px solid hsl(var(--b3))',
          borderRadius: '0.5rem',
          fontSize: '14px',
          fontWeight: '500',
        },

        // Default options for specific types
        success: {
          duration: 3000,
          iconTheme: {
            primary: 'hsl(var(--su))',
            secondary: 'hsl(var(--suc))',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: 'hsl(var(--er))',
            secondary: 'hsl(var(--erc))',
          },
        },
        loading: {
          iconTheme: {
            primary: 'hsl(var(--p))',
            secondary: 'hsl(var(--pc))',
          },
        },
      }}
    />
  );
}