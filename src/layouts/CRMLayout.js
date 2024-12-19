import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import {
    DashboardOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    CalendarOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import Navbar from '../components/Navbar';

const { Header, Content, Sider } = Layout;

const CRMLayout = ({ children }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Logique de déconnexion ici
        navigate('/login');
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Content>
                <Outlet />
                <Navbar />
            </Content>
        </Layout>
    );
};

export default CRMLayout;