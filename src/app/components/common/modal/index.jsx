import Modal from '@mui/material/Modal';
import PropTypes from 'prop-types';
const ModalComponent = ({ open, handleClose, body }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <>{body}</>
    </Modal>
  );
};

ModalComponent.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  body: PropTypes.node.isRequired,
};

export default ModalComponent;
