import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { FileText } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

const TermsOfService = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background/50 to-background flex flex-col">
      <Header />
      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-white dark:bg-purple-950/10 bg-none dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      
      <main className="flex-1 relative z-10 pt-20 sm:pt-24">
        <div className="max-w-4xl mx-auto mobile-padding py-8 sm:py-12 lg:py-16">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#8257E5] to-[#B490FF] shadow-lg mb-6">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-foreground mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground text-center text-base sm:text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8 sm:space-y-12">
            <section className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">1.</span>
                Acceptance of Terms
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                By accessing and using WavTrack ("the Service"), you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">2.</span>
                Description of Service
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-6 text-muted-foreground">
                WavTrack is an audio production tracking and analysis platform that allows users to:
              </p>
              <ul className="space-y-3 text-base sm:text-lg leading-relaxed text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Upload and analyze audio files
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Track production sessions and progress
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Generate insights and analytics
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Collaborate with other producers
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Access AI-powered coaching and suggestions
                </li>
              </ul>
            </section>

            <section className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">3.</span>
                User Accounts
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-6 text-muted-foreground">
                To use certain features of the Service, you must create an account. You are responsible for:
              </p>
              <ul className="space-y-3 text-base sm:text-lg leading-relaxed text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Maintaining the confidentiality of your account credentials
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  All activities that occur under your account
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Providing accurate and complete information
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Notifying us immediately of any unauthorized use
                </li>
              </ul>
            </section>

            <section className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">4.</span>
                Acceptable Use
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-6 text-muted-foreground">
                You agree not to use the Service to:
              </p>
              <ul className="space-y-3 text-base sm:text-lg leading-relaxed text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Upload content that violates copyright or intellectual property rights
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Transmit harmful, offensive, or illegal content
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Attempt to gain unauthorized access to our systems
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Interfere with or disrupt the Service
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Use the Service for commercial purposes without authorization
                </li>
              </ul>
            </section>

            <section className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">5.</span>
                Content Ownership
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                You retain ownership of the content you upload to WavTrack. By uploading content, you grant us 
                a limited license to process, store, and analyze your content solely for the purpose of providing 
                the Service to you.
              </p>
            </section>

            <section className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">6.</span>
                Privacy and Data
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use 
                of the Service, to understand our practices regarding the collection and use of your information.
              </p>
            </section>

            <section className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">7.</span>
                Service Availability
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                We strive to maintain high availability of the Service, but we do not guarantee uninterrupted 
                access. We may temporarily suspend the Service for maintenance, updates, or other operational reasons.
              </p>
            </section>

            <section className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">8.</span>
                Limitation of Liability
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                To the maximum extent permitted by law, WavTrack shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including but not limited to loss of profits, data, 
                or use, arising out of or relating to your use of the Service.
              </p>
            </section>

            <section className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">9.</span>
                Termination
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                We may terminate or suspend your account and access to the Service at any time, with or without 
                cause, with or without notice. Upon termination, your right to use the Service will cease immediately.
              </p>
            </section>

            <section className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">10.</span>
                Changes to Terms
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                We reserve the right to modify these terms at any time. We will notify users of any material 
                changes by posting the new terms on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">11.</span>
                Governing Law
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                These terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section className="bg-gradient-to-br from-[#8257E5]/10 to-[#B490FF]/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-[#8257E5]/20">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">12.</span>
                Contact Information
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-8 text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-white/80 dark:bg-black/20 rounded-xl p-6 text-center border border-[#8257E5]/30">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#8257E5] to-[#B490FF] mb-4 shadow-lg">
                  <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z' /></svg>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">WavTrack Support</h3>
                <p className="text-base mb-2 text-muted-foreground">
                  For legal or support questions, please{' '}
                  <a href="mailto:wavtrack@gmail.com" className="text-[#8257E5] hover:text-[#B490FF] underline font-medium transition-colors">
                    contact us
                  </a>.
                </p>
                <p className="text-sm text-muted-foreground">We're a small team and will reply as soon as possible!</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default TermsOfService