import nodemailer from 'nodemailer';
import { oldConfig } from './config';

const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: oldConfig.server.email,
    pass: oldConfig.server.password,
  },
});

export default transport;
