## I thought i had live updates enabled, so that when we make a code change, my browser with localhost:3000 open automatically reflects the code change, but i keep having to refresh the page to get the latest code change. can you make this automatic like im used to?

## Google search console hasnt picked up the sitemap, it shows "Add a new sitemap

https://triple-threat.vercel.app/enter-sitemap-url", what should we put there?

## in the per-round stats, the margin column, ayesha has a value of "n/a" which has text-secondary color, we can instead have it be clr-light like the rest of the text in that column. the n/a in the avg score column next to it is clr-light, so they should be the same.

## in per-round stats, how come we are bolding the values of the avg score column, but not the avg margin column next to it? i think they should either be both-bolded or both not-bolded. i think not-bolded since bolding all might feel to heavy. if you agree, then implement as such.

## instead of repetitive css for rank stylings like these

".rank1 {
background: var(--clr-rank1);
color: var(--clr-rank1-text);
}
.rank2 {
background: var(--clr-rank2);
color: var(--clr-rank2-text);
}
.rank3 {
background: var(--clr-rank3);
color: var(--clr-rank3-text);
}
.rankNR {
background-color: var(--clr-mid);
}"

couldn't we instead have the rank classes define values for a single --clr-rank value, and --clr-rank-text, border, etc.? like how i do in Trigram with the different stylings for round-1,-2,-3 (you can see the Trigram folder in this vs code workspace)?
