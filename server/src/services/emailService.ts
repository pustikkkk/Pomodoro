// Sends transactional email via SendGrid. API key is set once at module load time.
import sgMail from '@sendgrid/mail'
import { env } from '../config/env.js'

sgMail.setApiKey(env.SENDGRID_API_KEY)

export async function sendVerificationCode(to: string, code: string): Promise<void> {
  await sgMail.send({
    to,
    from: env.SENDGRID_FROM_EMAIL,
    subject: 'Your Pomodoro verification code',
    text: `Your verification code is: ${code}\n\nIt expires in 5 minutes.`,
    html: `
      <div style="background: linear-gradient(135deg, #ffb347, #ffcc33, #ff8c66, #c471ed); padding: 48px 24px; min-height: 100%;">
        <div style="font-family: 'Courier New', monospace; max-width: 440px; margin: 0 auto; background: rgba(255,255,255,0.45); border: 1px solid rgba(0,0,0,0.08); border-radius: 24px; padding: 40px; text-align: center;">
          <p style="font-weight: 700; font-size: 13px; letter-spacing: 4px; color: #000; margin: 0 0 32px;">POMODORO</p>
          <p style="color: #000; font-size: 15px; margin: 0 0 8px;">Your verification code</p>
          <p style="color: rgba(0,0,0,0.5); font-size: 12px; margin: 0 0 32px;">Expires in 5 minutes</p>
          <div style="font-size: 40px; font-weight: 700; letter-spacing: 12px; color: #000; background: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; padding: 20px 24px; margin: 0 0 32px; display: inline-block;">${code}</div>
          <p style="color: rgba(0,0,0,0.4); font-size: 11px; margin: 0;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  })
}
