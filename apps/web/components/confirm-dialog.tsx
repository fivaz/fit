"use client";

import * as React from "react";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";

interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
	confirmLabel?: string;
	cancelLabel?: string;
}

export function ConfirmDialog({
	isOpen,
	title,
	message,
	onConfirm,
	onCancel,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
}: ConfirmDialogProps) {
	return (
		<Drawer open={isOpen} onOpenChange={(open) => !open && onCancel()}>
			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle>{title}</DrawerTitle>
				</DrawerHeader>
				<div className="px-4">
					<div className="flex items-center gap-4 py-4">
						<div className="bg-destructive/10 flex size-10 shrink-0 items-center justify-center rounded-full">
							<AlertTriangle className="text-destructive size-5" />
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-muted-foreground text-sm">{message}</p>
						</div>
					</div>
				</div>
				<DrawerFooter className="space-y-2">
					<Button variant="outline" onClick={onCancel} className="w-full">
						{cancelLabel}
					</Button>
					<Button variant="destructive" onClick={onConfirm} className="w-full">
						{confirmLabel}
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
