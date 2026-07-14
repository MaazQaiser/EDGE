const MuiTableCell = ({ _theme }) => ({
  styleOverrides: {
    root: {
      backgroundColor: 'inherit',
      padding: '12px 24px',
      borderBottom: '1px solid #E6E6E7',
      '&.MuiTableCell-head': {
        color: '#5B5B5F',
        fontSize: '12px',
        lineHeight: '18px',
        fontWeight: '500',
      },
      '&.MuiTableCell-body': {
        lineHeight: '20px',
        fontWeight: '400',
        fontSize: '14px',
        color: '#86868B',
      },
    },
  },
});

export default MuiTableCell;
