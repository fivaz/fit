import { useEffect, useRef, useState } from "react";

import { format, parse } from "date-fns";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TimeInputProps = {
	value: Date | null | undefined;
	onUpdate: (date: Date) => void;
	isPending?: boolean;
};

export function TimeInput({ value, onUpdate, isPending }: TimeInputProps) {
	const [isEditing, setIsEditing] = useState(false);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const formattedTime = value ? format(new Date(value), "HH:mm") : "";

	useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	const handlePointerDown = () => {
		// Start timer for long press (edit mode)
		timerRef.current = setTimeout(() => {
			setIsEditing(true);
		}, 500);
	};

	const handlePointerUp = () => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
			// If we didn't trigger editing mode yet, it's a quick tap
			if (!isEditing) {
				onUpdate(new Date());
			}
		}
	};

	if (isEditing) {
		return (
			<Input
				type="time"
				autoFocus
				defaultValue={formattedTime}
				onBlur={() => setIsEditing(false)}
				onChange={(e) => {
					if (e.target.value) {
						onUpdate(parse(e.target.value, "HH:mm", new Date()));
					}
				}}
				onClick={(e) => e.currentTarget.showPicker?.()}
				className="h-10 border-orange-500 bg-white p-0 text-center dark:bg-gray-800"
			/>
		);
	}

	return (
		<motion.button
			type="button"
			disabled={isPending}
			onPointerDown={handlePointerDown}
			onPointerUp={handlePointerUp}
			onPointerLeave={() => timerRef.current && clearTimeout(timerRef.current)}
			className={cn(
				"h-10 w-full rounded-md border text-sm font-medium transition-colors",
				value
					? "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400"
					: "border-gray-200 bg-gray-50 text-gray-400 hover:border-orange-500 dark:border-gray-600 dark:bg-gray-700",
			)}
		>
			{formattedTime || <Clock className="mx-auto h-4 w-4" />}
		</motion.button>
	);
}
