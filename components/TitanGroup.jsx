export default function TitanGroup({ id, label, children }) {
	return (
		<div className="section">
			<p className="section-label" id={id}>
				{label}
			</p>
			<div className="titan-cards-group">{children}</div>
		</div>
	);
}
