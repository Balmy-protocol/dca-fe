import React from 'react';
import type { Meta } from '@storybook/react';

import { GraphContainer } from '.';
import type { GraphContainerProps } from '.';
import { colors } from '../../theme';
import { ResponsiveContainer, ComposedChart, CartesianGrid, Area, XAxis, YAxis } from 'recharts';
import { DateTime } from 'luxon';

// Function to generate random APY value between 1 and 20 with up to 2 decimal places
function generateRandomAPY(): number {
  return parseFloat((Math.random() * (20 - 1) + 1).toFixed(2));
}

// Function to generate an array of objects with timestamps and APYs
function generateAPYData(): { timestamp: number; apy: number; name: string }[] {
  const data: { timestamp: number; apy: number; name: string }[] = [];
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in one day

  for (let i = 0; i < 30; i++) {
    const timestamp = now - i * oneDay;
    const apy = generateRandomAPY();
    data.push({ timestamp, apy, name: DateTime.fromMillis(timestamp).toFormat('dd LLL') });
  }

  // Reverse the array to have timestamps from 90 days ago to today
  return data.reverse();
}

const apyData = generateAPYData();

function StoryGraphContainer({ children, ...args }: GraphContainerProps<(typeof apyData)[number]>) {
  return (
    <GraphContainer {...args} height={600}>
      {(data) => (
        <ResponsiveContainer height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="apy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.light.violet.violet500} stopOpacity={1} />
                <stop offset="95%" stopColor="#D2B1FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={colors.light.border.border1} />
            <Area
              connectNulls
              legendType="none"
              type="monotone"
              fill="url(#apy)"
              strokeWidth="2px"
              dot={false}
              activeDot={false}
              stroke={colors.light.violet.violet500}
              dataKey="apy"
            />
            <XAxis
              tickMargin={30}
              minTickGap={30}
              interval="preserveStartEnd"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tickFormatter={(value: string) => `${value.split(' ')[0]} ${value.split(' ')[1]}`}
            />
            <YAxis strokeWidth="0px" domain={['auto', 'auto']} axisLine={false} tickLine={false} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </GraphContainer>
  );
}

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
const meta: Meta<typeof StoryGraphContainer> = {
  title: 'Components/GraphContainer',
  component: StoryGraphContainer,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/react/writing-docs/autodocs
  tags: ['autodocs'],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  render: (args) => <StoryGraphContainer {...args} />,
  args: {
    data: apyData,
    legend: [
      {
        label: 'Legend 1',
        color: colors.light.accentPrimary,
      },
      {
        label: 'Legend 2',
        color: colors.dark.accentPrimary,
      },
    ],
    title: 'My graph',
  },
};

export default meta;

export { StoryGraphContainer };
