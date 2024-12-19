import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProConfigProvider, ProFormCheckbox, ProFormText } from '@ant-design/pro-components';
import { Button, Tabs, message, ConfigProvider } from 'antd';
import frFR from 'antd/lib/locale/fr_FR';

const LoginPage = () => {
  const [loginType, setLoginType] = useState('account');
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      const res = await axios.post('http://localhost:5000/api/users/login', values, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      const { userId, role, optician_id, id, two_factor_enabled } = res.data;
      if (two_factor_enabled) {
        navigate('/verify-code', { state: { userId } });
      } else {
        handleSuccessfulLogin({ role, optician_id, id });
      }
    } catch (err) {
      message.error('La connexion a échoué, vérifiez vos identifiants');
    }
  };

  const handleSuccessfulLogin = (data) => {
    const { role, optician_id, id } = data;
    localStorage.setItem('optician_id', optician_id);
    localStorage.setItem('role', role);
    localStorage.setItem('user_id', id);

    switch (role) {
      case 'Admin':
        navigate('/dashboard');
        break;
      case 'Manager':
        navigate('/frames');
        break;
      case 'Employee':
        navigate('/home');
        break;
      case 'Technicien':
        navigate('/technicianRepair');
        break;
      default:
        message.error('Rôle inconnu');
    }
  };

  return (
    <ConfigProvider locale={frFR}>
      <ProConfigProvider hashed={false}>
      <div style={{ minHeight: '90vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '600px', padding: '24px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
            <LoginForm
              logo="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
              title="CRM Optique"
              subTitle="Système de gestion pour opticiens"
              onFinish={ handleSubmit }
              submitter={{
                searchConfig: { submitText: 'Se connecter' },
                resetButtonProps: false,
                render: (props) => (
                  <Button type="primary" onClick={() => props.submit()} style={{ width: '100%' }}>
                    Se connecter
                  </Button>
                ),
              }}
            >
              <ProFormText
                name="username"
                fieldProps={{ size: 'large', prefix: <UserOutlined /> }}
                placeholder={'Nom d\'utilisateur'}
                rules={[{ required: true, message: 'Veuillez entrer votre nom d\'utilisateur!' }]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
                placeholder={'Mot de passe'}
                rules={[{ required: true, message: 'Veuillez entrer votre mot de passe!' }]}
              />
              <div style={{ marginBottom: 24 }}>
                <ProFormCheckbox noStyle name="autoLogin"> Se souvenir de moi </ProFormCheckbox>
                <a style={{ float: 'right' }}> Mot de passe oublié </a>
              </div>
            </LoginForm>
          </div>
        </div>
      </ProConfigProvider>
    </ConfigProvider>
  );
};

export default LoginPage;
