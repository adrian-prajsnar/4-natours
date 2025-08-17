import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { createTransport, type Transporter } from 'nodemailer'
import { htmlToText } from 'html-to-text'
import { renderFile } from 'pug'
import { IUser } from '../models/userModel'
import { getEnv } from './helpers'

export class Email {
  to: string
  firstName: string
  url: string
  from: string

  constructor(user: IUser, url: string) {
    this.to = user.email
    this.firstName = user.name.split(' ').at(0) ?? '-'
    this.url = url
    this.from = `Adrian Prajsnar <${getEnv('EMAIL_FROM')}>`
  }

  newTransport(): Transporter {
    if (getEnv('NODE_ENV') === 'production') {
      // Sendgrid
      // Placeholder for Sendgrid transport. Example:
      // return createTransport(sendgridTransport({ apiKey: getEnv('SENDGRID_API_KEY') }))
      // For now, fall back to SMTP transport below.
    }

    const transportConfig: SMTPTransport.Options = {
      host: getEnv('EMAIL_HOST'),
      port: parseInt(getEnv('EMAIL_PORT')),
      auth: {
        user: getEnv('EMAIL_USERNAME'),
        pass: getEnv('EMAIL_PASSWORD'),
      },
      secure: getEnv('NODE_ENV') === 'production',
      tls: {
        rejectUnauthorized: getEnv('NODE_ENV') === 'production',
      },
    }

    return createTransport(transportConfig)
  }

  // Send the actual email
  async send(template: string, subject: string) {
    // 1) Render HTML based on a pug template
    const html = renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject: subject,
    })

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: htmlToText(html),
    }

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions)
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!')
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      `Your password reset token (valid for only ${getEnv('PASSWORD_RESET_TOKEN_EXPIRATION_MINUTES')} minutes)`
    )
  }
}
