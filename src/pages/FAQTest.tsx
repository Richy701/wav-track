import React from 'react';
import { FAQSection } from '@/components/ui/faq-section';
import { BaseLayout } from '@/components/layout/BaseLayout';

export default function FAQTest() {
	return (
		<BaseLayout>
			<div className="relative min-h-screen bg-background">
				<FAQSection />
			</div>
		</BaseLayout>
	);
} 