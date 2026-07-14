import { Box, Button, Tooltip, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import HeaderDetailsSkeleton from 'src/app/components/common/skeletonLoader/headerDetailsSkeleton';
import { ACL_OBX_ZONES_DELETE } from 'src/app/router/constant/OBXMODULE';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';

import { useStyles } from './commonTabsStyles';
import DeleteZoneModal from './deleteZoneModal';

const Clients = ({ zonesData, loading }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const NA = t('commonText.nA');

  // Zone's sites exists
  const isDisabledBecauseSitesExist = zonesData?.sites?.length;

  // const exp = zonesData?.id && (
  //   <>
  //     {`#${zonesData?.id || ''} ${zonesData?.dutyType || ''} ${zonesData?.address || ''} ${
  //       zonesData?.city?.name || ''
  //     } ${zonesData?.state?.name || ''}  ${zonesData?.country?.name || ''}`}
  //   </>
  // );
  return (
    <>
      {loading ? (
        <HeaderDetailsSkeleton hasImage={false} numberOfStatusItem={0} />
      ) : (
        <Box className={classes.franchiseSubHeader}>
          <Box className={classes.headerDetail}>
            <Typography variant="h1" className={classes.headerTitle}>
              {zonesData?.name || NA}
            </Typography>
            <RenderIfHasPermission name={ACL_OBX_ZONES_DELETE}>
              <Tooltip
                title={
                  <Box
                    //Don't have option to add class sx is required here
                    sx={{
                      textAlign: 'center',
                    }}
                  >
                    {t('obx.zones.deleteZone.tooltip')}
                  </Box>
                }
                arrow
                placement="left"
                disableHoverListener={!isDisabledBecauseSitesExist}
              >
                <span>
                  <Button
                    variant="destructiveSecondary"
                    disabled={isDisabledBecauseSitesExist}
                    className={classes.button}
                    onClick={() => setOpenDeleteModal(true)}
                  >
                    {t('obx.zones.deleteZone.action')}
                  </Button>
                </span>
              </Tooltip>
            </RenderIfHasPermission>
          </Box>

          {openDeleteModal && (
            <DeleteZoneModal
              openModal={openDeleteModal}
              handleCloseModal={() => setOpenDeleteModal(false)}
              zoneId={zonesData?.id}
            />
          )}
        </Box>
      )}
    </>
  );
};

Clients.propTypes = {
  zonesData: PropTypes.object,
  loading: PropTypes.bool,
};

export default Clients;
