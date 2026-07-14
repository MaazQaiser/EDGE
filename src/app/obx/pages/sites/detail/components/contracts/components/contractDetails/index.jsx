import 'src/utils/pdfjs/reactPdfSetup';

import { Box, Button } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg?react';
import LoaderComponent from 'commonComponents/loader';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Document, Page } from 'react-pdf';

const useStyles = makeStyles((theme) => ({
  contractDrawerHeader: {
    padding: ' 24px',
    display: 'flex',
    justifyContent: 'flex-end',
    position: 'sticky',
    zIndex: 10,
    top: 0,
    right: 0,
    background: theme.palette.surfaceWhite,
    width: 'auto',
  },

  contractsPdf: {},

  closeBtn: {
    '&.MuiButtonBase-root': {
      minWidth: 'fit-content',
      padding: 0,

      '&:hover': {
        background: 'transparent',
      },
    },
  },
}));

const maxWidth = 850;

const ContractDetails = ({ url, handleClose }) => {
  const [numPages, setNumPages] = useState(0);
  const classes = useStyles();

  const [loading, setLoading] = useState(!!url);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = () => {
    setLoading(false);
  };

  return (
    <>
      {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />}
      <Box className={classes.contractDrawerHeader}>
        <Button disableRipple className={classes.closeBtn} onClick={handleClose}>
          <CloseIcon />
        </Button>
      </Box>

      <Box className={classes.contractsPdf}>
        {url && (
          <Document
            file={url}
            onLoadError={onDocumentLoadError}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={false}
          >
            {numPages > 0 && !loading
              ? Array.from(new Array(numPages), (el, index) => {
                  return (
                    <Page
                      // size="A4"
                      style={{
                        flexDirection: 'row',
                        backgroundColor: '#E4E4E4',
                      }}
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      loading={false}
                      width={maxWidth}
                    />
                  );
                })
              : null}
          </Document>
        )}
      </Box>
    </>
  );
};

ContractDetails.propTypes = {
  url: PropTypes.string,
  handleClose: PropTypes.func,
};

export default ContractDetails;
