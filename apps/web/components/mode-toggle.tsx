"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

export function ModeToggle() {
	const { setTheme } = useTheme();
	const { data: session } = authClient.useSession();

	if (session?.user.email !== process.env.NEXT_PUBLIC_DEMO_USER_EMAIL) return null;

	const themes = [
		{ label: "light", value: "light", icon: Sun },
		{ label: "dark", value: "dark", icon: Moon },
		{ label: "system", value: "system", icon: Monitor },
	] as const;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="icon">
					<Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
					<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
					<span className="sr-only">Toggle theme</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{themes.map(({ label, value, icon: Icon }) => (
					<DropdownMenuItem key={value} onClick={() => setTheme(value)} className="capitalize">
						<Icon className="mr-2 size-4" />
						{label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
