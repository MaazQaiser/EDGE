import SearchComponent from 'commonComponents/search';
import PropTypes from 'prop-types'; // Import PropTypes
import { useTranslation } from 'react-i18next';

/**
 * SearchComponent is a reusable search input component.
 *
 * @param {String} name - name of the field you are handling it in.
 * @param {Function} onSearch - Function to react to the selected values.
 * @param {Function} className - class name of the css applied.
 * @return Component
 */
const SearchComponentWithQuery = ({
  name,
  disabled = false,
  placeHolder,
  onSearch,
  className,
  helperText,
  error,
}) => {
  const { t } = useTranslation();

  return (
    <SearchComponent
      disabled={disabled}
      className={className}
      name={name}
      placeholder={placeHolder || `${t('form.input.textField.search.placeHolder')}`}
      onSearch={onSearch}
      helperText={helperText}
      error={error}
    />
  );
};

// Define propTypes for your component
SearchComponentWithQuery.propTypes = {
  name: PropTypes.string.isRequired,
  className: PropTypes.string,
  placeHolder: PropTypes.string,
  onSearch: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  helperText: PropTypes.string,
  error: PropTypes.bool,
};

// Set a default value for onSearch
SearchComponentWithQuery.defaultProps = {
  name: '',
  className: '',
  onSearch: () => {}, // You can provide a default function or null, depending on your use case
  disabled: false,
  helperText: '',
  error: false,
};

export default SearchComponentWithQuery;
