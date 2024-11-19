import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Frames from './components/Frames';
import Stocks from './components/Stocks';
import Sales from './components/Sales';
import Expenses from './components/Expenses';
import Home from './components/Home';
import SideBar from './components/SideBar';
import Client from './components/Client';
import ProtectedRoute from './components/ProtectedRoutes';

function App() {
  return (
    <Router>
      <SideBar />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/register" element={<ProtectedRoute requiredRole="Admin"><Register /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute requiredRole="Admin"><Dashboard /></ProtectedRoute>} />
        <Route path="/frames" element={<Frames />} />
        <Route path="/stocks" element={<Stocks />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/client" element={<Client />} />
      </Routes>
    </Router>
  );
}

export default App;