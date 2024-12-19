import React, { useEffect, useState } from 'react';
import { Layout, Space, Table, Input, Tabs, Form, Row, Col, Button, message, Card, Select } from 'antd';
import { DatePicker } from 'antd';
import { Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { MailOutlined, PhoneOutlined, UserOutlined, CalendarOutlined, EnvironmentOutlined, HomeOutlined, TagOutlined, SearchOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Content } = Layout;
const { Search } = Input;

const ClientPage = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [frames, setFrames] = useState([]);
  const [form] = Form.useForm();
  const [cart, setCart] = useState([]); // État pour le panier
  const [totalPrice, setTotalPrice] = useState(0); // État pour le prix total

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/clients');
        setClients(res.data);
        setFilteredClients(res.data);
      } catch (error) {
        console.error(error.response ? error.response.data : error.message);
      }
    };
    fetchClients();
  }, []);



  const handleSearch = (value) => {
    setSearchText(value);
    const filtered = clients.filter(client =>
      client.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredClients(filtered);
  };

  const handleAddClient = async (values) => {
    try {
      values.last_visit_date = values.last_visit_date.format('YYYY-MM-DD');
      const res = await axios.post('http://localhost:5000/api/clients/AddClients', values);
      setClients([...clients, res.data]);
      setFilteredClients([...clients, res.data]);
      message.success('Client ajouté avec succès !');
      form.resetFields();
    } catch (error) {
      message.error(error.response ? error.response.data.message : 'Erreur lors de l’ajout du client.');
    }
  };

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => <Link to={`/clients/${record.id}`}>{text}</Link>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Téléphone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Date de naissance',
      dataIndex: 'birth_date',
      key: 'birth_date',
      render: (text) => moment(text).format('DD-MM-YYYY'),
    },
    {
      title: 'Adresse',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Ville',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Code postal',
      dataIndex: 'postal_code',
      key: 'postal_code',
    },
    {
      title: 'Date de création',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => moment(text).format('DD-MM-YYYY'),
    },
    {
      title: 'Dernière visite',
      dataIndex: 'last_visit_date',
      key: 'last_visit_date',
      render: (text) => moment(text).format('DD-MM-YYYY'),
    },
  ];

  return (
    <Layout className='content'>
      <Content style={{ padding: '50 0px' }}>
        <div className="site-layout-content">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Liste des Clients" key="1">
              <Space style={{ marginBottom: 16 }}>
                <Search
                  placeholder="Rechercher un client"
                  onSearch={handleSearch}
                  value={searchText}
                  onChange={e => handleSearch(e.target.value)}
                  style={{ borderRadius: 20 }} // Arrondi du champ de recherche
                  prefix={<SearchOutlined />} // Icône de recherche 
                />
              </Space>
              <Table columns={columns} dataSource={filteredClients} rowKey="id" />
            </TabPane>
            <TabPane tab="Ajouter un Client" key="2">
              <Layout.Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

                <Card title="Ajouter un Client" bordered={false}
                  style={{
                    maxWidth: 800,
                    width: '100%', // Assure que le card ne dépasse pas la largeur de l'écran
                    margin: '24px', // Ajoute un peu d'espace autour du card
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddClient}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Nom complet"
                          name="name"
                          rules={[{ required: true, message: 'Veuillez entrer le nom complet.' }]}
                        >
                          <Input prefix={<UserOutlined />} placeholder="Nom complet" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Email"
                          name="email"
                          rules={[
                            { required: true, message: 'Veuillez entrer un email.' },
                            { type: 'email', message: 'Veuillez entrer un email valide.' },
                          ]}
                        >
                          <Input prefix={<MailOutlined />} placeholder="Email" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Téléphone"
                          name="phone"
                          rules={[{ required: true, message: 'Veuillez entrer un numéro de téléphone.' }]}
                        >
                          <Input prefix={<PhoneOutlined />} placeholder="Téléphone" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Date de naissance"
                          name="birth_date"
                          rules={[{ required: true, message: "Veuillez entrer la date de naissance." }]}
                        >
                          <Input prefix={<CalendarOutlined />} placeholder="Date de naissance (YYYY-MM-DD)" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Adresse"
                          name="address"
                          rules={[{ required: true, message: "Veuillez entrer l'adresse." }]}
                        >
                          <Input prefix={<HomeOutlined />} placeholder="Adresse" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          label="Ville"
                          name="city"
                          rules={[{ required: true, message: "Veuillez entrer la ville." }]}
                        >
                          <Input prefix={<EnvironmentOutlined />} placeholder="Ville" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          label="Code postal"
                          name="postal_code"
                          rules={[{ required: true, message: "Veuillez entrer le code postal." }]}
                        >
                          <Input prefix={<TagOutlined />} placeholder="Code postal" />
                        </Form.Item>
                      </Col>
                      {/* Champ pour la dernière visite avec DatePicker */}
                      <Col span={12}>
                        <Form.Item
                          label="Dernière visite"
                          name="last_visit_date"
                          rules={[{ required: true, message: "Veuillez sélectionner la dernière visite." }]}
                        >
                          <DatePicker
                            format={'YYYY-MM-DD'}
                            style={{ width: "100%" }}
                            inputReadOnly // Empêche l'utilisateur d'écrire dans l'input directement
                            placeholder="Sélectionner une date" // Placeholder pour le DatePicker
                            className='ant-input' // Appliquer la classe d'input standard d'Ant Design
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Ajouter
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Layout.Content>
            </TabPane>
          </Tabs>
        </div>
      </Content>
    </Layout>
  );
};

export default ClientPage;