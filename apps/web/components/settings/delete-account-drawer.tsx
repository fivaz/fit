"use client";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteAccount } from "@/lib/auth-client";
import { ROUTES } from "@/lib/consts";
import { logError } from "@/lib/logger";

type DeleteAccountDrawerProps = {
	isOpen: boolean;
	onClose: () => void;
};

export function DeleteAccountDrawer({ isOpen, onClose }: DeleteAccountDrawerProps) {
	const [password, setPassword] = useState("");
	const [isPending, setIsPending] = useState(false);
	const router = useRouter();

	const handleClose = () => {
		setPassword("");
		onClose();
	};

	const handleDelete = async (e: FormEvent) => {
		e.preventDefault();
		setIsPending(true);
		try {
			const result = await deleteAccount({ password });
			if (result.error) {
				toast.error(result.error.message ?? "Incorrect password. Please try again.");
				return;
			}
			toast.success("Your account has been deleted.");
			router.push(ROUTES.LOGIN);
		} catch (error) {
			logError(error, "DeleteAccountDrawer#handleDelete");
			toast.error("Failed to delete account. Please try again.");
		} finally {
			setIsPending(false);
		}
	};

	return (
		<Drawer open={isOpen} onOpenChange={(val) => !val && handleClose()}>
			<DrawerContent className="px-5 pb-10">
				<DrawerHeader className="px-0">
					<DrawerTitle>Delete Account</DrawerTitle>
					<DrawerDescription>
						This permanently deletes your account and all of your programs, exercises, workouts, and
						body metrics. This action cannot be undone.
					</DrawerDescription>
				</DrawerHeader>

				<form onSubmit={handleDelete} className="space-y-4 pt-4">
					<div>
						<Label
							htmlFor="delete-account-password"
							className="text-xs font-semibold text-gray-400 uppercase"
						>
							Confirm Password
						</Label>
						<Input
							id="delete-account-password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="••••••••"
							required
							autoComplete="current-password"
							className="mt-1.5 h-12 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
						/>
					</div>

					<div className="flex gap-3 pt-4">
						<DrawerClose asChild>
							<Button
								type="button"
								variant="outline"
								className="h-12 flex-1 rounded-xl"
								disabled={isPending}
							>
								Cancel
							</Button>
						</DrawerClose>
						<Button
							type="submit"
							variant="destructive"
							disabled={isPending || !password}
							className="h-12 flex-1 rounded-xl font-bold"
						>
							{isPending ? <Loader2 className="size-4 animate-spin" /> : "Delete Account"}
						</Button>
					</div>
				</form>
			</DrawerContent>
		</Drawer>
	);
}
