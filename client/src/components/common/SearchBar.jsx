import React from 'react';
import PropTypes from 'prop-types';
import {
  Autocomplete,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({
  options = [],
  value,
  onChange,
  placeholder = 'Search...',
  loading = false,
  getOptionLabel = (option) => option.name || option.label,
}) => {
  return (
    <Autocomplete
      options={options}
      value={value}
      onChange={onChange}
      getOptionLabel={getOptionLabel}
      loading={loading}
      filterOptions={(x) => x}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      )}
    />
  );
};

SearchBar.propTypes = {
  options: PropTypes.array,
  value: PropTypes.any,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  loading: PropTypes.bool,
  getOptionLabel: PropTypes.func,
};

export default SearchBar;
