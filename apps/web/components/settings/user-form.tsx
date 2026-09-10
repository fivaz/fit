import React from "react";

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

type UserFormProps = {
	isOpen: boolean;
	onClose: () => void;
	user: { name: string; email: string };
};
export function UserForm({ isOpen, onClose, user }: UserFormProps) {
	return (
		<Drawer open={isOpen} onOpenChange={(val) => !val && onClose()}>
			<DrawerContent className="px-5 pb-10">
				<DrawerHeader className="px-0">
					<DrawerTitle>Account Settings</DrawerTitle>
					<DrawerDescription>Update your name and contact information.</DrawerDescription>
				</DrawerHeader>

				<div className="space-y-4 pt-4">
					<div>
						<Label className="text-xs font-semibold text-gray-400 uppercase">Full Name</Label>
						<Input
							defaultValue={user.name}
							className="mt-1.5 h-12 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
						/>
					</div>
					<div>
						<Label className="text-xs font-semibold text-gray-400 uppercase">Email Address</Label>
						<Input
							type="email"
							defaultValue={user.email}
							className="mt-1.5 h-12 border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
						/>
					</div>

					<div className="flex gap-3 pt-4">
						<DrawerClose asChild>
							<Button variant="outline" className="h-12 flex-1 rounded-xl">
								Cancel
							</Button>
						</DrawerClose>
						<DrawerClose asChild>
							<Button
								onClick={onClose}
								className="h-12 flex-1 rounded-xl bg-orange-500 font-bold text-white shadow-md shadow-orange-200 dark:shadow-none"
							>
								Save Account
							</Button>
						</DrawerClose>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
