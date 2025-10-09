/* --------------------------- */
/*                             */
/*      UTILITY FUNCTIONS      */
/*                             */
/* --------------------------- */
function populateElement(query, content, className = null) {
	const element = document.querySelector(query);
	element.textContent = content;
	if (className) {
		element.className = className;
	}
}