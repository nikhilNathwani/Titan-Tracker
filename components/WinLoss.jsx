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
				<div id="winLossCaption">
					<p id="winLossRate">
						<span className="winloss-stat">{percentSuccess}%</span>
						<span id="winLossRateLabel">win rate</span>
					</p>
					<p id="winLossSentence">
						The titans have won {num_win} out of{" "}
						{num_win + num_loss} battles
						{num_tie > 0 && (
							<>
								, with {num_tie} tie{num_tie > 1 ? "s" : ""}
							</>
						)}
						.
					</p>
				</div>
			</div>
		</div>
	);
}
