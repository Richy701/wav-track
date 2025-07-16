import { BaseLayout } from '@/components/layout/BaseLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldCheck } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background dark:bg-background flex flex-col items-center justify-center relative overflow-x-hidden">
      {/* Decorative gradient bar */}
      <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-[#8257E5]/60 to-[#B490FF]/60 opacity-40 blur-2xl pointer-events-none z-0" />
      <BaseLayout containerWidth="default" withPadding={true}>
        <div className="mt-32 py-8 lg:py-16 flex flex-col items-center">
          <div className="flex flex-col items-center mb-6">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#8257E5] to-[#B490FF] shadow-lg mb-2">
              <ShieldCheck className="w-8 h-8 text-white" />
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-center text-foreground mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground text-center text-base mb-2">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
          <Card className="prose dark:prose-invert max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 card-glass shadow-2xl border border-white/20 dark:border-white/10 backdrop-blur-xl">
            <CardContent className="space-y-10">
              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">1. Information We Collect</h2>
                <p className="mb-4">
                  WavTrack collects information you provide directly to us, such as when you create an account, 
                  upload audio files, or contact us for support. This may include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Account information (name, email address, password)</li>
                  <li>Audio files and project data you upload</li>
                  <li>Usage data and analytics</li>
                  <li>Communication preferences</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">2. How We Use Your Information</h2>
                <p className="mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your audio files and generate insights</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Develop new features and services</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">3. Information Sharing</h2>
                <p className="mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties 
                  without your consent, except as described in this policy. We may share your information:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>With service providers who assist in our operations</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and safety</li>
                  <li>In connection with a business transfer or merger</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">4. Data Security</h2>
                <p className="mb-4">
                  We implement appropriate security measures to protect your personal information against 
                  unauthorized access, alteration, disclosure, or destruction. However, no method of 
                  transmission over the internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">5. Your Rights</h2>
                <p className="mb-4">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request data portability</li>
                  <li>Lodge a complaint with supervisory authorities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">6. Cookies and Tracking</h2>
                <p className="mb-4">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                  and provide personalized content. You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">7. Children's Privacy</h2>
                <p className="mb-4">
                  Our services are not intended for children under 13 years of age. We do not knowingly 
                  collect personal information from children under 13.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">8. Changes to This Policy</h2>
                <p className="mb-4">
                  We may update this privacy policy from time to time. We will notify you of any changes 
                  by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold mb-3 text-foreground border-l-4 border-[#8257E5] pl-3 bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 rounded">9. Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about this privacy policy, please contact us at:
                </p>
                <div className="w-full max-w-md mx-auto border border-[#B490FF] rounded-xl shadow-lg p-6 flex flex-col items-center text-center mt-6">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#8257E5] to-[#B490FF] mb-3 shadow">
                    <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' /></svg>
                  </span>
                  <p className="font-semibold text-lg mb-1">WavTrack Support</p>
                  <p className="text-base mb-2">For privacy or support questions, please <a href="mailto:wavtrack@gmail.com" className="text-[#8257E5] underline font-medium">contact us</a>.</p>
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

export default PrivacyPolicy 