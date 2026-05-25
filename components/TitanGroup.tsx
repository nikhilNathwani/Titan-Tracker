import type { ReactNode } from "react";

interface TitanGroupProps {
	id: string;
	label: string;
	children: ReactNode;
}

export default function TitanGroup({ id, label, children }: TitanGroupProps) {
	return (
		<div className="section">
			<p className="section-label" id={id}>
				{label}
			</p>
			<div className="titan-cards-group">{children}</div>
		</div>
	);
}
