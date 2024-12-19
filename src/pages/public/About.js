import React from 'react';
import { Layout, Typography, Row, Col, Card, Button, Timeline, Divider, Collapse } from 'antd';
import { EyeOutlined, HeartOutlined, RocketOutlined, CheckCircleOutlined, BulbOutlined, TeamOutlined, GlobalOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import aboutImage from '../../assets/logo.jpg';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const cardAnimation = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const AboutPage = () => {
    return (
        <Layout className="about-page">
            <Content style={{ padding: '50px 50px' }}>
                <section style={{ minHeight: '100vh' }}>
                    {/* Titre principal avec animation */}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 1 } }}>
                        <Title level={1} style={{ textAlign: 'center', color: '#1890ff' }}>À propos de CRM Optique</Title>
                    </motion.div>

                    {/* Image avec animation */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1, transition: { duration: 1 } }}
                        style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}
                    >
                        <img
                            src={aboutImage}
                            alt="CRM Optique"
                            style={{ width: '100%', maxWidth: '550px', borderRadius: '10px' }}
                        />
                    </motion.div>

                    {/* Paragraphes introductifs */}
                    <motion.div initial="hidden" animate="visible" variants={cardAnimation}>
                        <Paragraph style={{ fontSize: '18px', lineHeight: '1.6', textAlign: 'justify' }}>
                            CRM Optique est né de la passion pour l'innovation et de l'engagement envers l'excellence dans le domaine de l'optique. Notre mission est de révolutionner la gestion des opticiens en fournissant des solutions technologiques de pointe.
                        </Paragraph>
                        <Paragraph style={{ fontSize: '18px', lineHeight: '1.6', textAlign: 'justify' }}>
                            Fondée par une équipe d'experts en optique et en technologie, CRM Optique s'engage à améliorer l'efficacité opérationnelle des professionnels de l'optique tout en offrant une expérience client exceptionnelle.
                        </Paragraph>
                    </motion.div>
                </section>
                <Divider />
                <section style={{ minHeight: '100vh',padding: '40px 0' }}>
                    <Row gutter={[24, 24]} justify="center" align="middle">
                        {[
                            { title: 'Notre Vision', icon: <EyeOutlined />, description: "Transformer l'industrie optique grâce à des solutions numériques innovantes." },
                            { title: 'Notre Mission', icon: <HeartOutlined />, description: 'Offrir aux opticiens les outils nécessaires pour exceller dans un monde numérique en constante évolution.' },
                            { title: 'Notre Engagement', icon: <RocketOutlined />, description: 'Fournir un service client exceptionnel et des solutions technologiques de pointe.' },
                            { title: 'Notre Innovation', icon: <BulbOutlined />, description: 'Développer constamment de nouvelles fonctionnalités pour rester à la pointe de la technologie.' },
                            { title: 'Notre Équipe', icon: <TeamOutlined />, description: 'Une équipe passionnée et expérimentée dédiée à votre réussite.' },
                            { title: 'Notre Futur', icon: <GlobalOutlined />, description: "Étendre notre présence à l'international pour servir les opticiens du monde entier." },
                        ].map((item, index) => (
                            <Col xs={24} sm={12} md={8} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                >
                                    <Card
                                        hoverable
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            borderRadius: '15px',
                                            textAlign: 'center',
                                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                                            overflow: 'hidden',
                                            height: '100%',
                                        }}
                                    >
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            style={{ fontSize: '48px', marginBottom: '20px', color: '#1890ff' }}
                                        >
                                            {item.icon}
                                        </motion.div>
                                        <Title level={4} style={{ color: '#1890ff' }}>{item.title}</Title>
                                        <Paragraph>{item.description}</Paragraph>
                                    </Card>
                                </motion.div>
                            </Col>
                        ))}
                    </Row>
                </section>

                {/* Timeline avec animation */}
                <Divider />
                <motion.div initial="hidden" animate="visible" variants={cardAnimation}>
                    <Title level={2} style={{ marginTop: '60px', color: '#1890ff' }}>Notre Histoire</Title>
                    <Timeline style={{ marginTop: '40px' }}>
                        <Timeline.Item color="green">2018 : Fondation de CRM Optique par une équipe d'experts.</Timeline.Item>
                        <Timeline.Item color="green">2019 : Lancement de notre première plateforme CRM.</Timeline.Item>
                        <Timeline.Item color="green">2020 : Ajout de fonctionnalités de gestion des stocks et rendez-vous.</Timeline.Item>
                        <Timeline.Item color="green">2021 : Intégration de l'IA pour recommandations personnalisées.</Timeline.Item>
                        <Timeline.Item color="blue">Aujourd'hui : Leader du marché, servant des milliers d'opticiens.</Timeline.Item>
                    </Timeline>
                </motion.div>

                {/* Call-to-action */}
                <Divider />
                <motion.div initial="hidden" animate="visible" variants={cardAnimation} style={{ textAlign: 'center', marginTop: '60px' }}>
                    <Title level={2}>Prêt à Transformer Votre Activité ?</Title>
                    <Paragraph>Rejoignez les milliers d'opticiens qui ont adopté CRM Optique.</Paragraph>
                    <Button type="primary" size="large" style={{ backgroundColor: '#1890ff' }}>
                        Commencer Votre Essai Gratuit
                    </Button>
                </motion.div>
            </Content>
        </Layout>
    );
};

export default AboutPage;
