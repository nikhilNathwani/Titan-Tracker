/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*                                                          */
/*     VARIABLES                                            */
/*                                                          */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

// Breakpoint
const minWidthAdjacentMode = 1000; //px
const minHeight = 600; //px

// App states
const APP_STATE = {
	INITIAL: "initialMode",
	STACKED: "stackedMode",
	ADJACENT: "adjacentMode",
};

// Page sections
var appContainer = document.getElementById("app");
var filterContainer = document.getElementById("filter-container");
var resultContainer = document.getElementById("result-container");

// Buttons
const submitButton = document.getElementById("submit-button");
const filterReturnButton = document.getElementById("return-to-filters");

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*                                                          */
/*     EVENT HANDLING                                         */
/*                                                          */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */

// Handle submit ('View Results' button)
submitButton.addEventListener("click", function () {
	var timeout = 0;

	//Bring results to foreground by either scrolling down or
	//snapping filters to the left (depending on screen size)
	snapFilterView();

	if (!appContainer.classList.contains(APP_STATE.INITIAL)) {
		clearExistingResults();
		if (appContainer.classList.contains(APP_STATE.ADJACENT)) {
			timeout = 500; //wait for fade-out of existing results
		} else {
			timeout = 200; //no fade-out of existing results in STACKED mode, so just a short wait
		}
	}

	setTimeout(() => {
		//Generate new results based on filters applied
		generateResults();
	}, timeout);

	setTimeout(() => {
		fadeInResults();
	}, timeout + 500);
});

function snapFilterView() {
	//If screen is sufficiently small, scroll down to reveal results
	if (
		window.innerWidth < minWidthAdjacentMode ||
		window.innerHeight < minHeight
	) {
		setAppState(APP_STATE.STACKED);
		resultContainer.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
	}
	//If screen is sufficiently large, display results side-by-side with filters
	else {
		setAppState(APP_STATE.ADJACENT);
		resultContainer.scrollTo({ top: 0, behavior: "smooth" });
	}
}

// Handle screen resize
window.addEventListener("resize", function () {
	if (appContainer.classList.contains(APP_STATE.INITIAL)) {
		return;
	}
	if (
		(window.innerWidth < minWidthAdjacentMode ||
			window.innerHeight < minHeight) &&
		!appContainer.classList.contains(APP_STATE.STACKED)
	) {
		setAppState(APP_STATE.STACKED);
		resultContainer.scrollIntoView({ block: "start" });
		return;
	}
	if (
		window.innerWidth >= minWidthAdjacentMode &&
		window.innerHeight >= minHeight &&
		!appContainer.classList.contains(APP_STATE.ADJACENT)
	) {
		setAppState(APP_STATE.ADJACENT);
	}
});

// Handle 'Return to filters' button (only shown in stacked mode when filters are out of view)
filterReturnButton.addEventListener("click", function () {
	filterContainer.scrollIntoView({ behavior: "smooth", block: "start" });
});

// Show 'Return to filters' button (when filters are out of view)
const observer = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) {
				// filterContainer is out of view
				filterReturnButton.style.display = "block";
			} else {
				// filterContainer is in view
				filterReturnButton.style.display = "none";
			}
		});
	},
	{
		threshold: 0.2, // Trigger when <=20% of the element is in view
		// rootMargin: "0% 0px 0px 0px",
	}
);
observer.observe(filterContainer);

/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
/*                                                          */
/*     HELPER FUNCTIONS                                        */
/*                                                          */
/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
function setAppState(state) {
	Object.values(APP_STATE).forEach((state) =>
		appContainer.classList.remove(state)
	);
	appContainer.classList.add(state);
}
