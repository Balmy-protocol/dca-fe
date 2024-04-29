import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Dashboard, DashboardSkeleton } from '.';
import type { DashboardProps } from '.';
import { ContainerBox } from '../container-box';

function StoryDashboard({ ...args }: DashboardProps) {
  return (
    <ContainerBox style={{ width: '600px' }}>
      <Dashboard {...args} />
    </ContainerBox>
  );
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryDashboard> = {
  title: 'Components/Dashboard',
  component: StoryDashboard,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => <StoryDashboard {...args}>child</StoryDashboard>,
  args: {
    withPie: true,
    data: [
      {
        name: 'first',
        value: 10,
      },
      {
        name: 'second',
        value: 5,
      },
      {
        name: 'third',
        value: 3,
      },
      {
        name: 'fourth',
        value: 14,
      },
      {
        name: 'fifth',
        value: 12,
      },
      {
        name: 'sixth',
        value: 18,
      },
      {
        name: 'seventh',
        value: 20,
      },
      {
        name: 'eight',
        value: 2,
      },
    ],
  },
};

export default meta;

type Story = StoryObj<typeof StoryDashboard>;

const WithoutPieChart: Story = {
  args: {},
  render: (args: DashboardProps) => <StoryDashboard {...args} withPie={false} />,
};

const Skeleton: Story = {
  args: {},
  render: () => {
    return (
      <ContainerBox style={{ width: '600px' }}>
        <DashboardSkeleton withPie />
      </ContainerBox>
    );
  },
};

export { StoryDashboard, WithoutPieChart, Skeleton };
