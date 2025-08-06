import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { ShieldCheck } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'

const PrivacyPolicy = () => {
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
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-foreground mb-4">
              Privacy Policy
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
                Information We Collect
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-6 text-muted-foreground">
                WavTrack collects information you provide directly to us, such as when you create an account, 
                upload audio files, or contact us for support. This may include:
              </p>
              <ul className="space-y-3 text-base sm:text-lg leading-relaxed text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Account information (name, email address, password)
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Audio files and project data you upload
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Usage data and analytics
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Communication preferences
                </li>
              </ul>
            </section>

            <section className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">2.</span>
                How We Use Your Information
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-6 text-muted-foreground">
                We use the information we collect to:
              </p>
              <ul className="space-y-3 text-base sm:text-lg leading-relaxed text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Provide, maintain, and improve our services
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Process your audio files and generate insights
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Send you technical notices and support messages
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Respond to your comments and questions
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Develop new features and services
                </li>
              </ul>
            </section>

            <section className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">3.</span>
                Information Sharing
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-6 text-muted-foreground">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except as described in this policy. We may share your information:
              </p>
              <ul className="space-y-3 text-base sm:text-lg leading-relaxed text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  With service providers who assist in our operations
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  To comply with legal obligations
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  To protect our rights and safety
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  In connection with a business transfer or merger
                </li>
              </ul>
            </section>

            <section className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">4.</span>
                Data Security
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. However, no method of 
                transmission over the internet is 100% secure.
              </p>
            </section>

            <section className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">5.</span>
                Your Rights
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-6 text-muted-foreground">
                You have the right to:
              </p>
              <ul className="space-y-3 text-base sm:text-lg leading-relaxed text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Access and update your personal information
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Delete your account and associated data
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Opt out of marketing communications
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Request data portability
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 bg-[#8257E5] rounded-full mt-3 flex-shrink-0"></span>
                  Lodge a complaint with supervisory authorities
                </li>
              </ul>
            </section>

            <section className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">6.</span>
                Cookies and Tracking
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
                and provide personalized content. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">7.</span>
                Children's Privacy
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                Our services are not intended for children under 13 years of age. We do not knowingly 
                collect personal information from children under 13.
              </p>
            </section>

            <section className="bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-white/10">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">8.</span>
                Changes to This Policy
              </h2>
              <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
                We may update this privacy policy from time to time. We will notify you of any changes 
                by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="bg-gradient-to-br from-[#8257E5]/10 to-[#B490FF]/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-[#8257E5]/20">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground flex items-center gap-3">
                <span className="text-[#8257E5]">9.</span>
                Contact Us
              </h2>
              <p className="text-base sm:text-lg leading-relaxed mb-8 text-muted-foreground">
                If you have any questions about this privacy policy, please contact us:
              </p>
              <div className="bg-white/80 dark:bg-black/20 rounded-xl p-6 text-center border border-[#8257E5]/30">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#8257E5] to-[#B490FF] mb-4 shadow-lg">
                  <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z' /></svg>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">WavTrack Support</h3>
                <p className="text-base mb-2 text-muted-foreground">
                  For privacy or support questions, please{' '}
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

export default PrivacyPolicy