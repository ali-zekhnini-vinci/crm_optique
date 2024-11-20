import React, { useEffect, useState } from 'react';
import { Layout, Input, Table, Button, Space, Modal, Form, message } from 'antd';
import { Link } from 'react-router-dom';
import axios from 'axios';

const { Content } = Layout;
const { Search } = Input;

const Client = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/clients');
        console.log(res.data);
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

  const handleFilter = (status) => {
    const filtered = clients.filter(client => client.status === status);
    setFilteredClients(filtered);
  };

  const handleAddClient = async (values) => {
    try {
      const res = await axios.post('http://localhost:5000/api/clients/AddClients', values);
      setClients([...clients, res.data]);
      setFilteredClients([...clients, res.data]);
      message.success('Client ajouté avec succès !');
      form.resetFields();
      setIsModalVisible(false);
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
      dataIndex: 'tel',
      key: 'tel',
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content">
          <Space style={{ marginBottom: 16 }}>
            <Search
              placeholder="Rechercher un client"
              onSearch={handleSearch}
              enterButton
              value={searchText}
              onChange={e => handleSearch(e.target.value)}
            />
            <Button onClick={() => handleFilter('Actif')}>Actifs</Button>
            <Button onClick={() => handleFilter('Inactif')}>Inactifs</Button>
            <Button type="primary" onClick={() => setIsModalVisible(true)}>
              Ajouter Un Client
            </Button>
          </Space>
          <Table columns={columns} dataSource={filteredClients} rowKey="id" />

          {/* Modal pour ajouter un client */}
          <Modal
            title="Ajouter un client"
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleAddClient}
            >
              <Form.Item
                label="Nom complet"
                name="name"
                rules={[{ required: true, message: 'Veuillez entrer le nom complet.' }]}
              >
                <Input placeholder="Nom complet" />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Veuillez entrer un email.' },
                  { type: 'email', message: 'Veuillez entrer un email valide.' },
                ]}
              >
                <Input placeholder="Email" />
              </Form.Item>
              <Form.Item
                label="Téléphone"
                name="tel"
                rules={[{ required: true, message: 'Veuillez entrer un numéro de téléphone.' }]}
              >
                <Input placeholder="Téléphone" />
              </Form.Item>
              <Form.Item
                label="Statut"
                name="status"
                rules={[{ required: true, message: 'Veuillez sélectionner un statut.' }]}
              >
                <Input placeholder="Statut (Actif / Inactif)" />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    Ajouter
                  </Button>
                  <Button onClick={() => setIsModalVisible(false)}>
                    Annuler
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default Client;
