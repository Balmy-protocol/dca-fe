import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  MuiSelect,
  MuiSelectProps,
  ListSubheader,
  TextField,
  MenuItem,
  MuiSelectChangeEvent,
  InputAdornment,
  ContainerBox,
  Typography,
  TypographyProps,
  DividerBorder2,
} from '..';
import { KeyboardArrowDownIcon, SearchIcon } from '../../icons';
import { defineMessage, useIntl } from 'react-intl';
import styled, { useTheme } from 'styled-components';
import { colors } from '../../theme';
import isUndefined from 'lodash/isUndefined';
import { SPACING } from '../../theme/constants';

interface DisabledSearchProps {
  disabledSearch: true;
}

interface EnabledSearchProps<T> {
  disabledSearch: false;
  searchFunction: (data: T, searchTerm: string) => boolean;
  onSearchChange?: (searchTerm: string) => void;
}

type SearchProps<T> = DisabledSearchProps | EnabledSearchProps<T>;

interface BaseSelectProps<T extends { key: string | number }, H = object> {
  disabledSearch?: boolean;
  placeholder?: string;
  placeholderProps?: TypographyProps;
  options: T[];
  onChange: (selectedOption: T) => void;
  RenderItem: React.ComponentType<{ item: T }>;
  RenderSelectedValue?: React.ComponentType<{ item: T }>;
  SkeletonItem?: React.ComponentType;
  selectedItem?: T;
  id?: string;
  searchFunction?: (data: T, searchTerm: string) => boolean;
  emptyOption?: React.ReactNode;
  onSearchChange?: (searchTerm: string) => void;
  isLoading?: boolean;
  limitHeight?: boolean;
  variant?: MuiSelectProps['variant'];
  size?: MuiSelectProps['size'];
  Header?: {
    component: React.ComponentType<{ props: H }>;
    props: H;
  };
  Footer?: {
    component: React.ComponentType;
  };
}

type SelectProps<T extends { key: string | number }, H = object> = BaseSelectProps<T, H> & SearchProps<T>;

const StyledKeyboardArrowDown = styled(KeyboardArrowDownIcon)`
  color: ${({ theme: { palette } }) => `${colors[palette.mode].typography.typo2} !important;`};
`;

function Select<T extends { key: string | number }, H = object>({
  id,
  placeholder,
  placeholderProps,
  RenderItem,
  RenderSelectedValue,
  options,
  onChange,
  selectedItem,
  disabledSearch = false,
  searchFunction,
  emptyOption,
  onSearchChange,
  SkeletonItem,
  isLoading,
  limitHeight = false,
  variant,
  size = 'small',
  Header,
  Footer,
}: SelectProps<T, H>) {
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLDivElement>();
  const [open, setOpen] = useState(false);
  const intl = useIntl();
  const {
    palette: { mode },
  } = useTheme();

  const renderedItems = useMemo(
    () => (!disabledSearch && searchFunction ? options.filter((option) => searchFunction(option, search)) : options),
    [search, disabledSearch, searchFunction, options]
  );

  const handleChangeNetwork = useCallback(
    (evt: MuiSelectChangeEvent<number>) => {
      const selectedOption = options.find((option) => option.key === evt.target.value);
      if (selectedOption) {
        setOpen(false);
        setSearch('');
        // This is a little hack so the select closes once the selection is made and not after it
        setTimeout(() => onChange(selectedOption), 0);
      }
    },
    [onChange, options]
  );

  const handleOnClose = useCallback(() => {
    setOpen(false);
    setSearch('');
  }, []);

  const onRenderValue = (value: string | number) => {
    const optionFound = options.find((option) => option.key === value);
    if (value === '' || isUndefined(value) || !optionFound) {
      return (
        <Typography variant="bodyBold" color={colors[mode].typography.typo5} {...placeholderProps}>
          {placeholder}
        </Typography>
      );
    } else {
      return RenderSelectedValue ? (
        <RenderSelectedValue item={optionFound} key={value} />
      ) : (
        <RenderItem item={optionFound} key={value} />
      );
    }
  };

  const onSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    if (onSearchChange) {
      onSearchChange(searchTerm);
    }
  };

  const handleOnOpen = () => {
    setOpen(true);
  };

  return (
    <MuiSelect
      id={id}
      fullWidth
      open={open}
      value={selectedItem?.key || ''}
      onChange={handleChangeNetwork}
      onOpen={handleOnOpen}
      onClose={handleOnClose}
      placeholder={placeholder}
      IconComponent={StyledKeyboardArrowDown}
      renderValue={onRenderValue}
      displayEmpty
      variant={variant}
      size={size}
      SelectDisplayProps={{ style: { display: 'flex', alignItems: 'center', gap: '5px' } }}
      MenuProps={{
        autoFocus: false,
        transformOrigin: {
          horizontal: 'center',
          vertical: 'top',
        },
        className: 'MuiSelect-MuiMenu',
        ...(!limitHeight
          ? {}
          : {
              slotProps: {
                paper: {
                  sx: {
                    maxHeight: '400px',
                  },
                },
              },
            }),
      }}
    >
      {!disabledSearch && (
        <ListSubheader disableGutters sx={{ marginBottom: SPACING(2.5) }}>
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
            onChange={(e) => onSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Escape') {
                // Prevents autoselecting item while typing (default Select behaviour)
                e.stopPropagation();
              }
            }}
          />
        </ListSubheader>
      )}
      {Header && (
        <ListSubheader
          disableGutters
          sx={{
            border: `1px solid ${colors[mode].accentPrimary}`,
            background: colors[mode].background.secondary,
            padding: `${SPACING(3.75)} ${SPACING(3)}`,
            marginBottom: SPACING(1),
            borderRadius: SPACING(2),
          }}
        >
          {<Header.component props={Header.props} />}
        </ListSubheader>
      )}
      {renderedItems.length === 0 && (!isLoading || !SkeletonItem) && (
        <ContainerBox alignItems="center" justifyContent="center">
          {emptyOption}
        </ContainerBox>
      )}
      {renderedItems.length === 0 && isLoading && SkeletonItem && (
        <MenuItem sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <SkeletonItem />
        </MenuItem>
      )}
      {renderedItems.map((option) => (
        <MenuItem key={option.key} sx={{ display: 'flex', alignItems: 'center', gap: '5px' }} value={option.key}>
          <RenderItem item={option} key={option.key} />
        </MenuItem>
      ))}
      {Footer && (
        <ListSubheader
          disableGutters
          sx={{
            bottom: 0,
            backgroundColor: colors[mode].background.modals,
            paddingTop: SPACING(1.5),
          }}
        >
          <DividerBorder2 />
          <ContainerBox
            style={{
              padding: `${SPACING(2)} ${SPACING(3)} ${SPACING(3)}`,
            }}
          >
            <Footer.component />
          </ContainerBox>
        </ListSubheader>
      )}
    </MuiSelect>
  );
}

export { Select, SelectProps };
