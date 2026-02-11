import { ComponentProps } from "react";

import { Dumbbell } from "lucide-react";

type LogoProps = ComponentProps<"svg">;

export function Logo(props: LogoProps) {
	return <Dumbbell {...props} />;
}
