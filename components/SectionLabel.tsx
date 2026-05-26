import styles from "./SectionLabel.module.css";

interface SectionLabelProps {
	id?: string;
	children: React.ReactNode;
}

export default function SectionLabel({ id, children }: SectionLabelProps) {
	return (
		<p className={styles.label} id={id}>
			{children}
		</p>
	);
}
