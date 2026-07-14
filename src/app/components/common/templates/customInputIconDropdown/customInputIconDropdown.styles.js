import { makeStyles } from '@mui/styles';

export const useStyles = makeStyles((theme) => ({
  customInputIconDropDown: {
    display: 'flex',
    width: 'calc(50% - 6px)',
  },

  // customInputIconDropdownField: {
  //   flex: 1,

  //   '& .MuiInputBase-root': {
  //     height: '44px',
  //     '& .MuiOutlinedInput-notchedOutline': {
  //       borderTopRightRadius: 0,
  //       borderBottomRightRadius: 0,
  //       borderRight: '0',
  //       backgroundColor: theme.palette.surfaceWhite,
  //     },
  //     '&.Mui-error': {
  //       '& .MuiOutlinedInput-notchedOutline': {
  //         borderRight: '0',
  //       },
  //       '&.Mui-focused': {
  //         '& .MuiOutlinedInput-notchedOutline': {
  //           borderRight: '0',
  //           '-webkitClipPath': 'inset(-5px 0px -5px -5px)',
  //           clipPath: 'inset(-5px 0px -5px -5px)',
  //         },
  //       },
  //     },
  //     '&.Mui-focused': {
  //       '& .MuiOutlinedInput-notchedOutline': {
  //         borderRight: '0',
  //         '-webkitClipPath': 'inset(-5px 0px -5px -5px)',
  //         clipPath: 'inset(-5px 0px -5px -5px)',
  //       },
  //     },
  //   },
  // },

  customInputIconDropDownBox: {
    height: '44px',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: theme.palette.surfaceWhite,
    width: '77px',
    '& div:nth-child(2)': {
      maxHeight: '195px',
    },
  },

  customInputIconDropDownBtn: {
    height: '44px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '12px',
    border: `1px solid ${theme.palette.borderSubtle2}`,
    borderLeft: '0',
    borderTopRightRadius: '8px',
    borderBottomRightRadius: '8px',
    cursor: 'pointer',
    backgroundColor: theme.palette.surfaceWhite,

    '& .MuiSvgIcon-root': {
      fontSize: '20px',
    },
  },
  customInputIconDropdownFieldOne: {
    width: '100%',
    '& fieldset.MuiOutlinedInput-notchedOutline': {
      borderTopRightRadius: '0',
      borderBottomRightRadius: '0px',
    },
  },
  customInputIconDropdownFieldTwo: {
    width: '100px',
    '& .MuiInputBase-root.MuiOutlinedInput-root': {
      minWidth: '100%',

      borderRadius: '0',
    },
    '& fieldset.MuiOutlinedInput-notchedOutline': {
      borderRadius: '0',
      borderLeft: '0px',
    },
  },
}));
