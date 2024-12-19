import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Layout, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/check-admin', { withCredentials: true });
        if (res.data.role !== 'Admin') {
          message.error('You do not have permission to access this page');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/login');
      }
    };

     checkAdmin();
  }, [navigate]);

  const onFinish = async (values) => {
    console.log(values);
    try {
      const res = await axios.post('http://localhost:5000/api/users/register', values, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });
      message.success('User registered successfully');
      form.resetFields();
    } catch (err) {
      message.error(err.response?.data?.message || 'Error registering user');
    }
  };

  return (
    <Layout className='content'>
      <Content style={{ padding: '50px', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <img
              alt="Your Company"
              src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
              style={{ height: 40, margin: 'auto' }}
            />
            <Title level={2} style={{ marginTop: 24 }}>Register a new account</Title>
          </div>

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            scrollToFirstError
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Please input your username!', whitespace: true }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Username" />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                { type: 'email', message: 'The input is not valid E-mail!' },
                { required: true, message: 'Please input your E-mail!' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
              hasFeedback
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Password" />
            </Form.Item>

            <Form.Item
              name="role"
              rules={[{ required: true, message: 'Please select user role!' }]}
            >
              <Select placeholder="Select a role">
                <Option value="Admin">Admin</Option>
                <Option value="Manager">Manager</Option>
                <Option value="Employee">Employee</Option>
                <Option value="Technicien">Technicien</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="phone_number"
              rules={[
                { type: 'phone_number', message: 'The input is not valid Phone Number!' },
                { required: true, message: 'Please input your Phone number!' }
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Phone" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                Register
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

export default Register;