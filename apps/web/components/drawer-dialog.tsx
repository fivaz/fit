import { ReactNode, useEffect } from "react";

import { AnimatePresence, motion } from "framer-motion";

type DrawerDialogProps = {
	open: boolean;
	setOpen: (open: boolean) => void;
	children: ReactNode;
};

export function DrawerDialog({ children, open, setOpen }: DrawerDialogProps) {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setOpen(false);
			}
		};

		if (open) {
			window.addEventListener("keydown", handleKeyDown);
		}

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [open, setOpen]);

	return (
		<>
			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm lg:items-center"
						onClick={() => setOpen(false)}
						role="dialog"
						aria-modal="true"
						aria-label="Drawer dialog"
					>
						<motion.div
							initial={{ y: "100%", opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: "100%", opacity: 0 }}
							transition={{ type: "spring", damping: 25, stiffness: 300 }}
							onClick={(e) => e.stopPropagation()}
							className="bg-card z-30 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border shadow-2xl sm:rounded-3xl"
						>
							{children}
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
