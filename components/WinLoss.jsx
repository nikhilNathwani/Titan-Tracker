export default function WinLoss({ num_win, num_tie, num_loss }) {
	const total = num_win + num_tie + num_loss;
	const percentSuccess = ((100 * num_win) / total).toPrecision(3);

	return (
		<div className="section" id="winLoss">
			<p className="section-label">Win-Loss Record</p>
			<div className="section-content">
				<div className="winloss-banner">
					<img src="/img/all-titans.jpg" alt="The Titans" />
				</div>
				<p id="winLossCaption">
					<span className="winloss-stat">{num_win}</span> wins,{" "}
					<span className="winloss-stat">{num_loss}</span> losses
					{num_tie > 0 && (
						<>,{" "}
						<span className="winloss-stat">{num_tie}</span> ties</>
					)}{" "}
					— <span className="winloss-stat">{percentSuccess}%</span>{" "}
					win rate
				</p>
			</div>
		</div>
	);
}
