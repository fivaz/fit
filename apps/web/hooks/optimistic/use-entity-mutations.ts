"use client";

import { startTransition, useEffect, useRef } from "react";

import { EntityStoreReturn, Identifiable } from "./create-entity-store";

type PersistConfig<T> = {
	persist: () => Promise<void>;
	onSuccess?: (items: T[]) => void;
	onError?: (error: unknown, previousItems: T[]) => void;
};

type EntityMutationsReturn<T> = () => {
	isPending: boolean;
	addItem: (item: T, config?: PersistConfig<T>) => void;
	updateItem: (item: T, config?: PersistConfig<T>) => void;
	upsertItem: (item: T, config?: PersistConfig<T>) => void;
	deleteItem: (id: string, config?: PersistConfig<T>) => void;
	setItems: (items: T[], config?: PersistConfig<T>) => void;
};

export function createEntityMutations<T extends Identifiable>(
	useStore: () => EntityStoreReturn<T>,
): EntityMutationsReturn<T> {
	return function useEntityMutations() {
		const store = useStore();
		const latestItemsRef = useRef<T[]>(store.items);
		const pendingCountRef = useRef(0);

		useEffect(() => {
			latestItemsRef.current = store.items;
		}, [store.items]);

		async function runMutation(optimisticUpdate: () => void, config?: PersistConfig<T>) {
			const snapshot = structuredClone(latestItemsRef.current);

			// Optimistic update
			startTransition(() => optimisticUpdate());

			if (!config) return;

			// mark store as unstable
			pendingCountRef.current += 1;
			startTransition(() => store.setIsUnstable(true));

			try {
				await config.persist();
				config.onSuccess?.(latestItemsRef.current);
			} catch (error) {
				// rollback
				startTransition(() => store.setItems(snapshot));
				config.onError?.(error, snapshot);
			} finally {
				pendingCountRef.current -= 1;
				if (pendingCountRef.current === 0) {
					startTransition(() => store.setIsUnstable(false));
				}
			}
		}

		return {
			isPending: store.isUnstable,

			addItem(item: T, config?: PersistConfig<T>) {
				void runMutation(() => store.addItem(item), config);
			},

			updateItem(item: T, config?: PersistConfig<T>) {
				void runMutation(() => store.updateItem(item), config);
			},

			upsertItem(item: T, config?: PersistConfig<T>) {
				void runMutation(() => store.upsertItem(item), config);
			},

			deleteItem(id: string, config?: PersistConfig<T>) {
				void runMutation(() => store.deleteItem(id), config);
			},

			setItems(items: T[], config?: PersistConfig<T>) {
				void runMutation(() => store.setItems(items), config);
			},
		};
	};
}
