import { toast as hotToast } from 'react-hot-toast';

export const toast = {
  success: (message: string) => {
    hotToast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: 'hsl(var(--su))',
        color: 'hsl(var(--suc))',
        border: '1px solid hsl(var(--su))',
      },
    });
  },

  error: (message: string) => {
    hotToast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: 'hsl(var(--er))',
        color: 'hsl(var(--erc))',
        border: '1px solid hsl(var(--er))',
      },
    });
  },

  loading: (message: string) => {
    return hotToast.loading(message, {
      position: 'top-right',
    });
  },

  dismiss: (toastId: string) => {
    hotToast.dismiss(toastId);
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return hotToast.promise(promise, messages, {
      position: 'top-right',
    });
  },
};