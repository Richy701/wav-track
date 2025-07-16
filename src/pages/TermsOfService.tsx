import { BaseLayout } from '@/components/layout/BaseLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

const TermsOfService = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background dark:bg-background flex flex-col items-center justify-center relative overflow-x-hidden">
      {/* Decorative gradient bar */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-[#8257E5]/60 to-[#B490FF]/60 opacity-40 blur-2xl pointer-events-none z-0" />
      <BaseLayout containerWidth="default" withPadding={true}>
        <div className="mt-32 py-8 lg:py-16 flex flex-col items-center">
          <div className="flex flex-col items-center mb-6">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#8257E5] to-[#B490FF] shadow-lg mb-2">
              <FileText className="w-8 h-8 text-white" />
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-center text-foreground mb-2">Terms of Service</h1>
            <p className="text-muted-foreground text-center text-base mb-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          <Card className="prose dark:prose-invert max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 card-glass shadow-2xl border border-white/20 dark:border-white/10 backdrop-blur-xl">
            <CardContent className="space-y-10">
              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">1. Acceptance of Terms</h2>
                <p className="mb-4">
                  By accessing and using WavTrack ("the Service"), you accept and agree to be bound by the terms 
                  and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">2. Description of Service</h2>
                <p className="mb-4">
                  WavTrack is an audio production tracking and analysis platform that allows users to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Upload and analyze audio files</li>
                  <li>Track production sessions and progress</li>
                  <li>Generate insights and analytics</li>
                  <li>Collaborate with other producers</li>
                  <li>Access AI-powered coaching and suggestions</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">3. User Accounts</h2>
                <p className="mb-4">
                  To use certain features of the Service, you must create an account. You are responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and complete information</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">4. Acceptable Use</h2>
                <p className="mb-4">
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Upload content that violates copyright or intellectual property rights</li>
                  <li>Transmit harmful, offensive, or illegal content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Use the Service for commercial purposes without authorization</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">5. Content Ownership</h2>
                <p className="mb-4">
                  You retain ownership of the content you upload to WavTrack. By uploading content, you grant us 
                  a limited license to process, store, and analyze your content solely for the purpose of providing 
                  the Service to you.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">6. Privacy and Data</h2>
                <p className="mb-4">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use 
                  of the Service, to understand our practices regarding the collection and use of your information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">7. Service Availability</h2>
                <p className="mb-4">
                  We strive to maintain high availability of the Service, but we do not guarantee uninterrupted 
                  access. We may temporarily suspend the Service for maintenance, updates, or other operational reasons.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">8. Limitation of Liability</h2>
                <p className="mb-4">
                  To the maximum extent permitted by law, WavTrack shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, including but not limited to loss of profits, data, 
                  or use, arising out of or relating to your use of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">9. Termination</h2>
                <p className="mb-4">
                  We may terminate or suspend your account and access to the Service at any time, with or without 
                  cause, with or without notice. Upon termination, your right to use the Service will cease immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">10. Changes to Terms</h2>
                <p className="mb-4">
                  We reserve the right to modify these terms at any time. We will notify users of any material 
                  changes by posting the new terms on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">11. Governing Law</h2>
                <p className="mb-4">
                  These terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
                  without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">12. Contact Information</h2>
                <p className="mb-4">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="w-full max-w-md mx-auto border border-[#B490FF] rounded-xl shadow-lg p-6 flex flex-col items-center text-center mt-6">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#8257E5] to-[#B490FF] mb-3 shadow">
                    <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' /></svg>
                  </span>
                  <p className="font-semibold text-lg mb-1">WavTrack Support</p>
                  <p className="text-base mb-2">For legal or support questions, please <a href="mailto:wavtrack@gmail.com" className="text-[#8257E5] underline font-medium">contact us</a>.</p>
                  <p className="text-xs text-muted-foreground">We’re a small team and will reply as soon as possible!</p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </BaseLayout>
    </div>
  )
}

export default TermsOfService 