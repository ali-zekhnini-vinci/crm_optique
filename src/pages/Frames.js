import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const Frames = () => {
  const [frames, setFrames] = useState([]);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    price: '',
    stock: '',
    url: '',
  });

  const { brand, model, price, stock, url } = formData;

  useEffect(() => {
    const fetchFrames = async () => {
      const res = await axios.get('http://localhost:5000/api/frames');
      setFrames(res.data);
    };
    fetchFrames();
  }, []);

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    console.log(formData);
    try {
      const res = await axios.post('http://localhost:5000/api/frames', formData, {
        headers: { 
          'Content-Type': 'application/json' 
        } 
      });
      setFrames([...frames, res.data]);
    } catch (err) {
      console.error(err.response.data);
    }
  };

  const deleteFrame = async id => {
    try {
      await axios.delete(`/api/frames/${id}`);
      setFrames(frames.filter(frame => frame.id !== id));
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Frames
      </Typography>
      <form onSubmit={onSubmit}>
        <TextField
          label="Brand"
          name="brand"
          value={brand}
          onChange={onChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Model"
          name="model"
          value={model}
          onChange={onChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Price"
          name="price"
          type="number"
          value={price}
          onChange={onChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Stock"
          name="stock"
          type="number"
          value={stock}
          onChange={onChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Url"
          name="url"
          value={url}
          onChange={onChange}
          fullWidth
          margin="normal"
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Add Frame
        </Button>
      </form>
      <List>
        {frames.map(frame => (
          <ListItem key={frame.id}>
            <ListItemText primary={`${frame.brand} ${frame.model}`} secondary={`$${frame.price} - Stock: ${frame.stock}`} />
            <IconButton edge="end" aria-label="delete" onClick={() => deleteFrame(frame.id)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default Frames;
