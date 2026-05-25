import styles from "./Notes.module.css";

export default function Notes() {
	return (
		<div className="section" id="notesSection">
			<p className="section-label">Notes</p>
			<div className={`section-content ${styles.notesContent}`}>
				<p>
					<span className="footnote">*</span> Win rate = wins &divide;
					(wins + losses); ties are not counted.
				</p>
				<p>
					<span className="footnote">
						<sup>†</sup>
					</span>{" "}
					When averaging, I count Round 3&apos;s 20-pt scores as two
					separate 10-pt scores. E.g. a 16/20 counts as two
					8/10&apos;s.
				</p>
			</div>
		</div>
	);
}
