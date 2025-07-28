import { Resend } from 'resend'

// Initialize Resend with API key, or null if not provided
const resendApiKey = import.meta.env.VITE_RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export interface WelcomeEmailData {
  email: string
  tempPassword: string
  planName: string
  loginUrl: string
}

export const emailService = {
  async sendWelcomeEmail(data: WelcomeEmailData) {
    try {
      if (!resend) {
        console.warn('Resend API key not configured. Skipping welcome email.')
        return null
      }
      
      console.log('Sending welcome email to:', data.email)
      
      const { data: result, error } = await resend.emails.send({
        from: 'WavTrack <noreply@wavtrack.com>',
        to: [data.email],
        subject: 'Welcome to WavTrack! Your account is ready 🎵',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to WavTrack</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
              .credentials { background: #e9ecef; padding: 15px; border-radius: 6px; margin: 20px 0; }
              .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎵 Welcome to WavTrack!</h1>
                <p>Your music production journey starts now</p>
              </div>
              <div class="content">
                <h2>Your account is ready!</h2>
                <p>Thank you for choosing WavTrack! Your account has been created and your <strong>${data.planName}</strong> plan is now active with a 14-day free trial.</p>
                
                <div class="credentials">
                  <h3>🔐 Your Login Details</h3>
                  <p><strong>Email:</strong> ${data.email}</p>
                  <p><strong>Temporary Password:</strong> ${data.tempPassword}</p>
                </div>
                
                <div style="text-align: center;">
                  <a href="${data.loginUrl}" class="button">🚀 Get Started Now</a>
                </div>
                
                <div class="warning">
                  <h4>⚠️ Important Security Note</h4>
                  <p>Please change your password after your first login for security.</p>
                </div>
                
                <h3>🎯 What's Next?</h3>
                <ul>
                  <li>Log in to your account</li>
                  <li>Set up your profile</li>
                  <li>Start your first music production session</li>
                  <li>Explore our AI-powered features</li>
                </ul>
                
                <p>If you have any questions, feel free to reach out to our support team.</p>
                
                <p>Happy producing! 🎼</p>
                <p><strong>The WavTrack Team</strong></p>
              </div>
            </div>
          </body>
          </html>
        `
      })

      if (error) {
        console.error('Error sending welcome email:', error)
        throw error
      }

      console.log('Welcome email sent successfully:', result)
      return result
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      throw error
    }
  },

  async sendPasswordResetEmail(email: string, resetUrl: string) {
    try {
      if (!resend) {
        console.warn('Resend API key not configured. Skipping password reset email.')
        return null
      }
      
      const { data: result, error } = await resend.emails.send({
        from: 'WavTrack <noreply@wavtrack.com>',
        to: [email],
        subject: 'Reset your WavTrack password',
        html: `
          <h2>Reset Your Password</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
        `
      })

      if (error) throw error
      return result
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      throw error
    }
  }
} 