import { Slider } from '@mui/material';
import React from 'react';

const SliderComponent = () => {
  const marks = [
    {
      value: 0,
      label: '0',
    },
    {
      value: 20,
      label: '20',
    },
    {
      value: 100,
      label: '100',
    },
  ];

  return <Slider aria-label="Custom marks" defaultValue={40} step={10} marks={marks} />;
};

export default SliderComponent;
