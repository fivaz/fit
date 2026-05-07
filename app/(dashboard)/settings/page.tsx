import * as React from "react";

import { SettingsDetails } from "@/components/settings/settings-details";
import { getBodyMetrics } from "@/lib/body-metrics/service";
import { getUserId } from "@/lib/utils-server";

export default async function SettingsPage() {
	const userId = await getUserId();
	const bodyMetrics = await getBodyMetrics(userId);

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
