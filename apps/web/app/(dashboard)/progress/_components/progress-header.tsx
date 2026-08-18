"use client";

type ProgressHeaderProps = {
	subtitle: string;
};

export function ProgressHeader({ subtitle }: ProgressHeaderProps) {
	return (
		<div className="mb-6">
			<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Progress</h1>
			<p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
		</div>
	);
}
