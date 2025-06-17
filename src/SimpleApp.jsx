import React from 'react';

const SimpleApp = () => {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1>Product Management App</h1>
      <p>Application is loading...</p>
      <p>Backend status: Checking...</p>
    </div>
  );
};

export default SimpleApp;
