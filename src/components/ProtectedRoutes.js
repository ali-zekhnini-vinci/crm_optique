import React from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isAuthorized, setIsAuthorized] = React.useState(null);

  React.useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/check-admin', {
          withCredentials: true
        });
        if (res.data.role.trim() === requiredRole) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (err) {
        setIsAuthorized(false);
      }
    };

    checkAuthorization();
  }, [requiredRole]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;