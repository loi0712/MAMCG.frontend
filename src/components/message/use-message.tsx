import type { ReactNode } from 'react';
import type { ToastOptions } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import './index.scss';
import { toast } from 'react-toastify';
import { useWindowSize } from 'react-use';

import colorConfig from '@/config/colorConfig';

import { ErrorIcon, Info, Tick, Warning } from '../icons';

const enum DEFAULT_TOAST_ID {
  success,
  error,
  info,
  warning,
}

export const useMessage = () => {

  const { width: windowWidth } = useWindowSize();

  const defaultOption: ToastOptions = {
    position: windowWidth > 500 ? toast.POSITION.BOTTOM_LEFT : toast.POSITION.BOTTOM_CENTER,
    autoClose: 2000,
    closeButton: false,
    hideProgressBar: true,
    pauseOnHover: false,
    pauseOnFocusLoss: false,
    closeOnClick: true,
    className: 'spa-booking-message typo-body-1-medium',
    style:
      windowWidth > 500
        ? {
            bottom: '2rem',
            left: '20%',
            right: 'auto',
            height: 'fit-content',
            width: 'fit-content',
            whiteSpace: 'nowrap',
            color: colorConfig.neutral[900],
            borderRadius: '0.5rem',
            border: '1px solid',
          }
        : {
            bottom: '4rem',
            width: '100%',
            color: colorConfig.neutral[900],
            border: '1px solid',
          },
    draggable: false,
    delay: 10,
    isLoading: false,
  };

  const success = (content: string | ReactNode, customOption?: ToastOptions) => {
    const _content = typeof content === 'string' ? content : content;

    toast(_content, {
      ...defaultOption,
      icon: <Tick type="filled" color={colorConfig.semantic.success} />,
      style: {
        ...defaultOption.style,
        borderColor: colorConfig.semantic.success,
        backgroundColor: colorConfig.semantic.successBG,
      },
      toastId: typeof content === 'string' ? content : DEFAULT_TOAST_ID.success,
      ...customOption,
    });
  };

  const info = (content: string | ReactNode, customOption?: ToastOptions) => {
    const _content = typeof content === 'string' ? content : content;

    toast(_content, {
      ...defaultOption,
      icon: <Info type="filled" color={colorConfig.semantic.information} />,
      style: {
        ...defaultOption.style,
        borderColor: colorConfig.semantic.information,
        backgroundColor: colorConfig.semantic.informationBG,
      },
      toastId: typeof content === 'string' ? content : DEFAULT_TOAST_ID.info,
      ...customOption,
    });
  };

  const error = (content: string | ReactNode, customOption?: ToastOptions) => {
    const _content = typeof content === 'string' ? content : content;

    toast(_content, {
      ...defaultOption,
      icon: <ErrorIcon type="filled" color={colorConfig.semantic.error} />,
      style: {
        ...defaultOption.style,
        borderColor: colorConfig.semantic.error,
        backgroundColor: colorConfig.COLORS_NAME.LIGHT_RED,
      },
      toastId: typeof content === 'string' ? content : DEFAULT_TOAST_ID.error,
      ...customOption,
    });
  };

  const warning = (content: string | ReactNode, customOption?: ToastOptions) => {
    const _content = typeof content === 'string' ? content : content;

    toast(_content, {
      ...defaultOption,
      icon: <Warning type="filled" color={colorConfig.semantic.warning} />,
      style: {
        ...defaultOption.style,
        borderColor: colorConfig.semantic.warning,
        backgroundColor: colorConfig.semantic.warningBG,
      },
      toastId: typeof content === 'string' ? content : DEFAULT_TOAST_ID.warning,
      ...customOption,
    });
  };

  return { success, info, error, warning };
};
