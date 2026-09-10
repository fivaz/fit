import * as React from "react";

export function useMediaQuery(query: string) {
	const getMatches = () => {
		if (typeof window === "undefined") {
			return false;
		}
		return window.matchMedia(query).matches;
	};

	const [value, setValue] = React.useState<boolean>(getMatches);

	React.useEffect(() => {
		if (typeof window === "undefined") return;

		const mediaQueryList = window.matchMedia(query);

		const onChange = (event: MediaQueryListEvent) => {
			setValue(event.matches);
		};

		mediaQueryList.addEventListener("change", onChange);

		return () => {
			mediaQueryList.removeEventListener("change", onChange);
		};
	}, [query]);

	return value;
}
