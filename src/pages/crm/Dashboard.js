import React, { useEffect, useState } from 'react';
import { Layout, Row, Col, Statistic, Table, DatePicker, message, Card } from 'antd';
import axios from 'axios';
import { UserOutlined, ShoppingCartOutlined, DollarOutlined, EyeOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import moment from 'moment';
import { StatisticCard } from '@ant-design/pro-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from 'recharts';

const { RangePicker } = DatePicker;

const Dashboard = () => {
  const [frameData, setFrameData] = useState([]);
  const [salesData, setSalesData] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]);
  const [dateRange, setDateRange] = useState([moment().subtract(1, 'year'), moment()]);
  const [salePerMonth, setSalePerMonth] = useState([]);
  const [widgetPreferences, setWidgetPreferences] = useState({});
  const user_id = localStorage.getItem('user_id');
  const [repairData, setRepairData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!dateRange || dateRange.length === 0) {
        const today = new Date();
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
        setDateRange([oneYearAgo.toISOString().split('T')[0], today.toISOString().split('T')[0]]);
      } else {
        await fetchWidgetPreferences();
        fetchDashboardData();
      }
    };
    fetchData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      const [frames, sales, clients, topProducts, categoryData, monthlySales, repairs] = await Promise.all([
        axios.get('http://localhost:5000/api/frames'),
        axios.get('http://localhost:5000/api/sales/stats', { params: { startDate: dateRange[0], endDate: dateRange[1] } }),
        axios.get('http://localhost:5000/api/clients/count'),
        axios.get('http://localhost:5000/api/sales/top-products'),
        axios.get('http://localhost:5000/api/sales/by-category'),
        axios.get('http://localhost:5000/api/sales/monthly-sales'),
        axios.get('http://localhost:5000/api/repairs'),
      ]);

      setFrameData(frames.data);
      setSalesData(sales.data || 0);
      setClientCount(clients.data || 0);
      setTopSellingProducts(topProducts.data);
      setSalesByCategory(categoryData.data);
      setSalePerMonth(monthlySales.data || []);
      setRepairData(repairs.data);
    } catch (error) {
      message.error('Erreur lors du chargement des données du tableau de bord');
      console.error(error);
    }
  };

  const fetchWidgetPreferences = async () => {
    try {
      const response = await axios.get(`/api/users/user-widget-preferences/${user_id}`);
      const preferences = response.data.reduce((acc, pref) => {
        acc[pref.widget_id] = pref.enabled;
        return acc;
      }, {});
      setWidgetPreferences(preferences);
    } catch (error) {
      message.error('Erreur lors de la récupération des préférences de widgets');
      console.error(error);
    }
  };

  const widgets = [
    {
      id: '1',
      title: 'Nombre de clients',
      component: <Statistic value={clientCount} prefix={<UserOutlined />} />,
      span: 6,
    },
    {
      id: '2',
      title: "Chiffre d'affaires",
      component: <Statistic value={salesData} prefix={<DollarOutlined />} />,
      span: 6,
    },
    {
      id: '3',
      title: 'Rendez-Vous',
      component: <Statistic value={appointmentCount} prefix={<EyeOutlined />} />,
      span: 6,
    },
    {
      id: '4',
      title: 'Montures',
      component: <Statistic value={frameData.length} prefix={<ShoppingCartOutlined />} />,
      span: 6,
    },
    {
      id: '5',
      title: 'Graphique des ventes',
      component: (
        <StatisticCard
          title="Graphique des ventes"
          chart={
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={salePerMonth}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          }
        />
      ),
      span: 12,
    },
    {
      id: '6',
      title: 'Ventes par catégorie',
      component: (
        <StatisticCard
          title="Ventes par catégorie"
          chart={
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={salesByCategory}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          }
        />
      ),
      span: 12,
    },
    {
      id: '7',
      title: 'Produits les plus vendus',
      component: <Table columns={[
        { title: 'Produit', dataIndex: 'brand', key: 'brand' },
        { title: 'Ventes', dataIndex: 'total_quantity', key: 'total_quantity' },
        { title: 'Revenus', dataIndex: 'total_sales', key: 'total_sales', render: (text) => `${text} €` },
      ]} dataSource={topSellingProducts} pagination={false} rowKey="brand" />,
      span: 12,
    },
    {
      id: '8',
      title: 'Montures en stock faible',
      component: <Table columns={[
        { title: 'Produit', dataIndex: 'brand', key: 'brand' },
        { title: 'Categorie', dataIndex: 'category', key: 'category' },
        { title: 'Stocks', dataIndex: 'stock', key: 'stock' },
      ]} dataSource={frameData.filter(item => item.stock < 50)} pagination={false} rowKey="id" />,
      span: 12,
    },
    {
      id: '9',
      title: 'Réparations',
      component: <Table columns={[
        { title: 'Client', dataIndex: 'client_name', key: 'client_name' },
        { title: 'Equipement', dataIndex: 'equipment', key: 'equipment' },
        { title: 'Status', dataIndex: 'status', key: 'status' },
      ]} dataSource={repairData} pagination={false} rowKey="brand" />,
      span: 12,
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    duration: 10,
  };

  return (
    <Layout>
      <div className="content" style={{ padding: '20px' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
          <Col xs={24}>
            <RangePicker onChange={(dates) => setDateRange(dates)} />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {widgets.map(widget => (
            widgetPreferences[widget.id] && (
              <Col key={widget.id} span={widget.span}>
                <motion.div variants={cardVariants} initial="hidden" animate="visible">
                  <Card title={widget.title} bordered>
                    {widget.component}
                  </Card>
                </motion.div>
              </Col>
            )
          ))}
        </Row>
      </div>
    </Layout>
  );
};

export default Dashboard;