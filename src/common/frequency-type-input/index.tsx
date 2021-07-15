import React from 'react';
import capitalize from 'lodash/capitalize';
import findIndex from 'lodash/findIndex';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { maximalAppleTabsStylesHook } from 'common/tabs';
import { BigNumber } from 'ethers';
import { SetStateCallback } from 'types';

interface selectOption {
  value: any;
  label: {
    plural: string;
    adverb: string;
  };
}

type selectOptionsType = selectOption[];

interface minimalSelectProps {
  options: selectOptionsType;
  onChange: SetStateCallback<BigNumber>;
  selected: BigNumber;
  id: string;
}

const MinimalSelect = ({ options, selected, onChange, id }: minimalSelectProps) => {
  const [tabIndex, setTabIndex] = React.useState(findIndex(options, { value: selected }));
  const tabsStyles = maximalAppleTabsStylesHook.useTabs();
  const tabItemStyles = maximalAppleTabsStylesHook.useTabItem();
  const handleChange = (index: number) => {
    setTabIndex(index);
    onChange(options[index].value);
  };

  return (
    <Tabs classes={tabsStyles} value={tabIndex} onChange={(e, index) => handleChange(index)}>
      {options.map((frequencyTypeOption: selectOption) => (
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
