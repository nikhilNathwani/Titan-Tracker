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
				<div className="section-row">
					<div className="widget">
						<p className="widget-title">Wins</p>
						<p className="widget-content">{num_win}</p>
					</div>
					<div className="widget">
						<p className="widget-title">Losses</p>
						<p className="widget-content">{num_loss}</p>
					</div>
				</div>
				<div id="winLossCaption" className="section-caption">
					The titans have won {num_win} out of {num_win + num_loss}{" "}
					battles, which is a <b>{percentSuccess}%</b> win rate.
				</div>
			</div>
		</div>
	);
}
