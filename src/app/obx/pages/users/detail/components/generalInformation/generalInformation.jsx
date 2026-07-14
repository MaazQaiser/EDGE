import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { ReactComponent as EditIcon } from 'assets/icons/editPencilIcon.svg?react';
import { ReactComponent as TerminateIcon } from 'assets/svg/terminate.svg?react';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import InfoCardSkeleton from 'src/app/components/common/skeletonLoader/infoCardSkeleton';
import {
  ACL_OBX_EMPLOYEERATE_VIEW,
  ACL_OBX_USERS_USERINFORMATION_UPDATE,
} from 'src/app/router/constant/OBXMODULE';
import * as routes from 'src/app/router/constant/ROUTE';
import RenderIfHasPermission from 'src/hoc/RenderIfHasPermission';
import { useCurrency } from 'src/hooks/useCurrency';
import { rolesEnumWithName } from 'src/utils/constants';
import { capitalizeFirstLetter } from 'src/utils/string/common';

import TerminateUserModal from './components/terminateUser';
import { useStyles } from './generalInfoStyles';
const employeeTypeEnum = {
  W2: 'Employee (Hourly)',
  W2Salary: 'Employee (Full Time / Salaried)',
  1099: 'Contractor (Hourly)',
};
const GeneralInformation = ({ data, loading, id, refetchUser }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const NA = t('commonText.nA');
  const { userRole, franchiseId } = useSelector((state) => state.auth);
  const { currency: franchiseCurrency } = useCurrency();
  const [terminateUserModal, setTermianteUserModal] = React.useState(false);
  const { id: currentLoggedInUserId } = useSelector((state) => state.user.info);

  const isCurrentUserAndProfileSame = currentLoggedInUserId === +id;

  const usersInformation = (
    <>
      <CardContent className={classes.cardContainer} sx={{ padding: '0px !important' }}>
        <Box className={classes.cardFlexContent}>
          <Typography variant="subtitle1" className={classes.cardHeading}>
            {t('obx.users.userInformation.title')}
          </Typography>
          <RenderIfHasPermission name={ACL_OBX_USERS_USERINFORMATION_UPDATE}>
            <Link to={`${routes.OBX_USERS_FORM_INFORMATION}/${id}`}>
              <EditIcon className={classes.editIcon} />
            </Link>
          </RenderIfHasPermission>
        </Box>
        {loading ? (
          <Box className={classes.skeletonWrapperCard}>
            <InfoCardSkeleton noOfRows={4} />
          </Box>
        ) : (
          <Box className={classes.informationCard}>
            <Box className={classes.mainContent}>
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.users.userInformation.firstName')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {capitalizeFirstLetter(data?.firstName) || NA}
                </Typography>
              </Box>
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.users.userInformation.lastName')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {capitalizeFirstLetter(data?.lastName) || NA}
                </Typography>
              </Box>
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.users.userInformation.email')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {data?.email || NA}
                </Typography>
              </Box>
            </Box>
            <Box className={classes.mainContent}>
              {/* will use in future */}
              {/* <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.users.userInformation.gender')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {data?.gender || NA}
                </Typography>
              </Box> */}
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.users.userInformation.number')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {data?.phoneNumber || NA}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </>
  );

  const jobDetails = (
    <CardContent className={classes.cardContainer} sx={{ padding: '0px !important' }}>
      <Box className={classes.cardFlexContent}>
        <Box>
          <Typography variant="subtitle1" className={classes.cardHeading}>
            {t('obx.users.userInformation.jobDetails')}
          </Typography>
        </Box>
      </Box>
      {loading ? (
        <Box className={classes.skeletonWrapperCard}>
          <InfoCardSkeleton noOfRows={4} />
        </Box>
      ) : (
        <Box className={classes.informationCard}>
          <Box className={classes.mainContent}>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('obx.users.userInformation.designation')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {data?.designation || NA}
              </Typography>
            </Box>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('obx.users.userInformation.role')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {data?.label || NA}
              </Typography>
            </Box>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('obx.users.userInformation.skill')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {data?.skill || NA}
              </Typography>
            </Box>
          </Box>
          <Box className={classes.mainContent}>
            <Box className={classes.contentDetail}>
              <Typography variant="body3" className={classes.columnHeading}>
                {t('obx.users.userInformation.site')}
              </Typography>
              <Typography variant="subtitle2" className={classes.columnDetail}>
                {data?.site || NA}
              </Typography>
            </Box>

            <RenderIfHasPermission name={ACL_OBX_EMPLOYEERATE_VIEW}>
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {`${t('obx.users.userInformation.baseRate')} ${franchiseCurrency}`}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {data?.perHourRate || NA}
                </Typography>
              </Box>
            </RenderIfHasPermission>

            {rolesEnumWithName.supervisor.slug !== userRole?.slug && (
              <Box className={classes.contentDetail}>
                <Typography variant="body3" className={classes.columnHeading}>
                  {t('obx.users.userInformation.type')}
                </Typography>
                <Typography variant="subtitle2" className={classes.columnDetail}>
                  {employeeTypeEnum[data?.employeeType] || NA}
                </Typography>
              </Box>
            )}

            {data?.zones?.map((a, index) => {
              const zoneCount = index + 1;
              return (
                <Box key={index} className={classes.contentDetail}>
                  <Typography variant="body3" className={classes.columnHeading}>
                    {t('obx.users.userInformation.zone')} {zoneCount}
                  </Typography>
                  <Typography variant="subtitle2" className={classes.columnDetail}>
                    {a?.name || NA}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </CardContent>
  );
  return (
    <>
      <Box className={classes.mainBoxSection}>
        <Box className={classes.internalBoxWrapper}>
          <Card className={classes.cardContentLeft}>{usersInformation}</Card>
        </Box>

        <Box className={classes.internalBoxWrapper}>
          <Card className={classes.cardContentRight}>{jobDetails}</Card>
        </Box>
      </Box>
      <Box className={classes.terminateUserSection}>
        <RenderIfHasPermission name={ACL_OBX_USERS_USERINFORMATION_UPDATE}>
          <Button
            startIcon={<TerminateIcon />}
            variant="textOnly"
            className={classes.terminateUserButton}
            disabled={data?.lastWorkingDay || !franchiseId || isCurrentUserAndProfileSame}
            onClick={() => setTermianteUserModal(true)}
          >
            {t('obx.users.terminateUser.title')}
          </Button>
        </RenderIfHasPermission>
      </Box>

      {terminateUserModal && (
        <TerminateUserModal
          open={terminateUserModal}
          handleClose={() => setTermianteUserModal(false)}
          refetchUser={refetchUser}
          userId={id}
        />
      )}
    </>
  );
};

GeneralInformation.propTypes = {
  data: PropTypes.object,
  loading: PropTypes.bool,
  id: PropTypes.string,
  refetchUser: PropTypes.func,
};

export default GeneralInformation;
