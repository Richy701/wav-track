import React from 'react';
import { PricingSection } from '@/components/ui/pricing';

export default function PricingDemo() {
	return (
		<div className="flex min-h-screen items-center justify-center py-12">
			<PricingSection
				plans={WAVTRACK_PLANS}
				heading="Plans that Scale with Your Music"
				description="Whether you're just starting your music journey or you're a professional producer, our flexible pricing has you covered — with no hidden costs."
			/>
		</div>
	);
}

const WAVTRACK_PLANS = [
	{
		name: 'Starter',
		info: 'Perfect for beginners',
		price: {
			monthly: 9.99,
			yearly: Math.round(9.99 * 12 * (1 - 0.15)),
		},
		features: [
			{ text: 'Up to 10 beats per month' },
			{ text: 'Basic audio analysis' },
			{ text: 'Standard templates' },
			{
				text: 'Community support',
				tooltip: 'Get help from our community forum',
			},
			{
				text: 'Basic AI suggestions',
				tooltip: 'Get up to 50 AI-powered suggestions per month',
			},
			{
				text: 'Export in MP3 format',
				tooltip: 'Download your beats in high-quality MP3',
			},
		],
		btn: {
			text: 'Start Free Trial',
			href: '/auth/login',
		},
	},
	{
		highlighted: true,
		name: 'Producer',
		info: 'For serious producers',
		price: {
			monthly: 19.99,
			yearly: Math.round(19.99 * 12 * (1 - 0.15)),
		},
		features: [
			{ text: 'Unlimited beats' },
			{ text: 'Advanced audio analysis' },
			{ text: 'Premium templates & samples' },
			{
				text: 'Priority support',
				tooltip: 'Get 24/7 email and chat support',
			},
			{
				text: 'Advanced AI coaching',
				tooltip: 'Unlimited AI-powered suggestions and coaching',
			},
			{
				text: 'Export in multiple formats',
				tooltip: 'Download in MP3, WAV, and FLAC formats',
			},
			{
				text: 'Collaboration tools',
				tooltip: 'Share projects and collaborate with other producers',
			},
		],
		btn: {
			text: 'Get Started',
			href: '/auth/login',
		},
	},
	{
		name: 'Studio',
		info: 'For professional studios',
		price: {
			monthly: 49.99,
			yearly: Math.round(49.99 * 12 * (1 - 0.15)),
		},
		features: [
			{ text: 'Everything in Producer' },
			{ text: 'Multi-user access' },
			{ text: 'Custom branding' },
			{
				text: 'Advanced analytics',
				tooltip: 'Detailed insights and performance metrics',
			},
			{
				text: 'API access',
				tooltip: 'Integrate WavTrack with your existing workflow',
			},
			{
				text: 'Dedicated account manager',
				tooltip: 'Personal support from our team',
			},
			{
				text: 'White-label options',
				tooltip: 'Customize the interface for your brand',
			},
		],
		btn: {
			text: 'Contact Sales',
			href: '/contact',
		},
	},
]; 