import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { TablePagination } from '.';

const StoryTablePagination = () => {
  const [page, setPage] = useState(0);

  return <TablePagination count={100} rowsPerPage={10} page={page} onPageChange={(_, newPage) => setPage(newPage)} />;
};

const meta: Meta<typeof TablePagination> = {
  title: 'Components/TablePagination',
  component: TablePagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TablePagination>;

export const Primary: Story = {
  render: (args) => <StoryTablePagination {...args} />,
};
