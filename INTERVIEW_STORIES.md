# Titan Tracker Project - Interview Stories

## Tailored for IBM Entry Level Software Developer Position

## 🎯 Project Overview

A full-stack web application that tracks win-loss records and rankings for the "Titans" on Food Network's _Tournament of Champions_. Users can view current leaderboard rankings, individual titan stats, and historical performance. Built with **Node.js/Express backend**, **PostgreSQL database**, and **vanilla JavaScript frontend**.

**Tech Stack Alignment with IBM:**

- ✅ **Required:** JavaScript, GitHub, Databases (PostgreSQL)
- ✅ **Preferred:** Node.js, Web development, REST APIs, SQL databases, Window functions

---

## 🏆 Story Rankings for IBM Interview

### Tier 1: Lead with These (Best Match for IBM's Requirements)

1. **SQL Window Functions Migration** ⭐⭐⭐⭐⭐
    - **Why:** Shows advanced SQL, debugging tie-handling bugs, moving logic to proper layer
    - **IBM Alignment:** SQL databases (Db2, PostgreSQL), window functions, analytical thinking
    - **Demonstrates:** SQL RANK(), debugging edge cases, layer separation, eliminating error-prone JavaScript

2. **SQL Query Organization Refactor** ⭐⭐⭐⭐
    - **Why:** Shows code organization, separation of concerns, maintainability
    - **IBM Alignment:** Enterprise patterns, maintainable code, file structure
    - **Demonstrates:** Extracting SQL from routes, creating utilities, best practices

3. **Query Simplification & Optimization** ⭐⭐⭐⭐
    - **Why:** Shows SQL proficiency, performance mindset, removing unnecessary complexity
    - **IBM Alignment:** Database optimization, SQL query design, refactoring
    - **Demonstrates:** CTE simplification, query performance, analytical thinking

### Tier 2: Supporting Stories

4. **Database Schema Design: Natural Composite Keys & Table Relationships** ⭐⭐⭐⭐
    - **Why:** Shows database design thinking, understanding of keys/relationships, normalized schema
    - **IBM Alignment:** Database systems (Db2, PostgreSQL), schema design, foreign keys, data modeling
    - **Demonstrates:** Composite primary keys, foreign key constraints, relational design, natural vs surrogate keys

5. **Boolean Inversion Refactor (is_retired → is_active)** ⭐⭐⭐
    - **Why:** Shows thoughtful design decisions, consistency, refactoring across layers
    - **IBM Alignment:** Code clarity, maintainable patterns, full-stack changes
    - **Demonstrates:** Semantic naming, SQL + JavaScript refactoring, testing edge cases

---

## 📖 Detailed Interview Stories

## Story 1: SQL Window Functions Migration (Fixing Tie-Handling Bugs)

### **Expanded Story**

Titan Tracker ranks 3 titans by their win-loss records. Initially, I calculated ranks in **JavaScript** after fetching data from the database. This caused multiple bugs with tie handling.

**The Original Bugs:**

```javascript
// JavaScript ranking logic (buggy)
titanRecords.forEach((titan, index) => {
	let rank = index + 1; // Simple: 1, 2, 3

	if (currScore == titan.score) {
		isTie = true;
		rank = currRank; // Reuse previous rank
	}
	// BUG: If scores are [0.8, 0.8, 0.6], this produces ranks [1, 1, 3]
	// But also needed to handle [0.8, 0.75, 0.75] → [1, T-2nd, T-2nd]
	// And [0.8, 0.8, 0.8] → [T-1st, T-1st, T-1st]
});
```

**The Problems:**

1. **Complex logic:** Needed to handle 4 tie scenarios (no ties, 2-way tie at top, 2-way tie at bottom, 3-way tie)
2. **Error-prone:** Had to track `currScore`, `currRank`, `isTie` state variables
3. **Wrong layer:** Rankings are a **data concern**, not a presentation concern
4. **Retired titans:** Needed to exclude retired titans from rankings but still display them

**The Solution:** Use SQL `RANK()` window function:

```sql
-- Clean SQL solution (no bugs!)
SELECT
    titan_name,
    is_active,
    CASE
        WHEN is_active = false THEN NULL  -- Retired = no rank
        ELSE RANK() OVER (
            PARTITION BY is_active
            ORDER BY score DESC, titan_name ASC
        )
    END AS rank,
    num_win,
    num_tie,
    num_loss
FROM titan_scores;
```

**Benefits:**

- **Automatic tie handling:** `RANK()` correctly produces [1, 1, 3] or [1, 2, 2]
- **Simpler frontend:** Deleted ~30 lines of JavaScript logic
- **Single source of truth:** Ranking logic lives in database where it belongs
- **No state bugs:** No need to track `currScore`, `isTie`, etc.

### **STAR Format**

**Situation:** Building a leaderboard for 3 titans ranked by win percentage. Initially calculated ranks in JavaScript after fetching data from PostgreSQL. This led to bugs with tie scenarios (e.g., two titans with same score should both be "T-1st", next should be "3rd").

**Task:** Fix tie-handling bugs and refactor ranking logic to be more robust, maintainable, and architecturally correct (data calculations should happen in database, not frontend).

**Action:**

- Identified 4 tie scenarios that needed handling: no ties, 2-way at top, 2-way at bottom, 3-way
- Debugged JavaScript logic that was using index-based ranking (buggy with ties)
- Researched SQL window functions: `RANK()`, `DENSE_RANK()`, `ROW_NUMBER()`
- Chose `RANK()` because it handles ties correctly (1, 1, 3 instead of 1, 2, 3)
- Refactored SQL query to use `RANK() OVER (ORDER BY score DESC)`
- Added `PARTITION BY is_active` to exclude retired titans from rankings
- Updated frontend to consume rank directly from API (removed calculation logic)
- Added null handling for retired titans (rank = NULL)
- Tested all tie scenarios to verify correct behavior

**Result:** **Eliminated all tie-handling bugs** and removed ~30 lines of error-prone JavaScript. Learned about **SQL window functions**, **proper layer separation**, and how moving logic to the right place often simplifies code. This demonstrates understanding of **advanced SQL**, **debugging systematic issues**, and **architectural thinking**—skills IBM needs for database-heavy applications.

### **Maps to These Interview Questions:**

- ✅ "Describe experience with SQL and databases"
- ✅ "Tell me about debugging a systematic bug"
- ✅ "How do you decide where logic should live?"
- ✅ "Describe a time you refactored code to eliminate bugs"
- ✅ "Tell me about SQL window functions or advanced queries"

---

## Story 2: SQL Query Organization Refactor

### **Expanded Story**

Initially, my Express route files contained **inline SQL strings**:

```javascript
// routes/records.js (before - messy!)
router.get("/api/titanRecords", async (req, res) => {
	const query = `
        WITH titan_stats AS (
            SELECT titan_name, 
                   COUNT(CASE WHEN ...) AS num_win,
                   -- 40 more lines of SQL here
        ) SELECT ... FROM titan_scores
    `;
	const result = await pool.query(query);
	res.json(result.rows);
});
```

**The Problems:**

- **Hard to read:** SQL strings mixed with JavaScript logic
- **Hard to maintain:** Editing SQL requires careful quote escaping
- **No syntax highlighting:** SQL in strings doesn't get editor support
- **Hard to test:** Can't run queries independently of Node.js

**The Solution:**

1. Created `app/queries/` folder with `.sql` files organized by feature:
    - `queries/records/titanRecords.sql`
    - `queries/records/winLoss.sql`
    - `queries/stats/bestScores.sql`
2. Created `parseSQL.js` utility to read and execute SQL files:

```javascript
// utils/parseSQL.js
const fs = require("fs");
const path = require("path");

async function parseSQL(sqlFilePath, params = []) {
	const fullPath = path.join(__dirname, "..", sqlFilePath);
	const query = fs.readFileSync(fullPath, "utf8");
	return await pool.query(query, params);
}
```

3. Refactored routes to use clean file references:

```javascript
// routes/records.js (after - clean!)
router.get("/api/titanRecords", async (req, res) => {
	const result = await parseSQL("queries/records/titanRecords.sql");
	res.json(result.rows);
});
```

### **STAR Format**

**Situation:** Building a Node.js/Express backend with 5 different SQL queries. Initially wrote SQL as inline strings in route files. This made code hard to read, maintain, and test.

**Task:** Improve code organization by separating SQL from JavaScript while maintaining functionality and making queries easier to edit and test.

**Action:**

- Audited all route files to identify inline SQL queries
- Created organized folder structure: `app/queries/{records, stats}/`
- Extracted each query into dedicated `.sql` file with header comments
- Built `parseSQL()` utility function to:
    - Read SQL file from disk
    - Execute query with parameterization support
    - Handle errors consistently
- Refactored all routes to use `parseSQL('path/to/query.sql', params)`
- Updated code to use relative paths from project root
- Tested all endpoints to ensure behavior unchanged
- Added SQL file header comments documenting inputs/outputs

**Result:** **Reduced route file sizes by ~60%** and made SQL queries much easier to read and edit. Now can test queries directly in PostgreSQL without extracting from JavaScript strings. Learned about **separation of concerns**, **file organization**, and **utility function design**. Shows IBM I understand **enterprise code organization patterns** and **maintainability**.

### **Maps to These Interview Questions:**

- ✅ "How do you organize code for maintainability?"
- ✅ "Describe a refactoring project you completed"
- ✅ "Tell me about separation of concerns"
- ✅ "How do you make code easier to test?"
- ✅ "Describe experience with Node.js and Express"

---

## Story 3: Query Simplification & Optimization

### **Expanded Story**

After extracting SQL into files, I reviewed the queries and found opportunities for simplification. The `titanRecords.sql` query had **unnecessary complexity**:

**Before (56 lines):**

```sql
-- Overly complex with redundant CTEs
WITH titan_stats AS (
    SELECT titan_name,
           COUNT(CASE WHEN ...) AS num_win,
           COUNT(CASE WHEN ...) AS num_tie,
           COUNT(CASE WHEN ...) AS num_loss
    FROM titan_rounds
    GROUP BY titan_name
),
titan_scores AS (
    SELECT *,
           CASE WHEN ... THEN ... END AS score
    FROM titan_stats
),
-- Another CTE that could be combined
titan_with_active AS (
    SELECT ts.*, t.is_active
    FROM titan_scores ts
    JOIN titans t USING (titan_name)
)
SELECT ... FROM titan_with_active;
```

**After (35 lines - 37% shorter):**

```sql
-- Simplified: combined CTEs, removed redundancy
WITH titan_stats AS (
    SELECT titan_name,
           COUNT(CASE WHEN ...) AS num_win,
           COUNT(CASE WHEN ...) AS num_tie,
           COUNT(CASE WHEN ...) AS num_loss,
           -- Calculate score inline instead of separate CTE
           CASE
               WHEN COUNT(*) = 0 THEN 0
               ELSE COUNT(CASE WHEN ...)::float / COUNT(*)
           END AS score
    FROM titan_rounds
    GROUP BY titan_name
)
SELECT ts.*, t.is_active,
       RANK() OVER (PARTITION BY t.is_active ORDER BY ts.score DESC)
FROM titan_stats ts
JOIN titans t USING (titan_name);
```

**Improvements:**

- Merged 3 CTEs into 2
- Calculated score inline instead of separate step
- Removed intermediate result set
- Clearer logic flow

### **STAR Format**

**Situation:** After organizing SQL queries into separate files, reviewed them for optimization opportunities. Found the main leaderboard query had 3 CTEs (Common Table Expressions) with unnecessary intermediate steps.

**Task:** Simplify the query to improve readability and performance while maintaining correct results.

**Action:**

- Analyzed query execution plan to understand data flow
- Identified that `titan_scores` CTE was just adding one calculation
- Moved score calculation inline with `titan_stats` CTE
- Eliminated `titan_with_active` CTE by moving JOIN to final SELECT
- Reduced query from 56 lines to 35 lines (37% shorter)
- Tested extensively to ensure results unchanged
- Ran `EXPLAIN ANALYZE` to verify no performance regression
- Updated header comments to reflect simplified logic

**Result:** Query became **37% shorter and easier to understand** with same performance. Learned about **SQL optimization**, **CTE usage patterns**, and when simplification improves maintainability. Shows IBM I can **identify and remove unnecessary complexity**—important for maintaining large enterprise codebases.

### **Maps to These Interview Questions:**

- ✅ "Tell me about optimizing code or queries"
- ✅ "Describe experience with SQL optimization"
- ✅ "How do you balance performance and readability?"
- ✅ "Tell me about refactoring for simplicity"
- ✅ "Describe analytical or problem-solving skills"

---

## Story 4: Boolean Inversion Refactor (is_retired → is_active)

### **Expanded Story**

The database had an `is_retired` boolean column for titans who had left the show. This created **double-negative logic** everywhere:

```javascript
// Confusing double negatives
if (!titan.is_retired) {  // "if NOT retired" = active
    calculateRank(titan);
}

// SQL with NOT
WHERE is_retired = false  -- means "active titans"
```

**The Problem:** Double negatives are hard to read and error-prone. "Not retired" requires mental translation to "active".

**The Solution:** Inverted the boolean to `is_active`:

```javascript
// Much clearer
if (titan.is_active) {
    calculateRank(titan);
}

// SQL is clearer
WHERE is_active = true
```

**The Refactor Scope:**

- Updated PostgreSQL column: `ALTER TABLE titans RENAME COLUMN is_retired TO is_active`
- Inverted all values: `UPDATE titans SET is_active = NOT is_active`
- Updated SQL queries (3 files)
- Updated JavaScript frontend (1 file)
- Updated API response parsing
- Tested all endpoints

### **STAR Format**

**Situation:** Database had `is_retired` boolean for titans who left the show. This created confusing double-negative logic: `if (!titan.is_retired)` to check if active.

**Task:** Refactor to use positive boolean `is_active` for better code clarity, requiring changes across database, backend SQL, and frontend JavaScript.

**Action:**

- Identified all locations using `is_retired`: SQL queries, JavaScript, database schema
- Planned migration strategy:
    1. Update database column name and invert values
    2. Update SQL query files
    3. Update JavaScript response parsing
    4. Test all endpoints
- Executed SQL migration: `ALTER TABLE ... RENAME COLUMN` + `UPDATE ... SET is_active = NOT is_retired`
- Updated 3 SQL files to use `is_active` with correct boolean values
- Updated frontend to expect `is_active` field
- Tested all scenarios: active titans, retired titans, rank calculations
- Verified no logic errors from boolean inversion

**Result:** Code became **significantly more readable** by eliminating double negatives throughout. Learned about **semantic naming**, **boolean logic**, and **coordinating changes across full stack**. Shows IBM I value **code clarity** and can execute **systematic refactoring** across multiple layers.

### **Maps to These Interview Questions:**

- ✅ "Tell me about improving code readability"
- ✅ "Describe a refactoring project"
- ✅ "How do you handle schema changes?"
- ✅ "Tell me about coordinating changes across layers"
- ✅ "Describe attention to code quality"

---

## 💡 Interview Tips

### Opening Framework for IBM Interview

When asked "Tell me about a project you're proud of":

> "I built Titan Tracker, a web app that tracks rankings and stats for Food Network's Tournament of Champions. It's built with Node.js, Express, PostgreSQL, and vanilla JavaScript. The project taught me advanced SQL like window functions, code organization patterns, and refactoring across full stack—skills that translate directly to enterprise development at IBM."

### Story Selection Strategy for IBM Entry-Level Role

**Best Approach:** Lead with **SQL Window Functions Migration**

- Shows advanced SQL (RANK() window function) - IBM uses Db2, PostgreSQL
- Demonstrates debugging and problem-solving
- Shows proper layer separation (data vs presentation)

**If they ask about databases:** Lead with **SQL Window Functions** or **Query Simplification**  
**If they ask about code organization:** Lead with **SQL Query Organization Refactor**  
**If they ask about refactoring:** Lead with **Boolean Inversion** or **Query Simplification**

### Project Context (IBM-Relevant Details)

- **Tech Stack:** Node.js, Express, PostgreSQL, JavaScript, HTML5, CSS3—directly matches IBM's web development requirements
- **Database:** PostgreSQL with advanced features (window functions, CTEs)—aligns with IBM's Db2/SQL database focus
- **Source Control:** Git/GitHub throughout—meets required proficiency
- **Scale:** 324 commits, 3 titans, 20+ episodes tracked
- **Development Approach:** Iterative refactoring, continuous improvement

---

## Story 4: Database Schema Design (Natural Composite Keys & Table Relationships)

### **Challenge**

Needed to design a relational database schema to track:

- **Titans** (players): name, active status
- **Episodes**: season, episode number, challenger, judge
- **Rounds**: 3 rounds per episode with ingredients, scores, which titan competed

**Initial Design Decision:** Should I use auto-incrementing IDs (e.g., `round_id SERIAL PRIMARY KEY`) or natural composite keys (e.g., `PRIMARY KEY (season_num, episode_num, round_num)`)?

### **Analysis**

**Option 1: Surrogate IDs (Auto-Increment)**

- ✅ Narrow (single integer column for joins)
- ✅ Stable (if natural key changes, don't need cascade updates)
- ⚠️ Meaningless (id=142 requires join to understand what it represents)
- ⚠️ Need separate UNIQUE constraint to prevent duplicate rounds

**Option 2: Natural Composite Keys (My Choice)**

- ✅ **Self-documenting** (season 4, episode 10, round 2 is inherently readable)
- ✅ **Prevents duplicates by design** (can't accidentally insert same round twice)
- ✅ **Fine for small datasets** (~1000 rows: 4 seasons × 80 episodes × 3 rounds)
- ⚠️ Slightly wider for joins (3 columns vs 1 ID)

### **Solution: 3-Table Relational Schema**

```sql
-- Table 1: Titans metadata
CREATE TABLE titans (
    titan_name VARCHAR PRIMARY KEY,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Table 2: Episode information
CREATE TABLE titan_episodes (
    season_num INTEGER NOT NULL,
    episode_num INTEGER NOT NULL,
    challenger_name VARCHAR NOT NULL,
    judge_name VARCHAR NOT NULL,
    PRIMARY KEY (season_num, episode_num)
);

-- Table 3: Round-by-round results
CREATE TABLE titan_rounds (
    season_num INTEGER NOT NULL,
    episode_num INTEGER NOT NULL,
    round_num INTEGER NOT NULL,  -- 1, 2, or 3
    titan_name VARCHAR NOT NULL,  -- Foreign Key!
    ingredient1 VARCHAR NOT NULL,
    ingredient2 VARCHAR NOT NULL,
    max_score INTEGER NOT NULL,   -- 10 or 20
    titan_score INTEGER NOT NULL,
    challenger_score INTEGER NOT NULL,
    PRIMARY KEY (season_num, episode_num, round_num),
    FOREIGN KEY (titan_name) REFERENCES titans(titan_name)
);
```

### **Key Design Decisions**

1. **Natural Composite Keys:** Used semantic keys (season 4, episode 10, round 2) instead of arbitrary IDs because:
    - Dataset is small (~1000 rounds)
    - Natural keys are self-documenting in queries
    - Composite PK prevents duplicate rounds by design

2. **Foreign Key Constraint:** `titan_name` in `titan_rounds` references `titans.titan_name`
    - Enforces referential integrity (can't assign round to non-existent titan)
    - Shows understanding of table relationships

3. **Normalized Design:** Separated concerns into 3 tables instead of one denormalized table
    - Episode info (challenger, judge) in `titan_episodes` (not repeated per round)
    - Titan metadata (active status) in `titans` (not repeated per round)
    - Round results in `titan_rounds` with FKs to related tables

### **Performance Considerations**

**When Natural Composite Keys Work:**

- Small datasets (<10k rows): Join performance is similar to surrogate IDs
- Read-heavy workloads: Composite keys actually speed up queries (no need to join just to understand the key)

**When to Use Surrogate IDs Instead:**

- Large datasets (>100k rows): Narrow integer keys speed up joins significantly
- Frequently changing natural keys: Surrogate IDs avoid cascade updates
- External references: APIs/URLs benefit from short integer IDs

**For Titan Tracker:** Natural composite keys were the right choice given small dataset and read-heavy workload.

### **STAR Format**

**Situation:** Building database schema for Food Network show data. Needed to track titans, episodes, and round-by-round battle results. Had to decide between auto-incrementing IDs vs natural composite keys.

**Task:** Design normalized relational schema with 3 tables (titans, episodes, rounds) that:

- Prevents duplicate data entry
- Maintains referential integrity
- Is readable and self-documenting
- Performs well for small dataset (~1000 rounds)

**Action:**

- Analyzed trade-offs: surrogate IDs (narrow, stable) vs natural keys (semantic, self-documenting)
- Chose natural composite keys for rounds: `PRIMARY KEY (season_num, episode_num, round_num)`
- Implemented foreign key constraint: `titan_name REFERENCES titans.titan_name`
- Normalized design: separated episode info, titan metadata, and round results into 3 tables
- Documented schema with comments in SQL files for future reference
- Validated design prevents duplicates (can't insert same season/episode/round twice)

**Result:**

- Clean 3-table relational schema with proper foreign keys
- Self-documenting queries (SELECT from season 4, episode 10 is readable without joins)
- Zero duplicate data issues (composite PK prevents re-inserting same round)
- Fast query performance for small dataset
- Demonstrates understanding of: primary keys, foreign keys, referential integrity, normalization, natural vs surrogate keys

**IBM Relevance:** Shows database design thinking critical for Db2 and PostgreSQL systems. Understanding of when to use composite keys vs IDs, foreign key constraints, and normalized schema design.

---

## 🎯 Why IBM? (Connecting Titan Tracker to IBM Culture)

**What to emphasize:**

- "Titan Tracker taught me SQL window functions and query optimization—skills I'm eager to apply to IBM's enterprise databases like Db2"
- "The project showed me the importance of proper layer separation and code organization—essential for large-scale systems at IBM"
- "I learned that sometimes the best solution is moving logic to the right place, not just making it work—a mindset I'll bring to IBM's enterprise applications"
- "Building this taught me to value simplicity and readability, which matters even more when working on teams at IBM"
- "Designing the database schema taught me to think about trade-offs (natural keys vs IDs, normalization vs performance) which will help me make informed decisions on IBM projects"

---

**Remember:** These stories demonstrate you have:

- ✅ **Required:** JavaScript, GitHub, Debugging/Problem-solving, Databases
- ✅ **Preferred:** Node.js, Web development (REST APIs), SQL databases (PostgreSQL), Advanced SQL
- ✅ **Culture Fit:** Continuous improvement, analytical thinking, code quality focus

You're positioning as a **developer who understands databases deeply, values clean code organization, and learns from experience**—perfect for IBM's enterprise environment.
