const nodemailer = require("nodemailer");
require("dotenv").config();
const ejs = require('ejs');
const fs = require('fs');

const sendEmail = async (email, subject, to, verificationLink) => {
    try {
        const transporter = nodemailer.createTransport({
            // host: process.env.HOST,
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'lpbudgeting987@gmail.com',
                pass: 'ayaweqowerfvzosp',
            },
        });
        fs.readFile(__dirname + '/Views/verification_email.ejs', 'utf8', async (err, data) => {
            if (err) {
                console.log(err);
            } else {
                let template = ejs.compile(data);
                let html = template({verificationLink: verificationLink});
                let mailOptions = {
                    from: email,
                    to: to,
                    subject: subject,
                    html: html
                };
                await transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                        console.log("Email sent successfully");
                    }
                });
            }
        });
    } catch (error) {
        console.log("Email not sent");
        console.log(error);
    }
};

module.exports = sendEmail;
