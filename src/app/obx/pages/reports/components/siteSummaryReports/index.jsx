import { Box, Button, CircularProgress, TableCell, TableRow, Tooltip } from '@mui/material';
import { ReactComponent as ChevronRight } from 'assets/svg/chevron-right.svg?react';
import CustomDropDown from 'commonComponents/customDropDown';
import DateRangePicker from 'commonComponents/RangeDatepicker';
import SideDrawer from 'commonComponents/sideDrawer';
import TableComponent from 'commonComponents/table';
import NoRecordFound from 'commonComponents/table/noRecordFound';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SearchComponent from 'src/app/components/common/search';
import TableSkeleton from 'src/app/components/common/skeletonLoader/tableSkeleton';
import ExportReportModel from 'src/app/obx/pages/reports/components/exportReportModel';
import { DownloadCloud } from 'src/assets/svg';
import { ReactComponent as HyperlinkIcon } from 'src/assets/svg/HyperlinkIcon.svg?react';
import { useApiControllers } from 'src/helper/axios';
import { downloadFileFromResponse } from 'src/helper/utilityFunctions';
import { useDeepEffect } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { downloadPdfFromUrl, getSiteSummaryReports } from 'src/services/reports.services';
import {
  dayjsFormatsEnum,
  fileExtensions,
  paginationOptions,
  toastSettings,
} from 'src/utils/constants';
import {
  extractValuesByKeyFromInput,
  removeAllFromSelected,
} from 'src/utils/dropdownValueExtractor';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { toaster } from 'src/utils/toast';

import { useStyles } from '../../listing/reportsListing.styles';

const PDFViewDrawer = lazy(() => import('src/app/obx/pages/reports/components/pdfViewDrawer'));

const i18ColumnName = (t, hoverIconClass) => {
  return [
    {
      id: 'site_name',
      label: `${t('obx.siteSummaryReports.table.listing.columns.site')}`,

      className: hoverIconClass,
    },
    {
      id: 'start_date_time',
      label: `${t('obx.siteSummaryReports.table.listing.columns.startDate')}`,
    },
    {
      id: 'end_date_time',
      label: `${t('obx.siteSummaryReports.table.listing.columns.endDate')}`,
    },
    {
      id: 'print',
      label: ``,
    },
  ];
};

const columnIdsEnum = {
  name: 'name',
  site: 'site_name',
  timeRange: 'timeRange',
  punchIn: 'punchIn',
  timeSpent: 'timeSpent',
  start_date_time: 'start_date_time',
  end_date_time: 'end_date_time',
  print: 'print',
  punchInAndOut: 'punchInAndOut',
};

const SiteSummaryReports = ({ params = {}, allSites }) => {
  const { t } = useTranslation();

  const classes = useStyles();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const { formatDayjsDateTime } = useDateTime();
  const { getNewApiController } = useApiControllers();

  const [pdfViewDrawer, setPdfViewDrawer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [error, setError] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const columns = i18ColumnName(t, classes.reportsTableTitle);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDownloading, setDownloading] = useState(false);
  const NA = t('commonText.nA');
  const [selectedLoadingReport, setSelectedLoadingReport] = useState(null);

  const [queryParams, setQueryParams] = useState(params);

  const fetchSiteSummaryReports = async () => {
    const apiController = getNewApiController();
    try {
      setLoading(true);
      const updatedParams = {
        siteId: removeAllFromSelected(
          extractValuesByKeyFromInput(queryParams.site, 'value'),
          'all',
        ),
        windowStart: queryParams?.selectedDates?.[0]
          ? dayjs(queryParams.selectedDates[0]).format('YYYY-MM-DD')
          : '',
        windowEnd: queryParams?.selectedDates?.[1]
          ? dayjs(queryParams.selectedDates[1]).format('YYYY-MM-DD')
          : '',
        search: queryParams?.search,
      };

      const response = await getSiteSummaryReports(updatedParams, { signal: apiController.signal });

      if (response?.statusCode === 200) {
        setData(response?.data?.reports);
      }

      setLoading(false);
    } catch (error) {
      if (!apiController.signal.aborted) {
        toaster.error({
          text: error?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
        setLoading(false);
      }
    }
  };

  const updateFormHandler = (name, value) => {
    setQueryParams((prevState) => {
      return {
        ...prevState,
        page: paginationOptions.defaultPerPage,
        [name]: value,
      };
    });
  };

  const inputChangedHandler = (event) => {
    // Get name of changed input, and its corresponding value
    const { name, value } = event.target;
    // Update form state against the target input field
    updateFormHandler(name, value);
  };

  const gotoDetailPage = (column, row) => {
    if (column.id === columnIdsEnum.site) {
      setPdfUrl(row?.pdf_link);
      setSelectedReport(row);
      setPdfViewDrawer(true);
    }
  };

  const tableBody = (data, columns) => {
    return loading ? (
      <TableSkeleton columns={columns} />
    ) : (
      <>
        <NoRecordFound data={data} noOfColumns={columns.length} t={t} />
        {data?.map((row) => (
          <TableRow key={row?.id}>
            {columns?.map((column) => {
              const showHandCursor = column.id === columnIdsEnum.name ? 'pointer' : '';
              return (
                <TableCell
                  key={column?.id}
                  style={{ cursor: showHandCursor }}
                  className={column.className}
                >
                  {renderTableCell(row, column)}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </>
    );
  };

  const renderTableCell = (row, column) => {
    const columnId = column?.id;

    switch (columnId) {
      case columnIdsEnum.site: {
        const text = row[columnId];
        const data = {
          text,
          display: capitalizeFirstLetter(text?.slice(0, 32)),
          showTooltip: text?.length > 32,
        };

        const content = (
          <Box className={classes.franchiseName} onClick={() => gotoDetailPage(column, row)}>
            <Box className={classes.franchiseNameText}>
              {(data.display || '') + (data.showTooltip ? '...' : '') || NA}
            </Box>
            <Box className={classes.franchiseNameIcon}>
              <ChevronRight />
            </Box>
          </Box>
        );

        return data.showTooltip ? (
          <Tooltip title={data.text} arrow>
            {content}
          </Tooltip>
        ) : (
          content
        );
      }

      case columnIdsEnum.start_date_time:
      case columnIdsEnum.end_date_time: {
        if (!row[columnId]) return <>{NA}</>;
        return (
          <>{formatDayjsDateTime({ value: row[columnId], formatType: dayjsFormatsEnum.date })}</>
        );
      }

      case columnIdsEnum.print: {
        return (
          <Box
            onClick={async () => {
              if (row?.pdf_link) {
                window.open(row.pdf_link, '_blank', 'noopener,noreferrer');
              }
              setSelectedLoadingReport(null);
            }}
            className={classes.pointer}
          >
            {selectedLoadingReport === row?._id ? (
              <CircularProgress size={14} />
            ) : (
              <HyperlinkIcon />
            )}
          </Box>
        );
      }

      default:
        return <>{row[columnId] || NA}</>;
    }
  };

  useDeepEffect(() => {
    fetchSiteSummaryReports();
  }, [queryParams, queryParams.selectedDates, queryParams.site]);

  const downloadPdf = async () => {
    try {
      setDownloading(true);
      const response = await downloadPdfFromUrl(pdfUrl, {
        responseType: 'blob',
        skipAuth: true,
      });

      const startedAt = formatDayjsDateTime({
        value: selectedReport?.start_date_time,
        formatType: dayjsFormatsEnum.dateTime,
      });

      const fileName = `SiteSummaryReport${startedAt}.pdf`;

      downloadFileFromResponse(response, fileName);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleSearch = (e) => {
    const { name, value } = e.target;
    setQueryParams((prev) => ({
      ...prev,
      page: paginationOptions.defaultPerPage,
      [name]: value,
    }));
  };

  return (
    <Box className={classes.reportsListings}>
      <Box className={classes.reportsListingsHeader}>
        <Box className={classes.reportsListingsHeaderLeft}>
          <Box className={classes.reportsListingsFilters}>
            <SearchComponent
              name="search"
              value={queryParams?.name || ''}
              placeholder={t('obx.settings.preferences.breakRules.searchbyName')}
              onSearch={handleSearch}
            />
            <CustomDropDown
              label={t('obx.shiftReports.filters.sites.label')}
              name="site"
              clearAll
              searchable
              options={allSites}
              selectedValues={queryParams?.site || []}
              handleChange={inputChangedHandler}
              searchPlaceholder={t('obx.shiftReports.filters.sites.searchPlaceholder')}
              checkmark
              multiSelect={true}
            />
          </Box>
        </Box>
        <Box className={classes.reportsListingsHeaderRight}>
          <Box className={classes.reportsListingsHeaderRightDate} display={'contents'}>
            <Box className={classes.userSection}>
              <Button
                variant="secondaryGrey"
                startIcon={<DownloadCloud />}
                onClick={() => setExportModal(true)}
              >
                {`${t('links.export')}`}
              </Button>
            </Box>
            <DateRangePicker
              selectedDates={queryParams?.selectedDates}
              setDates={(dates) => {
                updateFormHandler('selectedDates', dates);
              }}
            />
          </Box>
        </Box>
      </Box>
      <Box className={classes.reportsListingsContent}>
        <TableComponent data={data} columns={columns} tableBody={tableBody} pagination={false} />
      </Box>
      <ExportReportModel
        open={exportModal}
        onClose={() => setExportModal(false)}
        fileExtension={fileExtensions.XLSX}
      />
      {pdfViewDrawer && (
        <SideDrawer
          isOpen={pdfViewDrawer}
          key={`${loading}-${pdfUrl}-${error}`}
          totalWidth="1024px"
        >
          <Suspense fallback={null}>
            <PDFViewDrawer
              url={pdfUrl}
              setError={setError}
              setUrl={setPdfUrl}
              closeDrawer={setPdfViewDrawer}
            />
          </Suspense>
          <Box>
            <Box className={classes.reportsDrawerActions}>
              <Button
                onClick={() => {
                  downloadPdf();
                }}
                variant="secondaryBlue"
                disableRipple
                disabled={!pdfUrl || isDownloading}
              >
                {t('buttons.downloadPDF')}
              </Button>
            </Box>
          </Box>
        </SideDrawer>
      )}
    </Box>
  );
};

SiteSummaryReports.propTypes = {
  params: PropTypes.object,
  value: PropTypes.number,
  sites: PropTypes.array,
  allSites: PropTypes.array,
};

export default SiteSummaryReports;
