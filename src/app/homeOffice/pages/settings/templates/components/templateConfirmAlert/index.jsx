import PropTypes from 'prop-types';
import { useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import classes from './templateConfirmAlert.module.scss';
const MySwal = withReactContent(Swal);

/**
 * TemplateConfirmAlert is a reusable React component for displaying SweetAlert dialogs.
 *
 * @param {string} title - The title of the alert dialog.
 * @param {object} textHtml - The content text of the alert dialog.
 * @param {string} type - The type of the alert ('success', 'error', 'warning', etc.).
 * @param {boolean} showCancelButton - Whether to show the Cancel button (default is true).
 * @param {string} cancelButtonText - The text for the Cancel button.
 * @param {string} cancelButtonColor - The color for the Cancel button.
 * @param {string} confirmButtonText - The text for the Confirm button.
 * @param {string} confirmButtonColor - The color for the Confirm button.
 * @param {boolean} show - Controls whether the alert dialog is shown.
 * @param {object} icon - returns img tag with icon in src attribute.
 * @param {function} handleConfirmButton - Function to be called when the Confirm button is clicked.
 * @param {function} handleCancelButton - Function to be called when the Confirm button is clicked.
 * @param {boolean} reverseButtons - Controls whether the placement of buttons.
 */
const TemplateConfirmAlert = ({
  title,
  textHtml,
  type,
  showCancelButton,
  cancelButtonText,
  cancelButtonColor,
  confirmButtonText,
  confirmButtonColor,
  show,
  icon,
  handleConfirmButton,
  handleCancelButton,
  reverseButtons,
  loader,
}) => {
  useEffect(() => {
    if (show) {
      MySwal.fire({
        customClass: {
          container: classes.templateConfirmAlertContainer,
          popup: classes.templateConfirmAlertPopup,
          title: classes.templateConfirmAlertTitle,
          icon: classes.templateConfirmAlertIcon,
          htmlContainer: classes.templateConfirmAlertHtmlContainer,
          actions: classes.templateConfirmAlertActions,
          confirmButton: classes.templateConfirmAlertConfirmButton,
          denyButton: classes.templateConfirmAlertDenyButton,
          cancelButton: classes.templateConfirmAlertCancelButton,
        },
        title,
        html: textHtml,
        iconHtml: icon,
        showCancelButton,
        confirmButtonColor,
        cancelButtonText,
        cancelButtonColor,
        confirmButtonText,
        reverseButtons,
      }).then((result) => {
        if (result.isConfirmed) {
          handleConfirmButton();
        }
        if (result.isDenied || result.isDismissed) {
          handleCancelButton();
        }
      });
    }
  }, [type, title, textHtml, show, loader]);

  return null;
};

TemplateConfirmAlert.propTypes = {
  title: PropTypes.string.isRequired,
  textHtml: PropTypes.object.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info', 'question']).isRequired,
  showCancelButton: PropTypes.bool,
  cancelButtonText: PropTypes.string,
  cancelButtonColor: PropTypes.string,
  confirmButtonText: PropTypes.string,
  confirmButtonColor: PropTypes.string,
  show: PropTypes.bool.isRequired,
  reverseButtons: PropTypes.bool.isRequired,
  handleConfirmButton: PropTypes.func.isRequired,
  handleCancelButton: PropTypes.func.isRequired,
  icon: PropTypes.object,
  loader: PropTypes.bool,
};

TemplateConfirmAlert.defaultProps = {
  showCancelButton: true,
  confirmButtonColor: '#d33',
  cancelButtonColor: '#3085d6',
  show: false,
  reverseButtons: true,
};

export default TemplateConfirmAlert;
