import { makeStyles } from '@mui/styles';
export const useStyles = makeStyles((_theme) => ({
  settings: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
    '& .MuiTabs-root': {
      margin: '0 32px',
      borderBottom: '1px solid #E6E6E7',
      '& .MuiTabs-scroller': {
        '& .MuiTabs-indicator': {
          backgroundColor: '#146DFF',
        },
        '& .MuiTabs-flexContainer': {
          gap: '16px',

          '& .MuiButtonBase-root': {
            padding: '19px 4px 12px 4px',
            color: ' #6A6A70',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: '20px',

            '&.Mui-selected': {
              color: '#146DFF',
              fontWeight: 500,
            },

            '&.Mui-disabled': {
              color: '#AEAEB2',
            },
          },
        },
      },
    },
  },

  templates: {
    padding: '0 32px',
    paddingTop: '24px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'auto',
  },
}));
