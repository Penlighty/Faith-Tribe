import React from 'react';

// This fixture contains a deliberate hex literal to test that the lint rule blocks it.
export const DeliberateHexComponent: React.FC = () => {
  return (
    <div style={{ color: '#FF5733' }}>
      Deliberate Hex Literal
    </div>
  );
};
