import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const useStyles = makeStyles(() => ({
  invalidFeedback: {
    fontSize: 14,
    lineHeight: '20px',
    fontWeight: 400,
    margin: 0,
    marginTop: '6px',
    color: '#B32318',
    textShadow: '0px 0px 0px #F4EBFF, 0px 1px 2px rgba(16, 24, 40, 0.05)',
    '&::first-letter ': {
      textTransform: 'capitalize',
    },
  },
}));

const FieldError = ({ error, positionClass }) => {
  const classes = useStyles();
  return !!error ? (
    <div className={classNames(classes.invalidFeedback, positionClass, 'Mui-error')}>{error}</div>
  ) : (
    <></>
  );
};

FieldError.propTypes = {
  positionClass: PropTypes.string,
  error: PropTypes.string,
};
FieldError.defaultProps = {
  positionClass: '',
};

export default FieldError;
