import nodemailer from 'nodemailer'
import { SendEmailCommand } from '@aws-sdk/client-sesv2'
import { sesClient } from './ses.client'

export const transporter = nodemailer.createTransport({
  SES: { sesClient, SendEmailCommand },
})
