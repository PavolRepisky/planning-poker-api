import nodemailer from 'nodemailer';
import config from './config';

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.server.email,
    pass: config.server.password,
  },
});

export default transport;
