import { ReactComponent as DeleteIcon } from 'assets/svg/delete-modal.svg?react';
import { ReactComponent as InfoIcon } from 'assets/svg/info-toast.svg?react';
import { ReactComponent as SuccessIcon } from 'assets/svg/success-toast.svg?react';
import { ReactComponent as ErrorIcon } from 'assets/svg/toast-error.svg?react';
import { toast } from 'react-toastify';
import CustomToast from 'src/app/components/common/toastNotification';

export const toaster = (myProps, toastProps) =>
  toast(<CustomToast {...myProps} />, { ...toastProps });

toaster.success = (myProps, toastProps) =>
  toast.success(<CustomToast {...myProps} />, {
    ...toastProps,
    hideProgressBar: true,
    icon: (
      <span style={{ display: 'flex', alignItems: 'flex-start' }}>
        <SuccessIcon style={{ width: '40px', height: '40px' }} />
      </span>
    ),
  });
toaster.error = (myProps, toastProps) =>
  toast.error(<CustomToast {...myProps} />, {
    ...toastProps,
    hideProgressBar: true,
    icon: (
      <span style={{ display: 'flex', alignItems: 'flex-start' }}>
        <ErrorIcon style={{ width: '40px', height: '40px' }} />
      </span>
    ),
  });
toaster.delete = (myProps, toastProps) =>
  toast(<CustomToast {...myProps} />, {
    ...toastProps,
    hideProgressBar: true,
    icon: (
      <span style={{ display: 'flex', alignItems: 'flex-start' }}>
        <DeleteIcon style={{ width: '40px', height: '40px' }} />
      </span>
    ),
  });
toaster.info = (myProps, toastProps) =>
  toast.info(<CustomToast {...myProps} />, {
    ...toastProps,
    hideProgressBar: true,
    icon: (
      <span style={{ display: 'flex', alignItems: 'flex-start' }}>
        <InfoIcon style={{ width: '40px', height: '40px' }} />
      </span>
    ),
  });
