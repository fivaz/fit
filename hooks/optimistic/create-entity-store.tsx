"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

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

function itemsReducer<T extends Identifiable>(state: T[], action: Action<T>) {
	switch (action.type) {
		case "add":
			return [...state, action.item];

		case "update":
			return state.map((item) => (item.id === action.item.id ? { ...item, ...action.item } : item));

		case "upsert": {
			const exists = state.some((item) => item.id === action.item.id);
			return exists
				? state.map((item) => (item.id === action.item.id ? { ...item, ...action.item } : item))
				: [...state, action.item];
		}

		case "delete":
			return state.filter((item) => item.id !== action.id);

		case "set":
			return action.items;

		default:
			return state;
	}
}

export function createEntityStore<T extends Identifiable>() {
	const Context = createContext<EntityStoreReturn<T> | null>(null);

	type ProviderProps = { initialItems: T[]; children: ReactNode };

	function Provider({ initialItems, children }: ProviderProps) {
		const [items, setItemsState] = useState(initialItems);
		const [isUnstable, setIsUnstable] = useState(false);

		useEffect(() => {
			setItemsState(initialItems);
		}, [initialItems]);

		const dispatch = (action: Action<T>) => {
			setItemsState((state) => itemsReducer(state, action));
		};

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
