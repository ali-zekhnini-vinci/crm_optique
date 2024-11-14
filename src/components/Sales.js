import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, List, ListItem, ListItemText } from '@mui/material';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [formData, setFormData] = useState({
    user_id: '',
    frame_id: '',
    quantity: '',
    total: ''
  });

  const { user_id, frame_id, quantity, total } = formData;

  useEffect(() => {
    const fetchSales = async () => {
      const res = await axios.get('http://localhost:5000/api/sales');
      setSales(res.data);
    };
    fetchSales();
  }, []);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/sales', formData);
      setSales([...sales, res.data]);
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Sales
      </Typography>
      <form onSubmit={onSubmit}>
        <TextField
          label="User ID"
          name="user_id"
          type="number"
          value={user_id}
          onChange={onChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Frame ID"
          name="frame_id"
          type="number"
          value={frame_id}
          onChange={onChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Quantity"
          name="quantity"
          type="number"
          value={quantity}
          onChange={onChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Total"
          name="total"
          type="number"
          value={total}
          onChange={onChange}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Add Sale
        </Button>
      </form>
      <List>
        {sales.map(sale => (
          <ListItem key={sale.id}>
            <ListItemText
              primary={`User ID: ${sale.user_id} - Frame ID: ${sale.frame_id}`}
              secondary={`Quantity: ${sale.quantity} - Total: $${sale.total}`}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Sales;

