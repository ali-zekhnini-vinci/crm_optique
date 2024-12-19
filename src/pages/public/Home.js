import React, { useEffect } from 'react';
import { Layout, Typography, Button, Row, Col, Divider, Card, Space, Avatar } from 'antd';
import { CheckCircleOutlined, RocketOutlined, TeamOutlined, BarChartOutlined } from '@ant-design/icons';
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import logo from '../../assets/logo.jpg';
import { Link } from 'react-router-dom';

const { Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const AnimatedElement = ({ children }) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 }
      }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

const Home = () => {
  const features = [
    { icon: <TeamOutlined />, title: "Gestion des clients", description: "Gérez efficacement vos clients et leurs informations avec une interface intuitive." },
    { icon: <BarChartOutlined />, title: "Analyses avancées", description: "Obtenez des insights précieux sur vos ventes et votre performance grâce à des rapports détaillés." },
    { icon: <RocketOutlined />, title: "Optimisation des processus", description: "Améliorez votre efficacité opérationnelle grâce à nos outils automatisés." },
  ];

  const plans = [
    {
      name: 'Basic',
      priceMonthly: '19.99€',
      description: 'Gestion des clients et support par email.',
      features: ['Gestion des clients', 'Suivi des prescriptions', 'Support par email'],
    },
    {
      name: 'Pro',
      priceMonthly: '39.99€',
      description: 'Toutes les fonctionnalités Basic et gestion des stocks.',
      features: ['Toutes les fonctionnalités Basic', 'Gestion des stocks', 'Rapports avancés', 'Support prioritaire'],
    },
    {
      name: 'Enterprise',
      priceMonthly: '99.99€',
      description: 'API personnalisée et support dédié.',
      features: ['Toutes les fonctionnalités Pro', 'API personnalisée', 'Gestion multi-magasins', 'Support dédié 24/7'],
    },
  ];

  return (
    <Layout>
      <Content>
        {/* Section Héros */}
        <div style={{ padding: '10px 50px', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <AnimatedElement>
                <Title>CRM Optique - Optimisez la gestion de votre magasin d'optique</Title>
                <Paragraph>
                  Notre solution CRM spécialisée pour les opticiens vous permet de gérer efficacement vos clients, prescriptions, stocks et ventes en un seul endroit.
                </Paragraph>
                <Link to="/subscription">
                  <Button type="primary" size="large">Commencer maintenant</Button>
                </Link>
              </AnimatedElement>
            </Col>
            <Col xs={24} md={12}>
              <AnimatedElement>
                <img src={logo} alt="CRM Optique" style={{ width: '100%', borderRadius: '8px' }} />
              </AnimatedElement>
            </Col>
          </Row>
        </div>

        <Divider />

        {/* Section Fonctionnalités */}
        <div style={{ padding: '10px 50px', minHeight: '100vh' }}>
          <AnimatedElement>
            <Title level={2} style={{ textAlign: 'center' }}>Fonctionnalités principales</Title>
          </AnimatedElement>
          <Row gutter={[32, 32]} style={{ marginTop: '40px' }}>
            {features.map((feature, index) => (
              <Col xs={24} md={8} key={index}>
                <AnimatedElement>
                  <Card hoverable style={{ height: '100%' }}>
                    <Space direction="vertical" align="center" style={{ width: '100%' }}>
                      <Avatar size={64} icon={feature.icon} />
                      <Title level={4}>{feature.title}</Title>
                      <Paragraph style={{ textAlign: 'center' }}>{feature.description}</Paragraph>
                    </Space>
                  </Card>
                </AnimatedElement>
              </Col>
            ))}
          </Row>
        </div>

        <Divider />

        <div style={{ padding: '10px 50px', minHeight: '100vh' }}>
          <AnimatedElement>
            <Title level={2} className="text-center">Nos offres d'abonnement</Title>
          </AnimatedElement>
          <Row gutter={[16, 16]} justify="center" style={{ marginTop: '40px' }}>
            {plans.map((plan, index) => (
              <Col xs={24} md={8} key={index}>
                <AnimatedElement>
                  <div className="w-full max-w-sm p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-8">
                    <h5 className="mb-4 text-xl font-medium text-gray-500">{plan.name}</h5>
                    <div className="flex items-baseline text-gray-900">
                      <span className="text-3xl font-semibold">€</span>
                      <span className="text-5xl font-bold tracking-tight">{plan.priceMonthly}</span>
                      <span className="ms-1 text-xl font-normal text-gray-500">/mois</span>
                    </div>
                    <p className="mt-2 text-base font-normal leading-tight text-gray-500">{plan.description}</p>
                    <ul role="list" className="space-y-5 my-7">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center">
                          <CheckCircleOutlined className="flex-shrink-0 w-4 h-4 text-blue-700" />
                          <span className="text-base font-normal leading-tight text-gray-500 ms-3">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button type="primary" block>Choisir ce plan</Button>
                  </div>
                </AnimatedElement>
              </Col>
            ))}
          </Row>
        </div>

        {/* Section Témoignages */}
        <div style={{ padding: '60px 50px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} md={12}>
              <AnimatedElement>
                <img src="/path-to-testimonial-image.jpg" alt="Témoignage client" style={{ width: '100%', borderRadius: '8px' }} />
              </AnimatedElement>
            </Col>
            <Col xs={24} md={12}>
              <AnimatedElement>
                <Title level={2}>Ce que disent nos clients</Title>
                <Paragraph>
                  "Depuis que nous utilisons CRM Optique, notre efficacité a considérablement augmenté. La gestion de nos clients et de nos stocks n'a jamais été aussi simple !"
                </Paragraph>
                <Paragraph strong>- Marie Dupont, Opticienne à Paris</Paragraph>
              </AnimatedElement>
            </Col>
          </Row>
        </div>

      </Content>

      {/* Footer */}
      <Footer style={{ textAlign: 'center', backgroundColor: '#001529', color: '#fff', paddingTop: '40px', paddingBottom: '40px' }}>
        © 2024 CRM Optique. Tous droits réservés.
      </Footer>

    </Layout>
  );
};

export default Home;