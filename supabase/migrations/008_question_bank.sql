-- ═══════════════════════════════════════════════════════
-- Migration 008: question_bank catalogue (idempotent)
-- ═══════════════════════════════════════════════════════

create table if not exists public.question_bank (
  id                     uuid primary key default gen_random_uuid(),
  subject_code           text not null references public.subjects(code) on delete cascade,
  type                   text not null check (type in ('mcq', 'theory')),
  question               text not null,
  options                jsonb, -- e.g. {"A": "Option A", "B": "Option B", "C": "Option C", "D": "Option D"}
  correct_option         text, -- A, B, C, or D
  explanation            text, -- explanation for MCQ
  marks                  smallint, -- marks weightage for theory
  expected_duration_mins smallint, -- duration estimate for theory
  ideal_answer           text, -- MU acceptable model answer conforming to exam evaluation guidelines
  year_of_exam           smallint, -- exam year
  created_at             timestamptz default now()
);

-- Enable RLS
alter table public.question_bank enable row level security;

-- Setup Select Policy
drop policy if exists "Public can read question_bank" on public.question_bank;
create policy "Public can read question_bank"
  on public.question_bank for select
  using (true);

-- Seed Data (AIDS Sem 4: OS, DBMS, CT)
insert into public.question_bank (subject_code, type, question, options, correct_option, explanation, marks, expected_duration_mins, ideal_answer, year_of_exam)
values
-- ── OPERATING SYSTEMS (2014113-OS) MCQS ──────────────────────────────────────────
(
  '2014113-OS', 'mcq',
  $$Which of the following scheduling algorithms can lead to starvation/indefinite blocking?$$,
  '{"A": "Round Robin", "B": "Shortest Job First (SJF)", "C": "First-Come First-Served (FCFS)", "D": "None of the above"}',
  'B',
  $$SJF prioritizes shorter jobs. If a steady stream of short processes enters the queue, longer processes will experience starvation.$$,
  null, null, null, 2024
),
(
  '2014113-OS', 'mcq',
  $$In virtual memory paging, when does a page fault occur?$$,
  '{"A": "When a page resides in main memory cache", "B": "When the CPU requests a page not currently present in physical memory (RAM)", "C": "When memory experiences internal fragmentation", "D": "When the TLB hit ratio is 100%"}',
  'B',
  $$A page fault is an interrupt triggered by the hardware MMU when a program accesses a page mapped in logical address space but not loaded in RAM.$$,
  null, null, null, 2024
),
(
  '2014113-OS', 'mcq',
  $$Which condition is NOT required for a deadlock state to occur?$$,
  '{"A": "Mutual Exclusion", "B": "Hold and Wait", "C": "Preemption", "D": "Circular Wait"}',
  'C',
  $$No preemption is required for deadlock. If preemption is allowed, resources can be allocated elsewhere, resolving the deadlock.$$,
  null, null, null, 2023
),
(
  '2014113-OS', 'mcq',
  $$Belady's Anomaly occurs in which of the following page replacement algorithms?$$,
  '{"A": "LRU (Least Recently Used)", "B": "Optimal replacement", "C": "FIFO (First-In First-Out)", "D": "MRU (Most Recently Used)"}',
  'C',
  $$FIFO can experience Belady's Anomaly, where increasing the number of physical page frames results in more page faults.$$,
  null, null, null, 2023
),
(
  '2014113-OS', 'mcq',
  $$What is the purpose of the Banker's Algorithm?$$,
  '{"A": "Deadlock Prevention", "B": "Deadlock Detection", "C": "Deadlock Avoidance", "D": "Deadlock Recovery"}',
  'C',
  $$Banker's algorithm is a resource allocation and deadlock avoidance algorithm that tests for safety by simulating allocations.$$,
  null, null, null, 2024
),

-- ── OPERATING SYSTEMS (2014113-OS) THEORY ───────────────────────────────────────
(
  '2014113-OS', 'theory',
  $$Explain the critical section problem and discuss Peterson's solution for two processes. State its requirements.$$,
  null, null, null, 10, 15,
  $$### Mumbai University Exam Model Answer

#### 1. Introduction & Critical Section Problem Definition
The **Critical Section Problem** is a fundamental synchronization problem in Operating Systems. A critical section is a code segment where shared resources (e.g., variables, tables, files) are accessed. If multiple processes execute their critical sections concurrently, it leads to a race condition (data inconsistency).

To solve this, any solution must satisfy three strict requirements:
1. **Mutual Exclusion:** If process Pi is executing in its critical section, no other processes can execute in their critical sections.
2. **Progress:** If no process is executing in its critical section and some processes wish to enter, only those processes not executing in their remainder sections can participate in deciding which process enters next.
3. **Bounded Waiting:** There must be a limit on the number of times other processes are allowed to enter their critical sections after a process has made a request to enter and before that request is granted.

---

#### 2. Peterson's Solution Algorithm (Two Processes: P0 and P1)
Peterson's solution is a classic software-based solution for two processes. It uses two shared variables:
- `boolean flag[2]`: Initiated to false. `flag[i] = true` indicates process i wants to enter.
- `int turn`: Indicates whose turn it is to enter.

##### Algorithm Code Structure:
```c
// Process i (i = 0 or 1, and j = 1 - i)
do {
    flag[i] = true;
    turn = j;
    while (flag[j] && turn == j); // Busy wait / Entry section
    
    // CRITICAL SECTION
    
    flag[i] = false; // Exit section
    
    // REMAINDER SECTION
} while (true);
```

---

#### 3. Verification of Requirements
- **Mutual Exclusion:** Pi enters only if `flag[j] == false` or `turn == i`. Since `turn` can only hold one value (0 or 1) at a time, both processes cannot enter their critical sections simultaneously.
- **Progress:** If Pj does not want to enter, `flag[j] = false`, and Pi's busy-wait terminates immediately, allowing it to enter.
- **Bounded Waiting:** Since turn is set to `j` upon entry, Pi yields the turn to Pj, ensuring Pj will enter at most once before Pi gets another turn.$$,
  2024
),
(
  '2014113-OS', 'theory',
  $$Explain Paging and describe the Logical to Physical Address Translation mechanism with a neat block diagram.$$,
  null, null, null, 10, 15,
  $$### Mumbai University Exam Model Answer

#### 1. Concept of Paging
**Paging** is a non-contiguous memory management scheme that eliminates the need for contiguous allocation of physical memory.
- **Pages:** Logical memory is divided into fixed-size blocks called Pages.
- **Frames:** Physical memory (RAM) is divided into same-sized blocks called Frames.
- **Page Table:** A data structure maintained by the OS for each process to map logical pages to physical frames.

---

#### 2. Address Translation Mechanism
The CPU generates a **Logical Address** which consists of two parts:
1. **Page Number (p):** Used as an index into the page table.
2. **Page Offset (d):** Combined with the base frame address to define the physical memory address.

##### Step-by-Step Translation Steps:
1. CPU requests a logical address containing page `p` and offset `d`.
2. The Memory Management Unit (MMU) uses page number `p` to look up the entry in the active process's Page Table.
3. The Page Table retrieves the corresponding frame number `f`.
4. The physical address is constructed by appending offset `d` directly to frame number `f` (Physical Address = `f * page_size + d`).
5. Offset `d` remains unchanged during translation because the page size is equal to the frame size.

---

#### 3. Conceptual Block Diagram
```
    LOGICAL ADDRESS
   +-------+-------+
   |   p   |   d   |
   +---+---+---+---+
       |       |
       |       +-----------------------+
       v                               |
   [ PAGE TABLE ]                      |
   +---+-------+                       |
   | p | Frame |                       |
   +---+-------+                       v
   | 0 |   5   |               PHYSICAL ADDRESS
   | 1 |   9   |-------------> +-------+-------+
   | 2 |   12  |               |   f   |   d   |
   +---+-------+               +---+---+---+---+
                                   |       |
                                   v       v
                               [ PHYSICAL MEMORY ]
```$$,
  2023
),
(
  '2014113-OS', 'theory',
  $$Discuss Banker's Algorithm for Deadlock Avoidance with Safety and Resource Request algorithms.$$,
  null, null, null, 12, 18,
  $$### Mumbai University Exam Model Answer

#### 1. Concept of Banker's Algorithm
The **Banker's Algorithm** is a deadlock avoidance method used for systems with multiple instances of resources. When a process requests resources, the system simulates the allocation and evaluates if the resulting state is **safe** (no deadlock can occur). If safe, resources are allocated; otherwise, the process must wait.

---

#### 2. Data Structures Used
- `Available[m]`: 1D array. If `Available[j] = k`, there are `k` instances of resource type `Rj` free.
- `Max[n][m]`: 2D array. `Max[i][j]` defines the maximum demand of process `Pi` for resource `Rj`.
- `Allocation[n][m]`: 2D array. `Allocation[i][j]` defines the number of resources currently allocated to `Pi`.
- `Need[n][m]`: 2D array. `Need[i][j] = Max[i][j] - Allocation[i][j]`.

---

#### 3. Safety Algorithm
Tests whether a system is in a safe state:
1. Let `Work` be an array of length `m` and `Finish` be an array of length `n`.
   - Initialize: `Work = Available`, and `Finish[i] = false` for all `i`.
2. Find an index `i` such that both:
   - `Finish[i] == false`
   - `Need[i] <= Work`
   If no such `i` exists, go to Step 4.
3. Update state for process `Pi`:
   - `Work = Work + Allocation[i]`
   - `Finish[i] = true`
   Go to Step 2.
4. If `Finish[i] == true` for all `i`, the system is in a **safe state**.

---

#### 4. Resource Request Algorithm
Processes resource requests for process `Pi`:
1. If `Request[i] <= Need[i]`, go to Step 2. Otherwise, raise an error (process exceeded maximum claim).
2. If `Request[i] <= Available`, go to Step 3. Otherwise, `Pi` must wait since resources are not available.
3. Pretend to allocate resources:
   - `Available = Available - Request[i]`
   - `Allocation[i] = Allocation[i] + Request[i]`
   - `Need[i] = Need[i] - Request[i]`
4. Run the **Safety Algorithm**.
   - If safe, allocate permanently.
   - If unsafe, roll back allocation state and make `Pi` wait.$$,
  2024
),

-- ── DATABASE SYSTEMS (2014112-DBMS) MCQS ─────────────────────────────────────────
(
  '2014112-DBMS', 'mcq',
  $$Which normal form requires functional dependencies to be such that for every X -> Y, X is a super key?$$,
  '{"A": "First Normal Form (1NF)", "B": "Second Normal Form (2NF)", "C": "Third Normal Form (3NF)", "D": "Boyce-Codd Normal Form (BCNF)"}',
  'D',
  $$BCNF is stricter than 3NF. It requires that for every non-trivial functional dependency X -> Y, the left-hand side X must be a super key.$$,
  null, null, null, 2024
),
(
  '2014112-DBMS', 'mcq',
  $$Which SQL command is used to remove all records from a table and release the storage space, but keep the structure intact?$$,
  '{"A": "DELETE", "B": "DROP", "C": "TRUNCATE", "D": "REMOVE"}',
  'C',
  $$TRUNCATE is a DDL command that deletes all rows from a table quickly by deallocating the data pages, keeping the table schema.$$,
  null, null, null, 2024
),
(
  '2014112-DBMS', 'mcq',
  $$In transaction schedules, what does the ACID property 'Isolation' guarantee?$$,
  '{"A": "That transactions are all-or-nothing", "B": "That concurrent execution of transactions leaves the database in a state equivalent to serial execution", "C": "That changes survive system crashes", "D": "That transactions preserve database constraints"}',
  'B',
  $$Isolation ensures that the execution of concurrent transactions is isolated from one another, preventing dirty reads or updates.$$,
  null, null, null, 2023
),
(
  '2014112-DBMS', 'mcq',
  $$Which relational algebra operator selects rows that satisfy a given predicate?$$,
  '{"A": "Projection (π)", "B": "Selection (σ)", "C": "Cartesian Product (x)", "D": "Join (⋈)"}',
  'B',
  $$The Selection operator (denoted by lowercase sigma σ) filters tuples from a relation that satisfy a logical condition.$$,
  null, null, null, 2023
),
(
  '2014112-DBMS', 'mcq',
  $$A primary key must satisfy which two properties?$$,
  '{"A": "Unique and Nullable", "B": "Unique and NOT NULL", "C": "Foreign Key and Indexed", "D": "Composite and Candidate"}',
  'B',
  $$A primary key uniquely identifies each record in a table, meaning it must contain unique values and cannot contain NULL values.$$,
  null, null, null, 2024
),

-- ── DATABASE SYSTEMS (2014112-DBMS) THEORY ───────────────────────────────────────
(
  '2014112-DBMS', 'theory',
  $$Explain 1NF, 2NF, 3NF and BCNF with suitable examples and functional dependencies.$$,
  null, null, null, 12, 18,
  $$### Mumbai University Exam Model Answer

#### 1. First Normal Form (1NF)
A relation is in **1NF** if and only if the domain of each attribute contains only atomic (indivisible) values, and no attribute contains multiple values or repeating groups.

##### Example:
*Incorrect (Non-1NF):* A table where a single student row contains multiple phone numbers: `Phones = {"98765...", "91234..."}`.
*Correct (1NF):* Flatten the table so each phone number has its own row.

---

#### 2. Second Normal Form (2NF)
A relation is in **2NF** if:
1. It is in 1NF.
2. No non-prime attribute is partially dependent on any candidate key (No Partial Dependency).
*(Partial Dependency means a non-prime attribute depends on only a part of a composite key).*

##### Example:
Consider relation R(StudentID, CourseID, CourseName) with Key: `(StudentID, CourseID)`
Functional Dependency: `CourseID -> CourseName`
*Violation:* `CourseName` (non-prime) is dependent on `CourseID` which is only a part of the composite primary key.
*Solution:* Decompose into R1(StudentID, CourseID) and R2(CourseID, CourseName).

---

#### 3. Third Normal Form (3NF)
A relation is in **3NF** if:
1. It is in 2NF.
2. There is no transitive dependency for non-prime attributes.
*(For every functional dependency X -> Y, either X is a superkey, or Y is a prime attribute).*

##### Example:
Consider R(StudentID, ZipCode, City) with Key: `StudentID`
Functional Dependencies: `StudentID -> ZipCode` and `ZipCode -> City`.
*Violation:* `StudentID -> City` is transitive via `ZipCode`.
*Solution:* Decompose into R1(StudentID, ZipCode) and R2(ZipCode, City).

---

#### 4. Boyce-Codd Normal Form (BCNF)
A relation is in **BCNF** if for every non-trivial functional dependency X -> Y, X is a superkey of the relation. BCNF is stronger than 3NF because it removes dependencies where a prime attribute depends on a non-key attribute.

##### Example:
Consider R(StudentID, Subject, Advisor)
Functional Dependencies: `(StudentID, Subject) -> Advisor` and `Advisor -> Subject`.
*Violation:* Advisor is not a superkey, but subject depends on it.
*Solution:* Decompose into R1(Advisor, Subject) and R2(StudentID, Advisor).$$,
  2024
),
(
  '2014112-DBMS', 'theory',
  $$Discuss ACID properties of transactions and explain their importance in database recovery.$$,
  null, null, null, 10, 15,
  $$### Mumbai University Exam Model Answer

#### 1. Concept of ACID Properties
A transaction is a single logical unit of work. To maintain database consistency and integrity before and after executions, the DBMS must enforce the **ACID** properties:

- **Atomicity ("All or Nothing"):** Ensures that all operations within a transaction are completed successfully; if any operation fails, the entire transaction is aborted and rolled back.
- **Consistency:** Guarantees that a transaction transforms the database from one valid state to another valid state, preserving all integrity constraints.
- **Isolation:** Ensures that concurrently running transactions do not interfere with each other. The intermediate state of a transaction is invisible to others.
- **Durability:** Guarantees that once a transaction commits, its updates are permanent and survive any subsequent system crashes.

---

#### 2. Importance in Database Recovery
ACID properties form the core rules for the recovery subsystem:
- **Undo Logs (Atomicity):** If the system crashes mid-transaction, the recovery manager reads undo logs to roll back uncommitted changes, ensuring atomicity.
- **Redo Logs (Durability):** Committed transactions whose writes were still in cache during a crash are re-applied (redone) from log files to RAM.
- **Locking Protocols (Isolation):** Prevent cascading rollbacks during system failures.$$,
  2023
),
(
  '2014112-DBMS', 'theory',
  $$Explain 2PL (Two-Phase Locking) concurrency control protocol. Differentiate between Strict and Rigorous 2PL.$$,
  null, null, null, 10, 15,
  $$### Mumbai University Exam Model Answer

#### 1. Two-Phase Locking (2PL) Protocol
The **Two-Phase Locking (2PL)** protocol guarantees serializability in transaction schedules by locking resources in two distinct phases:

1. **Growing Phase:**
   - A transaction may acquire locks (shared or exclusive) but cannot release any locks.
2. **Shrinking Phase:**
   - A transaction may release locks but cannot acquire any new locks.

---

#### 2. Lock Types
- **Shared Lock (S):** Acquired for read operations. Multiple transactions can hold shared locks on the same item.
- **Exclusive Lock (X):** Acquired for write operations. Only one transaction can hold an exclusive lock on an item.

---

#### 3. Strict 2PL vs. Rigorous 2PL
To prevent cascading aborts (where aborting one transaction forces rolling back others), modifications to standard 2PL are used:

| Feature | Strict 2PL | Rigorous 2PL |
|---|---|---|
| **Lock Release Rule** | All **Exclusive (X) locks** held by a transaction must be kept until the transaction commits or aborts. | All locks (**both Shared (S) and Exclusive (X) locks**) must be held until commit/abort. |
| **Shrinking Phase** | Shrinks only for Shared locks before commit. | No shrinking phase until commit/abort occurs. |
| **Cascading Rollback** | Avoids cascading rollbacks. | Avoids cascading rollbacks and guarantees serializability in order of commits. |$$,
  2024
),

-- ── COMPUTATIONAL THEORY (2014111-CT) MCQS ───────────────────────────────────────
(
  '2014111-CT', 'mcq',
  $$Which of the following problems is undecidable?$$,
  '{"A": "Finiteness problem for DFAs", "B": "Halting Problem for Turing Machines", "C": "Equivalence problem for Regular Grammars", "D": "Emptiness problem for Context-Free Grammars"}',
  'B',
  $$The Halting Problem (determining whether an arbitrary Turing Machine halts on a given input) is a classic example of an undecidable problem.$$,
  null, null, null, 2024
),
(
  '2014111-CT', 'mcq',
  $$A Context-Free Grammar (CFG) can be parsed by which machine?$$,
  '{"A": "Finite Automata", "B": "Turing Machine only", "C": "Pushdown Automata (PDA)", "D": "Linear Bounded Automata"}',
  'C',
  $$Pushdown Automata (PDAs) use an auxiliary memory stack, which gives them the computational power required to parse Context-Free Languages.$$,
  null, null, null, 2024
),
(
  '2014111-CT', 'mcq',
  $$Which normal form for CFGs requires all production rules to be in the form A -> BC or A -> a?$$,
  '{"A": "Chomsky Normal Form (CNF)", "B": "Greibach Normal Form (GNF)", "C": "Chomsky Hierarchy", "D": "Backus-Naur Form"}',
  'A',
  $$CNF specifies that all production rules must generate either exactly two non-terminals (BC) or exactly one terminal symbol (a).$$,
  null, null, null, 2023
),
(
  '2014111-CT', 'mcq',
  $$The language L = {a^n b^n c^n | n >= 1} is:$$,
  '{"A": "Regular", "B": "Context-Free", "C": "Context-Sensitive", "D": "None of the above"}',
  'C',
  $$L = {a^n b^n c^n} cannot be recognized by a PDA (not Context-Free) due to three-way comparison, but can be parsed by a Turing Machine (Context-Sensitive).$$,
  null, null, null, 2023
),
(
  '2014111-CT', 'mcq',
  $$Arden's Theorem is used for which of the following operations?$$,
  '{"A": "Converting a CFG to CNF", "B": "Finding the Regular Expression of a Finite Automata", "C": "Minimizing a DFA", "D": "Proving a language is not regular"}',
  'B',
  $$Arden's Theorem provides a solution for equations of the form R = Q + RP, helping to convert transition diagrams into regular expressions.$$,
  null, null, null, 2024
),

-- ── COMPUTATIONAL THEORY (2014111-CT) THEORY ──────────────────────────────────────
(
  '2014111-CT', 'theory',
  $$Define Turing Machine. Design a Turing machine to accept the language L = {0^n 1^n | n >= 1}.$$,
  null, null, null, 12, 18,
  $$### Mumbai University Exam Model Answer

#### 1. Definition of a Turing Machine (TM)
A Turing Machine is a mathematical model of computation consisting of:
- An infinite tape divided into cells containing symbols from a tape alphabet.
- A read-write tape head that can move left, right, or remain stationary.
- A control unit holding state transitions.

Formally, a TM is defined as a 7-tuple: $M = (Q, \Sigma, \Gamma, \delta, q_0, B, F)$ where:
- $Q$: Finite set of states.
- $\Sigma$: Input alphabet (not containing the blank symbol $B$).
- $\Gamma$: Tape alphabet ($\Sigma \subset \Gamma$ and $B \in \Gamma$).
- $\delta$: Transition function: $Q \times \Gamma \rightarrow Q \times \Gamma \times \{L, R\}$.
- $q_0$: Initial state.
- $B$: Blank symbol.
- $F$: Set of final/accepting states.

---

#### 2. Design of Turing Machine for $L = {0^n 1^n \mid n \ge 1}$
##### Design Logic:
1. Start in state $q_0$. Read $0$, replace it with $X$, move right, and transition to state $q_1$.
2. In $q_1$, skip all $0$s and $Y$s until you find a $1$.
3. When $1$ is found, replace it with $Y$, move left, and transition to state $q_2$.
4. In $q_2$, skip all $0$s and $Y$s moving left until you find $X$. Move one cell right (to the first remaining $0$), and transition back to $q_0$.
5. Repeat. If in $q_0$ you read a $Y$ instead of a $0$, it means all $0$s have been replaced. Move right and transition to state $q_3$ to check for trailing $1$s.
6. In $q_3$, skip $Y$s. If you read a blank $B$, accept by transitioning to state $q_4$ (final state).

##### State Transition Table:
| Current State | Input Symbol: 0 | Input Symbol: 1 | Input Symbol: X | Input Symbol: Y | Input Symbol: B |
|---|---|---|---|---|---|
| **q0** | (q1, X, R) | — | — | (q3, Y, R) | — |
| **q1** | (q1, 0, R) | (q2, Y, L) | — | (q1, Y, R) | — |
| **q2** | (q2, 0, L) | — | (q0, X, R) | (q2, Y, L) | — |
| **q3** | — | — | — | (q3, Y, R) | (q4, B, R) |
| **q4 (Final)**| — | — | — | — | — |$$,
  2024
),
(
  '2014111-CT', 'theory',
  $$State and prove Pumping Lemma for Regular Languages. Use it to show L = {a^n b^n | n >= 0} is not regular.$$,
  null, null, null, 10, 15,
  $$### Mumbai University Exam Model Answer

#### 1. Statement of Pumping Lemma
If a language $L$ is regular, there exists a **pumping length** $p$ (where $p \ge 1$) such that any string $w \in L$ with length $|w| \ge p$ can be split into three substrings, $w = xyz$, satisfying the following conditions:
1. $xy^iz \in L$ for all $i \ge 0$.
2. $|y| > 0$ (the pumped substring $y$ cannot be empty).
3. $|xy| \le p$.

---

#### 2. Proof Logic (By Contradiction)
To prove a language is not regular:
1. Assume the language $L$ is regular.
2. Therefore, the pumping lemma applies with a pumping length $p$.
3. Choose a specific string $w \in L$ such that $|w| \ge p$.
4. Partition $w$ into $xyz$ satisfying $|xy| \le p$ and $|y| > 0$.
5. Show that for some $i \ge 0$, the pumped string $xy^iz \notin L$, which creates a contradiction.

---

#### 3. Proving $L = {a^n b^n \mid n \ge 0}$ is Not Regular
1. Assume $L = {a^n b^n}$ is regular. Let $p$ be its pumping length.
2. Select string $w = a^p b^p$. Clearly, $w \in L$ and $|w| = 2p \ge p$.
3. Split $w = xyz$ such that $|xy| \le p$ and $|y| > 0$.
   - Since $|xy| \le p$, the substring $xy$ must consist entirely of $a$s.
   - Therefore, the substring $y$ must consist of $a^k$ where $k \ge 1$ (since $|y| > 0$).
4. Now, let's pump $y$ with $i = 2$:
   - $w' = xy^2z = a^{p+k} b^p$.
5. Since $k \ge 1$, the number of $a$s ($p+k$) is strictly greater than the number of $b$s ($p$).
6. Thus, $w' = xy^2z \notin L$. This contradicts the Pumping Lemma condition.
7. Therefore, the assumption is false, and $L = {a^n b^n}$ is **not regular**.$$,
  2023
),
(
  '2014111-CT', 'theory',
  $$Convert the following Context-Free Grammar (CFG) to Chomsky Normal Form (CNF): S -> aSb | ab.$$,
  null, null, null, 10, 15,
  $$### Mumbai University Exam Model Answer

#### 1. Chomsky Normal Form (CNF) Definition
A CFG is in CNF if all production rules are of the form:
- $A \rightarrow BC$ (exactly two non-terminals)
- $A \rightarrow a$ (exactly one terminal)

---

#### 2. Step-by-Step CNF Conversion for $S \rightarrow aSb \mid ab$

##### Step 1: Check for Null and Unit Productions
- **Null Productions ($A \rightarrow \epsilon$):** None present.
- **Unit Productions ($A \rightarrow B$):** None present.
*(No simplification is needed).*

##### Step 2: Introduce Non-Terminals for Terminals
We have terminals $a$ and $b$ inside mixed productions $aSb$ and $ab$.
Create new non-terminals $T_a$ and $T_b$:
- $T_a \rightarrow a$
- $T_b \rightarrow b$

Now, substitute $T_a$ and $T_b$ into the original grammar rules:
1. $S \rightarrow T_a S T_b \mid T_a T_b$
2. $T_a \rightarrow a$
3. $T_b \rightarrow b$

Rules $T_a \rightarrow a$ and $T_b \rightarrow b$ are already in CNF.
Rule $S \rightarrow T_a T_b$ is also in CNF (two non-terminals).

##### Step 3: Break Down Long Productions
Rule $S \rightarrow T_a S T_b$ contains three non-terminals ($T_a, S, T_b$), which violates CNF.
Introduce a new non-terminal $U_1$ to represent the suffix $S T_b$:
- $U_1 \rightarrow S T_b$

Now substitute $U_1$ back:
- $S \rightarrow T_a U_1$

##### Step 4: Final CNF Grammar Rules
Gather all final rules:
1. $S \rightarrow T_a U_1 \mid T_a T_b$
2. $U_1 \rightarrow S T_b$
3. $T_a \rightarrow a$
4. $T_b \rightarrow b$

All rules are now strictly in CNF formats $A \rightarrow BC$ and $A \rightarrow a$.$$,
  2024
),
-- ── ADDITIONAL AUTOMATA THEORY (2014111-CT) PAST PAPER QUESTIONS ───────────────
(
  '2014111-CT', 'theory',
  $$Define the following terms and give an example of each: (1) Automata, (2) String, (3) Language, (4) Alphabet, (5) Grammar.$$,
  null, null, null, 5, 8,
  $$### Mumbai University Exam Model Answer

#### 1. Automata
An automaton (plural: automata) is a self-moving mathematical model of computation. It is an abstract machine that receives input, changes states based on transition rules, and determines whether the input is accepted.
*Example:* A finite automaton representing a vending machine or turnstile.

#### 2. String
A string is a finite sequence of symbols chosen from a finite set called an alphabet. The length of a string $w$, denoted by $|w|$, is the number of symbols in it. The empty string is denoted by $\epsilon$ or $\lambda$.
*Example:* If alphabet $\Sigma = \{0, 1\}$, then $w = 01101$ is a string of length 5.

#### 3. Language
A language is a set of strings over a fixed alphabet. It can be finite or infinite.
*Example:* $L = \{0^n 1^n \mid n \ge 1\}$ over alphabet $\Sigma = \{0, 1\}$.

#### 4. Alphabet
An alphabet is a finite, non-empty set of symbols.
*Example:* Binary alphabet $\Sigma = \{0, 1\}$, or English alphabet $\Sigma = \{a, b, c, \dots, z\}$.

#### 5. Grammar
A grammar is a formal mathematical system consisting of four components $G = (V, T, P, S)$ used to generate strings of a language:
- $V$: Finite set of non-terminals.
- $T$: Finite set of terminals.
- $P$: Finite set of production rules.
- $S$: Start symbol.
*Example:* $S \rightarrow 0S1 \mid 01$ generates the language $L = \{0^n 1^n \mid n \ge 1\}$.$$,
  2023
),
(
  '2014111-CT', 'theory',
  $$What are the limitations of Finite Automata?$$,
  null, null, null, 5, 8,
  $$### Mumbai University Exam Model Answer

#### Limitations of Finite Automata (FA)
While Finite Automata are highly efficient for pattern matching and lexical analysis, they suffer from several fundamental limitations:

1. **Finite Memory Cache:**
   An FA has a strictly finite set of states. It has no auxiliary memory (like a stack or tape) to store intermediate information or symbols.
2. **Inability to Count arbitrarily:**
   Because of its finite memory, an FA cannot verify or parse languages requiring infinite counting or nested balance. E.g., it cannot recognize the language $L = \{a^n b^n \mid n \ge 1\}$ because it cannot "remember" how many $a$s were read when matching them with $b$s.
3. **No Context Parsing:**
   An FA cannot recognize Context-Free Languages (CFLs) like matching parentheses in programming languages or nested mathematical expressions.
4. **Read-Only / One-Way input:**
   The input head of an FA moves strictly left-to-right, one symbol at a time. It cannot go back to re-read previous inputs or write data back to the input tape.$$,
  2023
),
(
  '2014111-CT', 'theory',
  $$What do you mean by ambiguous grammar? Give an example.$$,
  null, null, null, 5, 8,
  $$### Mumbai University Exam Model Answer

#### 1. Definition of Ambiguous Grammar
A Context-Free Grammar (CFG) $G$ is said to be **ambiguous** if there exists at least one string $w \in L(G)$ that has:
- More than one leftmost derivation, or
- More than one rightmost derivation, or
- More than one distinct parse tree.

---

#### 2. Example of Ambiguity
Consider the expression grammar $G$:
$$S \rightarrow S + S \mid S \times S \mid \text{id}$$

Let the target string be $w = \text{id} + \text{id} \times \text{id}$.

##### Parse Tree 1:
Evaluates $+$ first, then $\times$:
```
      S
     /|\
    S * S
   /|\  |
  S + S id
  |   |
  id  id
```
*(Represents: $(\text{id} + \text{id}) \times \text{id}$)*

##### Parse Tree 2:
Evaluates $\times$ first, then $+$:
```
      S
     /|\
    S + S
    |  /|\
   id S * S
      |   |
     id  id
```
*(Represents: $\text{id} + (\text{id} \times \text{id})$)*

Since the string has two distinct parse trees, the grammar is ambiguous.$$,
  2023
),
(
  '2014111-CT', 'theory',
  $$Design a Turing Machine that performs the addition of two unary numbers. (Provide logic, state diagram representation, and transition table).$$,
  null, null, null, 10, 15,
  $$### Mumbai University Exam Model Answer

#### 1. Logic for Unary Addition
Unary numbers represent the value $n$ as a sequence of $n$ ones ($1$s).
- E.g., $3 + 2$ is written as $111 + 11 = 11111$.
- In the input tape, we separate two unary numbers using a plus symbol ($+$). E.g., `111+11`.

##### Step-by-Step Logic:
1. Start at the leftmost $1$. Move right until you find the plus symbol $+$.
2. Replace the plus symbol $+$ with a $1$. (This joins the two blocks, but increases the total length by 1).
3. Move right to the end of the combined string until you hit the blank symbol $B$.
4. Move one cell left (to the last $1$).
5. Replace that last $1$ with a blank $B$ to restore the correct count (subtracting the extra $1$ we added).
6. Transition to the final halt state.

---

#### 2. State Transition Function
- **q0 (Start state):**
  - Read $1$: Write $1$, move Right, stay in $q_0$.
  - Read $+$; Write $1$, move Right, transition to $q_1$.
- **q1 (Search end state):**
  - Read $1$: Write $1$, move Right, stay in $q_1$.
  - Read $B$: Write $B$, move Left, transition to $q_2$.
- **q2 (Delete extra state):**
  - Read $1$: Write $B$, move Left, transition to $q_3$ (Halt/Accept).

---

#### 3. Transition Table
| Current State | Input Symbol: 1 | Input Symbol: + | Input Symbol: B |
|---|---|---|---|
| **q0** | (q0, 1, R) | (q1, 1, R) | — |
| **q1** | (q1, 1, R) | — | (q2, B, L) |
| **q2** | (q3, B, L) | — | — |
| **q3 (Final)** | — | — | — |$$,
  2022
),
(
  '2014111-CT', 'theory',
  $$Design Deterministic Finite Automata (DFA) over alphabet {0, 1} for strings ending with '10'.$$,
  null, null, null, 10, 15,
  $$### Mumbai University Exam Model Answer

#### 1. DFA Logic & Requirements
We need to design a DFA that accepts strings ending with the suffix `10` over alphabet $\Sigma = \{0, 1\}$.
- **Minimum Accepted String:** `10` (length 2).
- **Other Accepted Strings:** `010`, `110`, `0010`, `1010`, etc.

---

#### 2. State Definitions
1. **q0 (Initial state):** Represents the default state where we have not read any suffix matches.
2. **q1:** Represents the state where the last character read was `1`.
3. **q2 (Final state):** Represents the state where the last two characters read were `10`.

---

#### 3. State Transition Table
| Current State | Input: 0 | Input: 1 | Description / Meaning |
|---|---|---|---|
| **q0 (Initial)** | q0 | q1 | Reads `1`, moves to q1. Reads `0`, stays in q0. |
| **q1** | q2 (Accept) | q1 | Reads `0` after `1`, moves to q2 (accepts). Reads `1`, stays in q1. |
| **q2 (Final)** | q0 | q1 | Reads `1` after `10` (ends with `1`), goes to q1. Reads `0` (ends with `0`), goes to q0. |

---

#### 4. Transition Diagram Representation
```
       +---0---+
       |       |
       v       |
      (q0) ---1---> (q1) ---0---> ((q2))
     ^   |           ^             |
     |   +-----0-----+             |
     +--------------1--------------+
```$$,
  2023
);
