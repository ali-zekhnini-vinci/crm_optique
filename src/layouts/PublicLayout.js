import React from 'react';
import { Layout, Menu, Button } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import { HomeOutlined, InfoCircleOutlined, MailOutlined, LoginOutlined, ShoppingOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

const PublicLayout = () => {
  return (
    <Layout className="layout">
      <Header style={{ background: '#fff', boxShadow: '0 2px 8px #f0f1f2' }}>
        <div className="logo" style={{ float: 'left', width: 120, height: 31, margin: '16px 24px 16px 0' }} />
        <Menu mode="horizontal" defaultSelectedKeys={['1']} style={{ lineHeight: '64px', float: 'left' }}>
          <Menu.Item key="1" icon={<HomeOutlined />}>
            <Link to="/">Accueil</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<InfoCircleOutlined />}>
            <Link to="/about">À propos</Link>
          </Menu.Item>
          <Menu.Item key="3" icon={<MailOutlined />}>
            <Link to="/contact">Contact</Link>
          </Menu.Item>
        </Menu>
        <Button type="primary" icon={<LoginOutlined />} style={{ float: 'right', margin: '16px 24px' }}>
          <Link to="/login">Connexion</Link>
        </Button>
        <Button type="" icon={<ShoppingOutlined />} style={{ float: 'right', margin: '16px 24px' }}>
          <Link to="/subscription">S'abonner</Link>
        </Button>
      </Header>
      <Content style={{ padding: '0 50px', minHeight: 'calc(100vh - 64px)' }}>
        <Outlet />
      </Content>
    </Layout>
  );
};

export default PublicLayout;