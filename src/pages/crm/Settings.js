import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, message, Layout, Typography, Table, Modal, Tabs, Upload, Switch } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const stripePromise = loadStripe('pk_test_51QTTmrQMnVYA3nqwLTikEVS4NpfUovAJouXs5A42zo1ZKVt8NN0YpCxN1NR7WxrnKTrpdFB8PYxUjmNUgUysfhkp00eWO30LqU');

const UserManagement = () => {
  // États
  const [users, setUsers] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [fileList, setFileList] = useState([]);
  const [smsAuthEnabled, setSmsAuthEnabled] = useState(false);

  const [form] = Form.useForm();
  const optician_id = localStorage.getItem('optician_id');
  const user_id = localStorage.getItem('user_id');

  // Effets
  useEffect(() => {
    fetchUsers();
    fetchSubscriptions();
    fetchWidgets();
    fetchSMSAuthentication();
  }, []);

  // Fonctions de récupération de données
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs', error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(`/api/subscriptions/plan/${optician_id}`);
      console.log('abo : ' + JSON.stringify(response.data, null, 2));
      setSubscriptions(response.data);
      setLoadingSubscriptions(false);
    } catch (error) {
      message.error('Erreur lors de la récupération des abonnements');
      setLoadingSubscriptions(false);
    }
  };

  const fetchSMSAuthentication = async () => {
    try {
      const response = await axios.get(`/api/users/sms-auth/${user_id}`);
      setSmsAuthEnabled(response.data.two_factor_enabled);
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences d\'authentification par SMS', error);
    }
  };

  const fetchWidgets = async () => {
    try {
      const [widgetsResponse, preferencesResponse] = await Promise.all([
        axios.get('/api/users/widgets'),
        axios.get(`/api/users/user-widget-preferences/${user_id}`)
      ]);

      const allWidgets = widgetsResponse.data;
      const userPreferences = preferencesResponse.data;

      const widgetsWithPreferences = allWidgets.map(widget => ({
        ...widget,
        enabled: userPreferences.find(pref => pref.widget_id === widget.id)?.enabled || false
      }));

      setWidgets(widgetsWithPreferences);
    } catch (error) {
      console.error('Erreur lors de la récupération des widgets', error);
      message.error('Impossible de charger les widgets');
    }
  };


  // Gestionnaires d'événements
  const onFinish = async (values) => {
    try {
      await axios.post('http://localhost:5000/api/users/register', values, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      message.success('Utilisateur enregistré avec succès');
      form.resetFields();
      setIsModalVisible(false);
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement de l\'utilisateur');
    }
  };

  const handleEditUser = (userId) => {
    console.log(`Édition de l'utilisateur avec l'ID: ${userId}`);
  };

  const handleChangePlan = async (subscriptionId, newPlanId) => {
    const stripe = await stripePromise;
    try {
      const response = await axios.post(`/api/subscriptions/change`, { subscriptionId, planId: newPlanId });
      const { sessionId } = response.data;
      const result = await stripe.redirectToCheckout({ sessionId });
      if (result.error) {
        message.error(result.error.message);
      }
    } catch (error) {
      message.error('Erreur lors du changement de plan d\'abonnement');
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    message.success(`Abonnement annulé pour l'ID: ${subscriptionId}`);
  };

  const handleProfileUpdate = async (values) => {
    try {
      await axios.post(`/api/users/updateUser/${user_id}`, values);
      fetchUsers();
      console.log('Profil mis à jour:', values);
      message.success('Profil mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil', error);
      message.error('Erreur lors de la mise à jour du profil');
    };

  };

  const handlePhotoUpload = (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} téléchargé avec succès`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} échec du téléchargement`);
    }
    setFileList(info.fileList);
  };

  const updateSmsAuthPreference = async (two_factor_enabled) => {
    try {
      await axios.post('/api/users/update-sms-auth', { two_factor_enabled, user_id });
      message.success("Préférence d'authentification par SMS mise à jour");
    } catch (error) {
      message.error('Erreur lors de la mise à jour de la préférence');
    }
  };

  const handleWidgetToggle = async (widgetId, isEnabled) => {
    try {
      await axios.put(`/api/users/user-widget-preferences/${user_id}`, { widgetId, enabled: isEnabled });
      fetchWidgets();
      message.success('Préférences de widget mises à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences de widget', error);
      message.error('Impossible de mettre à jour les préférences de widget');
    }
  };

  // Configuration des colonnes pour les tables
  const columns = [
    { title: 'Nom', dataIndex: 'username', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Rôle', dataIndex: 'role', key: 'role' },
    {
      title: 'Actions',
      render: (_, record) => (
        <Button onClick={() => handleEditUser(record.id)}>Modifier</Button>
      ),
    },
  ];

  const subscriptionColumns = [
    { title: 'Plan', dataIndex: 'name', key: 'name' },
    { title: 'Prix', dataIndex: 'price', key: 'price' },
    { title: 'Statut', dataIndex: 'status', key: 'status' },
    {
      title: 'Actions',
      render: (_, record) => (
        <div>
          <Select placeholder="Changer d'offre" onChange={(value) => handleChangePlan(record.id, value)}>
            <Option value="Basic">Basic</Option>
            <Option value="Pro">Pro</Option>
            <Option value="Entreprise">Enterprise</Option>
          </Select>
          <Button onClick={() => handleCancelSubscription(record.id)} style={{ marginLeft: 8 }}>Annuler</Button>
        </div>
      ),
    },
  ];

  const kpiColumns = [
    { title: 'Indicateur', dataIndex: 'indicator', key: 'indicator' },
    { title: 'Valeur', dataIndex: 'value', key: 'value' },
    { title: 'Objectif', dataIndex: 'target', key: 'target' },
  ];

  const kpiData = [
    { id: 1, indicator: 'Chiffre d\'affaires total', value: '50,000 €', target: '100,000 €' },
    { id: 2, indicator: 'Nombre de ventes réalisées', value: '200', target: '500' },
    { id: 3, indicator: 'Taux de satisfaction client', value: '85%', target: '90%' },
  ];

  // Rendu du composant
  return (
    <Layout className='content'>
      <Content style={{ padding: '20px' }}>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Gestion des Utilisateurs" key="1">
            <Button onClick={() => setIsModalVisible(true)} style={{ margin: '10px 0' }}>
              Ajouter un Utilisateur
            </Button>
            <Table columns={columns} dataSource={users} rowKey="id" />

            <Modal
              title="Ajouter un Utilisateur"
              visible={isModalVisible}
              onCancel={() => setIsModalVisible(false)}
              footer={null}
            >
              <Form
                form={form}
                name="register"
                onFinish={onFinish}
                scrollToFirstError
              >
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: 'Veuillez entrer votre nom d\'utilisateur!', whitespace: true }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Nom d'utilisateur" />
                </Form.Item>

                <Form.Item
                  name="email"
                  rules={[
                    { type: 'email', message: 'L\'adresse e-mail n\'est pas valide!' },
                    { required: true, message: 'Veuillez entrer votre e-mail!' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Email" />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Veuillez entrer votre mot de passe!' }]}
                  hasFeedback
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Mot de passe" />
                </Form.Item>

                <Form.Item
                  name="phone_number"
                  rules={[{ required: true, message: 'Veuillez entrer votre numero de telephone!', whitespace: true }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder=" +32 XXX XX XX XX" />
                </Form.Item>


                <Form.Item
                  name="role"
                  rules={[{ required: true, message: 'Veuillez sélectionner le rôle de l\'utilisateur!' }]}
                >
                  <Select placeholder="Sélectionner un rôle">
                    <Option value="Admin">Admin</Option>
                    <Option value="Manager">Manager</Option>
                    <Option value="Employee">Employé</Option>
                  </Select>
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                    Enregistrer
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </TabPane>

          <TabPane tab="Personnalisation du Profil" key="2">
            <Title level={4}>Modifier vos informations</Title>
            <Form form={form} layout="vertical" onFinish={handleProfileUpdate}>
              <Form.Item
                name="username"
                label="Nom d'utilisateur"
                rules={[{ required: true, message: 'Veuillez entrer votre nom d\'utilisateur!' }]}
              >
                <Input prefix={<UserOutlined style={{ margin: '5px 5px 5px 0' }}/>} placeholder="Nom d'utilisateur" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { type: 'email', message: 'L\'email n\'est pas valide!' },
                  { required: true, message: 'Veuillez entrer votre email!' }
                ]}
              >
                <Input prefix={<MailOutlined style={{ margin: '5px 5px 5px 0' }}/>} placeholder="Email" />
              </Form.Item>

              <Form.Item
                name="phone_number"
                label="Tel"
                rules={[
                  { required: true, message: 'Veuillez entrer votre numero de telephone!' }
                ]}
              >
                <Input prefix={<PhoneOutlined style={{ margin: '5px 5px 5px 0' }}/>} placeholder="Tel" />
              </Form.Item>

              {/* Section pour télécharger une photo de profil */}
              <Form.Item label="Photo de Profil">
                <Upload
                  beforeUpload={() => false} // Empêche le téléchargement automatique
                  onChange={handlePhotoUpload}
                  showUploadList={false}
                >
                  <Button>Choisir une photo</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Mettre à jour le profil
                </Button>
              </Form.Item>
            </Form>

            <Form.Item label="Activer l'authentification par SMS">
              <Switch
                checked={smsAuthEnabled}
                onChange={(checked) => {
                  setSmsAuthEnabled(checked);
                  // Envoyer une requête au backend pour mettre à jour la préférence de l'utilisateur
                  updateSmsAuthPreference(checked);
                }}
              />
            </Form.Item>

          </TabPane>

          <TabPane tab="Gestion des Abonnements" key="3">
            {loadingSubscriptions ? (
              <p>Chargement des abonnements...</p>
            ) : (
              <Table columns={subscriptionColumns} dataSource={subscriptions} rowKey="id" />
            )}
          </TabPane>

          <TabPane tab="Rapports" key="4">
            <Title level={4}>Analyse et Reporting</Title>
            <p>Suivez les performances clés de votre entreprise grâce aux indicateurs ci-dessous.</p>

            {/* Tableau pour afficher les KPI */}
            <Table columns={kpiColumns} dataSource={kpiData} rowKey="id" />
          </TabPane>

          <TabPane tab="Personnalisation du Dashboard" key="5">
            <Title level={4}>Widgets</Title>
            <Table
              dataSource={widgets}
              columns={[
                {
                  title: 'Widget',
                  dataIndex: 'widget_title',
                  key: 'widget_title',
                },
                {
                  title: 'Description',
                  dataIndex: 'description',
                  key: 'description',
                },
                {
                  title: 'Activer',
                  key: 'enabled',
                  render: (_, record) => (
                    <Switch
                      checked={record.enabled}
                      onChange={(checked) => handleWidgetToggle(record.id, checked)}
                    />
                  ),
                },
              ]}
              rowKey="id"
            />
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
};

export default UserManagement;