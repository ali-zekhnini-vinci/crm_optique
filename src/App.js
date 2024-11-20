import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Frames from './pages/Frames';
import Stocks from './pages/Stocks';
import Sales from './pages/Sales';
import Expenses from './pages/Expenses';
import Home from './pages/Home';
import SideBar from './components/SideBar';
import Client from './pages/Client';
import ProtectedRoute from './components/ProtectedRoutes';

function App() {
  return (
    <Router>
      <SideBar />
      <Routes>
        <Route path="/register" element={<ProtectedRoute requiredRole="Admin"><Register /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute requiredRole="Admin"><Dashboard /></ProtectedRoute>} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
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