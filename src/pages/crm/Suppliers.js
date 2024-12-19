import React, { useState, useEffect } from 'react';
import { Layout, Table, Button, Modal, Form, Input, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Content } = Layout;

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingSupplier, setEditingSupplier] = useState(null);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('/api/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs', error);
    }
  };

  const handleAddSupplier = async (values) => {
    try {
      await axios.post('/api/suppliers', values);
      message.success('Fournisseur ajouté avec succès');
      form.resetFields();
      setIsModalVisible(false);
      fetchSuppliers(); // Rafraîchir la liste des fournisseurs
    } catch (error) {
      message.error('Erreur lors de l\'ajout du fournisseur');
    }
  };

  const handleEditSupplier = async (values) => {
    try {
      await axios.put(`/api/suppliers/${editingSupplier.id}`, values);
      message.success('Fournisseur mis à jour avec succès');
      form.resetFields();
      setIsModalVisible(false);
      fetchSuppliers(); // Rafraîchir la liste des fournisseurs
    } catch (error) {
      message.error('Erreur lors de la mise à jour du fournisseur');
    }
  };

  const handleDeleteSupplier = async (id) => {
    try {
      await axios.delete(`/api/suppliers/${id}`);
      message.success('Fournisseur supprimé avec succès');
      fetchSuppliers(); // Rafraîchir la liste des fournisseurs
    } catch (error) {
      message.error('Erreur lors de la suppression du fournisseur');
    }
  };

  const columns = [
    { title: 'Nom', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Téléphone', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Actions',
      render: (_, record) => (
        <div>
          <Button onClick={() => { setEditingSupplier(record); form.setFieldsValue(record); setIsModalVisible(true); }}>Modifier</Button>
          <Button danger onClick={() => handleDeleteSupplier(record.id)} style={{ marginLeft: 8 }}>Supprimer</Button>
        </div>
      ),
    },
  ];

  return (
    <Layout className='content'>
      <Content style={{ padding: '20px' }}>
        <Button type="primary" onClick={() => { setEditingSupplier(null); setIsModalVisible(true); }}>Ajouter un Fournisseur</Button>
        <Table columns={columns} dataSource={suppliers} rowKey="id" style={{ marginTop: '20px' }} />
        
        <Modal
          title={editingSupplier ? "Modifier le Fournisseur" : "Ajouter un Fournisseur"}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
        >
          <Form form={form} onFinish={editingSupplier ? handleEditSupplier : handleAddSupplier}>
            <Form.Item name="name" rules={[{ required: true, message: 'Veuillez entrer le nom du fournisseur!' }]}>
              <Input prefix={<UserOutlined />} placeholder="Nom du fournisseur" />
            </Form.Item>
            <Form.Item name="email" rules={[{ type: 'email', message: 'L\'adresse e-mail n\'est pas valide!' }, { required: true, message: 'Veuillez entrer l\'email!' }]}>
              <Input prefix={<MailOutlined />} placeholder="Email" />
            </Form.Item>
            <Form.Item name="phone" rules={[{ required: true, message: 'Veuillez entrer le numéro de téléphone!' }]}>
              <Input prefix={<PhoneOutlined />} placeholder="Téléphone" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                {editingSupplier ? "Mettre à jour" : "Ajouter"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default SupplierManagement;
