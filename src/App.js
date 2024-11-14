import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Frames from './components/Frames';
import Stocks from './components/Stocks';
import Sales from './components/Sales';
import Expenses from './components/Expenses';
import Home from './components/Home';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/frames" element={<Frames />} />
        <Route path="/stocks" element={<Stocks />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/expenses" element={<Expenses />} />
      </Routes>
    </Router>
  );
}

export default App;
