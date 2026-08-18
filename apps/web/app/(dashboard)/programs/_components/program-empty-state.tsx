import { NotebookTabsIcon } from "lucide-react";

export function ProgramEmptyState() {
	return (
		<div className="py-16 text-center">
			<NotebookTabsIcon className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-700" />
			<p className="text-lg text-gray-600 dark:text-gray-500">No programs yet</p>
			<p className="mt-1 text-sm text-gray-500 dark:text-gray-600">
				Create your first workout program
			</p>
		</div>
	);
}
