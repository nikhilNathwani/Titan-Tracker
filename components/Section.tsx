import styles from "./Section.module.css";

interface SectionProps {
	id?: string;
	title: string;
	children: React.ReactNode;
}

export default function Section({ id, title, children }: SectionProps) {
	return (
		<div className="section" id={id}>
			<p className={styles.label}>{title}</p>
			{children}
		</div>
	);
}
