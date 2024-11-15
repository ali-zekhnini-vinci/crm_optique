import React, { useEffect, useState } from 'react';
import { Layout, Breadcrumb, Card, Row, Col, List } from 'antd';
import { Line } from '@ant-design/charts';
import axios from 'axios';

const { Content, Footer } = Layout;

const data = [
  { month: 'Jan', sales: 4000, expenses: 2400 },
  { month: 'Feb', sales: 3000, expenses: 1398 },
  { month: 'Mar', sales: 2000, expenses: 9800 },
  { month: 'Apr', sales: 2780, expenses: 3908 },
  { month: 'May', sales: 1890, expenses: 4800 },
  { month: 'Jun', sales: 2390, expenses: 3800 },
  { month: 'Jul', sales: 3490, expenses: 4300 },
];

const stats = {
  users: 1200,
  totalSales: 150000,
  totalExpenses: 90000,
  totalProfits: 60000,
};

const Dashboard = () => {
  const [frameData, setFrameData] = useState([]);
  const [salesData, setSalesData] = useState(0);

  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/frames');
        console.log(res.data);
        setFrameData(res.data);
      } catch (error) {
        console.error(error.response.data);
      }
    };
    fetchFrames();
  }, []);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/sales');
        console.log("data ", res.data); // Ajoute cette ligne pour voir la structure des données
        console.log("total_sales ", res.data.total_sales); // Vérifie si total_sales est défini
        setSalesData(res.data);
      } catch (error) {
        console.error(error.response ? error.response.data : error.message);
      }
    };
    fetchSales();
  }, []);

  const config = {
    data,
    xField: 'month',
    yField: 'value',
    seriesField: 'type',
    yAxis: {
      label: {
        formatter: (v) => `${v} €`,
      },
    },
    legend: { position: 'top' },
    smooth: true,
  };

  return (
    <Layout>
      <Content style={{ padding: '0 50px' }}>
        <Breadcrumb style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
        </Breadcrumb>
        <div className="site-layout-content">
          <Row gutter={16}>
            <Col span={6}>
              <Card title="Utilisateurs" bordered={false} className='font-medium text-lg'>
                {stats.users}
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Ventes Totales" bordered={false} className='font-medium text-lg'>
                {salesData} €
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Dépenses Totales" bordered={false} className='font-medium text-lg'>
                {stats.totalExpenses} €
              </Card>
            </Col>
            <Col span={6}>
              <Card title="Profits Totals" bordered={false} className='font-medium text-lg'>
                {stats.totalProfits} €
              </Card>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginTop: '24px' }}>
            <Col span={12}>
              <Card title="Sales and Expenses">
                <Line {...config} />
              </Card>
            </Col>
            <Col span={12}>
              <Card title="Montures">
                <div style={{ maxHeight: '480px', overflowY: 'auto' }}>
                  <List
                    dataSource={frameData}
                    renderItem={item => (
                      <List.Item>
                      <List.Item.Meta
                        title={item.brand + item.model}
                        description={`                
                          Prix: ${item.price} € 
                          Stock: ${item.stock}
                        `}
                      />
                    </List.Item>
                    )}
                  />
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>CRM Dashboard ©2024 Created by You</Footer>
    </Layout>
  );
};

export default Dashboard;
