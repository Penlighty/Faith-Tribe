import React from 'react';

// This fixture uses CSS variables and design tokens compliant with the design system.
export const CompliantComponent: React.FC = () => {
  return (
    <div style={{ color: 'var(--ft-primary)', backgroundColor: 'var(--ft-surface)' }}>
      Compliant Component
    </div>
  );
};
