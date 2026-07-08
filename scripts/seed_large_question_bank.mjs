import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zbfqidnjspzruabgazvx.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiZnFpZG5qc3B6cnVhYmdhenZ4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMzkxMywiZXhwIjoyMDk4NDk5OTEzfQ.hgXLsFv4xA_k4Ww9KlbD_Guuca3Otiu6HOYDnjMYLmU";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const questions = [
  // ═══════════════════════════════════════════════════════
  // COMPUTATIONAL THEORY (2014111-CT)
  // ═══════════════════════════════════════════════════════
  {
    subject_code: "2014111-CT", type: "theory", marks: 5, year_of_exam: 2023,
    module_name: "Module 1: Finite Automata & Regular Expressions",
    question: "Define the following terms and give an example of each: (1) Automata, (2) String, (3) Language, (4) Alphabet, (5) Grammar.",
    answer: `### Mumbai University Exam Model Answer

#### 1. Automata
An automaton (plural: automata) is a self-moving mathematical model of computation. It is an abstract machine that receives input, changes states based on transition rules, and determines whether the input is accepted.
*Example:* A finite automaton representing a vending machine or turnstile.

#### 2. String
String is a finite sequence of symbols chosen from a finite set called an alphabet. The length of a string $w$, denoted by $|w|$, is the number of symbols in it. The empty string is denoted by $\\epsilon$ or $\\lambda$.
*Example:* If alphabet $\\Sigma = \\{0, 1\\}$, then $w = 01101$ is a string of length 5.

#### 3. Language
A language is a set of strings over a fixed alphabet. It can be finite or infinite.
*Example:* $L = \\{0^n 1^n \\mid n \\ge 1\\}$ over alphabet $\\Sigma = \\{0, 1\\}$.

#### 4. Alphabet
An alphabet is a finite, non-empty set of symbols.
*Example:* Binary alphabet $\\Sigma = \\{0, 1\\}$, or English alphabet $\\Sigma = \\{a, b, c, \\dots, z\\}$.

#### 5. Grammar
A grammar is a formal mathematical system consisting of four components $G = (V, T, P, S)$ used to generate strings of a language:
- $V$: Finite set of non-terminals.
- $T$: Finite set of terminals.
- $P$: Finite set of production rules.
- $S$: Start symbol.
*Example:* $S \\rightarrow 0S1 \\mid 01$ generates the language $L = \\{0^n 1^n \\mid n \\ge 1\\}$.`
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 5, year_of_exam: 2023,
    module_name: "Module 1: Finite Automata & Regular Expressions",
    question: "What are the limitations of Finite Automata?",
    answer: `### Mumbai University Exam Model Answer

#### Limitations of Finite Automata (FA)
While Finite Automata are highly efficient for pattern matching and lexical analysis, they suffer from several fundamental limitations:

1. **Finite Memory Cache:**
   An FA has a strictly finite set of states. It has no auxiliary memory (like a stack or tape) to store intermediate information or symbols.
2. **Inability to Count arbitrarily:**
   Because of its memory limits, an FA cannot verify or parse languages requiring infinite counting. E.g., it cannot recognize $L = \\{a^n b^n \\mid n \\ge 1\\}$ because it cannot "remember" how many $a$s were read when matching them with $b$s.
3. **No Context Parsing:**
   An FA cannot recognize Context-Free Languages (CFLs) like matching parentheses in programming languages or nested mathematical expressions.
4. **Read-Only / One-Way input:**
   The input head of an FA moves strictly left-to-right, one symbol at a time. It cannot go back to re-read previous inputs or write data back to the input tape.`
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2023,
    module_name: "Module 1: Finite Automata & Regular Expressions",
    question: "What do you mean by Deterministic Finite Automata (DFA)? Design DFA ending with 10.",
    answer: `### Mumbai University Exam Model Answer

#### 1. DFA Logic & Requirements
We need to design a DFA that accepts strings ending with the suffix \`10\` over alphabet $\\Sigma = \\{0, 1\\}$.
- **Minimum Accepted String:** \`10\` (length 2).
- **Other Accepted Strings:** \`010\`, \`110\`, \`0010\`, \`1010\`, etc.

---

#### 2. State Definitions
1. **q0 (Initial state):** Represents the default state where we have not read any suffix matches.
2. **q1:** Represents the state where the last character read was \`1\`.
3. **q2 (Final state):** Represents the state where the last two characters read were \`10\`.

---

#### 3. State Transition Table
| Current State | Input: 0 | Input: 1 | Description / Meaning |
|---|---|---|---|
| **q0 (Initial)** | q0 | q1 | Reads \`1\`, moves to q1. Reads \`0\`, stays in q0. |
| **q1** | q2 (Accept) | q1 | Reads \`0\` after \`1\`, moves to q2 (accepts). Reads \`1\`, stays in q1. |
| **q2 (Final)** | q0 | q1 | Reads \`1\` after \`10\` (ends with \`1\`), goes to q1. Reads \`0\` (ends with \`0\`), goes to q0. |

---

#### 4. Transition Diagram Representation
\`\`\`
       +---0---+
       |       |
       v       |
      (q0) ---1---> (q1) ---0---> ((q2))
     ^   |           ^             |
     |   +-----0-----+             |
     +--------------1--------------+
\`\`\`
`
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 1: Finite Automata & Regular Expressions",
    question: "What are Moore and Mealy machines? Design Mealy machine to output x if input ends in 101, y if ends in 110, else z.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2023,
    module_name: "Module 2: Regular Grammars & Normalization",
    question: "State and prove Pumping Lemma for Regular Languages. Use it to show L = {a^n b^n | n >= 0} is not regular.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 5, year_of_exam: 2024,
    module_name: "Module 2: Regular Grammars & Normalization",
    question: "Explain the need for normalization/simplification in grammars.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 5, year_of_exam: 2023,
    module_name: "Module 3: Context-Free Grammars & Simplification",
    question: "What do you mean by ambiguous grammar? Give an example using an arithmetic grammar.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 3: Context-Free Grammars & Simplification",
    question: "Convert the grammar to Chomsky Normal Form (CNF): S -> a | aA | B | C, A -> aB | \\epsilon, B -> Aa, C -> aCD | a, D -> ddd.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2023,
    module_name: "Module 4: Pushdown Automata",
    question: "Design Push Down Automata (PDA) for L = { a^n b a^(2n) | n >= 0 }.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 4: Pushdown Automata",
    question: "Design Push Down Automata (PDA) for odd-length palindromes L = { w c w^R } over alphabet {0, 1}.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2023,
    module_name: "Module 5: Turing Machines & Undecidability",
    question: "Design a Turing Machine that performs the addition of two unary numbers. (Logic, transition function, and diagram).",
    answer: `### Mumbai University Exam Model Answer

#### 1. Logic for Unary Addition
Unary numbers represent the value $n$ as a sequence of $n$ ones ($1$s).
- E.g., $3 + 2$ is written as $111 + 11 = 11111$.
- In the input tape, we separate two unary numbers using a plus symbol ($+$). E.g., \`111+11\`.

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
| **q3 (Final)** | — | — | — |`
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 5: Turing Machines & Undecidability",
    question: "Design a Turing Machine to multiply two unary numbers.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 5, year_of_exam: 2024,
    module_name: "Module 5: Turing Machines & Undecidability",
    question: "Explain Halting Problem of Turing Machine.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 6: Chomsky Hierarchy & Compiler Phases",
    question: "Explain Chomsky's Hierarchy of Grammars with a neat diagram.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2023,
    module_name: "Module 6: Chomsky Hierarchy & Compiler Phases",
    question: "What is a compiler? Describe different phases of a compiler.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 5, year_of_exam: 2022,
    module_name: "Module 1: Finite Automata & Regular Expressions",
    question: "Describe regular expressions concisely: (i) 1(0+1)*0, (ii) (aa)*(bb)*(b), (iii) (ab+ba)*, (iv) (A-Z) (a-z) *(a+e+i+o+u), (v) (a-z) (a-z | 0-9)*",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 5, year_of_exam: 2022,
    module_name: "Module 1: Finite Automata & Regular Expressions",
    question: "Write regular expressions for: (i) strings over {0,1} having an odd number of 1s, (ii) strings over {0,1} having number of 10 or 11.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 5, year_of_exam: 2022,
    module_name: "Module 1: Finite Automata & Regular Expressions",
    question: "Convert given NFA to DFA with proper transition table and states description.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 5, year_of_exam: 2022,
    module_name: "Module 1: Finite Automata & Regular Expressions",
    question: "Construct Mealy machine: for input over {0,1}, if input ends in 101 output x, if input ends in 110 output y, else output z.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 5, year_of_exam: 2022,
    module_name: "Module 1: Finite Automata & Regular Expressions",
    question: "Give Regular Expressions for: (i) starts with 10 and ends with 01, (ii) exactly 3 occurrences of 'b' over alphabet {a,b}.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 5, year_of_exam: 2022,
    module_name: "Module 3: Context-Free Grammars & Simplification",
    question: "Consider CFG: S -> aAS | a, A -> SbA | SS | ba. Derive the string 'aabbaa' using leftmost and rightmost derivation.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 5, year_of_exam: 2022,
    module_name: "Module 5: Turing Machines & Undecidability",
    question: "Compare and Contrast between Finite Automata (FA), Push Down Automata (PDA) and Turing Machine (TM).",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 5, year_of_exam: 2022,
    module_name: "Module 3: Context-Free Grammars & Simplification",
    question: "What is Ambiguous Grammar? Test if the arithmetic grammar S -> S+S | S*S | S-S | S/S | (S) | var | const is ambiguous for string (x+2.0)*y/(z-6.0).",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2022,
    module_name: "Module 3: Context-Free Grammars & Simplification",
    question: "Convert the following grammar into CNF: S -> a | aA | B, A -> aBB | \\epsilon, B -> Aa | b.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2022,
    module_name: "Module 5: Turing Machines & Undecidability",
    question: "Design a Turing Machine to accept the language L = { a^m b^m : m >= 1 }.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2022,
    module_name: "Module 1: Finite Automata & Regular Expressions",
    question: "Construct DFA for given regular expression (a+b)* aba (a+b)*.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2022,
    module_name: "Module 1: Finite Automata & Regular Expressions",
    question: "Construct NFA with epsilon-moves for regular expression 'zero or more 0s followed by zero or more 1s followed by zero or more 2s', and convert to DFA.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 5, year_of_exam: 2024,
    module_name: "Module 2: Regular Grammars & Normalization",
    question: "What do you mean by Right-linear and Left-linear grammars? Give examples.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 5, year_of_exam: 2024,
    module_name: "Module 1: Finite Automata & Regular Expressions",
    question: "Write regular expressions for: (a) strings over {0,1} having no consecutive 0s, (b) strings containing the sequence 101, (c) strings length is multiple of 3 over {a,b}, (d) strings containing no more than two 0s.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 1: Finite Automata & Regular Expressions",
    question: "What are Moore and Mealy machines? Design Moore and Mealy machines to convert each occurrence of 'aaa' with 'zzz'.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 4: Pushdown Automata",
    question: "Design Push Down Automata (PDA) for L = { a^n b^n : n >= 1 }.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 1: Finite Automata & Regular Expressions",
    question: "What is Deterministic Finite Automata (DFA)? Construct a DFA for binary numbers divisible by 5 excluding leading zeros.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 3: Context-Free Grammars & Simplification",
    question: "Convert the following grammar into CNF: S -> aSa | bSb | a | b | \\epsilon.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 5: Turing Machines & Undecidability",
    question: "Design a Turing Machine for L = { a^n b^m c^(n+m) | n,m >= 1 }.",
    answer: null
  },
  {
    subject_code: "2014111-CT", type: "theory", marks: 5, year_of_exam: 2024,
    module_name: "Module 3: Context-Free Grammars & Simplification",
    question: "Write a short note on Greibach Normal Form (GNF) and its simplification steps.",
    answer: null
  },

  // ═══════════════════════════════════════════════════════
  // DATABASE MANAGEMENT SYSTEMS (2014112-DBMS)
  // ═══════════════════════════════════════════════════════
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 5, year_of_exam: 2023,
    module_name: "Module 1: Introduction & Database Architecture",
    question: "Explain the concept of data independence. Discuss the differences between logical and physical data independence.",
    answer: `### Mumbai University Exam Model Answer

#### Data Independence
Data Independence is the capability to modify the schema at one level of the database architecture without changing the schema at the next higher level.

1. **Logical Data Independence:**
   - **Definition:** The ability to modify the conceptual schema without causing program rewrites.
   - **Example:** Adding a new column to a table or splitting a table vertically does not require altering existing user views or application logic.
   
2. **Physical Data Independence:**
   - **Definition:** The ability to modify the physical schema (internal file organizations, index modifications) without changing the conceptual or external schema.
   - **Example:** Switching from B-Trees to Hashing on storage does not affect tables structure or queries.`
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 5, year_of_exam: 2023,
    module_name: "Module 2: ER Model & Relational Mapping",
    question: "Describe weak entity. Provide an example of weak entity and strong entity.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 5, year_of_exam: 2023,
    module_name: "Module 3: Relational Algebra & SQL",
    question: "List and briefly explain SQL aggregate functions with suitable examples.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 5, year_of_exam: 2023,
    module_name: "Module 4: Database Design & Normalization",
    question: "Explain the concept of First Normal Form (1NF). Give example for the same.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 5, year_of_exam: 2023,
    module_name: "Module 5: Transactions & Concurrency Control",
    question: "Discuss conflict serializability with suitable example.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 10, year_of_exam: 2023,
    module_name: "Module 1: Introduction & Database Architecture",
    question: "Describe the overall architecture of DBMS with suitable diagram.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 10, year_of_exam: 2023,
    module_name: "Module 5: Transactions & Concurrency Control",
    question: "What is deadlock? Explain wait-die and wound-wait methods with suitable example.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 10, year_of_exam: 2023,
    module_name: "Module 2: ER Model & Relational Mapping",
    question: "Draw an E-R diagram for library management system. Convert it into relational schema.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 10, year_of_exam: 2023,
    module_name: "Module 3: Relational Algebra & SQL",
    question: "Explain the following Relational Algebra operations with suitable example: (1) Project, (2) Select, (3) Union, (4) Rename, (5) Set difference.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 10, year_of_exam: 2023,
    module_name: "Module 3: Relational Algebra & SQL",
    question: "Write SQL queries for the employee database:\nEmployee(empname, street, city, date_of_joining)\nWorks(empname, company_name, salary)\nCompany(company_name, city)\n1. Modify John's lives to Mumbai.\n2. Find employees who joined in October.\n3. Give ABC Corporation employees 10% raise.\n4. Find employees earning more than their company average.\n5. List name of companies starting with A.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 10, year_of_exam: 2023,
    module_name: "Module 4: Database Design & Normalization",
    question: "Why is there a need for normalization? Explain 1NF, 2NF, 3NF and BCNF with suitable examples.",
    answer: `### Mumbai University Exam Model Answer

#### Normalization
Normalization is the systematic process of organizing database tables to minimize data redundancy, update anomalies, and structural dependencies.

1. **First Normal Form (1NF):**
   - **Requirement:** A relation is in 1NF if all domain attributes contain only atomic (indivisible) values.
   
2. **Second Normal Form (2NF):**
   - **Requirement:** Must be in 1NF and no non-prime attribute is partially dependent on any candidate key (no partial dependencies).
   
3. **Third Normal Form (3NF):**
   - **Requirement:** Must be in 2NF and no non-prime attribute is transitively dependent on candidate keys (for every FD $X \\rightarrow Y$, $X$ is superkey or $Y$ is prime).
   
4. **Boyce-Codd Normal Form (BCNF):**
   - **Requirement:** Strict version of 3NF. For every functional dependency $X \\rightarrow Y$, $X$ must be a super key.`
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 10, year_of_exam: 2023,
    module_name: "Module 5: Transactions & Concurrency Control",
    question: "Describe ACID properties of transactions with suitable examples.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 10, year_of_exam: 2023,
    module_name: "Module 5: Transactions & Concurrency Control",
    question: "Explain Lock based (2PL) concurrency control method with example.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 5, year_of_exam: 2023,
    module_name: "Module 2: ER Model & Relational Mapping",
    question: "Explain Conversion of Specialization to relational schema with suitable example.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 5, year_of_exam: 2023,
    module_name: "Module 6: Log-Based Recovery & Database Security",
    question: "Write short note on Log based recovery.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 5, year_of_exam: 2023,
    module_name: "Module 1: Introduction & Database Architecture",
    question: "Explain the Role of DBA (Database Administrator) in database systems.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 5, year_of_exam: 2023,
    module_name: "Module 6: Log-Based Recovery & Database Security",
    question: "Write a short note on Database Triggers and their uses.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 5, year_of_exam: 2023,
    module_name: "Module 2: ER Model & Relational Mapping",
    question: "Explain different Types of attributes in Entity-Relationship model.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 5, year_of_exam: 2024,
    module_name: "Module 1: Introduction & Database Architecture",
    question: "Compare File Processing System with Database Management system.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 5, year_of_exam: 2024,
    module_name: "Module 5: Transactions & Concurrency Control",
    question: "Describe Transaction state transition diagram with neat sketch.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 2: ER Model & Relational Mapping",
    question: "Design an EER diagram for Hospital Management System and map it into Relational Model.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 3: Relational Algebra & SQL",
    question: "Explain Relational Algebra operators: Selection, Union, Rename, Cartesian product with examples.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 5: Transactions & Concurrency Control",
    question: "Explain in detail with example of conflict and view serializability.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 5, year_of_exam: 2024,
    module_name: "Module 6: Log-Based Recovery & Database Security",
    question: "Explain Referential Constraints and Null Constraints in relational database design.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 1: Introduction & Database Architecture",
    question: "Explain three-level architecture of DBMS in detail with appropriate diagram.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 3: Relational Algebra & SQL",
    question: "Discuss types of Joins in SQL (Inner Join, Left/Right Outer Join, Full Outer Join) with syntax and examples.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 3: Relational Algebra & SQL",
    question: "Write SQL queries for database: Employee(ename, ecode, salary, dno), Project(pno, pname, budget, dno), Works(ecode, pno, responsibility, hours)\n1) Find project pno and pname with budget > 100000.\n2) Find employee name in department D1 ordered by descending salary.\n3) Find works records where hours < 10 and responsibility is Manager.\n4) Find total employees.\n5) Raise employees salary by 10%.\n6) Find employee name with maximum salary.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 6: Log-Based Recovery & Database Security",
    question: "Explain all types of integrity constraints with examples in SQL.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 5: Transactions & Concurrency Control",
    question: "Write short notes on Lock-based and Timestamp-based protocols.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 5, year_of_exam: 2025,
    module_name: "Module 6: Log-Based Recovery & Database Security",
    question: "What are DDL and DML commands? Write syntax and examples for DDL and DML commands.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 5, year_of_exam: 2025,
    module_name: "Module 2: ER Model & Relational Mapping",
    question: "Discuss with suitable example Extended ER features: Specialization, Generalization and Aggregation.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 5, year_of_exam: 2025,
    module_name: "Module 1: Introduction & Database Architecture",
    question: "Explain different types of users for database system and explain responsibilities of DBA.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 10, year_of_exam: 2025,
    module_name: "Module 3: Relational Algebra & SQL",
    question: "Write SQL expressions for database Customer(cust_id, cname, caddress, ph_no, balance):\ni) Select customers living in Mumbai or Delhi with balance > 50000.\nii) Add one record (105, 'Sachin', 'Kalyan', '9820011211', 25000).\niii) Find customer name with minimum balance.\niv) Find total number of customers.\nv) Write syntax of view creation.",
    answer: null
  },
  {
    subject_code: "2014112-DBMS", type: "theory", marks: 10, year_of_exam: 2025,
    module_name: "Module 5: Transactions & Concurrency Control",
    question: "Explain Timestamp ordering protocol in detail.",
    answer: null
  },

  // ═══════════════════════════════════════════════════════
  // OPERATING SYSTEMS (2014113-OS)
  // ═══════════════════════════════════════════════════════
  {
    subject_code: "2014113-OS", type: "theory", marks: 5, year_of_exam: 2024,
    module_name: "Module 1: Overview & OS Structures",
    question: "Describe the functions and services provided by an Operating System.",
    answer: `### Mumbai University Exam Model Answer

#### Services Provided by an Operating System:
1. **User Interface (UI):** Provides a CLI, GUI, or batch interface for user interaction.
2. **Program Execution:** Loads program instructions into memory, assigns CPU time, and runs the process.
3. **I/O Operations:** Coordinates and controls access to input/output devices (disks, keyboards, printers).
4. **File System Manipulation:** Creation, deletion, reading, writing, and permission management of files/directories.
5. **Communications:** Manages message-passing or shared memory communications between processes on same or remote systems.
6. **Error Detection:** Continuously monitors CPU, memory, and devices to detect and gracefully handle errors.
7. **Resource Allocation:** Assigns CPU cycles, main memory, and storage space to concurrent users/processes.
8. **Protection and Security:** Controls access to system resources and prevents unauthorized usage.`
  },
  {
    subject_code: "2014113-OS", type: "theory", marks: 10, year_of_exam: 2023,
    module_name: "Module 1: Overview & OS Structures",
    question: "What is a system call? Explain different categories of system calls with examples.",
    answer: null
  },
  {
    subject_code: "2014113-OS", type: "theory", marks: 5, year_of_exam: 2024,
    module_name: "Module 2: Process & Thread Management",
    question: "Draw and explain the Process State Transition diagram.",
    answer: `### Mumbai University Exam Model Answer

#### Process State Transition Diagram
A process transitions between the following states during its lifecycle:

\`\`\`
        Admit
          v
   +--------------+      Dispatch      +-------------+
   |              | -----------------> |             |
   |    READY     |                    |   RUNNING   |
   |              | <----------------- |             |
   +--------------+     Time slice     +-------------+
       ^                   expired            |
       |                                      | Event wait
       |                                      v
       |                               +-------------+
       +------------------------------ |   BLOCKED   |
                 Event occurred        |  (WAITING)  |
                                       +-------------+
\`\`\`

1. **New:** The process is being created.
2. **Ready:** The process is in memory, waiting to be assigned to a CPU core.
3. **Running:** Instructions are being executed by the CPU.
4. **Blocked (Waiting):** The process is waiting for an I/O completion or event signal.
5. **Terminated:** The process has finished execution.`
  },
  {
    subject_code: "2014113-OS", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 2: Process & Thread Management",
    question: "Describe CPU scheduling algorithms: FCFS, SJF, SRTN, Round Robin, and Priority Scheduling. Solve a numerical example.",
    answer: null
  },
  {
    subject_code: "2014113-OS", type: "theory", marks: 5, year_of_exam: 2023,
    module_name: "Module 2: Process & Thread Management",
    question: "Explain the difference between a process and a thread. Explain Multithreading models.",
    answer: null
  },
  {
    subject_code: "2014113-OS", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 3: Process Synchronization",
    question: "Explain the Critical Section problem and Peterson's solution for two processes. State its requirements.",
    answer: `### Mumbai University Exam Model Answer

#### Peterson's Critical Section Solution
Peterson's solution is a classic software-based solution for two processes ($P_0$ and $P_1$) to solve the mutual exclusion critical section problem.

#### Variables Shared:
- \`boolean flag[2];\` (Initialized to \`false\`. \`flag[i] = true\` means process $P_i$ wants to enter).
- \`int turn;\` (Indicates whose turn it is to enter the critical section).

#### Structure of Process $P_i$:
\`\`\`c
do {
    flag[i] = true;
    turn = j;
    while (flag[j] && turn == j);
    
    // CRITICAL SECTION
    
    flag[i] = false;
    
    // REMAINDER SECTION
} while (true);
\`\`\`

#### Requirements Satisfied:
1. **Mutual Exclusion:** Verified as only one process can enter since \`turn\` can only be $0$ or $1$.
2. **Progress:** If no process is in CS, a process can enter without indefinite waiting.
3. **Bounded Waiting:** A process waits at most one turn before entering.`
  },
  {
    subject_code: "2014113-OS", type: "theory", marks: 10, year_of_exam: 2023,
    module_name: "Module 3: Process Synchronization",
    question: "What are Semaphores? Explain Producer-Consumer problem or Reader-Writer problem using semaphores.",
    answer: null
  },
  {
    subject_code: "2014113-OS", type: "theory", marks: 5, year_of_exam: 2024,
    module_name: "Module 4: Deadlocks",
    question: "What is a Deadlock? Explain the four necessary conditions for a deadlock to occur.",
    answer: null
  },
  {
    subject_code: "2014113-OS", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 4: Deadlocks",
    question: "Explain Banker's Algorithm for Deadlock Avoidance. Solve a resource allocation sample scenario.",
    answer: null
  },
  {
    subject_code: "2014113-OS", type: "theory", marks: 10, year_of_exam: 2023,
    module_name: "Module 5: Memory Management",
    question: "Explain Paging and the logical-to-physical address translation mechanism with a neat diagram.",
    answer: null
  },
  {
    subject_code: "2014113-OS", type: "theory", marks: 5, year_of_exam: 2024,
    module_name: "Module 5: Memory Management",
    question: "Explain Segmentation and compare Paging with Segmentation.",
    answer: null
  },
  {
    subject_code: "2014113-OS", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 5: Memory Management",
    question: "Discuss page replacement algorithms (FIFO, LRU, Optimal). Solve a page reference string numerical.",
    answer: null
  },
  {
    subject_code: "2014113-OS", type: "theory", marks: 10, year_of_exam: 2023,
    module_name: "Module 6: Storage & File Systems",
    question: "Explain disk scheduling algorithms (FCFS, SSTF, SCAN, CSCAN, LOOK, CLOOK) with examples.",
    answer: null
  },
  {
    subject_code: "2014113-OS", type: "theory", marks: 10, year_of_exam: 2024,
    module_name: "Module 6: Storage & File Systems",
    question: "Explain file allocation methods: Contiguous Allocation, Linked Allocation, Indexed Allocation.",
    answer: null
  },
  {
    subject_code: "2014113-OS", type: "theory", marks: 5, year_of_exam: 2023,
    module_name: "Module 6: Storage & File Systems",
    question: "Write short notes on: (1) Raid levels, (2) I/O buffering.",
    answer: null
  }
];

async function seed() {
  console.log("Truncating public.question_bank...");
  let truncErr;
  try {
    const { error } = await supabase.rpc("exec_sql", {
      sql_query: "truncate table public.question_bank cascade;"
    });
    truncErr = error;
  } catch (err) {
    truncErr = err;
  }

  // Fallback direct delete if RPC is missing
  if (truncErr) {
    console.log("Direct truncation fallback...");
    try {
      const { error: delErr } = await supabase.from("question_bank").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (delErr) {
        console.error("Delete failed:", delErr);
        return;
      }
    } catch (e) {
      console.error("Direct delete failed:", e);
      return;
    }
  }

  console.log(`Inserting ${questions.length} questions in batches...`);
  const batchSize = 15;
  for (let i = 0; i < questions.length; i += batchSize) {
    const batch = questions.slice(i, i + batchSize);
    const { error } = await supabase.from("question_bank").insert(batch);
    if (error) {
      console.error(`Batch ${i / batchSize + 1} failed:`, error);
    } else {
      console.log(`Batch ${i / batchSize + 1} succeeded.`);
    }
  }
  console.log("Seeding complete!");
}

seed();
