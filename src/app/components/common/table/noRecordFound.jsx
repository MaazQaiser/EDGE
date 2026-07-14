import { Box, TableCell, Typography } from '@mui/material';
import { ReactComponent as NoDataIcon } from 'assets/images/Nodata.svg?react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import { useStyles } from './table.styles';

const NoRecordFound = ({ data, noOfColumns, type, title, image, description }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <>
      {data.length === 0 && type === 'table' && (
        <TableCell
          colSpan={noOfColumns}
          sx={{
            padding: '24px',
          }}
        >
          <Box className={classes.noRecordFound}>
            {image ? <img alt="" src={image} /> : <NoDataIcon />}
            <Typography variant="h2" className={classes.noRecordFoundTitle}>
              {title ? title : t('commonText.table.noRecordFound')}
            </Typography>

            {description && (
              <Typography variant="body2" className={classes.noRecordFoundText}>
                {description}
              </Typography>
            )}
          </Box>
        </TableCell>
      )}
      {data.length === 0 && type === 'listing' && (
        <Box className={classes.noRecordFoundData}>
          <Box className={classes.noRecordFound}>
            {image ? <img alt="" src={image} /> : <NoDataIcon />}
            <Typography variant="h2" className={classes.noRecordFoundTitle}>
              {title ? title : t('commonText.table.noRecordFound')}
            </Typography>

            {description && (
              <Typography variant="body2" className={classes.noRecordFoundText}>
                {description}
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </>
  );
};

NoRecordFound.propTypes = {
  data: PropTypes.array.isRequired,
  noOfColumns: PropTypes.number,
  type: PropTypes.string,
  title: PropTypes.string,
  image: PropTypes.string,
  description: PropTypes.string,
};

NoRecordFound.defaultProps = {
  type: 'table',
};
export default NoRecordFound;
