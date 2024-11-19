import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [formData, setFormData] = useState({
    frame_id: '',
    quantity: ''
  });

  const { frame_id, quantity } = formData;

  useEffect(() => {
    const fetchStocks = async () => {
      const res = await axios.get('http://localhost:5000/api/stocks');
      setStocks(res.data);
    };
    fetchStocks();
  }, []);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/stocks', formData);
      setStocks([...stocks, res.data]);
    } catch (err) {
      console.error(err.response.data);
    }
  };

  const deleteStock = async id => {
    try {
      await axios.delete(`http://localhost:5000/api/stocks${id}`);
      setStocks(stocks.filter(stock => stock.id !== id));
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Stocks
      </Typography>
      <form onSubmit={onSubmit}>
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
        <Button type="submit" variant="contained" color="primary">
          Add Stock
        </Button>
      </form>
      <List>
        {stocks.map(stock => (
          <ListItem key={stock.id}>
            <ListItemText primary={`Frame ID: ${stock.frame_id}`} secondary={`Quantity: ${stock.quantity}`} />
            <IconButton edge="end" aria-label="delete" onClick={() => deleteStock(stock.id)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Stocks;
