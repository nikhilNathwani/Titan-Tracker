import type { ReactNode } from "react";
import styles from "./TitanGroup.module.css";

export default function TitanGroup({ children }: { children: ReactNode }) {
	return <div className={styles.cardsGroup}>{children}</div>;
}
