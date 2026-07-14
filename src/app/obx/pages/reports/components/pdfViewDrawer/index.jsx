import 'src/utils/pdfjs/reactPdfSetup';

import { Box, Button, Skeleton } from '@mui/material';
import { ReactComponent as CloseIcon } from 'assets/svg/close.svg?react';
import PropTypes from 'prop-types';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { Document, Page } from 'react-pdf';

import { useStyles } from './pdfViewDrawer.styles';

const maxPageWidth = 962;
const minPageWidth = 200;

const PDFViewDrawer = ({
  url,
  setUrl,
  closeDrawer,
  loading = !(url && url.length),
  setError = () => {},
  setDocNums = () => {},
  setLoading = () => {},
}) => {
  const classes = useStyles();
  const pdfContainerRef = useRef(null);
  const [pageWidth, setPageWidth] = useState(maxPageWidth);

  const [numPages, setNumPages] = useState(0);
  const [fetched, setFetched] = useState(false);

  useLayoutEffect(() => {
    const el = pdfContainerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const updateWidth = () => {
      const w = el.clientWidth;
      if (w > 0) {
        setPageWidth(Math.max(minPageWidth, Math.min(Math.floor(w), maxPageWidth)));
      }
    };

    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, [url]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setTimeout(() => {
      setDocNums(numPages);
    }, 1500);
    // setLoading(false);
    // setUrl(null);
  };

  const onDocumentLoadError = () => {
    setLoading(false);
    // setUrl(null);
    setError(true);
  };

  const onSourceSuccess = () => {
    // setLoading(false);
  };

  const onLoadSuccess = () => {
    // setLoading(false);
    // setError(false);
  };
  const onLoadProgress = ({ loaded, total }) => {
    if (loaded === total) {
      setLoading(false);
    }

    if (!isNaN(total) && loaded >= total) {
      setFetched(true);
    }
  };

  const renderUI = () => {
    return (
      <>
        <Box
          style={{ display: `${fetched && url && !loading ? 'none' : 'flex'}` }}
          className={classes.pdfLoadingSkeletons}
        >
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </Box>
        <>
          <Box
            ref={pdfContainerRef}
            className={classes.pdfDocumentWrapper}
            style={{ opacity: `${fetched ? 1 : 0}` }}
          >
            <Document
              file={url}
              onLoadError={onDocumentLoadError}
              onLoadSuccess={onDocumentLoadSuccess}
              onSourceSuccess={onSourceSuccess}
              loading={onLoadSuccess}
              onLoadProgress={onLoadProgress}
            >
              {Array.from(new Array(numPages), (el, index) => {
                return (
                  <Page
                    style={{
                      flexDirection: 'row',
                      backgroundColor: '#E4E4E4',
                    }}
                    key={`page_${index + 1}`}
                    pageNumber={index + 1}
                    loading={false}
                    width={pageWidth}
                  />
                );
              })}
            </Document>
          </Box>
        </>
      </>
    );
  };

  return (
    <>
      {/* {loading && <LoaderComponent size={50} color={'primary'} label={'Loading'} />} */}

      <Box className={classes.addBannedVisitorDrawer}>
        <Box className={classes.addBannedVisitorDrawerHeader}>
          <Button
            disableRipple
            className={classes.closeBtn}
            onClick={() => {
              closeDrawer(false);
              setLoading(false);
              setUrl('');
            }}
          >
            <CloseIcon />
          </Button>
        </Box>

        <Box className={classes.addBannedVisitorDrawerBody}>{renderUI()}</Box>
      </Box>
    </>
  );
};

PDFViewDrawer.propTypes = {
  url: PropTypes.string,
  setUrl: PropTypes.func,
  closeDrawer: PropTypes.func,
  loading: PropTypes.func,
  setLoading: PropTypes.func,
  setError: PropTypes.func,
  setDocNums: PropTypes.func,
  invoice: PropTypes.object,
};

export default PDFViewDrawer;
