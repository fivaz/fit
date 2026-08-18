export type AuthUser = {
	id: string;
	name: string;
	email: string;
	image?: string | null;
	timezone?: string | null;
};

export const AUTH_ADDITIONAL_FIELDS = {
	user: {
		timezone: {
			type: "string" as const,
			required: false,
		},
	},
};
