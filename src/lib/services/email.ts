export interface WelcomeEmailData {
  email: string
  tempPassword: string
  planName: string
  loginUrl: string
}

export const emailService = {
  async sendWelcomeEmail(data: WelcomeEmailData) {
    try {
      console.log('📧 [Mock Email Service] Welcome email would be sent to:', data.email)
      console.log('📧 [Mock Email Service] Email data:', {
        to: data.email,
        subject: 'Welcome to WavTrack! Your account is ready 🎵',
        planName: data.planName,
        tempPassword: data.tempPassword,
        loginUrl: data.loginUrl
      })
      
      // In a real implementation, this would send an actual email
      // For now, we just log the email details
      return { success: true, message: 'Email logged to console' }
    } catch (error) {
      console.error('Failed to log welcome email:', error)
      throw error
    }
  },

  async sendPasswordResetEmail(email: string, resetUrl: string) {
    try {
      console.log('📧 [Mock Email Service] Password reset email would be sent to:', email)
      console.log('📧 [Mock Email Service] Reset URL:', resetUrl)
      
      // In a real implementation, this would send an actual email
      // For now, we just log the email details
      return { success: true, message: 'Password reset email logged to console' }
    } catch (error) {
      console.error('Failed to log password reset email:', error)
      throw error
    }
  }
} 