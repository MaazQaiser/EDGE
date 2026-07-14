import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  detailsnWrapper: {
    overflow: 'auto',
    padding: '0px 32px',
    height: '100vh',
  },
  detailsSplitWrapper: {
    height: '100%',
  },
  rightSideArea: {
    overflow: 'auto',
    flexBasis: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    padding: '20px 0',
  },
  overHeadr: {
    marginBottom: '12px',
    height: '36px',
    display: 'flex',
    alignItems: 'self-start',
    justifyContent: 'space-between',
  },
  overHeading: {
    color: '#262527',
    fontSize: '20px',
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: '24px',
  },
  searchComponent: {
    width: '100%',
  },
  title: {
    color: theme.palette.textPrimary,
    fontSize: '22px',
    fontStyle: 'normal',
    fontWeight: '700',
    lineHeight: '28px',
  },
  tabItems: {
    color: theme.palette.textPlaceholder,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '20px',
    backgroundColor: 'transparent',
    padding: '4px 4px 12px 4px ',
    border: 'none',
    display: 'flex',
    '&[aria-selected="true"]': {
      color: theme.palette.textBrand, // Change text color for the selected tab
      borderBottom: '2px solid #146DFF',
    },
    '&:hover': {
      backgroundColor: 'white',
      color: theme.palette.textBrand,
      borderBottom: '2px solid #146DFF',
    },

    '&:focus': {
      backgroundColor: 'white',
      color: theme.palette.textBrand,
      borderBottom: '2px solid #146DFF',
    },
  },
  verticalTabsItems: {
    color: theme.palette.textPlaceholder,
    cursor: 'pointer',
    backgroundColor: 'transparent',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '20px',
    width: '100%',
    border: 'none',
    borderRadius: '6px',
    display: 'flex',
    padding: '8px 12px',
    '&[aria-selected="true"]': {
      backgroundColor: theme.palette.textBrand,
      color: 'white',
      boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.06), 0px 1px 3px 0px rgba(16, 24, 40, 0.10)',
      padding: '8px 12px',
    },
    '&:hover': {
      backgroundColor: theme.palette.textBrand,
      color: 'white',
      boxShadow: '0px 1px 2px 0px rgba(16, 24, 40, 0.06), 0px 1px 3px 0px rgba(16, 24, 40, 0.10)',
      padding: '8px 12px',
    },
    '&:focus': {
      padding: '8px 12px',
      color: 'white',
      backgroundColor: theme.palette.textBrand,
    },
  },
  horizontalTabPanel: {
    width: '100%',
  },
  horizontalTabComponent: {
    width: 'calc(100%)',
  },
  horizontalTabBox: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  tableSearchBtn: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  customTable: {
    '& th:last-child, & td:last-child, .tablelink': {
      backgroundColor: 'white',
      width: '119px',
    },
  },
  horizontalmainWrapper: {
    display: 'flex',
    gap: '32px',
    width: '100%',
  },
  horizontalTabList: {
    backgroundColor: 'transparent',
    borderRadius: '6px',
    display: 'flex',
    gap: '12px',
    minWidth: '157px',
    flexDirection: 'column',
    alignContent: 'space-between',
    boxShadow: 'none',
  },
  mainListTabs: {
    display: 'flex !important',
    justifyContent: 'flex-start !important',
    gap: '20px',
    minWidth: '400px',
    backgroundColor: 'white',
    alignContent: 'space-between',
  },
  tabWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  tabListMainBox: {
    borderBottom: '1',
    borderColor: 'divider',
    flex: '1',
  },
}));
