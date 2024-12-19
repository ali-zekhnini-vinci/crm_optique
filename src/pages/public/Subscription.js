import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { message } from 'antd';
import { motion } from 'framer-motion';

const Subscription = () => {
    const [plans, setPlans] = useState([]);
    const navigate = useNavigate();

    const handleRegister = (buyNowUrl) => {
        try {
            window.location.href = buyNowUrl;
        } catch (err) {
            message.error('Erreur lors de la création de la session de paiement');
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/lemon/products');
            const products = res.data.map(product => ({
                ...product,
                attributes: {
                    ...product.attributes,
                    features: getFeaturesForPlan(product.attributes.name)
                }
            }));
            setPlans(products);
        } catch (err) {
            console.error('Erreur lors de la récupération des produits:', err.message);
        }
    };

    const getFeaturesForPlan = (planName) => {
        const features = {
            "Plan Basic": [
                { name: "Gestion de base des clients", available: true },
                { name: "Suivi limité des stocks", available: true },
                { name: "Enregistrement des ventes", available: true },
                { name: "Rapport mensuel simple", available: true },
                { name: "Support par email", available: true },
                { name: "Gestion multi-sites", available: false },
                { name: "Intégration comptable", available: false },
                { name: "Outils de marketing avancés", available: false },
                { name: "Rapports personnalisés", available: false },
                { name: "Assistance technique dédiée", available: false },
                { name: "Mises à jour prioritaires", available: false },
                { name: "Formation incluse", available: false }
            ],
            "Plan Pro": [
                { name: "Gestion de base des clients", available: true },
                { name: "Suivi limité des stocks", available: true },
                { name: "Enregistrement des ventes", available: true },
                { name: "Rapport mensuel simple", available: true },
                { name: "Support par email", available: true },
                { name: "Gestion multi-sites", available: true },
                { name: "Intégration comptable", available: true },
                { name: "Outils de marketing avancés", available: true },
                { name: "Rapports personnalisés", available: true },
                { name: "Assistance technique dédiée", available: true },
                { name: "Mises à jour prioritaires", available: true },
                { name: "Formation incluse", available: false }
            ],
            "Plan Entreprise": [
                { name: "Gestion de base des clients", available: true },
                { name: "Suivi limité des stocks", available: true },
                { name: "Enregistrement des ventes", available: true },
                { name: "Rapport mensuel simple", available: true },
                { name: "Support par email", available: true },
                { name: "Gestion multi-sites", available: true },
                { name: "Intégration comptable", available: true },
                { name: "Outils de marketing avancés", available: true },
                { name: "Rapports personnalisés", available: true },
                { name: "Assistance technique dédiée", available: true },
                { name: "Mises à jour prioritaires", available: true },
                { name: "Formation incluse", available: true }
            ]
        };
        return features[planName] || [];
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div className="flex flex-wrap justify-center items-center min-h-screen max-h-[90vh]">
            {plans.map((plan, index) => (
                <motion.div
                    key={plan.id}
                    className="w-full max-w-xs p-3 bg-white border border-gray-200 rounded-lg shadow sm:p-6 m-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <h5 className="mb-2 text-lg font-medium text-gray-500">{plan.attributes.name}</h5>
                    <div className="flex items-baseline text-gray-900">
                        <span className="text-2xl font-semibold">€</span>
                        <span className="text-4xl font-extrabold tracking-tight">{(plan.attributes.price / 100).toFixed(2)}</span>
                        <span className="ms-1 text-lg font-normal text-gray-500">/mois</span>
                    </div>
                    <ul role="list" className="space-y-3 my-5">
                        {plan.attributes.features.map((feature, index) => (
                            <li key={index} className={`flex items-center ${!feature.available ? 'line-through decoration-gray-500' : ''}`}>
                                <FontAwesomeIcon
                                    icon={feature.available ? faCheckCircle : faTimesCircle}
                                    className={`flex-shrink-0 w-3 h-3 ${feature.available ? 'text-blue-700' : 'text-gray-400'}`}
                                />
                                <span className="text-sm font-normal leading-tight text-gray-500 ms-2">{feature.name}</span>
                            </li>
                        ))}
                    </ul>
                    <button
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-200 font-medium rounded-lg text-xs px-4 py-2 inline-flex justify-center w-full text-center"
                        onClick={() => handleRegister(plan.attributes.buy_now_url)}
                    >
                        Choisir le plan
                    </button>
                </motion.div>
            ))}
        </div>
    );
};

export default Subscription;