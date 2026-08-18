"use client";

import { ReactNode, useCallback, useRef, useState } from "react";

import { ConfirmDialog } from "@/components/confirm-dialog";

import { ConfirmContext, type ConfirmOptions } from "./confirm-context";

interface ConfirmProviderProps {
	children: ReactNode;
}

export function ConfirmProvider({ children }: ConfirmProviderProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [options, setOptions] = useState<ConfirmOptions>({
		title: "",
		message: "",
	});
	const resolveRef = useRef<((value: boolean) => void) | null>(null);

	const confirm = useCallback((confirmOptions: ConfirmOptions): Promise<boolean> => {
		setOptions(confirmOptions);
		setIsOpen(true);

		return new Promise<boolean>((resolve) => {
			resolveRef.current = resolve;
		});
	}, []);

	const handleConfirm = useCallback(() => {
		if (resolveRef.current) {
			resolveRef.current(true);
			resolveRef.current = null;
		}
		setIsOpen(false);
	}, []);

	const handleCancel = useCallback(() => {
		if (resolveRef.current) {
			resolveRef.current(false);
			resolveRef.current = null;
		}
		setIsOpen(false);
	}, []);

	return (
		<ConfirmContext.Provider value={{ confirm }}>
			{children}
			<ConfirmDialog
				isOpen={isOpen}
				title={options.title}
				message={options.message || ""}
				onConfirm={handleConfirm}
				onCancel={handleCancel}
				confirmLabel={options.confirmLabel}
				cancelLabel={options.cancelLabel}
			/>
		</ConfirmContext.Provider>
	);
}
