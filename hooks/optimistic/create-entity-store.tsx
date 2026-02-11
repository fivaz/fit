"use client";

import { createContext, ReactNode, useContext } from "react";
import { useOptimistic } from "react";

export type Identifiable = { id: string };

export type EntityStoreReturn<T extends Identifiable> = {
	items: T[];
	firstItem: T | undefined;
	isUnstable: boolean;
	addItem: (item: T) => void;
	updateItem: (item: T) => void;
	upsertItem: (item: T) => void;
	deleteItem: (id: string) => void;
	setItems: (items: T[]) => void;
	setIsUnstable: (unstable: boolean) => void;
};

type Action<T> =
	| { type: "add"; item: T }
	| { type: "update"; item: T }
	| { type: "upsert"; item: T }
	| { type: "delete"; id: string }
	| { type: "set"; items: T[] };

export function createEntityStore<T extends Identifiable>() {
	const Context = createContext<EntityStoreReturn<T> | null>(null);

	type ProviderProps = { initialItems: T[]; children: ReactNode };

	function Provider({ initialItems, children }: ProviderProps) {
		const [items, dispatch] = useOptimistic(initialItems, (state: T[], action: Action<T>) => {
			switch (action.type) {
				case "add":
					return [...state, action.item];

				case "update":
					return state.map((i) => (i.id === action.item.id ? { ...i, ...action.item } : i));

				case "upsert": {
					const exists = state.some((i) => i.id === action.item.id);
					return exists
						? state.map((i) => (i.id === action.item.id ? { ...i, ...action.item } : i))
						: [...state, action.item];
				}

				case "delete":
					return state.filter((i) => i.id !== action.id);

				case "set":
					return action.items;

				default:
					return state;
			}
		});

		const [isUnstable, setIsUnstable] = useOptimistic(false, (_, newValue: boolean) => newValue);

		const store: EntityStoreReturn<T> = {
			items,
			firstItem: items[0],
			isUnstable,
			addItem: (item) => dispatch({ type: "add", item }),
			updateItem: (item) => dispatch({ type: "update", item }),
			upsertItem: (item) => dispatch({ type: "upsert", item }),
			deleteItem: (id) => dispatch({ type: "delete", id }),
			setItems: (items) => dispatch({ type: "set", items }),
			setIsUnstable,
		};

		return <Context.Provider value={store}>{children}</Context.Provider>;
	}

	function useStore() {
		const context = useContext(Context);
		if (!context) {
			throw new Error("useStore must be used within its Provider");
		}
		return context;
	}

	return [Provider, useStore] as const;
}
