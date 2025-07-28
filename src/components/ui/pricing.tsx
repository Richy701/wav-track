'use client';
import React from 'react';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';
import { CheckCircleIcon, StarIcon } from 'lucide-react';
import { motion, Transition } from 'framer-motion';

type FREQUENCY = 'monthly' | 'yearly';
const frequencies: FREQUENCY[] = ['monthly', 'yearly'];

interface Plan {
	name: string;
	info: string;
	price: {
		monthly: number;
		yearly: number;
	};
	features: {
		text: string;
		tooltip?: string;
	}[];
	btn: {
		text: string;
		href: string;
	};
	highlighted?: boolean;
}

interface PricingSectionProps extends React.ComponentProps<'div'> {
	plans: Plan[];
	heading: string;
	description?: string;
}

export function PricingSection({
	plans,
	heading,
	description,
	...props
}: PricingSectionProps) {
	const [frequency, setFrequency] = React.useState<'monthly' | 'yearly'>(
		'monthly',
	);

	return (
		<div
			className={cn(
				'flex w-full flex-col items-center justify-center space-y-5 p-4',
				props.className,
			)}
			{...props}
		>
			<div className="mx-auto max-w-xl space-y-2">
				<h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
					{heading}
				</h2>
				{description && (
					<p className="text-muted-foreground text-center text-sm md:text-base">
						{description}
					</p>
				)}
			</div>
			<PricingFrequencyToggle
				frequency={frequency}
				setFrequency={setFrequency}
			/>
			<div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
				{plans.map((plan) => (
					<PricingCard plan={plan} key={plan.name} frequency={frequency} />
				))}
			</div>
		</div>
	);
}

type PricingFrequencyToggleProps = React.ComponentProps<'div'> & {
	frequency: FREQUENCY;
	setFrequency: React.Dispatch<React.SetStateAction<FREQUENCY>>;
};

export function PricingFrequencyToggle({
	frequency,
	setFrequency,
	...props
}: PricingFrequencyToggleProps) {
	return (
		<div
			className={cn(
				'bg-purple-100/50 dark:bg-purple-950/30 mx-auto flex w-fit rounded-full border border-purple-200/50 dark:border-purple-800/50 p-1',
				props.className,
			)}
			{...props}
		>
			{frequencies.map((freq) => (
				<button
					key={freq}
					onClick={() => setFrequency(freq)}
					className="relative px-4 py-1 text-sm capitalize transition-colors duration-200"
				>
					<span className={cn(
						"relative z-20",
						frequency === freq ? "text-white" : "text-foreground"
					)}>
						{freq}
					</span>
					{frequency === freq && (
						<motion.span
							layoutId="frequency"
							transition={{ type: 'spring', duration: 0.4 }}
							className="bg-gradient-to-r from-purple-600 to-purple-700 absolute inset-0 z-10 rounded-full shadow-sm"
						/>
					)}
				</button>
			))}
		</div>
	);
}

type PricingCardProps = React.ComponentProps<'div'> & {
	plan: Plan;
	frequency?: FREQUENCY;
};

export function PricingCard({
	plan,
	className,
	frequency = frequencies[0],
	...props
}: PricingCardProps) {
	return (
		<div
			key={plan.name}
			className={cn(
				'relative flex w-full flex-col rounded-lg border',
				plan.highlighted && 'scale-105 border-purple-500/50 shadow-xl',
				className,
			)}
			{...props}
		>
			<div
				className={cn(
					'bg-muted/20 rounded-t-lg border-b p-4',
					plan.highlighted && 'bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-500/20',
				)}
			>
				<div className="absolute top-2 right-2 z-10 flex items-center gap-2">
					{plan.highlighted && (
						<p className="bg-gradient-to-r from-purple-600 to-purple-700 text-white flex items-center gap-1 rounded-md border border-purple-500/30 px-3 py-1 text-xs font-medium shadow-sm">
							<StarIcon className="h-3 w-3 fill-current" />
							Most Popular
						</p>
					)}
					{frequency === 'yearly' && (
						<p className="bg-primary text-primary-foreground flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs">
							{Math.round(
								((plan.price.monthly * 12 - plan.price.yearly) /
									plan.price.monthly /
									12) *
									100,
							)}
							% off
						</p>
					)}
				</div>

				<div className={cn(
					"text-lg font-medium",
					plan.highlighted && "text-purple-700 dark:text-purple-300"
				)}>
					{plan.name}
				</div>
				<p className={cn(
					"text-muted-foreground text-sm font-normal",
					plan.highlighted && "text-purple-600/80 dark:text-purple-400/80"
				)}>
					{plan.info}
				</p>
				<h3 className="mt-2 flex items-end gap-1">
					<span className={cn(
						"text-3xl font-bold",
						plan.highlighted && "text-purple-700 dark:text-purple-300"
					)}>
						${plan.price[frequency]}
					</span>
					<span className={cn(
						"text-muted-foreground",
						plan.highlighted && "text-purple-600/70 dark:text-purple-400/70"
					)}>
						{plan.name !== 'Free'
							? '/' + (frequency === 'monthly' ? 'month' : 'year')
							: ''}
					</span>
				</h3>
			</div>
			<div
				className={cn(
					'text-muted-foreground space-y-4 px-4 py-6 text-sm',
					plan.highlighted && 'bg-muted/10',
				)}
			>
				{plan.features.map((feature, index) => (
					<div key={index} className="flex items-start gap-3">
						<CheckCircleIcon className="text-foreground h-4 w-4 mt-0.5 flex-shrink-0" />
						<p className="leading-relaxed">
							{feature.text}
						</p>
					</div>
				))}
			</div>
			<div
				className={cn(
					'mt-auto w-full border-t p-3',
					plan.highlighted && 'bg-muted/40',
				)}
			>
				{plan.highlighted ? (
					// Highlighted plan - Purple gradient button
					<a
						href={plan.btn.href}
						className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl"
					>
						{plan.btn.text}
					</a>
				) : (
					// Regular plans - Purple outline with hover effects
					<a
						href={plan.btn.href}
						className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 border border-purple-500/30 bg-background hover:bg-gradient-to-r hover:from-purple-600/10 hover:to-purple-700/10 hover:border-purple-500/50 text-foreground hover:text-purple-700 dark:hover:text-purple-300 shadow-sm hover:shadow-md"
					>
						{plan.btn.text}
					</a>
				)}
			</div>
		</div>
	);
}

 