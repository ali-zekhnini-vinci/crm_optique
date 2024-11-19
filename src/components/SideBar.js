import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserPlusIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  CubeIcon,
  ArchiveBoxIcon,
  XMarkIcon,
  Bars3Icon,
  ArrowLeftOnRectangleIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

const initialNavigation  = [
  { name: 'Accueil', href: '/', icon: HomeIcon, current: false },
  { name: 'Inscription', href: '/register', icon: UserPlusIcon, current: false },
  { name: 'Client', href: '/client', icon: UserGroupIcon, current: false },
  { name: 'Dépenses', href: '/expenses', icon: ChartBarIcon, current: false },
  { name: 'Ventes', href: '/sales', icon: ShoppingBagIcon, current: false },
  { name: 'Montures', href: '/frames', icon: CubeIcon, current: false },
  { name: 'Stocks', href: '/stocks', icon: ArchiveBoxIcon, current: false },
  { name: 'Dashboard', href: '/dashboard', icon: ComputerDesktopIcon, current: false },
];  

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Sidebar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [navigation, setNavigation] = useState(initialNavigation);
  const isLoggedIn = !!localStorage.getItem('token'); // Vérifie si le token est présent
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }
        const res = await axios.get('http://localhost:5000/api/check-admin', {
          withCredentials: true // Assure l'envoi des cookies
        });
        if (res.data.role.trim() === 'Admin') {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Erreur lors de la vérification du rôle:', err.response ? err.response.data : err.message);
      }
    };

    checkAdmin();
  }, []);

  useEffect(() => {
    // Met à jour le statut `current` en fonction du chemin actif
    const updatedNavigation = navigation.map((item) => ({
      ...item,
      current: location.pathname === item.href,
    }));
    setNavigation(updatedNavigation);
  }, [location]);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/logout',
        {},
        {
          withCredentials: true // Assure l'envoi des cookies
        }
      );
      localStorage.removeItem('token'); // Supprimer le token du localStorage
      navigate('/login'); // Rediriger vers la page de connexion
      window.location.reload();
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err.response ? err.response.data : err.message);
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-16'
        } bg-gray-800 fixed inset-y-0 left-0 flex flex-col transition-all duration-300`}
      >
        <div className="flex items-center justify-between h-16 px-4">
          <img
            className={`h-8 w-auto ${isSidebarOpen ? 'block' : 'hidden'}`}
            src="https://tailwindui.com/img/logos/workflow-mark-indigo-500.svg"
            alt="Workflow"
          />
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-400 hover:text-white focus:outline-none"
          >
            {isSidebarOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          {navigation.map(
            (item) =>
              (item.name !== 'Inscription' || isAdmin) &&
              (item.name !== 'Connexion' || !isLoggedIn) && (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon className="h-6 w-6 mr-3" />
                  {isSidebarOpen && item.name}
                </Link>
              )
          )}
        </nav>
        <div className="px-2">
          <button
            onClick={handleLogout}
            className="text-gray-300 hover:bg-gray-700 hover:text-white flex items-center px-2 py-2 text-sm font-medium rounded-md w-full"
          >
            <ArrowLeftOnRectangleIcon className="h-6 w-6 mr-3" />
            {isSidebarOpen && 'Déconnexion'}
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div
        className={`ml-${isSidebarOpen ? '64' : '16'} flex-1 transition-all duration-300`}
        style={{ overflow: 'auto' }}
      >
        {/* Contenu des pages */}
      </div>
    </div>
  );
};

export default Sidebar ;
