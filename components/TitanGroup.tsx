import type { ReactNode } from "react";
import SectionLabel from "./SectionLabel";
import styles from "./TitanGroup.module.css";

interface TitanGroupProps {
	id: string;
	label: string;
	children: ReactNode;
}

export default function TitanGroup({ id, label, children }: TitanGroupProps) {
	return (
		<div className="section">
			<SectionLabel id={id}>{label}</SectionLabel>
			<div className={styles.cardsGroup}>{children}</div>
		</div>
	);
}
