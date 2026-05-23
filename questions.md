## the 'Copy' share button isnt working still, the share text wasnt copied to clipboard and button's "copied" state didnt appear

## vercel build error: "Build Failed

Command "npm run build" exited with 1" logs: "11:21:53.567
Linting and checking validity of types ...
11:21:57.573
Failed to compile.
11:21:57.573
11:21:57.573
./app/page.tsx:20:2
11:21:57.574
Type error: Duplicate identifier 'WinLoss'.
11:21:57.574
11:21:57.575
18 | TitanRecord,
11:21:57.575
19 | TitanWithRank,
11:21:57.575

> 20 | WinLoss,
> 11:21:57.576

     | 	^

11:21:57.576
21 | AvgScoresMap,
11:21:57.576
22 | BestScoresMap,
11:21:57.577
23 | PerRoundStatsMap,
11:21:57.594
Next.js build worker exited with code: 1 and signal: null
11:21:57.619
Error: Command "npm run build" exited with 1
" the latest changes havent been deploeyd to triple-threat.vercel.app yet, including the google-site-verification meta tag, so maybe you didnt need to do this "Meta tag — Added a direct <head><meta name="google-site-verification" ...></head> block in the layout JSX. This coexists with the metadata.verification export — both are now present. The direct tag is immune to any rendering/timing issues with the async layout. On production (Vercel), the tag will definitely be in the HTML now. On localhost it still won't render (the layout throws on DB failure), so always check triple-threat.vercel.app when verifying with GSC." i.e. you could try going back to the way you added the meta tag before, if you can fix the build issue
