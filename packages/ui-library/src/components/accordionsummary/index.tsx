import React from 'react';
import type { AccordionSummaryProps } from '@mui/material/AccordionSummary';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import { ExpandMoreIcon } from '../../icons';

const AccordionSummary = (props: AccordionSummaryProps) => (
  <MuiAccordionSummary expandIcon={<ExpandMoreIcon fontSize="medium" />} {...props} />
);

export { AccordionSummary, type AccordionSummaryProps };
