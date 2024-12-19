const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const { Recipient, EmailParams, MailerSend } = require("mailersend");
const dotenv = require('dotenv');

dotenv.config();

const mailersend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY,
});

const sendEmail = async (to, subject, htmlContent, textContent) => {
    const recipients = [new Recipient(to)];

    const emailParams = new EmailParams()
        .setFrom(process.env.SENDER_EMAIL)
        .setTo(recipients)
        .setSubject(subject)
        .setHtml(htmlContent)
        .setText(textContent);
    try {
        await mailersend.email.send(emailParams);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Email sending failed');
    }
};

module.exports = { sendEmail };
