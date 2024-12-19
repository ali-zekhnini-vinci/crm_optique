import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Button } from 'antd';
import axios from 'axios';
import {
  HomeOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
  BarChartOutlined,
  InboxOutlined,
  DesktopOutlined,
  LogoutOutlined,
  LoginOutlined,
  UserOutlined,
  SettingOutlined,
  CalendarOutlined,
  ApartmentOutlined,
  ToolOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const { Sider } = Layout;

const Navbar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('optician_id');
    setIsLoggedIn(!!token);
  }, []);

  const getCookieValue = (name) => {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return match ? decodeURIComponent(match[2]) : null;
  };

  useEffect(() => {
    const role = getCookieValue('role');
    setIsAdmin(role && role.trim() === 'Admin');
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/users/logout', {}, { withCredentials: true });
      localStorage.removeItem('optician_id');
      localStorage.removeItem('role');
      localStorage.removeItem('user_id');
      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err.message);
    }
  };

  const menuItems = [
    { key: '/register', label: 'Inscription', icon: <UserAddOutlined />, adminOnly: false },
    // { key: '/calendar', label: 'Calendrier', icon: <CalendarOutlined /> },
    { key: '/stocks', label: 'Stocks', icon: <InboxOutlined /> },
    { key: '/clients', label: 'Clients', icon: <UsergroupAddOutlined /> },
    { key: '/supplier', label: 'Fournisseurs', icon: <ApartmentOutlined />, adminOnly: true },
    { key: '/calendar', label: 'Calendrier', icon: <CalendarOutlined />, adminOnly: false },
    { key: '/technicianRepair', label: 'Technicien', icon: <ToolOutlined />, adminOnly: false },
    { key: '/dashboard', label: 'Dashboard', icon: <DesktopOutlined />, adminOnly: true },
  ];

  return (
    <Sider
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      width={250}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: '#fff',
        boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '64px',
          // background: '#f0f2f5'
        }}
      >
        <h1 style={{
          color: '#001529',
          margin: 0,
          fontSize: collapsed ? '16px' : '20px'
        }}>
          {collapsed ? 'CRM' : 'CRM Optique'}
        </h1>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 0'
        }}
      >
        <Avatar
          size={64}
          icon={<UserOutlined />}
          style={{
            backgroundColor: '#1890ff',
            cursor: 'pointer'
          }}
        />
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ borderRight: 0 }}
      >
        {menuItems
          .filter(item => !item.adminOnly || isAdmin)
          .map(item => (
            <Menu.Item key={item.key} icon={item.icon}>
              <Link to={item.key}>{item.label}</Link>
            </Menu.Item>
          ))
        }
      </Menu>

      <div style={{ position: 'absolute', bottom: '20px', width: '100%', padding: '0 24px' }}>
        <Link to="/settings">
          <Button
            icon={<SettingOutlined />}
            style={{ width: '100%', marginBottom: '10px' }}

          >
            Paramètres
          </Button>
        </Link>
        {!isLoggedIn ? (
          <Link to="/login">
            <Button
              style={{ width: '100%' }}
              icon={<LoginOutlined />}
            >
              Connexion
            </Button>
          </Link>
        ) : (
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ width: '100%' }}
          >
            Déconnexion
          </Button>
        )}
      </div>
    </Sider>
  );
};

export default Navbar;