import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Select, SelectProps } from '.';

function StorySelect({ ...args }: SelectProps<{ key: string | number }>) {
  return <Select {...args} />;
}

const buildOption = ({ key, label, endText }: { key: string; label: string; endText?: string }) => ({
  key: key || 'value',
  label: label || 'label',
  endText,
});

const defaultOptions = [
  buildOption({
    key: 'value 1',
    label: 'display this label',
  }),
  buildOption({
    key: 'value 2',
    label: 'second value label',
  }),
  buildOption({
    key: 'value 3',
    label: 'Third value label',
  }),
  buildOption({
    key: 'value 4',
    label: 'display this label',
    endText: 'this also has endText',
  }),
];

const ItemRenderer = ({ item: { label, endText } }: { item: (typeof defaultOptions)[number] }) => (
  <>
    {label}
    {endText}
  </>
);

const searchFunction = (item: (typeof defaultOptions)[number], search: string) => item.label.includes(search);

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: StorySelect,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StorySelect {...args} />,
  args: {
    options: defaultOptions,
    RenderItem: ItemRenderer,
    placeholder: 'Hello',
    disabledSearch: false,
    searchFunction,
    onChange: (item) => alert(item),
    id: 'storybook-select',
    selectedItem: defaultOptions[0],
  },
};

export default meta;

type Story = StoryObj<typeof Select>;

export { StorySelect };

export const Empty: Story = {
  args: {},
  render: () => (
    <Select
      options={[]}
      RenderItem={ItemRenderer}
      placeholder={'Hello'}
      disabledSearch={false}
      searchFunction={searchFunction}
      onChange={(item) => alert(item)}
      id={'storybook-select-empty'}
      selectedItem={undefined}
      emptyOption="No options to display"
    />
  ),
};

export const LongItems: Story = {
  args: {},
  render: () => (
    <Select
      options={Array.from(Array(40).keys()).map((key) => buildOption({ key: key.toString(), label: `Label ${key}` }))}
      RenderItem={ItemRenderer}
      placeholder={'Hello'}
      disabledSearch={false}
      searchFunction={searchFunction}
      onChange={(item) => alert(item)}
      id={'storybook-select-empty'}
      selectedItem={undefined}
      emptyOption="No options to display"
      limitHeight
    />
  ),
};
