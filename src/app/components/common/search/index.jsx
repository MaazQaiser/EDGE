import { Box, InputAdornment, TextField } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { ReactComponent as Search } from 'assets/svg/commonDropdown/search.svg?react';
import PropTypes from 'prop-types';
import useDebounceHook from 'src/hooks/useDebounceHook';

const useStyles = makeStyles((_theme) => ({
  search: {
    display: 'flex',
    flex: '1',
    width: '100%',
  },
  searchInput: {
    '& .MuiInputBase-root': {
      height: '36px',

      '& .MuiInputBase-input': {
        fontSize: '14px',
        lineHeight: '20px',
        '&::placeholder': {
          fontSize: '12px',
          lineHeight: '20px',
        },
      },
    },
  },
}));

const SearchComponent = ({
  name,
  placeholder,
  onSearch,
  className,
  disabled = false,
  onBlur = () => {},
  onFocus = () => {},
  helperText = '',
  error = false,
}) => {
  const handleSearch = useDebounceHook(onSearch, 500);
  const classes = useStyles();

  return (
    <Box className={`${className} ${classes.search}`}>
      <TextField
        disabled={disabled}
        id="outlined-search"
        placeholder={placeholder}
        type="search"
        className={classes.searchInput}
        name={name}
        onBlur={onBlur}
        onFocus={onFocus}
        onChange={handleSearch}
        helperText={helperText}
        error={error}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

SearchComponent.propTypes = {
  heading: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
  helperText: PropTypes.string,
  error: PropTypes.bool,
};

export default SearchComponent;
