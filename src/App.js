import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


// PUBLIC IMPORT
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import Subscription from './pages/public/Subscription';
import VerifyCode from './pages/public/VerifyCode'; 
import AboutPage from './pages/public/About';

// CRM IMPORT 
import Register from './pages/crm/Register';
import Dashboard from './pages/crm/Dashboard';
import Stocks from './pages/crm/Stocks';
import Clients from './pages/crm/Client';
import ProtectedRoute from './components/ProtectedRoutes';
import ClientDetail from './pages/crm/ClientDetails';
import Settings from './pages/crm/Settings';
import SupplierManagement from './pages/crm/Suppliers';
import AppointmentCalendar from './pages/crm/Calendar';
import TechnicianRepairDashboard from './pages/crm/TechnicianRepairDashboard ';
// import Calendar from './pages/Calendar';

import PublicLayout from './layouts/PublicLayout';
import CRMLayout from './layouts/CRMLayout';



function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/about" element={<AboutPage />} />
          {/* Ajoutez d'autres routes publiques ici */}
        </Route>

        {/* Routes CRM protégées */}
        <Route element={<CRMLayout />}>
          <Route path="/dashboard" element={<ProtectedRoute requiredRole="Admin"><Dashboard /></ProtectedRoute>} />
          <Route path="/stocks" element={<ProtectedRoute requiredRole={['Admin', 'Manager', 'Technicien']}><Stocks /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute requiredRole={['Admin', 'Manager', 'Employee', 'Technicien']}><Clients /></ProtectedRoute>} />
          <Route path="/clients/:id" element={<ProtectedRoute requiredRole={['Admin', 'Manager', 'Employee']}><ClientDetail /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute requiredRole="Admin"><Settings /></ProtectedRoute>} />
          <Route path="/register" element={<Register />} />
          <Route path="/supplier" element={<ProtectedRoute requiredRole={['Admin', 'Manager', 'Employee']}><SupplierManagement /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute requiredRole={['Admin', 'Manager', 'Employee']}><AppointmentCalendar /></ProtectedRoute>} />
          <Route path="/technicianRepair" element={<ProtectedRoute requiredRole={['Admin', 'Technicien']}><TechnicianRepairDashboard /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;