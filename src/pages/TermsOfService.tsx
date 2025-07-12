import { BaseLayout } from '@/components/layout/BaseLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const TermsOfService = () => {
  return (
    <BaseLayout containerWidth="default" withPadding={true}>
      <div className="mt-28 py-8 lg:py-12">
        <Card className="prose dark:prose-invert max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center mb-4">
              Terms of Service
            </CardTitle>
            <p className="text-muted-foreground text-center">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using WavTrack ("the Service"), you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
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
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
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
              <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
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
              <h2 className="text-2xl font-semibold mb-4">5. Content Ownership</h2>
              <p className="mb-4">
                You retain ownership of the content you upload to WavTrack. By uploading content, you grant us 
                a limited license to process, store, and analyze your content solely for the purpose of providing 
                the Service to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Privacy and Data</h2>
              <p className="mb-4">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use 
                of the Service, to understand our practices regarding the collection and use of your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Service Availability</h2>
              <p className="mb-4">
                We strive to maintain high availability of the Service, but we do not guarantee uninterrupted 
                access. We may temporarily suspend the Service for maintenance, updates, or other operational reasons.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="mb-4">
                To the maximum extent permitted by law, WavTrack shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including but not limited to loss of profits, data, 
                or use, arising out of or relating to your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Termination</h2>
              <p className="mb-4">
                We may terminate or suspend your account and access to the Service at any time, with or without 
                cause, with or without notice. Upon termination, your right to use the Service will cease immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these terms at any time. We will notify users of any material 
                changes by posting the new terms on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
              <p className="mb-4">
                These terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], 
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">WavTrack Support</p>
                <p>Email: legal@wavtrack.com</p>
                <p>Address: [Your Business Address]</p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </BaseLayout>
  )
}

export default TermsOfService 