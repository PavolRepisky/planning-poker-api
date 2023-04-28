import { Prisma } from '@prisma/client';
import config from 'config';
import { Request } from 'express';
import { convert } from 'html-to-text';
import nodemailer from 'nodemailer';
import pug from 'pug';

const smtp = config.get<{
  host: string;
  port: number;
  user: string;
  pass: string;
}>('smtp');

export default class Email {
  private firstName: string;
  private to: string;
  private from: string;

  constructor(user: Prisma.UserCreateInput, private url: string) {
    this.firstName = user.firstName;
    this.to = user.email;
    this.from = smtp.user;
  }

  private newTransport() {
    return nodemailer.createTransport({
      ...smtp,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });
  }

  private async send(template: string, subject: string) {
    const html = pug.renderFile(`${__dirname}/../views/${template}.pug`, {
      firstName: this.firstName,
      subject,
      url: this.url,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: convert(html),
      html,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendVerificationCode(req: Request) {
    await this.send(
      `verificationCode_${
        req.headers['accept-language']?.toLowerCase() ?? 'en'
      }`,
      req.t('email.verify.subject')
    );
  }
}
