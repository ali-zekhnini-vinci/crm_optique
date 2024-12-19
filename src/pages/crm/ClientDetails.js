import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { Layout, Descriptions, Spin, message, Tabs, Table, Button, Modal, Form, Input, DatePicker, TimePicker, Select, Typography, Row, Col, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { UserOutlined, CalendarOutlined, PhoneOutlined, HomeOutlined, EnvironmentOutlined } from '@ant-design/icons';


import { loadStripe } from '@stripe/stripe-js';
import { color } from 'framer-motion';
import TextArea from 'antd/es/input/TextArea';
import { EyeOutlined, MailOutlined, TagOutlined } from '@ant-design/icons';
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const { Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;
const { Text } = Typography;

const ClientDetail = ({ currentUserId }) => {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditClientModalVisible, setIsEditClientModalVisible] = useState(false);
  const [isRepairModalVisible, setIsRepairModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [frames, setFrames] = useState([]);
  const [cart, setCart] = useState([]); // État pour le panier
  const [totalPrice, setTotalPrice] = useState(0);
  const [clients, setClients] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const user_id = localStorage.getItem('user_id');

  // Appointment 
  const [isAppointmentVisibile, setAppointmentModalVisible] = useState(false);
  const [note, setNote] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchFrames();
    fetchClientAndPrescriptions();
    fetchRepairs();
  }, [id]);

  const fetchFrames = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/frames');
      setFrames(response.data || []); // Utilisez un tableau vide si response.
    } catch (error) {
      message.error('Erreur lors de la récupération des montures');
    }
  }

  const fetchClientAndPrescriptions = async () => {
    try {
      const [clientsList, clientRes, prescriptionsRes, purchaseHistoryRes] = await Promise.all([
        axios.get('http://localhost:5000/api/clients'),
        axios.get(`http://localhost:5000/api/clients/${id}`),
        axios.get(`http://localhost:5000/api/clients/${id}/prescriptions`),
        axios.get(`http://localhost:5000/api/clients/${id}/purchases`)
      ]);
      setClients(clientsList.data);
      setClient(clientRes.data);
      setPrescriptions(prescriptionsRes.data);
      setPurchaseHistory(purchaseHistoryRes.data);
      setLoading(false);
    } catch (error) {
      message.error('Erreur lors de la récupération des données');
      setLoading(false);
    }
  };

  const handleAddPrescription = async (values) => {
    try {
      const prescriptionData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        user_id: 2, // Assurez-vous que c'est la bonne valeur pour user_id
        client_id: id,
      };
      console.log(prescriptionData)
      const res = await axios.post(`http://localhost:5000/api/clients/${id}/prescriptions`, prescriptionData);
      setPrescriptions([...prescriptions, res.data]);
      message.success('Prescription ajoutée avec succès');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error("ici")
      message.error("Erreur lors de l'ajout de la prescription");
    }
  };

  const handleUpdateClient = async (values) => {
    console.log('Données envoyées au serveur:', values); // Ajoutez cette ligne pour déboguer
    try {
      const res = await axios.put(`http://localhost:5000/api/clients/${id}`, values);
      setClient(res.data);
      message.success('Client mis à jour avec succès');
      setIsEditClientModalVisible(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error); // Ajoutez cette ligne pour déboguer
      message.error("Erreur lors de la mise à jour du client");
    }
  };

  const handleSavePrescriptionNote = async (prescriptionId, notes) => {
    try {
      await axios.patch(`http://localhost:5000/api/clients/prescriptions/${prescriptionId}`, { notes });
      setPrescriptions(prescriptions.map(p =>
        p.id === prescriptionId ? { ...p, notes } : p
      ));
      message.success('Note de prescription enregistrée avec succès');
    } catch (error) {
      message.error("Erreur lors de l'enregistrement de la note de prescription");
    }
  };

  // Fonction pour ajouter un article au panier
  const addToCart = (frameId, quantity) => {
    const frame = frames.find(f => f.id === frameId);
    if (frame) {
      // Vérifier si l'article est déjà dans le panier
      const existingItemIndex = cart.findIndex(item => item.id === frame.id);
      if (existingItemIndex > -1) {
        // Si l'article existe déjà, augmenter la quantité
        const updatedCart = [...cart];
        updatedCart[existingItemIndex].quantity = quantity;
        setCart(updatedCart);
        updateTotalPrice(updatedCart); // Mettre à jour le prix total
      } else {
        // Sinon, ajouter un nouvel article au panier
        const newItem = { ...frame, quantity };
        setCart([...cart, newItem]);
        updateTotalPrice([...cart, newItem]); // Mettre à jour le prix total
      }
    }
  };

  // Fonction pour mettre à jour le prix total
  const updateTotalPrice = (updatedCart) => {
    const total = updatedCart.reduce((accum, item) => accum + item.price * item.quantity, 0);
    setTotalPrice(total);
  };

  // Fonction pour gérer la soumission du formulaire
  const handlePurchase = async () => {
    const stripe = await stripePromise;

    try {
      const values = form.getFieldValue();
      const saleData = {
        client_id: id,
        frame_id: values.frame_id,
        quantity: values.quantity,
        total: totalPrice,
        sale_date: new Date(),
        user_id: localStorage.getItem('user_id')
      };

      const saleResponse = await axios.post('http://localhost:5000/api/sales/addSales', saleData);
      const saleId = saleResponse.data.id;

      // Créer une session de paiement sur votre serveur
      const sessionResponse = await axios.post('http://localhost:5000/api/sales/create-checkout-session', {
        items: cart,
        total: totalPrice,
        client_id: id,
      });

      const sessionId = sessionResponse.data.id;

      // Rediriger vers la page de paiement
      const result = await stripe.redirectToCheckout({ sessionId });

      if (result.error) {
        message.error(result.error.message);
      } else {
        // Ajouter chaque article du panier à sale_items après le paiement réussi
        for (const item of cart) {
          const saleItemData = {
            sale_id: saleId,
            frame_id: item.id,
            quantity: item.quantity,
            price: item.price
          };
          await axios.post('http://localhost:5000/api/sales/sale-items', saleItemData);
        }

        message.success('Achat enregistré avec succès !');
        form.resetFields();
        setCart([]);
        setTotalPrice(0);
      }
    } catch (error) {
      console.error(error);
      message.error('Erreur lors de l\'enregistrement de l\'achat.');
    }
  };

  const fetchRepairs = async () => {
    try {
      const response = await axios.get(`/api/repairs/${client.id}`);
      setRepairs(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des réparations', error);
    }
  };

  const handleAddRepair = async (values) => {
    console.log(JSON.stringify(values, null, 2));
    try {
      await axios.post('/api/repairs/AddRepair', { ...values, user_id, client_id: client.id });
      message.success('Réparation ajoutée avec succès');
      setIsRepairModalVisible(false);
      form.resetFields();
      fetchRepairs(); // Rafraîchir la liste des réparations
    } catch (error) {
      message.error('Erreur lors de l\'ajout de la réparation');
    }
  };

  const handleChangeReapairStatus = async (repairId, status) => {
    try {
      await axios.patch(`/api/repairs/${repairId}`, { status });
      message.success('Statut de réparation mis à jour avec succès');
      fetchRepairs(); // Rafraîchir la liste des réparations
    } catch (error) {
      message.error('Erreur lors de la mise à jour du statut de réparation');
    }
  };

  const RepairColumns = [
    { title: 'Équipement', dataIndex: 'equipment', key: 'equipment' },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        let color;
        if (text === 'Terminée' || text === 'Prête à récupérer') {
          color = 'green';
        } else if (text === 'En cours') {
          color = 'orange';
        } else {
          color = 'red';
        }
        return <span style={{ color }}>{text}</span>;
      },
    },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
    },
    {
      title: 'Date Estimée',
      dataIndex: 'estimated_completion_date',
      key: 'estimated_completion_date',
      render: (text) => {
        // Vérifiez si la date est valide avant de formater
        const date = new Date(text);
        return !isNaN(date.getTime()) ?
          `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}` :
          'Date invalide';
      },
    },
    /*{
      title: 'Actions',
      dataIndex: 'updateStatus',
      key: 'updateStatus',
      render: (_, record) => (
        <div>
          <Select placeholder="Sélectionner un statut" onChange={(value) => handleChangeReapairStatus(record.id, value)}>
            <Option value="En cours">En cours</Option>
            <Option value="Terminée">Terminée</Option>
            <Option value="En attente de pièce">En attente de pièce</Option>
          </Select>
        </div>
      ),
    },*/
  ];


  const handleViewRepair = (id) => {
    // Logique pour afficher les détails de la réparation
    console.log(`Afficher les détails de la réparation avec l'ID: ${id}`);
  };

  const handleAddAppointment = async (values) => {
    console.log(JSON.stringify(values, null, 2));
    try {
      await axios.post('/api/appointments/addAppointment', { ...values, user_id, client_id: client.id });
      message.success('Rendez-vous ajouté avec succès');
      setAppointmentModalVisible(false);
      form.resetFields();
      navigate('/calendar');
    } catch (error) {
      message.error('Erreur lors de l\'ajout de la réparation');
    }
  }

  if (loading) {
    return <Spin size="large" />;
  }

  if (!client) {
    return <p>Aucun client trouvé.</p>;
  }

  const prescriptionColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => moment(text).format('DD-MM-YYYY') // Formatage ici
    },
    { title: 'OD Sphère', dataIndex: 'right_sphere', key: 'right_sphere', prefix: <MailOutlined /> },
    { title: 'OD Cylindre', dataIndex: 'right_cylinder', key: 'right_cylinder' },
    { title: 'OD Axe', dataIndex: 'right_axis', key: 'right_axis' },
    { title: 'OG Sphère', dataIndex: 'left_sphere', key: 'left_sphere' },
    { title: 'OG Cylindre', dataIndex: 'left_cylinder', key: 'left_cylinder' },
    { title: 'OG Axe', dataIndex: 'left_axis', key: 'left_axis' },
    { title: 'Addition', dataIndex: 'add_power', key: 'add_power' },
    {
      title: 'Notes',
      dataIndex: 'notes',
      key: 'notes',
      render: (text, record) => (
        <Input.TextArea
          defaultValue={text}
          onBlur={(e) => handleSavePrescriptionNote(record.id, e.target.value)}
        />
      )
    },
  ];

  return (
    <Layout>
      <Content style={{ padding: '0 50px' }}>
        <div className="site-layout-content content">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Informations Personnelles" key="1">
              <Descriptions
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span>Détails du Client</span>
                    </div>
                    <div>
                      <Button onClick={() => setIsEditClientModalVisible(true)} style={{ margin: ' 0 10px' }}>
                        Modifier le client
                      </Button>
                      <Button onClick={() => setAppointmentModalVisible(true)}>
                        Rendez-Vous
                      </Button>
                    </div>
                  </div>
                }
                bordered
              >
                <Descriptions.Item label="Nom">{client.name}</Descriptions.Item>
                <Descriptions.Item label="Email">{client.email}</Descriptions.Item>
                <Descriptions.Item label="Téléphone">{client.phone}</Descriptions.Item>
                <Descriptions.Item label="Date de naissance">{moment(client.birth_date).format('DD-MM-YYYY')}</Descriptions.Item>
                <Descriptions.Item label="Adresse">{client.address}</Descriptions.Item>
                <Descriptions.Item label="Ville">{client.city}</Descriptions.Item>
                <Descriptions.Item label="Code Postal">{client.postal_code}</Descriptions.Item>
                <Descriptions.Item label="Dernière visite">{moment(client.last_visit_date).format('DD-MM-YYYY')}</Descriptions.Item>
                <Descriptions.Item label="Notes">{client.notes}</Descriptions.Item>
              </Descriptions>

              <h3 style={{ margin: '20px 0', fontWeight: '' }}>Historique des Achats</h3>
              <Table
                dataSource={purchaseHistory}
                columns={[
                  {
                    title: 'Date',
                    dataIndex: 'sale_date',
                    key: 'sale_date',
                    render: (text) => moment(text).format('DD-MM-YYYY')
                  },
                  {
                    title: 'Monture',
                    dataIndex: 'frame_model',
                    key: 'frame_model'
                  },
                  {
                    title: 'Quantité',
                    dataIndex: 'quantity',
                    key: 'quantity'
                  },
                  {
                    title: 'Prix Total',
                    dataIndex: 'total',
                    key: 'total',
                    render: (text) => `€${parseFloat(text).toFixed(2)}`
                  }
                ]}
                rowKey="id"
                pagination={false}
              />
            </TabPane>
            <TabPane tab="Prescriptions / Reparations" key="2">

              <Button onClick={() => setIsModalVisible(true)} style={{ marginBottom: 16 }}>
                Ajouter une prescription
              </Button>
              <Table columns={prescriptionColumns} dataSource={prescriptions} rowKey="id" />

              <h3 style={{ margin: '20px 0', fontWeight: '' }}> </h3>

              <Button onClick={() => setIsRepairModalVisible(true)}>
                Ajouter une Réparation
              </Button>
              <Table columns={RepairColumns} dataSource={repairs} rowKey="id" style={{ marginTop: '20px' }} />

            </TabPane>
            <TabPane tab="Effectuer un Achat" key="3">
              <Form form={form} layout="vertical">
                <Form.Item label="Client" initialValue={client ? client.id : null}>
                  <h3>{client.name}</h3>
                </Form.Item>

                <Form.Item name="frame_id" label="Monture" rules={[{ required: true, message: 'Champ requis' }]}>
                  <Select
                    placeholder="Sélectionner une monture"
                    onChange={(value) => {
                      const selectedFrame = frames.find(frame => frame.id === value);
                      form.setFieldsValue({ price: selectedFrame ? selectedFrame.price : 0 });
                    }}
                  >
                    {frames.map(frame => (
                      <Select.Option key={frame.id} value={frame.id}>
                        {frame.brand} - {frame.model} (${frame.price})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item name="quantity" label="Quantité" rules={[{ required: true, message: 'Champ requis' }]}>
                  <Input prefix={<TagOutlined />} type="number" placeholder="Quantité" onChange={(e) => {
                    const quantity = parseInt(e.target.value);
                    if (quantity > 0) {
                      addToCart(form.getFieldValue('frame_id'), quantity);
                    }
                  }} />
                </Form.Item>

                <h3>Articles dans le Panier :</h3>
                <Table
                  dataSource={cart}
                  columns={[
                    { title: 'Monture', dataIndex: 'model', key: 'model' },
                    { title: 'Quantité', dataIndex: 'quantity', key: 'quantity' },
                    { title: 'Prix Unitaire', dataIndex: 'price', key: 'price' },
                    { title: 'Total', render: (text, record) => record.price * record.quantity }
                  ]}
                  pagination={false}
                />

                <h3 style={{ margin: '5px' }}>Total : €{totalPrice.toFixed(2)}</h3>

                <Form.Item>
                  <Button type="primary" onClick={handlePurchase}>
                    Enregistrer l'Achat
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>

          <Modal
            title="Ajouter une prescription"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
            width={800}
          >
            <Form form={form} onFinish={handleAddPrescription}>

              <Form.Item name="date" rules={[{ required: true }]}>
                <DatePicker />
              </Form.Item>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="right_sphere" rules={[{ required: true }]}>
                    <Input placeholder="OD Sphère" prefix={<EyeOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="right_cylinder" rules={[{ required: true }]}>
                    <Input placeholder="OD Cylindre" prefix={<EyeOutlined />} />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="right_axis" rules={[{ required: true }]}>
                    <Input placeholder="OD Axe" prefix={<EyeOutlined />} />
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={16}>

                <Col span={8}>
                  <Form.Item name="left_sphere" rules={[{ required: true }]}>
                    <Input placeholder="OG Sphère" prefix={<EyeOutlined />} />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item name="left_cylinder" rules={[{ required: true }]}>
                    <Input placeholder="OG Cylindre" prefix={<EyeOutlined />} />
                  </Form.Item>
                </Col>

                <Col span={8}>
                  <Form.Item name="left_axis" rules={[{ required: true }]}>
                    <Input placeholder="OG Axe" prefix={<EyeOutlined />} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="add_power" >
                <Input placeholder="Addition" prefix={<EyeOutlined />} />
              </Form.Item>
              <Form.Item name="notes" >
                <Input.TextArea placeholder="Notes" prefix={<EyeOutlined />} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Ajouter
                </Button>
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            title="Modifier le client"
            open={isEditClientModalVisible}
            onCancel={() => setIsEditClientModalVisible(false)}
            footer={null}
            width={800}
          >
            <Layout.Content style={{}}>
              <Form
                form={editForm}
                initialValues={{
                  ...client,
                  birth_date: client.birth_date ? moment(client.birth_date) : null,
                  last_visit_date: client.last_visit_date ? moment(client.last_visit_date) : null
                }}
                onFinish={handleUpdateClient}
                layout="vertical"
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

                <Form.Item name="notes" label="Notes">
                  <Input.TextArea />
                </Form.Item>

                <Form.Item>
                  <Button htmlType="submit">
                    Mettre a jour
                  </Button>
                </Form.Item>
              </Form>
            </Layout.Content>
          </Modal>

          <Modal
            title="Ajouter une Réparation"
            open={isRepairModalVisible}
            onCancel={() => setIsRepairModalVisible(false)}
            footer={null}
          >
            <Form form={form} onFinish={handleAddRepair}>
              <Form.Item name="equipment" rules={[{ required: true, message: 'Veuillez entrer l\'équipement!' }]}>
                <Input placeholder="Équipement" />
              </Form.Item>
              <Form.Item name="notes" rules={[{ required: true, message: 'Veuillez entrer l\'équipement!' }]}>
                <Input.TextArea placeholder="Notes" />
              </Form.Item>
              {/* <Form.Item name="status" rules={[{ required: true, message: 'Veuillez sélectionner le statut!' }]}>
                <Select placeholder="Sélectionner un statut">
                  <Option value="En cours">En cours</Option>
                  <Option value="Terminée">Terminée</Option>
                  <Option value="En attente de pièce">En attente de pièce</Option>
                </Select>
              </Form.Item> */}
              <Form.Item name="estimated_completion_date" rules={[{ required: true, message: 'Veuillez entrer une date estimée!' }]}>
                <DatePicker />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                  Ajouter
                </Button>
              </Form.Item>
            </Form>
          </Modal>


          <Modal
            title="Ajouter un Rendez-vous"
            open={isAppointmentVisibile}
            onCancel={() => setAppointmentModalVisible(false)}
            footer={null}
          >
            <Form form={form} onFinish={handleAddAppointment}>

              <Form.Item name="equipment">
                <Text >Client : {client.name}</Text>
              </Form.Item>

              <Form.Item name="notes" rules={[{ required: true, message: 'Veuillez entrer une note!' }]}>
                <TextArea name="notes" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" />
              </Form.Item>

              <Form.Item name="status" rules={[{ required: true, message: 'Veuillez sélectionner le statut!' }]}>
                <Select placeholder="Sélectionner un statut">
                  <Option value="En cours">En cours</Option>
                  <Option value="Terminée">Terminée</Option>
                  <Option value="A venir" >A venir</Option>
                </Select>
              </Form.Item>

              <Form.Item name="type" rules={[{ required: true, message: 'Veuillez sélectionner le statut!' }]}>
                <Select placeholder="Sélectionner un type">
                  <Option value=".">.</Option>
                  <Option value="..">..</Option>
                  <Option value="..." >...</Option>
                </Select>
              </Form.Item>


              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item  name="estimated_completion_date" rules={[{ required: true, message: 'Veuillez entrer une date estimée!' }]}>
                    <DatePicker style={{ width: '225px'}}  />
                  </Form.Item>
                </Col>
                <Col span={12} >
                  <Form.Item style={{ width: '20px'}} name="appointment_time" rules={[{ required: true, message: 'Veuillez entrer une date estimée!' }]}>
                    <TimePicker style={{ width: '225px'}} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item>
                <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                  Ajouter
                </Button>
              </Form.Item>

            </Form>
          </Modal>
        </div>
      </Content>
    </Layout >
  );
};

export default ClientDetail;