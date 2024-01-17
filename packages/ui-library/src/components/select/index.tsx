import React, { useCallback, useMemo, useRef, useState } from 'react';
import { MuiSelect, ListSubheader, TextField, MenuItem, MuiSelectChangeEvent, InputAdornment, Divider } from '..';
import { SearchIcon } from '../../icons';
import { defineMessage, useIntl } from 'react-intl';

interface DisabledSearchProps {
  disabledSearch: true;
}

interface EnabledSearchProps<T> {
  disabledSearch: false;
  searchFunction: (data: T, searchTerm: string) => boolean;
}

type SearchProps<T> = DisabledSearchProps | EnabledSearchProps<T>;

interface BaseSelectProps<T extends { key: string | number }> {
  disabledSearch?: boolean;
  placeholder?: string;
  options: T[];
  onChange: (selectedOption: T) => void;
  RenderItem: React.ComponentType<{ item: T }>;
  selectedItem?: T;
  id?: string;
  searchFunction?: (data: T, searchTerm: string) => boolean;
}

type SelectProps<T extends { key: string | number }> = BaseSelectProps<T> & SearchProps<T>;

function Select<T extends { key: string | number }>({
  id,
  placeholder,
  RenderItem,
  options,
  onChange,
  selectedItem,
  disabledSearch = false,
  searchFunction,
}: SelectProps<T>) {
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLDivElement>();
  const intl = useIntl();

  const renderedItems = useMemo(
    () => (!disabledSearch && searchFunction ? options.filter((option) => searchFunction(option, search)) : options),
    [search, disabledSearch, searchFunction]
  );

  const handleChangeNetwork = useCallback(
    (evt: MuiSelectChangeEvent<number>) => {
      const selectedOption = options.find((option) => option.key === evt.target.value);
      if (selectedOption) {
        setSearch('');
        onChange(selectedOption);
      }
    },
    [onChange, options]
  );

  const handleOnClose = useCallback(() => setSearch(''), []);

  return (
    <MuiSelect
      id={id}
      fullWidth
      value={selectedItem?.key}
      onChange={handleChangeNetwork}
      onClose={handleOnClose}
      placeholder={placeholder}
      size="small"
      SelectDisplayProps={{ style: { display: 'flex', alignItems: 'center', gap: '5px' } }}
      MenuProps={{
        autoFocus: false,
        TransitionProps: { onEntered: () => searchRef.current?.focus() },
        transformOrigin: {
          horizontal: 'center',
          vertical: 'top',
        },
        className: 'MuiSelect-MuiMenu',
      }}
    >
      {!disabledSearch && (
        <>
          <ListSubheader disableGutters>
            <TextField
              size="small"
              // Autofocus on textfield
              autoFocus
              placeholder={intl.formatMessage(
                defineMessage({ description: 'typeToSearch', defaultMessage: 'Type to search...' })
              )}
              fullWidth
              value={search}
              inputRef={searchRef}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== 'Escape') {
                  // Prevents autoselecting item while typing (default Select behaviour)
                  e.stopPropagation();
                }
              }}
            />
          </ListSubheader>
          <Divider />
        </>
      )}
      {renderedItems.map((option) => (
        <MenuItem key={option.key} sx={{ display: 'flex', alignItems: 'center', gap: '5px' }} value={option.key}>
          <RenderItem item={option} key={option.key} />
        </MenuItem>
      ))}
    </MuiSelect>
  );
}

export { Select, SelectProps };
