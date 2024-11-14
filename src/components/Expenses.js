import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [formData, setFormData] = useState({
    description: '',
    amount: ''
  });

  const { description, amount } = formData;

  useEffect(() => {
    const fetchExpenses = async () => {
      const res = await axios.get('http://localhost:5000/api/expenses');
      setExpenses(res.data);
    };
    fetchExpenses();
  }, []);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/expenses', formData);
      setExpenses([...expenses, res.data]);
    } catch (err) {
      console.error(err.response.data);
    }
  };

  const deleteExpense = async id => {
    try {
      await axios.delete(`/api/expenses/${id}`);
      setExpenses(expenses.filter(expense => expense.id !== id));
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Expenses
      </Typography>
      <form onSubmit={onSubmit}>
        <TextField
          label="Description"
          name="description"
          value={description}
          onChange={onChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Amount"
          name="amount"
          type="number"
          value={amount}
          onChange={onChange}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Add Expense
        </Button>
      </form>
      <List>
        {expenses.map(expense => (
          <ListItem key={expense.id}>
            <ListItemText primary={expense.description} secondary={`$${expense.amount}`} />
            <IconButton edge="end" aria-label="delete" onClick={() => deleteExpense(expense.id)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Expenses;
