import React, { useState, useEffect } from 'react';
import { Calendar, Modal, Button, Badge, Layout, Typography, message } from 'antd';
import axios from 'axios';
import moment from 'moment';

const { Content } = Layout;
const { Title } = Typography;

const AppointmentCalendar = () => {
    const [appointments, setAppointments] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await axios.get('/api/appointments');
            console.log('Données reçues :', response.data);
            const formattedAppointments = response.data.map((appointment) => ({
                ...appointment,
                date: moment(appointment.date).format('YYYY-MM-DD'),
                time: moment(appointment.time, 'HH:mm').format('HH:mm'),
            }));
            setAppointments(formattedAppointments);
        } catch (error) {
            console.error('Erreur lors de la récupération des rendez-vous', error);
            message.error('Erreur lors de la récupération des rendez-vous');
        }
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const dateCellRender = (date) => {
        const formattedDate = date.format('YYYY-MM-DD');
        const dayAppointments = appointments.filter(
            (appointment) => appointment.date === formattedDate
        );

        return (
            <ul className="events">
                {dayAppointments.map((item) => (
                    <li key={item.id}>
                        {item.status === 'En cours' ? (
                            <Badge status="processing" text={`${item.name} `} />
                        ) : item.status === 'Terminée' ? (
                            <Badge status="success" text={`${item.name} `} />
                        ) : (
                            <Badge status="warning" text={`${item.name} `} />
                        )}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <Layout>
            <Content style={{ padding: '50px' }} className="content">
                <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>
                    Calendrier des Rendez-vous
                </Title>
                <Calendar
                    cellRender={dateCellRender}
                    onSelect={handleDateClick}
                />
                <Modal
                    title={`Rendez-vous du ${selectedDate ? selectedDate.format('YYYY-MM-DD') : ''}`}
                    open={isModalVisible}
                    onCancel={handleCancel}
                    footer={[
                        <Button key="close" onClick={handleCancel}>
                            Fermer
                        </Button>,
                    ]}
                >
                    {selectedDate && (
                        <div>
                            <h3>Détails des rendez-vous :</h3>
                            <ul>
                                {appointments.filter(appointment => appointment.date === selectedDate.format('YYYY-MM-DD'))
                                    .map(appointment => (
                                        <li key={appointment.id}>
                                            {appointment.status === 'En cours' ? (
                                                <Badge status="processing" text={
                                                    <a href={`/clients/${appointment.client_id}`}>
                                                        {appointment.name}
                                                    </a>
                                                } />
                                            ) : appointment.status === 'Terminée' ? (
                                                <Badge status="success" text={
                                                    <a href={`/clients/${appointment.client_id}`}>
                                                        {appointment.name}
                                                    </a>
                                                } />
                                            ) : (
                                                <Badge status="warning" text={
                                                    <a href={`/clients/${appointment.client_id}`}>
                                                        {appointment.name}
                                                    </a>
                                                } />
                                            )}
                                            - {appointment.notes} - {appointment.date} à {appointment.time}
                                        </li>
                                    ))}
                            </ul>
                        </div>
                    )}
                </Modal>
            </Content>
        </Layout>
    );
};

export default AppointmentCalendar;
