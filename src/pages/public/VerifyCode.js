import React, { useState } from 'react';
import { Button, Form, Input, Typography, Layout, message } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;
const { Content } = Layout;

const VerifyCode = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = location.state || {};

  const onFinish = async (values) => {
    console.log("values : " + values.code);
    console.log("values ID : " + userId);
    try {
      const res = await axios.post('http://localhost:5000/api/users/verify-code', {
        userId,
        code: values.code
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      
      const { role, token, optician, id } = res.data;

      localStorage.setItem('optician_id', optician);
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
        default:
          message.error('Unknown role');
      }
    } catch (err) {
      message.error('Verification failed. Please check your code.');
    }
  };

  return (
    <Layout>
      <Content style={{ padding: '50px', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <Title level={2}>Verify Your Code</Title>
          <Typography.Paragraph>
            Please check your phone for the verification code we sent you.
          </Typography.Paragraph>
          <Form
            form={form}
            name="verify-code"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              name="code"
              rules={[{ required: true, message: 'Please input the verification code!' }]}
            >
              <Input placeholder="Enter verification code" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                Verify
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Content>
    </Layout>
  );
};

export default VerifyCode;