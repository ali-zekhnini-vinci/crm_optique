import React from 'react';
import { Container, Typography } from '@mui/material';

const Dashboard = () => {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1">
        Welcome to the CRM Dashboard. Here you can manage frames, stocks, sales, and expenses.
      </Typography>
    </Container>
  );
};

export default Dashboard;
