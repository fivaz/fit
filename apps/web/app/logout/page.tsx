"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

export default function LogoutPage() {
	return <Button onClick={() => signOut()}>Sign out</Button>;
}
