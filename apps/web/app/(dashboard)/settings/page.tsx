"use client";

import * as React from "react";
import { useEffect, useState } from "react";

import { SettingsDetails } from "@/components/settings/settings-details";
import { getBodyMetrics } from "@/lib/body-metrics/api";
import { BodyMetricsUI, getEmptyBodyMetrics } from "@/lib/body-metrics/type";

export default function SettingsPage() {
	const [bodyMetrics, setBodyMetrics] = useState<BodyMetricsUI>(getEmptyBodyMetrics());

	useEffect(() => {
		void getBodyMetrics().then((metrics) => {
			if (!metrics) return;
			setBodyMetrics(metrics);
		});
	}, []);

	return (
		<div className="relative flex w-full flex-col">
			{/* Header */}
			<div className="flex items-start justify-between pb-4">
				<div>
					<h1 className="text-foreground text-2xl font-bold">Settings</h1>
				</div>
			</div>
			<SettingsDetails bodyMetrics={bodyMetrics} />
		</div>
	);
}
