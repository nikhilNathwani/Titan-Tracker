# React Migration Guide for Titan Tracker
## Learn React by Rebuilding Your App (Not by Doing Tutorials)

**Philosophy:** Instead of re-reading React docs, you'll re-learn React concepts **incrementally** by converting your actual app piece by piece. Each phase teaches specific React concepts through hands-on building.

**Timeline:** ~5-10 hours total, spread over a few days
**Approach:** Incremental (keep app functional throughout)

---

## 📋 Pre-Migration Checklist

### ✅ Setup (30 minutes)

1. **Create a new branch**
   ```bash
   git checkout -b react-migration
   git push -u origin react-migration
   ```

2. **Install Vite + React** (modern build tool, faster than Create React App)
   ```bash
   npm create vite@latest client -- --template react
   cd client
   npm install
   npm run dev
   ```
   
   This creates a `client/` folder with React app running on `http://localhost:5173`

3. **Test the setup**
   - Visit `localhost:5173` - you should see Vite's default React app
   - Edit `client/src/App.jsx` - changes should hot-reload instantly
   - **React concepts learned:** JSX syntax, component structure, Vite dev server

4. **Copy your CSS**
   ```bash
   cp public/css/style.css client/src/index.css
   ```

5. **Update your backend CORS** (in `server.js`):
   ```javascript
   const cors = require('cors');
   app.use(cors()); // Allow React dev server to fetch from Express
   ```

---

## 🎯 Phase 1: Hello World + Static Components (1 hour)
**Goal:** Get comfortable with JSX and component structure
**React Concepts:** JSX, components, props, importing/exporting

### Step 1.1: Clear the Template
Delete everything in `client/src/App.jsx` and start fresh:

```jsx
function App() {
  return (
    <div>
      <h1>TITAN TRACKER</h1>
      <p>Rebuilding in React...</p>
    </div>
  );
}

export default App;
```

**Check:** Visit `localhost:5173` - you should see your title

### Step 1.2: Build Header Component
Create `client/src/components/Header.jsx`:

```jsx
function Header() {
  return (
    <div className="section" id="titleSection">
      <div className="section-content">
        <h1 id="appTitle">TITAN TRACKER</h1>
        <p id="appDescription">
          Fan-made stat tracker for <em>Bobby's Triple Threat</em> on Food Network
        </p>
      </div>
      <div id="support" className="section-content">
        <p>
          If you'd like to support my work,{' '}
          <a
            id="coffeeLink"
            href="https://buymeacoffee.com/nikhilnathwani"
            target="_blank"
            rel="noopener noreferrer"
          >
            ☕️ buy me a coffee?
          </a>
        </p>
      </div>
    </div>
  );
}

export default Header;
```

**Update App.jsx:**
```jsx
import Header from './components/Header';

function App() {
  return (
    <div>
      <Header />
    </div>
  );
}

export default App;
```

**✨ What you just learned:**
- JSX is HTML-like syntax in JavaScript
- `className` instead of `class` (because `class` is reserved in JS)
- Components are just functions that return JSX
- `export default` / `import` for component reusability

### Step 1.3: Build Footer Component
Create `client/src/components/Footer.jsx` (copy structure from your HTML):

```jsx
function Footer() {
  return (
    <div className="section" id="footer">
      <div className="section-content">
        <p>Made by fan of the show, Nikhil N.</p>
        <div id="links">
          <a href="mailto:nnathwani36@gmail.com" target="_blank" rel="noopener noreferrer">
            Email Me
          </a>
          <a href="https://nikhilnathwani.com" target="_blank" rel="noopener noreferrer">
            Other Work
          </a>
          <a
            href="https://buymeacoffee.com/nikhilnathwani"
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy me a coffee ☕️
          </a>
        </div>
        <p id="footnotes">
          <span className="footnote">*</span>Rankings are based on win percentage, not total
          number of wins.
          <br />
          <span className="footnote">
            <sup>†</sup>
          </span>
          When averaging, I count Round 3's 20-pt scores as two separate 10-pt scores. E.g. a
          16/20 counts as two 8/10's.
        </p>
      </div>
    </div>
  );
}

export default Footer;
```

Add to `App.jsx`:
```jsx
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <div>
      <Header />
      <Footer />
    </div>
  );
}

export default App;
```

**🎉 Phase 1 Complete!** You have static components rendering. Your app structure is visible.

---

## 🎯 Phase 2: Data Fetching + State (1.5 hours)
**Goal:** Fetch data from your API and display it dynamically
**React Concepts:** `useState`, `useEffect`, async/await, conditional rendering

### Step 2.1: Create API Service
Create `client/src/services/api.js`:

```javascript
const API_BASE = 'http://localhost:3000'; // Your Express server

export async function fetchWinLoss() {
  const response = await fetch(`${API_BASE}/records/winLoss`);
  return response.json();
}

export async function fetchTitanRecords() {
  const response = await fetch(`${API_BASE}/records/titanRecords`);
  return response.json();
}
```

### Step 2.2: Build Win-Loss Widget with State
Create `client/src/components/WinLossSection.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { fetchWinLoss } from '../services/api';

function WinLossSection() {
  // STATE: Where React stores data that can change
  const [winLoss, setWinLoss] = useState(null);
  const [loading, setLoading] = useState(true);

  // EFFECT: Runs after component mounts (similar to window.onload)
  useEffect(() => {
    async function loadData() {
      const data = await fetchWinLoss();
      setWinLoss(data);
      setLoading(false);
    }
    loadData();
  }, []); // Empty array = run once on mount

  // CONDITIONAL RENDERING: Show loading state
  if (loading) return <div>Loading...</div>;

  // Calculate win percentage
  const total = winLoss.num_win + winLoss.num_tie + winLoss.num_loss;
  const percentSuccess = (100 * winLoss.num_win) / total;

  return (
    <div className="section" id="winLoss">
      <h2 className="section-title">Win-Loss Record</h2>
      <div className="section-content">
        <div className="section-row">
          <div className="widget">
            <p className="widget-title">Wins</p>
            <p className="widget-content">{winLoss.num_win}</p>
          </div>
          <div className="widget">
            <p className="widget-title">Losses</p>
            <p className="widget-content">{winLoss.num_loss}</p>
          </div>
        </div>
        <div id="winLossCaption" className="section-caption">
          The titans have won {winLoss.num_win} out of {winLoss.num_win + winLoss.num_loss}{' '}
          battles, which is a <b>{percentSuccess.toPrecision(3)}%</b> win rate.
        </div>
      </div>
    </div>
  );
}

export default WinLossSection;
```

Add to `App.jsx`:
```jsx
import Header from './components/Header';
import WinLossSection from './components/WinLossSection';
import Footer from './components/Footer';

function App() {
  return (
    <div>
      <Header />
      <WinLossSection />
      <Footer />
    </div>
  );
}

export default App;
```

**✨ What you just learned:**
- **`useState(initialValue)`** - Creates state variable + setter function
- **`useEffect(() => {...}, [])`** - Runs code after component renders
- **Conditional rendering** - `if (loading) return <div>Loading...</div>`
- **Data interpolation** - `{winLoss.num_win}` inserts data into JSX
- **Async data fetching** - `await fetch()` in useEffect

**🎉 Phase 2 Complete!** You've fetched real data and displayed it dynamically!

---

## 🎯 Phase 3: Leaderboard Table (1 hour)
**Goal:** Render a list of items with `.map()`
**React Concepts:** Array mapping, keys, destructuring

### Step 3.1: Build Leaderboard Component
Create `client/src/components/TitanLeaderboard.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { fetchTitanRecords } from '../services/api';
import { generateRankStrings } from '../utils/ranking';

function TitanLeaderboard() {
  const [titans, setTitans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await fetchTitanRecords();
      setTitans(data);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div>Loading leaderboard...</div>;

  // Generate rank strings (copy your ranking.js logic here)
  const rankStrings = generateRankStrings(titans.map(t => t.rank));

  return (
    <div className="section" id="titanLeaderboard">
      <h2 className="section-title">Titan Leaderboard</h2>
      <div className="section-content">
        <table className="statTable">
          <thead>
            <tr className="statTableHeader">
              <th>
                Rank<span className="footnote">*</span>
              </th>
              <th>Titan</th>
              <th>Win-Loss-Tie</th>
            </tr>
          </thead>
          <tbody>
            {titans.map((titan, index) => {
              const [firstName, lastName] = titan.titan_name.split(' ');
              const rankClass = `rank rank${titan.rank ?? 'NR'}`;

              return (
                <tr key={titan.titan_name} className="statTableRow">
                  <td>
                    <div className={rankClass}>{rankStrings[index]}</div>
                  </td>
                  <td>
                    <div className="titanFirstName">{firstName}</div>
                    <div className="titanLastName">{lastName}</div>
                  </td>
                  <td className="statValue">
                    {titan.num_win} - {titan.num_loss} - {titan.num_tie}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="statCaption">NR = Not Ranked (since titan is inactive)</div>
      </div>
    </div>
  );
}

export default TitanLeaderboard;
```

### Step 3.2: Copy Ranking Utility
Create `client/src/utils/ranking.js` and copy your `generateRankStrings()` function from `public/js/view/util/ranking.js`.

Add to `App.jsx`:
```jsx
import TitanLeaderboard from './components/TitanLeaderboard';

function App() {
  return (
    <div>
      <Header />
      <WinLossSection />
      <TitanLeaderboard />
      <Footer />
    </div>
  );
}
```

**✨ What you just learned:**
- **`.map()` for lists** - Transform array of data into array of JSX elements
- **`key` prop** - React needs unique keys for list items (use `titan.titan_name`)
- **Destructuring** - `const [first, last] = name.split(' ')`
- **Template literals in className** - `` className={`rank rank${titan.rank}`} ``
- **Nullish coalescing** - `titan.rank ?? 'NR'` (if null, use 'NR')

**🎉 Phase 3 Complete!** You're rendering dynamic lists from API data!

---

## 🎯 Phase 4: Titan Cards (2 hours)
**Goal:** Build complex, reusable components with nested data
**React Concepts:** Component composition, prop drilling, reusable widgets

### Step 4.1: Create Reusable Widget Component
Create `client/src/components/Widget.jsx`:

```jsx
function Widget({ title, value, caption, fullWidth = false }) {
  const widgetClass = fullWidth ? 'widget widget-full' : 'widget';
  
  return (
    <div className={widgetClass}>
      <div className="widget-title">{title}</div>
      <div className="widget-content">
        <div className="widget-value">{value}</div>
        {caption && <em className="widget-caption">{caption}</em>}
      </div>
    </div>
  );
}

export default Widget;
```

### Step 4.2: Build TitanCard Component
Create `client/src/components/TitanCard.jsx`:

```jsx
import Widget from './Widget';

function TitanCard({ titan, rankString }) {
  const [firstName, lastName] = titan.titan_name.split(' ');
  const rankClass = `rank rank${titan.rank ?? 'NR'}`;
  const titanId = titan.titan_name.replace(' ', '-');

  // Format record string (copy your formattedRecordString logic)
  const recordString = formatRecord(titan.num_win, titan.num_loss, titan.num_tie);

  return (
    <div className="section titanCard" id={titanId}>
      <div className="section-title">
        <div className={rankClass}>{rankString}</div>
        <div className="section-title-name">{titan.titan_name}</div>
      </div>

      <div className="section-content">
        <div className="section-row">
          <Widget 
            title="Record" 
            value={recordString} 
            caption="Win-Loss-Tie" 
          />
          <Widget
            title="Avg Score"
            value={titan.avg_score?.toFixed(1) || 'N/A'}
            caption={
              <>
                10-pt scale
                <span className="footnote">
                  <sup>†</sup>
                </span>
              </>
            }
          />
        </div>

        {/* Add more widgets here: best score, per-round stats, etc. */}
      </div>
    </div>
  );
}

// Helper function (copy from your renderRecords.js)
function formatRecord(win, loss, tie) {
  const isTwoDigit = (num) => Math.abs(num) >= 10;
  const count = [win, loss, tie].filter(isTwoDigit).length;
  return count >= 2 ? `${win}-${loss}-${tie}` : `${win} - ${loss} - ${tie}`;
}

export default TitanCard;
```

### Step 4.3: Build TitanCards Container
Create `client/src/components/TitanCards.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { fetchTitanRecords } from '../services/api';
import { generateRankStrings } from '../utils/ranking';
import TitanCard from './TitanCard';

function TitanCards() {
  const [titans, setTitans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await fetchTitanRecords();
      setTitans(data);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div>Loading titan cards...</div>;

  const rankStrings = generateRankStrings(titans.map(t => t.rank));

  return (
    <div>
      {titans.map((titan, index) => (
        <TitanCard 
          key={titan.titan_name} 
          titan={titan} 
          rankString={rankStrings[index]} 
        />
      ))}
    </div>
  );
}

export default TitanCards;
```

Add to `App.jsx`:
```jsx
import TitanCards from './components/TitanCards';

function App() {
  return (
    <div>
      <Header />
      <WinLossSection />
      <TitanLeaderboard />
      <TitanCards />
      <Footer />
    </div>
  );
}
```

**✨ What you just learned:**
- **Component composition** - `<TitanCard>` uses `<Widget>` internally
- **Props** - Pass data down: `titan={titan}`, `rankString={rankStrings[index]}`
- **Reusable components** - `<Widget>` is used multiple times with different props
- **Optional chaining** - `titan.avg_score?.toFixed(1)` (safe navigation)
- **JSX fragments** - `<>...</>` for grouping without extra div

**🎉 Phase 4 Complete!** You've eliminated 240+ lines of duplicate HTML with ONE reusable component!

---

## 🎯 Phase 5: Optimize & Refactor (1 hour)
**Goal:** Eliminate duplicate data fetching, lift state up
**React Concepts:** Lifting state, prop drilling, custom hooks

### Problem: Duplicate Fetching
Right now, `TitanLeaderboard` and `TitanCards` both fetch the same data. This is inefficient!

### Solution: Lift State to App.jsx
**Update App.jsx:**
```jsx
import { useState, useEffect } from 'react';
import { fetchTitanRecords, fetchWinLoss } from './services/api';
import { generateRankStrings } from './utils/ranking';
import Header from './components/Header';
import WinLossSection from './components/WinLossSection';
import TitanLeaderboard from './components/TitanLeaderboard';
import TitanCards from './components/TitanCards';
import Footer from './components/Footer';

function App() {
  const [titans, setTitans] = useState([]);
  const [winLoss, setWinLoss] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch ALL data once at top level
  useEffect(() => {
    async function loadData() {
      const [titanData, winLossData] = await Promise.all([
        fetchTitanRecords(),
        fetchWinLoss(),
      ]);
      setTitans(titanData);
      setWinLoss(winLossData);
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <div>Loading Titan Tracker...</div>;

  const rankStrings = generateRankStrings(titans.map(t => t.rank));

  return (
    <div>
      <Header />
      <WinLossSection winLoss={winLoss} />
      <TitanLeaderboard titans={titans} rankStrings={rankStrings} />
      <TitanCards titans={titans} rankStrings={rankStrings} />
      <Footer />
    </div>
  );
}

export default App;
```

**Update child components to accept props:**

`WinLossSection.jsx`:
```jsx
function WinLossSection({ winLoss }) {
  // Remove useState, useEffect - just use props!
  const total = winLoss.num_win + winLoss.num_tie + winLoss.num_loss;
  const percentSuccess = (100 * winLoss.num_win) / total;

  return (
    // ...same JSX as before
  );
}
```

`TitanLeaderboard.jsx`:
```jsx
function TitanLeaderboard({ titans, rankStrings }) {
  // Remove useState, useEffect
  return (
    // ...same JSX as before
  );
}
```

`TitanCards.jsx`:
```jsx
function TitanCards({ titans, rankStrings }) {
  // Remove useState, useEffect
  return (
    <div>
      {titans.map((titan, index) => (
        <TitanCard 
          key={titan.titan_name} 
          titan={titan} 
          rankString={rankStrings[index]} 
        />
      ))}
    </div>
  );
}
```

**✨ What you just learned:**
- **Lifting state up** - Move shared state to common parent
- **Props down, events up** - Data flows from parent → child via props
- **Promise.all()** - Fetch multiple APIs in parallel
- **Single source of truth** - Data is fetched once, used everywhere

**🎉 Phase 5 Complete!** Your app is now optimized with proper data flow!

---

## 🎯 Phase 6: Add More Stats (1-2 hours)
**Goal:** Practice everything you've learned by adding remaining features
**Your turn to code!**

### Tasks:
1. **Fetch and display stats** from `/stats` endpoints
2. **Build BestScoreWidget** component (with ingredient list)
3. **Build PerRoundStatsTable** component (with histogram)
4. **Add loading states** and error handling

**Hints:**
- Copy structure from your `renderStats.js` file
- Create new components: `BestScoreWidget.jsx`, `PerRoundStatsTable.jsx`
- Fetch data in `App.jsx` and pass as props
- Use `.map()` for rendering ingredient lists

---

## 🎯 Phase 7: Deploy (30 minutes)
**Goal:** Get your React app live

### Option 1: Vercel (Easiest)
```bash
cd client
npm run build  # Creates production build in client/dist

# Deploy to Vercel
npx vercel --prod
```

### Option 2: Serve from Express
Update your Express server to serve React build:

```javascript
// server.js
const path = require('path');

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'client/dist')));

// All other routes serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});
```

Then:
```bash
cd client
npm run build
cd ..
node server.js
```

Visit `http://localhost:3000` - you're now serving React from Express!

---

## 🎓 What You've Learned

By the end, you'll have re-learned:

### Core Concepts
- ✅ JSX syntax and component structure
- ✅ `useState` for managing data
- ✅ `useEffect` for side effects (data fetching)
- ✅ Props for passing data between components
- ✅ Conditional rendering (`if (loading)...`)
- ✅ List rendering with `.map()` and `key` prop

### Advanced Concepts
- ✅ Component composition (nesting components)
- ✅ Lifting state up to parent components
- ✅ Custom utilities and helper functions
- ✅ API integration with async/await
- ✅ Reusable components with flexible props

### Bonus Skills
- ✅ Vite build tool
- ✅ Modern JavaScript (destructuring, optional chaining, nullish coalescing)
- ✅ CSS modules or styled-components (if you explore further)
- ✅ React DevTools for debugging

---

## 🚨 Common Mistakes to Watch For

### 1. Forgetting `key` prop in lists
```jsx
// ❌ Bad
{titans.map(titan => <div>{titan.name}</div>)}

// ✅ Good
{titans.map(titan => <div key={titan.titan_name}>{titan.name}</div>)}
```

### 2. Mutating state directly
```jsx
// ❌ Bad
titans.push(newTitan);

// ✅ Good
setTitans([...titans, newTitan]);
```

### 3. Missing dependencies in useEffect
```jsx
// ❌ Bad - will cause infinite loop
useEffect(() => {
  fetchData().then(data => setTitans(data));
}); // Missing dependency array!

// ✅ Good
useEffect(() => {
  fetchData().then(data => setTitans(data));
}, []); // Empty array = run once
```

### 4. Using `class` instead of `className`
```jsx
// ❌ Bad
<div class="widget">

// ✅ Good
<div className="widget">
```

---

## 🔗 Quick Reference Links

When you get stuck, check:
- **React Docs:** https://react.dev/learn
- **useState:** https://react.dev/reference/react/useState
- **useEffect:** https://react.dev/reference/react/useEffect
- **Vite Docs:** https://vitejs.dev/guide/

---

## 🎉 You Did It!

By following this guide, you've:
- ✅ Converted 539 lines of HTML → 25 lines + reusable components
- ✅ Eliminated repetitive `populateElement()` calls
- ✅ Built a modern, maintainable React application
- ✅ Re-learned React by **doing**, not by reading tutorials

**Next steps:**
- Add more features (search, filtering, sorting)
- Explore React Router for multi-page navigation
- Try Zustand or Context API for global state management
- Write tests with Vitest

**Great work!** 🚀
