import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Layout, Upload, Select, InputNumber, Table, Button, Spin, message, Tabs, Form, Row, Col, Input, Card, Typography } from 'antd';
import { DatePicker } from 'antd';
import { AppstoreOutlined, ColumnWidthOutlined, InboxOutlined, TagOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { TabPane } = Tabs;
const { Content } = Layout;
const { Dragger } = Upload;
const { Text } = Typography;

const StockPage = () => {
  const [loading, setLoading] = useState(true);
  const [stocks, setStocks] = useState([]); // Initialisation avec un tableau vide
  const [frames, setFrames] = useState([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/stocks'); // Assurez-vous que l'URL est correcte
      setStocks(response.data || []); // Utilisez un tableau vide si response.data est undefined
      setLoading(false);
    } catch (error) {
      message.error('Erreur lors de la récupération des stocks');
      setLoading(false);
    }
  };

  const handleAddFrame = async (values) => {
    setLoading(true);
    try {
      const { image, ...frameData } = values;

      // Convertir l'image en base64
      const imageBase64 = await toBase64(image.file.originFileObj);

      const payload = { ...frameData, image: imageBase64 };

      const response = await axios.post('http://localhost:5000/api/frames/AddFrames', payload, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      if (response.status === 200) {
        message.success('Monture ajoutée avec succès !');
        form.resetFields();
        fetchStocks(); // Recharger les stocks après ajout
        navigate('/stocks');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la monture:', error);
      message.error('Erreur lors de l\'ajout de la monture. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

  const columns = [
    {
      title: 'Marque',
      dataIndex: 'brand',
      key: 'brand',
    },
    {
      title: 'Modèle',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Couleur',
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: 'Taille',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Prix',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Coût',
      dataIndex: 'cost',
      key: 'cost',
    },
    {
      title: 'Catégories',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      key: 'stock',
      render: (stock) => {
        let color = 'green';
        if (stock < 50) {
          color = 'red';
        } else if (stock < 100) {
          color = 'orange';
        }
        return <Text style={{ color }}>{stock}</Text>;
      },
    },
  ];

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <Layout className='content'>
      <Content>
        <div className="site-layout-content">
          <Tabs defaultActiveKey="1">
            <TabPane tab="Liste des Stocks" key="1">
              <Table columns={columns} dataSource={stocks} rowKey="id" />
            </TabPane>
            <TabPane tab="Ajouter une Monture" key="2">
              <Layout.Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Card title="Ajouter une nouvelle monture" bordered={false}
                  style={{
                    maxWidth: 800,
                    width: '100%', // Assure que le card ne dépasse pas la largeur de l'écran
                    margin: ' 0 24px', // Ajoute un peu d'espace autour du card
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  }}>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleAddFrame}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="brand" label="Marque" rules={[{ required: true, message: 'Champ requis' }]}>
                          <Input prefix={<TagOutlined />} placeholder="Ex: Ray-Ban" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="model" label="Modèle" rules={[{ required: true, message: 'Champ requis' }]}>
                          <Input prefix={<AppstoreOutlined />} placeholder="Ex: Aviator" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="color" label="Couleur" rules={[{ required: true, message: 'Champ requis' }]}>
                          <Select placeholder="Sélectionner une couleur">
                            <Select.Option value="noir">Noir</Select.Option>
                            <Select.Option value="marron">Marron</Select.Option>
                            <Select.Option value="transparent">Transparent</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="material" label="Matériau" rules={[{ required: true, message: 'Champ requis' }]}>
                          <Select placeholder="Sélectionner un matériau">
                            <Select.Option value="acetate">Acétate</Select.Option>
                            <Select.Option value="metal">Métal</Select.Option>
                            <Select.Option value="mixte">Mixte</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="category" label="Catégorie" rules={[{ required: true, message: 'Champ requis' }]}>
                          <Select placeholder="Sélectionner une catégorie">
                            <Select.Option value="Vue">Lunettes de Vue</Select.Option>
                            <Select.Option value="Soleil">Lunettes de Soleil</Select.Option>
                            <Select.Option value="Sport">Lunettes de Sport</Select.Option>
                            <Select.Option value="Lecture">Lunettes de Lecture</Select.Option>
                            <Select.Option value="Ordinateur">Lunettes d'Ordinateur</Select.Option>
                            <Select.Option value="Fashion">Lunettes Fashion</Select.Option>
                            <Select.Option value="Enfant">Montures Enfant</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="size" label="Taille" rules={[{ required: true, message: 'Champ requis' }]}>
                          <Input prefix={<ColumnWidthOutlined />} placeholder="Ex: 52-18-145" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item name="price" label="Prix" rules={[{ required: true, message: 'Champ requis' }]}>
                          <InputNumber style={{ width: '100%' }} placeholder="Prix" min={0} formatter={value => `€ ${value}`} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="cost" label="Coût" rules={[{ required: true, message: 'Champ requis' }]}>
                          <InputNumber style={{ width: '100%' }} placeholder="Coût" min={0} formatter={value => `€ ${value}`} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item name="stock" label="Stock" rules={[{ required: true, message: 'Champ requis' }]}>
                          <InputNumber style={{ width: '100%' }} placeholder="Quantité en stock" min={0} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name="image" label="Image de la monture" rules={[{ required: false, message: 'Champ requis' }]}>
                      <Dragger name="files" multiple={false} accept="image/*">
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Cliquez ou glissez une image ici</p>
                      </Dragger>
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit" block>Ajouter la monture</Button>
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

export default StockPage;