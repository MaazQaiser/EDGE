import { Avatar, Box, CardMedia, Chip, Skeleton, Typography } from '@mui/material';
import { ReactComponent as CrossBlackIcon } from 'assets/svg/CrossBlackIcon.svg?react';
import { ReactComponent as PenIcon } from 'assets/svg/PenIcon.svg?react';
import { ReactComponent as VisitorPDFIcon } from 'assets/svg/VisitorPDFIcon.svg?react';
import PopoverButton from 'commonComponents/popoverButton';
import SideDrawer from 'commonComponents/sideDrawer';
import ThumbnailSlider from 'commonComponents/thumbnailSlider';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  downloadProfile,
  getBanVisitorLoadInfo,
  getVisitorLoadInfo,
} from 'services/visitorsLoads.service';
import { dayjsWithStandardOffset } from 'src/app/obx/pages/schedules/helper';
import { DownloadCloudIcon, MoreVert } from 'src/assets/svg';
// import TableImage from 'src/app/components/common/tableImage';
// import VideoThumbnail from 'src/app/components/common/videoThumbnail';
import {
  formatDate,
  generateURLFromObject,
  isObjectEmpty,
  listStatusHandler,
} from 'src/helper/utilityFunctions';
import { useTenantLabel } from 'src/helper/utilityHooks';
import useDateTime from 'src/hooks/useDateTime';
import { downloadPdfFromUrl } from 'src/services/reports.services';
import {
  dayjsFormatsEnum,
  enumResponseType,
  supportedImageFormats,
  toastSettings,
  videoFileFormats,
} from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';
import { toaster } from 'src/utils/toast';

import { useStyles } from './PreviewVisitorDrawer';

const PDFViewDrawer = lazy(() => import('src/app/obx/pages/reports/components/pdfViewDrawer'));

const _enumDropDownOptions = {
  all: 'all',
  checked_in: 'Checked-In',
  checked_out: 'Checked-Out',
};

const enumDropDownOptionsLoad = {
  all: 'all',
  checked_in: 'in_bound',
  checked_out: 'out_bound',
};

const enumStats = {
  Banned: 'Banned',
  Allowed: 'Allowed',
};

const notToShowOnFirstRow = [
  enumResponseType.webCam,
  enumResponseType?.attachments,
  enumResponseType?.imageVideo,
  enumResponseType?.signature,
];

const visitorStatus = {
  ALLOWED: 'Allowed',
  BANNED: 'Banned',
};

const showOnlyImages = [enumResponseType.webCam, enumResponseType?.imageVideo];
const showDateFormat = [enumResponseType.date, enumResponseType?.datetime, enumResponseType?.time];

const VisitorsLoadsPreview = ({
  handleClosePreviewVisitorDrawer,
  anchor,
  id,
  isLoad,
  isBan,
  setShowEditVisitProfile,
  setProfileId,
  profileId,
}) => {
  const { t } = useTranslation();
  const NA = t('commonText.nA');
  const classes = useStyles();
  const { getLabel } = useTenantLabel();

  const saasToken = useSelector((state) => state.auth.saasToken);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});

  const [open, setOpen] = useState({
    state: false,
    index: 0,
  });
  const [pdfUrl, setPdfUrl] = useState('');
  const [reset, setReset] = useState(true);
  const [_docNum, setDocNums] = useState(0);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState({});
  const { formatDayjsDateTime, dateformat, dateTimeFormat, timeFormatType } = useDateTime();

  const formatAccordingToDateType = {
    [enumResponseType.date]: dateformat,
    [enumResponseType.datetime]: dateTimeFormat,
    [enumResponseType.time]: timeFormatType,
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
    setPdfUrl(null);
    setReset(true);
    setSelectedPDF({});
  };
  const _handleOpenDrawer = (url, pdf) => {
    setShowDrawer(true);
    setPdfUrl(url);
    setSelectedPDF(pdf);
  };

  const getFileName = () => {
    return isLoad ? data?.identifier : data?.name?.split(' ')?.join('');
  };

  const downloadLocalPDf = (url, isProfileDownload = false) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedPDF?.key}_${dayjs().unix()}.pdf`);
    link.setAttribute(
      'download',
      `${isProfileDownload ? getFileName() : selectedPDF?.key}_${dayjs().unix()}.pdf`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchProfile = async () => {
    try {
      if (!id) return;
      const response = await downloadProfile(id);
      if (response && response.statusCode === 200) {
        if (!response?.data?.url) return;
        const pdfResponse = await downloadPdfFromUrl(response?.data?.url, {
          responseType: 'blob',
          skipAuth: true,
        });
        const url = URL.createObjectURL(pdfResponse);
        downloadLocalPDf(url, true);
        toaster.success({
          text: response?.message,
          position: 'top-right',
          autoClose: toastSettings.AUTO_CLOSE,
        });
      }
    } catch (error) {
      toaster.error({
        text: error?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
    }
  };

  const fetchVisitorLoadInfo = async () => {
    try {
      setLoading(true);
      const response = !isBan ? await getVisitorLoadInfo(id) : await getBanVisitorLoadInfo(id);

      if (response?.statusCode === 200) {
        const allData = { ...response?.data };

        if (
          !isBan &&
          !isObjectEmpty(allData?.checkinForm) &&
          allData?.checkinForm?.sectionsAttributes.length > 0
        ) {
          allData['checkinForm']['sectionsAttributes'] = allData?.['checkinForm']?.[
            'sectionsAttributes'
          ]?.map((b) => {
            b.questionsAttributes = b?.questionsAttributes?.slice(isLoad ? 1 : 3);
            return b;
          });
        }

        setData(allData);
      }

      setLoading(false);
    } catch (e) {
      toaster.error({
        text: e?.message,
        position: 'top-right',
        autoClose: toastSettings.AUTO_CLOSE,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchVisitorLoadInfo();
  }, [id]);

  useEffect(() => {
    if (pdfUrl) setReset(false);
  }, [pdfUrl]);

  const status = listStatusHandler(
    isLoad ? enumDropDownOptionsLoad[data?.state] : data?.state,
    t,
    getLabel,
  );

  const showImagesOfCheckInCheckOut = (question, i) => {
    if (
      showOnlyImages.includes(question?.responseType) &&
      (question?.answers?.imgUrl || question?.answers?.fileUri)
    ) {
      return (
        <Avatar
          key={i}
          className={classes.profileImageUploaded}
          src={generateURLFromObject(question?.answers, saasToken)}
          alt="webcam"
          onClick={() => {
            setOpen({ state: true, index: i });
          }}
        />
      );
    } else if (
      question?.responseType === enumResponseType.signature &&
      (question?.answers?.imgUrl || question?.answers?.fileUri)
    ) {
      return (
        <Box>
          <img
            key={i}
            src={generateURLFromObject(question?.answers, saasToken)}
            className={classes.signatureUploaded}
            alt="Signature"
          />
        </Box>
      );
    } else if (showOnlyImages.includes(question?.responseType) && question?.answers.length) {
      return question?.answers?.map((img, i) => {
        const imageUrl = generateURLFromObject(img, saasToken);
        const imageIndex = previewFiles?.findIndex((file) => file.src === imageUrl);
        if (img?.contentType?.startsWith('video/')) {
          return (
            <CardMedia
              key={i}
              className={classes.profileImageUploaded}
              src={generateURLFromObject(img, saasToken)}
              alt="Images"
              onClick={() => {
                setOpen({ state: true, index: imageIndex });
              }}
              component="video"
              sx={{ width: '100px', objectFit: 'fill', height: '100px', borderRadius: '4px' }}
            />
          );
        } else {
          return (
            <Avatar
              key={i}
              className={classes.profileImageUploaded}
              src={generateURLFromObject(img, saasToken)}
              alt="Images"
              onClick={() => {
                setOpen({ state: true, index: imageIndex });
              }}
            />
          );
        }
      });
    } else if (enumResponseType?.attachments === question.responseType) {
      return question?.answers?.map((pdf, i) => {
        return (
          <Box
            onClick={() => {
              // handleOpenDrawer(generateURLFromObject(pdf, saasToken), pdf);
              const pdfUrl = generateURLFromObject(pdf, saasToken);
              window.open(pdfUrl, '_blank');
            }}
            key={i}
            className={(classes.bgColor, classes.bgColor)}
          >
            <VisitorPDFIcon />
          </Box>
        );
      });
    } else {
      return null;
    }
  };
  const callBackTransform = (f) => {
    const data = { src: f?.url, type: f?.contentType };
    if (videoFileFormats.includes(f?.contentType)) {
      data.sources = [{ src: f?.url, type: f?.contentType }];
      data.type = 'video';
    }
    if (supportedImageFormats.includes(f?.contentType)) {
      data.type = 'image';
    }
    return data;
  };
  const transformDataForPreview = (sectionsAttributes) => {
    const images = [];
    sectionsAttributes?.forEach((section) => {
      section.questionsAttributes?.forEach((question) => {
        if (question?.responseType === enumResponseType.webCam && question?.answers) {
          images.push({
            ...callBackTransform({
              ...question?.answers,
              url: generateURLFromObject(question?.answers, saasToken),
            }),
          });
        } else if (showOnlyImages.includes(question?.responseType) && question?.answers.length) {
          return question?.answers?.forEach((img) => {
            images.push({
              ...callBackTransform({
                ...img,
                url: generateURLFromObject(img, saasToken),
              }),
            });
          });
        }
      });
    });
    return images;
  };

  const previewFiles = useMemo(() => {
    const images = [];
    images.push(...transformDataForPreview(data?.checkinForm?.sectionsAttributes));
    images.push(...transformDataForPreview(data?.checkoutForm?.sectionsAttributes));
    return images;
  }, [data]);

  return (
    <>
      <Box className={classes.previewHeader}>
        {open.state && (
          <ThumbnailSlider
            files={previewFiles}
            usedFrom={'bar'}
            open={open.state}
            setOpen={setOpen}
            index={open.index}
          />
        )}

        <Box className={classes.headerLeft}>
          <Avatar className={classes.compnayLogo} alt="Remy Sharp" src={data?.profileImage} />
          {loading ? (
            <Skeleton className={classes.nameSkeleton} />
          ) : (
            <Box>
              {(data?.identifier || data?.name) && (
                <Box className={classes.namelable}>
                  <Typography variant="h4">
                    {isLoad
                      ? capitalizeFirstLetter(data?.identifier)
                      : capitalizeFirstLetter(data?.name)}
                  </Typography>
                  {data?.status === enumStats.Banned && (
                    <Chip color="error" size="small" label={t('visitor.banned')} />
                  )}
                </Box>
              )}
              {(data?.name || data?.phone) && (
                <Typography className={classes.marginTop} variant="subtitle3">
                  {isLoad ? data?.name : data?.identifier}
                </Typography>
              )}
            </Box>
          )}
        </Box>
        <Box className={classes.headerRight}>
          {/*{!isObjectEmpty(data) && data?.status === enumStats.Allowed && (*/}
          {/*  <Button*/}
          {/*    variant="destructiveSecondary"*/}
          {/*    startIcon={<StockeBanIcon />}*/}
          {/*    className={classes.blackIcon}*/}
          {/*    onClick={() => {*/}
          {/*      setProfileId(profileId);*/}
          {/*      changeModelState('ban', true);*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    {`${t(isLoad ? 'loads.banLoad' : 'visitor.banVisitor')}`}*/}
          {/*  </Button>*/}
          {/*)}*/}

          {/*<Button*/}
          {/*  variant="destructiveSecondary"*/}
          {/*  startIcon={<StockeBanIcon />}*/}
          {/*  className={classes.blackIcon}*/}
          {/*  onClick={() => {*/}
          {/*    setProfileId(profileId);*/}
          {/*    handleClosePreviewVisitorDrawer();*/}
          {/*    setShowEditVisitProfile(true);*/}
          {/*  }}*/}
          {/*>*/}
          {/*  Edit Profile*/}
          {/*</Button>*/}
          {data?.status !== visitorStatus.BANNED && !isObjectEmpty(data) ? (
            <PopoverButton
              className={classes.questionBankActions}
              variants="icon"
              Icon={MoreVert}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            >
              <Box className={classes.questionBankActionsMenu}>
                <>
                  <Box
                    onClick={() => {
                      setProfileId(profileId);
                      handleClosePreviewVisitorDrawer();
                      setShowEditVisitProfile(true);
                    }}
                    className={classes.questionBankActionsRegular}
                  >
                    <PenIcon className={classes.questionBankActionsIconRegular} />
                    <Typography
                      className={classes.questionBankActionsTextRegular}
                      variant="subtitle2"
                    >
                      {`${t(isLoad ? 'loads.editBanLoads' : 'visitor.editVisitorLoads')}`}
                    </Typography>
                  </Box>
                  <Box onClick={fetchProfile} className={classes.questionBankActionsRegular}>
                    <DownloadCloudIcon className={classes.questionBankActionsIconRegular} />
                    <Typography
                      className={classes.questionBankActionsTextRegular}
                      variant="subtitle2"
                    >
                      {`${t('visitor.downloadVisitorProfile')}`}
                    </Typography>
                  </Box>
                </>
              </Box>
            </PopoverButton>
          ) : null}
          {/*{!isObjectEmpty(data) && (data?.status === enumStats.Banned || isBan) && (*/}
          {/*  <Button*/}
          {/*    variant="secondaryGrey"*/}
          {/*    startIcon={<UnbannedIcon />}*/}
          {/*    className={classes.blackIcon}*/}
          {/*    onClick={() => {*/}
          {/*      setProfileId(profileId);*/}
          {/*      changeModelState('unBan', true);*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    {`${t(isLoad ? 'loads.uNBanLoad' : 'visitor.uNBanVisitor')}`}*/}
          {/*  </Button>*/}
          {/*)}*/}
          <a href="#" onClick={() => handleClosePreviewVisitorDrawer(anchor)}>
            <CrossBlackIcon />
          </a>
        </Box>
      </Box>
      {loading ? (
        <Box className={classes.previewContent}>
          <Skeleton className={classes.previewContentSkeletonTop} />
          <Skeleton className={classes.previewContentSkeletonTop} />
          <Skeleton className={classes.previewContentSkeletonTop} />
        </Box>
      ) : (
        <Box className={classes.previewContent}>
          {(data?.status === enumStats.Banned || isBan) && data?.banInfo && (
            <Box className={classes.reasonBox}>
              <Typography variant="body2" className={classes.boldText}>
                {`${t('visitor.visitorReason')}`}
                <span>
                  {' '}
                  {formatDayjsDateTime({
                    value: data?.bannedAt,
                    formatType: dayjsFormatsEnum.date,
                  })}
                </span>
                {''}
                {`${t('visitor.visitorBy')}`}
                {''}
                <span> {data?.banInfo?.banned_by_name}</span>
              </Typography>
              <Typography variant="body2" className={classes.reasonText}>
                {`${t('visitor.reason')}`}: <span> {data?.banReason} </span>
              </Typography>
            </Box>
          )}
          <Box className={classes.visitorDetail}>
            {!isBan && (
              <Box className={classes.inlineFlex}>
                <Typography variant="body2" className={classes.visitorlable}>
                  {`${t(isLoad ? 'loads.loadType' : 'visitor.visitorType')}`}:
                </Typography>
                <Typography variant="subtitle1" className={classes.visitorValue}>
                  {capitalizeFirstLetter(data?.type) || NA}
                </Typography>
              </Box>
            )}

            {isBan && (
              <Box className={classes.inlineFlex}>
                <Typography variant="body2" className={classes.visitorlable}>
                  {`${t(isLoad ? 'loads.numberOfVisit' : 'visitor.numberOfVisit')}`}:
                </Typography>
                <Typography variant="subtitle1" className={classes.visitorValue}>
                  {data?.totalEvents}
                </Typography>
              </Box>
            )}
            <Box className={classes.valueWrapper}>
              <Box className={classes.valueInline}>
                <Typography variant="body2" className={classes.visitorlable}>
                  {`${t(isLoad ? 'loads.vehicleNumber' : 'visitor.phone')}`}:
                </Typography>

                <Typography variant="body1" className={classes.visitorValue}>
                  {isLoad ? data?.identifier || NA : data?.identifier || NA}
                </Typography>
              </Box>
              {!isBan && (
                <Box className={classes.valueInline}>
                  <Typography variant="body2" className={classes.visitorlable}>
                    {`${t('visitor.state')}`}:
                  </Typography>
                  <Typography variant="body1" className={classes.visitorValue}>
                    {status?.title && data?.status !== enumStats.Banned ? (
                      <Chip label={status?.title} size="small" color={status?.color} />
                    ) : data?.status === enumStats.Banned ? (
                      '--'
                    ) : (
                      NA
                    )}
                  </Typography>
                </Box>
              )}
            </Box>
            {!isBan && (
              <Box className={classes.valueWrapper}>
                <Box className={classes.valueInline}>
                  <Typography variant="body2" className={classes.visitorlable}>
                    {`${t(isLoad ? 'visitor.inBound' : 'visitor.checkIn')}`}:
                  </Typography>
                  <Typography variant="body1" className={classes.visitorValue}>
                    {formatDayjsDateTime({
                      value: data?.checkIn,
                      formatType: dayjsFormatsEnum.dateTime,
                    })}
                  </Typography>
                </Box>
                <Box className={classes.valueInline}>
                  <Typography variant="body2" className={classes.visitorlable}>
                    {`${t(isLoad ? 'visitor.outBound' : 'visitor.checkOut')}`}:
                  </Typography>
                  <Typography variant="body1" className={classes.visitorValue}>
                    {data?.checkOut
                      ? formatDayjsDateTime({
                          value: data?.checkOut,
                          formatType: dayjsFormatsEnum.dateTime,
                        })
                      : NA}
                  </Typography>
                </Box>
              </Box>
            )}

            {isBan && (
              <Box className={classes.valueWrapper}>
                <Box className={classes.valueInline}>
                  <Typography variant="body2" className={classes.visitorlable}>
                    {`${t(isLoad ? 'loads.bannedDetails.lastInBound' : 'visitor.bannedDetails.lastInBound')}`}
                  </Typography>
                  <Typography variant="body1" className={classes.visitorValue}>
                    {formatDayjsDateTime({
                      value: data?.lastCheckin,
                      formatType: dayjsFormatsEnum.date,
                    }) || NA}
                  </Typography>
                </Box>
                <Box className={classes.valueInline}>
                  <Typography variant="body2" className={classes.visitorlable}>
                    {`${t(isLoad ? 'loads.bannedDetails.lastOutBound' : 'visitor.bannedDetails.lastOutBound')}`}
                  </Typography>
                  <Typography variant="body1" className={classes.visitorValue}>
                    {formatDayjsDateTime({
                      value: data?.lastCheckout,
                      formatType: dayjsFormatsEnum.date,
                    }) || NA}
                  </Typography>
                </Box>
              </Box>
            )}
            {!isObjectEmpty(data?.checkinForm) &&
            data?.checkinForm?.sectionsAttributes[0]?.questionsAttributes?.length ? (
              <Box className={classes.borderBox}>
                <Box className={classes.valueWrapperNew}>
                  {data?.checkinForm?.sectionsAttributes.map((section) => {
                    return section.questionsAttributes.map((question, i) => {
                      if (!notToShowOnFirstRow.includes(question?.responseType)) {
                        return (
                          <Box key={i} className={classes.valueInline}>
                            <Typography variant="body2" className={classes.visitorlable}>
                              {question?.questionStatement}:
                            </Typography>
                            <Typography variant="body1" className={classes.visitorValue}>
                              {question?.responseType === enumResponseType?.multiselect
                                ? question?.answers?.length
                                  ? question?.answers?.map((a) => a?.optionText)?.join(', ')
                                  : NA
                                : showDateFormat.includes(question?.responseType)
                                  ? formatDate(
                                      dayjsWithStandardOffset(question?.answers),
                                      formatAccordingToDateType[question?.responseType],
                                    ) || NA
                                  : question?.answers || NA}
                            </Typography>
                          </Box>
                        );
                      } else {
                        return null;
                      }
                    });
                  })}
                </Box>
              </Box>
            ) : null}

            {!isObjectEmpty(data?.checkinForm) &&
            data?.checkinForm?.sectionsAttributes[0]?.questionsAttributes?.filter((a) =>
              notToShowOnFirstRow?.includes(a?.responseType),
            )?.length ? (
              <Box className={classes.borderBox}>
                <Box className={classes.valueWrapperNewImages}>
                  {data?.checkinForm?.sectionsAttributes.map((section) => {
                    return section.questionsAttributes.map((question, i) => {
                      if (
                        notToShowOnFirstRow.includes(question?.responseType) &&
                        (question?.answers?.imgUrl ||
                          question?.answers?.fileUri ||
                          question.answers?.length)
                      ) {
                        return (
                          <Box key={i} className={classes.valueInline}>
                            <Typography
                              variant="body2"
                              className={classes.visitorlable}
                              marginTop={'12px'}
                            >
                              {question?.questionStatement}:
                            </Typography>
                            <Box className={classes.attachmentsWrap}>
                              {showImagesOfCheckInCheckOut(question)}
                            </Box>
                          </Box>
                        );
                      } else {
                        return null;
                      }
                    });
                  })}
                </Box>
              </Box>
            ) : null}
          </Box>
        </Box>
      )}

      {!isObjectEmpty(data?.checkoutForm) && (
        <Box className={classes.previewContent}>
          <Box className={classes.visitorDetails}>
            <Box className={classes.checkOutTitle}>
              <Typography variant={'h4'}>
                {t(
                  isLoad
                    ? 'loads.bannedDetails.outBoundDetails'
                    : 'visitor.detailView.checkOutDetails',
                )}
              </Typography>
            </Box>
            <Box className={classes.borderBox}>
              <Box className={classes.valueWrapperNew}>
                {data?.checkoutForm?.sectionsAttributes.map((section) => {
                  return section.questionsAttributes.map((question, i) => {
                    if (!notToShowOnFirstRow.includes(question?.responseType)) {
                      return (
                        <Box key={i} className={classes.valueInline}>
                          <Typography variant="body2" className={classes.visitorlable}>
                            {question?.questionStatement}:
                          </Typography>
                          <Typography variant="body1" className={classes.visitorValue}>
                            {question?.responseType === enumResponseType?.multiselect
                              ? question?.answers?.length
                                ? question?.answers?.map((a) => a?.optionText)?.join(', ')
                                : NA
                              : showDateFormat.includes(question?.responseType)
                                ? formatDate(
                                    dayjsWithStandardOffset(question?.answers),
                                    formatAccordingToDateType[question?.responseType],
                                  ) || NA
                                : question?.answers || NA}
                          </Typography>
                        </Box>
                      );
                    } else {
                      return null;
                    }
                  });
                })}
              </Box>
            </Box>
            {/*<Box>*/}
            {/*  <Box className={classes.attachmentsWrap} marginBottom={'20px'}>*/}
            {/*    {showImagesOfCheckInCheckOut(data?.checkoutForm?.sectionsAttributes)}*/}
            {/*  </Box>*/}
            {/*</Box>*/}
            {!isObjectEmpty(data?.checkoutForm) &&
            data?.checkoutForm?.sectionsAttributes[0]?.questionsAttributes?.filter((a) =>
              notToShowOnFirstRow?.includes(a?.responseType),
            )?.length ? (
              <Box className={classes.borderBox}>
                <Box className={classes.valueWrapperNewImages}>
                  {data?.checkoutForm?.sectionsAttributes.map((section) => {
                    return section.questionsAttributes.map((question, i) => {
                      if (
                        notToShowOnFirstRow.includes(question?.responseType) &&
                        (question?.answers?.imgUrl ||
                          question?.answers?.fileUri ||
                          question.answers?.length)
                      ) {
                        return (
                          <Box key={i} className={classes.valueInline}>
                            <Typography
                              variant="body2"
                              className={classes.visitorlable}
                              marginTop={'12px'}
                            >
                              {question?.questionStatement}:
                            </Typography>
                            <Box className={classes.attachmentsWrap}>
                              {showImagesOfCheckInCheckOut(question)}
                            </Box>
                          </Box>
                        );
                      } else {
                        return null;
                      }
                    });
                  })}
                </Box>
              </Box>
            ) : null}
          </Box>

          <SideDrawer
            closeDrawer={handleCloseDrawer}
            key={`${pdfUrl}-${reset}`}
            isOpen={showDrawer}
            totalWidth={'920px'}
          >
            <Box>
              <Suspense fallback={null}>
                <PDFViewDrawer
                  url={pdfUrl}
                  key={pdfUrl}
                  loading={reset}
                  setLoading={setReset}
                  setUrl={setPdfUrl}
                  closeDrawer={handleCloseDrawer}
                  setDocNums={setDocNums}
                />
              </Suspense>
            </Box>
          </SideDrawer>
        </Box>
      )}
    </>
  );
};

VisitorsLoadsPreview.propTypes = {
  handleClosePreviewVisitorDrawer: PropTypes.func,
  anchor: PropTypes.string,
  id: PropTypes.number,
  isLoad: PropTypes.bool,
  isBan: PropTypes.bool,
  setShowEditVisitProfile: PropTypes.func,
  setProfileId: PropTypes.func,
  profileId: PropTypes.number,
};

export default VisitorsLoadsPreview;
