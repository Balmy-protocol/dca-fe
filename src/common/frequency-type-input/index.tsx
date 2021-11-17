import React from 'react';
import capitalize from 'lodash/capitalize';
import findIndex from 'lodash/findIndex';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { maximalAppleTabsStylesHook } from 'common/tabs';
import { BigNumber } from 'ethers';
import { SetStateCallback } from 'types';

interface SelectOption {
  value: BigNumber;
  label: {
    plural: string;
    adverb: string;
  };
}

type SelectOptionsType = SelectOption[];

interface MinimalSelectProps {
  options: SelectOptionsType;
  onChange: SetStateCallback<BigNumber>;
  selected: BigNumber;
}

const MinimalSelect = ({ options, selected, onChange }: MinimalSelectProps) => {
  const [tabIndex, setTabIndex] = React.useState(findIndex(options, { value: selected }));
  const tabsStyles = maximalAppleTabsStylesHook.useTabs();
  const tabItemStyles = maximalAppleTabsStylesHook.useTabItem();
  const handleChange = (index: number) => {
    setTabIndex(index);
    onChange(options[index].value);
  };

  return (
    <Tabs classes={tabsStyles} value={tabIndex} onChange={(e, index) => handleChange(index)}>
      {options.map((frequencyTypeOption: SelectOption) => (
        <Tab
          classes={tabItemStyles}
          key={frequencyTypeOption.label.adverb}
          disableRipple
          label={capitalize(frequencyTypeOption.label.adverb)}
        />
      ))}
    </Tabs>
  );
};

export default MinimalSelect;
