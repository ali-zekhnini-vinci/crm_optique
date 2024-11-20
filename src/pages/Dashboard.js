import React, { useEffect, useState } from 'react';
import { Layout, Card, Row, Col, List } from 'antd';
import { Line } from '@ant-design/charts';
import axios from 'axios';

const Dashboard = () => {
  const [frameData, setFrameData] = useState([]);
  const [salesData, setSalesData] = useState(0);

  useEffect(() => {
    const fetchFrames = async () => {
      const res = await axios.get('http://localhost:5000/api/frames');
      setFrameData(res.data);
    };
    fetchFrames();
  }, []);

  useEffect(() => {
    const fetchSales = async () => {
      const res = await axios.get('http://localhost:5000/api/sales/stats');
      setSalesData(res.data || 0);
    };
    fetchSales();
  }, []);

  const chartConfig = {
    data: [
      { month: 'Jan', sales: 4000 },
      { month: 'Feb', sales: 3000 },
      { month: 'Mar', sales: 2000 },
      { month: 'Apr', sales: 2780 },
    ],
    xField: 'month',
    yField: 'sales',
    seriesField: 'type',
    smooth: true,
  };

  return (
    <div className="layout">
      {/* Content */}
      <div className="content">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card title="Utilisateurs">
              <div className="card-data">1200</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Ventes Totales">
              <div className="card-data">{salesData} €</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Dépenses">
              <div className="card-data">90000 €</div>
            </Card>
          </Col>
          <Col span={6}>
            <Card title="Profits">
              <div className="card-data">60000 €</div>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
          <Col span={12}>
            <Card title="Graphique des ventes">
              <Line {...chartConfig} />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Montures">
              <div style={{ maxHeight: '478px', overflowY: 'auto' }}>
                <List
                  dataSource={frameData}
                  renderItem={item => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.brand + '  ' + item.model}
                        description={`Prix: ${item.price} € | Stock: ${item.stock}`}
                      />
                    </List.Item>
                  )}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Dashboard;
