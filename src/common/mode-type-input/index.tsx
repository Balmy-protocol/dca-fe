import React from 'react';
import capitalize from 'lodash/capitalize';
import values from 'lodash/values';
import findIndex from 'lodash/findIndex';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { maximalAppleTabsStylesHook } from 'common/tabs';
import { SetStateCallback } from 'types';
import { MODE_TYPES } from 'config/constants';

interface ModeTypeInputProps {
  onChange: SetStateCallback<string>;
  selected: string;
}

const ModeTypeInput = ({ selected, onChange }: ModeTypeInputProps) => {
  const options = React.useMemo(() => values(MODE_TYPES), [MODE_TYPES]);
  const [tabIndex, setTabIndex] = React.useState(findIndex(options, { id: selected }));
  const tabsStyles = maximalAppleTabsStylesHook.useTabs();
  const tabItemStyles = maximalAppleTabsStylesHook.useTabItem();
  const handleChange = (index: number) => {
    setTabIndex(index);
    onChange(options[index].id);
  };

  return (
    <Tabs classes={tabsStyles} value={tabIndex} onChange={(e, index) => handleChange(index)}>
      {options.map((modeTypeOption) => (
        <Tab
          classes={tabItemStyles}
          key={modeTypeOption.label}
          disableRipple
          label={capitalize(modeTypeOption.label)}
        />
      ))}
    </Tabs>
  );
};

export default ModeTypeInput;
