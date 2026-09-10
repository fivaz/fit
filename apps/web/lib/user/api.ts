import { apiFetch } from "@/lib/api-client";

export function updateTimezone(newTimezone: string) {
	return apiFetch<{ success: true }>("/api/user/timezone", {
		method: "PATCH",
		body: { timezone: newTimezone },
	});
}
