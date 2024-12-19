import React, { useState, useEffect } from 'react';
import { Layout, Table, Badge, Button, Modal, Form, Input, Select, message } from 'antd';
import { ToolOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Content } = Layout;
const { Option } = Select;

const TechnicianRepairDashboard = () => {
    const [repairs, setRepairs] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedRepair, setSelectedRepair] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchRepairs();
        // Mettre en place un intervalle pour rafraîchir les réparations toutes les 5 minutes
        const interval = setInterval(fetchRepairs, 300000);
        return () => clearInterval(interval);
    }, []);

    const fetchRepairs = async () => {
        try {
            const response = await axios.get('/api/repairs');
            setRepairs(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des réparations', error);
            message.error('Impossible de charger les réparations');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Client',
            dataIndex: 'client_name',
            key: 'client_name',
            sorter: (a, b) => a.client_name.localeCompare(b.client_name),
            filters: [
                ...new Set(repairs.map(repair => repair.client_name))
            ].map(client => ({ text: client, value: client })),
            render: (client_name, record) => (
                <a href={`/clients/${record.client_id}`}>{client_name}</a>
            ),
        },
        {
            title: 'Client ID',
            dataIndex: 'client_id',
            key: 'client_id',
            render: (client_id) => (
                <a href={`/clients/${client_id}`}>{client_id}</a>
            ),
        },
        {
            title: 'Équipement',
            dataIndex: 'equipment',
            key: 'equipment',
        },
        {
            title: 'Statut',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'En attente', value: 'En attente' },
                { text: 'En cours', value: 'En cours' },
                { text: 'Terminée', value: 'Terminée' },
                { text: 'Prête à récupérer', value: 'Prête à récupérer' },
                { text: 'En attente de pièce', value: 'En attente de pièce' },
            ],
            onFilter: (value, record) => record.status === value,
            render: (status) => (
                <Badge
                    status={
                        status === 'En attente'
                            ? 'warning'
                            : status === 'En cours'
                                ? 'processing'
                                : status === 'Terminée'
                                    ? 'success'
                                    : status === 'Prête à récupérer'
                                        ? 'success'
                                        : status === 'En attente de pièce'
                                            ? 'error'
                                            : 'default'
                    }
                    text={status}
                />
            ),
        },
        {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Button onClick={() => showRepairDetails(record)}>
                    Voir détails
                </Button>
            ),
        },
    ];

    const showRepairDetails = (repair) => {
        setSelectedRepair(repair);
        setIsModalVisible(true);
        form.setFieldsValue(repair);
    };

    const handleUpdateRepair = async (values) => {
        try {
            await axios.patch(`/api/repairs/${selectedRepair.id}`, values);
            message.success('Réparation mise à jour avec succès');
            setIsModalVisible(false);
            fetchRepairs();
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la réparation', error);
            message.error('Impossible de mettre à jour la réparation');
        }
    };

    return (
        <Layout className="content">
            <Content style={{ padding: '20px' }}>
                <h1><ToolOutlined /> Tableau de bord des réparations</h1>
                <Table
                    columns={columns}
                    dataSource={repairs}
                    rowKey="id"
                    onChange={(pagination, filters, sorter) => {
                        console.log({ pagination, filters, sorter });
                    }
                }
                />

                <Modal
                    title="Détails de la réparation"
                    visible={isModalVisible}
                    onCancel={() => setIsModalVisible(false)}
                    footer={null}
                >
                    <Form form={form} onFinish={handleUpdateRepair}>
                        <Form.Item name="status" label="Statut">
                            <Select>
                                <Option value="En attente"> <Badge status='warning' text='En attente' /></Option>
                                <Option value="En cours"><Badge status='processing' text='En cours' /></Option>
                                <Option value="Terminée"><Badge status='success' text='Terminée' /></Option>
                                <Option value="Prête à récupérer"><Badge status='success' text='Prête à récupérer' /></Option>
                                <Option value="En attente de pièce"><Badge status='error' text='En attente de pièce' /></Option>
                            </Select>
                        </Form.Item>
                        <Form.Item name="notes" label="Notes">
                            <Input.TextArea />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Mettre à jour
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </Content>
        </Layout>
    );
};

export default TechnicianRepairDashboard;
