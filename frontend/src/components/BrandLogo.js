import React from 'react';
import { Box } from '@mui/material';
import flipLogo from '../assests/flip-logo.png';

const BrandLogo = ({
  size = 48,
  showText = true,
  stacked = false,
  subtitle = true,
  compact = false,
  maxWidth,
}) => {
  const width = showText ? size * (stacked ? 2.7 : subtitle ? 4.15 : 2.35) : size;
  const height = showText ? size * (stacked ? 1.75 : 1.18) : size;

  return (
    <Box
      component="img"
      src={flipLogo}
      alt="FLIP - Flashcard Learning Immersion Platform"
      sx={{
        display: 'block',
        width,
        height,
        maxWidth: maxWidth || '100%',
        objectFit: 'contain',
        borderRadius: compact ? 0 : Math.max(8, size * 0.12),
        filter: compact ? 'none' : 'drop-shadow(0 14px 24px rgba(15, 42, 74, 0.14))',
      }}
    />
  );
};

export default BrandLogo;
