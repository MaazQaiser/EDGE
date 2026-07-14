import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  tabArea: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    '& .MuiTabs-root ': {
      minHeight: 'auto',
    },
    '&  .MuiButtonBase-root.MuiTab-root.MuiTab-textColorPrimary': {
      padding: '0px 5px 14px 5px',
      width: '100%',
      maxWidth: 'fit-content',
      minWidth: 'fit-content',
      minHeight: '0px',
      height: 'auto',
      marginRight: '10px',
    },
  },
  overviewTabs: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    paddingRight: '10px',
    '& > .MuiBox-root': {
      padding: '0px',
    },
  },
  overviewTabsOne: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
    '& > .MuiBox-root': {
      padding: '0px',
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1',
      overflow: 'auto',
      '& > .MuiBox-root': {
        padding: '0px',
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1',
        overflow: 'auto',
      },
    },
  },
  historyTab: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    padding: '0,',
    overflow: 'auto',
    '& > .MuiBox-root': {
      padding: '0px',
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1',
      overflow: 'auto',
      '& > .MuiBox-root': {
        padding: '0px',
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1',
        overflow: 'auto',
      },
    },
  },
  activitySkeleton: {
    padding: '20px 0 !important',
  },
  relevantQuestionsWrap: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto',
  },
  tabBtn: {
    '&.Mui-selected': {
      color: `${theme.palette.textBrand} !important`,
    },
  },
  tabsBtnWrapper: {
    '& .MuiTabs-indicator': {
      backgroundColor: `${theme.palette.textBrand} !important`,
    },
  },
  inProgressWrapper: {
    '&.MuiBox-root': {
      padding: '24px',
    },
  },
}));
