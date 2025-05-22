import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { createTransport } from 'nodemailer'
import { getEnv } from './helpers'

const sendEmail = async (options: {
  email: string
  subject: string
  message: string
}): Promise<void> => {
  // 1) Create a transporter
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

  const transporter = createTransport(transportConfig)

  // 2) Define the email options
  const mailOptions = {
    from: 'Adrian Prajsnar <hello@adrian.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  // 3) Actually send the email
  await transporter.sendMail(mailOptions)
}

export default sendEmail
