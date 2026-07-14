import PropTypes from 'prop-types';
import { useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// import classes from './sweetAlertModal.module.scss';
const MySwal = withReactContent(Swal);
import { useStyles } from './sweetAlertModal.styles';

/**
 * SweetAlertModal is a reusable React component for displaying SweetAlert dialogs.
 *
 * @param {string} title - The title of the alert dialog.
 * @param {string} text - The content text of the alert dialog.
 * @param {string} type - The type of the alert ('success', 'error', 'warning', etc.).
 * @param {boolean} showCancelButton - Whether to show the Cancel button (default is true).
 * @param {string} cancelButtonText - The text for the Cancel button.
 * @param {string} cancelButtonColor - The color for the Cancel button.
 * @param {string} confirmButtonText - The text for the Confirm button.
 * @param {string} confirmButtonColor - The color for the Confirm button.
 * @param {boolean} show - Controls whether the alert dialog is shown.
 * @param {function} handleConfirmButton - Function to be called when the Confirm button is clicked.
 * @param handleCancelButton
 * @param icon
 * @param customClass
 * @param reverseButtons
 */
const SweetAlertModal = ({
  title,
  text,
  type,
  showCancelButton,
  cancelButtonText,
  cancelButtonColor,
  confirmButtonText,
  confirmButtonColor,
  show,
  handleConfirmButton,
  handleCancelButton,
  icon,
  customClass,
  reverseButtons,
}) => {
  const classes = useStyles();
  useEffect(() => {
    if (show) {
      MySwal.fire({
        customClass: {
          container: classes.sweetAlertContainer,
          popup: classes.sweetAlertPopup,
          title: classes.sweetAlertTitle,
          icon: classes.sweetAlertIcon,
          htmlContainer: classes.sweetAlertHtmlContainer,
          actions: classes.sweetAlertActions,
          confirmButton: classes.sweetAlertConfirmButton,
          denyButton: classes.sweetAlertDenyButton,
          cancelButton: classes.sweetAlertCancelButton,
          ...customClass,
        },
        title,
        text,
        iconHtml: icon,
        showCancelButton,
        confirmButtonColor,
        cancelButtonText,
        cancelButtonColor,
        confirmButtonText,
        reverseButtons,
        preConfirm: handleConfirmButton,
      }).then((result) => {
        if (result.isConfirmed) {
          // handleConfirmButton();
        }
        if (result.isDenied || result.isDismissed) {
          handleCancelButton();
        }
      });
    }
  }, [type, title, text, show]);

  return null;
};

SweetAlertModal.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info', 'question']).isRequired,
  showCancelButton: PropTypes.bool,
  cancelButtonText: PropTypes.string,
  cancelButtonColor: PropTypes.string,
  confirmButtonText: PropTypes.string,
  confirmButtonColor: PropTypes.string,
  show: PropTypes.bool.isRequired,
  handleConfirmButton: PropTypes.func.isRequired,
  icon: PropTypes.object,
  handleCancelButton: PropTypes.func,
  customClass: PropTypes.string,
  reverseButtons: PropTypes.bool,
};

SweetAlertModal.defaultProps = {
  showCancelButton: true,
  cancelButtonColor: '#d33',
  confirmButtonColor: '#3085d6',
  show: false,
  reverseButtons: true,
};

export default SweetAlertModal;
