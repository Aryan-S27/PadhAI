// src/lib/questions.js
// Pre-seeded database catalog fallback for instant question loading in PadhAI Score module.
// Conforms strictly to MU Engineering evaluation guidelines.

export const questionBank = {
  "2014111-CT": {
    "theory": [
      {
        "id": "q-2014111-CT-qcj6shrxf",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Define the following terms and give an example of each: (1) Automata, (2) String, (3) Language, (4) Alphabet, (5) Grammar.",
        "marks": 5,
        "module_name": "Module 1: Finite Automata & Regular Expressions",
        "year_of_exam": 2023,
        "answer": "### Mumbai University Exam Model Answer\n\n#### 1. Automata\nAn automaton (plural: automata) is a self-moving mathematical model of computation. It is an abstract machine that receives input, changes states based on transition rules, and determines whether the input is accepted.\n*Example:* A finite automaton representing a vending machine or turnstile.\n\n#### 2. String\nString is a finite sequence of symbols chosen from a finite set called an alphabet. The length of a string $w$, denoted by $|w|$, is the number of symbols in it. The empty string is denoted by $\\epsilon$ or $\\lambda$.\n*Example:* If alphabet $\\Sigma = \\{0, 1\\}$, then $w = 01101$ is a string of length 5.\n\n#### 3. Language\nA language is a set of strings over a fixed alphabet. It can be finite or infinite.\n*Example:* $L = \\{0^n 1^n \\mid n \\ge 1\\}$ over alphabet $\\Sigma = \\{0, 1\\}$.\n\n#### 4. Alphabet\nAn alphabet is a finite, non-empty set of symbols.\n*Example:* Binary alphabet $\\Sigma = \\{0, 1\\}$, or English alphabet $\\Sigma = \\{a, b, c, \\dots, z\\}$.\n\n#### 5. Grammar\nA grammar is a formal mathematical system consisting of four components $G = (V, T, P, S)$ used to generate strings of a language:\n- $V$: Finite set of non-terminals.\n- $T$: Finite set of terminals.\n- $P$: Finite set of production rules.\n- $S$: Start symbol.\n*Example:* $S \\rightarrow 0S1 \\mid 01$ generates the language $L = \\{0^n 1^n \\mid n \\ge 1\\}$."
      },
      {
        "id": "q-2014111-CT-whg1qjvqp",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "What are the limitations of Finite Automata?",
        "marks": 5,
        "module_name": "Module 1: Finite Automata & Regular Expressions",
        "year_of_exam": 2023,
        "answer": "### Mumbai University Exam Model Answer\n\n#### Limitations of Finite Automata (FA)\nWhile Finite Automata are highly efficient for pattern matching and lexical analysis, they suffer from several fundamental limitations:\n\n1. **Finite Memory Cache:**\n   An FA has a strictly finite set of states. It has no auxiliary memory (like a stack or tape) to store intermediate information or symbols.\n2. **Inability to Count arbitrarily:**\n   Because of its memory limits, an FA cannot verify or parse languages requiring infinite counting. E.g., it cannot recognize $L = \\{a^n b^n \\mid n \\ge 1\\}$ because it cannot \"remember\" how many $a$s were read when matching them with $b$s.\n3. **No Context Parsing:**\n   An FA cannot recognize Context-Free Languages (CFLs) like matching parentheses in programming languages or nested mathematical expressions.\n4. **Read-Only / One-Way input:**\n   The input head of an FA moves strictly left-to-right, one symbol at a time. It cannot go back to re-read previous inputs or write data back to the input tape."
      },
      {
        "id": "q-2014111-CT-3c0pp1m6a",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "What do you mean by Deterministic Finite Automata (DFA)? Design DFA ending with 10.",
        "marks": 10,
        "module_name": "Module 1: Finite Automata & Regular Expressions",
        "year_of_exam": 2023,
        "answer": "### Mumbai University Exam Model Answer\n\n#### 1. DFA Logic & Requirements\nWe need to design a DFA that accepts strings ending with the suffix `10` over alphabet $\\Sigma = \\{0, 1\\}$.\n- **Minimum Accepted String:** `10` (length 2).\n- **Other Accepted Strings:** `010`, `110`, `0010`, `1010`, etc.\n\n---\n\n#### 2. State Definitions\n1. **q0 (Initial state):** Represents the default state where we have not read any suffix matches.\n2. **q1:** Represents the state where the last character read was `1`.\n3. **q2 (Final state):** Represents the state where the last two characters read were `10`.\n\n---\n\n#### 3. State Transition Table\n| Current State | Input: 0 | Input: 1 | Description / Meaning |\n|---|---|---|---|\n| **q0 (Initial)** | q0 | q1 | Reads `1`, moves to q1. Reads `0`, stays in q0. |\n| **q1** | q2 (Accept) | q1 | Reads `0` after `1`, moves to q2 (accepts). Reads `1`, stays in q1. |\n| **q2 (Final)** | q0 | q1 | Reads `1` after `10` (ends with `1`), goes to q1. Reads `0` (ends with `0`), goes to q0. |\n\n---\n\n#### 4. Transition Diagram Representation\n```\n       +---0---+\n       |       |\n       v       |\n      (q0) ---1---> (q1) ---0---> ((q2))\n     ^   |           ^             |\n     |   +-----0-----+             |\n     +--------------1--------------+\n```\n"
      },
      {
        "id": "q-2014111-CT-n7w2b8f1g",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "What are Moore and Mealy machines? Design Mealy machine to output x if input ends in 101, y if ends in 110, else z.",
        "marks": 10,
        "module_name": "Module 1: Finite Automata & Regular Expressions",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014111-CT-xeqncqqoa",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "State and prove Pumping Lemma for Regular Languages. Use it to show L = {a^n b^n | n >= 0} is not regular.",
        "marks": 10,
        "module_name": "Module 2: Regular Grammars & Normalization",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014111-CT-i1sms4gkb",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Explain the need for normalization/simplification in grammars.",
        "marks": 5,
        "module_name": "Module 2: Regular Grammars & Normalization",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014111-CT-2yb2vykm6",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "What do you mean by ambiguous grammar? Give an example using an arithmetic grammar.",
        "marks": 5,
        "module_name": "Module 3: Context-Free Grammars & Simplification",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014111-CT-uoa8mibse",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Convert the grammar to Chomsky Normal Form (CNF): S -> a | aA | B | C, A -> aB | \\epsilon, B -> Aa, C -> aCD | a, D -> ddd.",
        "marks": 10,
        "module_name": "Module 3: Context-Free Grammars & Simplification",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014111-CT-c3rpanoqb",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Design Push Down Automata (PDA) for L = { a^n b a^(2n) | n >= 0 }.",
        "marks": 10,
        "module_name": "Module 4: Pushdown Automata",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014111-CT-pc809johm",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Design Push Down Automata (PDA) for odd-length palindromes L = { w c w^R } over alphabet {0, 1}.",
        "marks": 10,
        "module_name": "Module 4: Pushdown Automata",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014111-CT-a7wpbct0b",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Design a Turing Machine that performs the addition of two unary numbers. (Logic, transition function, and diagram).",
        "marks": 10,
        "module_name": "Module 5: Turing Machines & Undecidability",
        "year_of_exam": 2023,
        "answer": "### Mumbai University Exam Model Answer\n\n#### 1. Logic for Unary Addition\nUnary numbers represent the value $n$ as a sequence of $n$ ones ($1$s).\n- E.g., $3 + 2$ is written as $111 + 11 = 11111$.\n- In the input tape, we separate two unary numbers using a plus symbol ($+$). E.g., `111+11`.\n\n##### Step-by-Step Logic:\n1. Start at the leftmost $1$. Move right until you find the plus symbol $+$.\n2. Replace the plus symbol $+$ with a $1$. (This joins the two blocks, but increases the total length by 1).\n3. Move right to the end of the combined string until you hit the blank symbol $B$.\n4. Move one cell left (to the last $1$).\n5. Replace that last $1$ with a blank $B$ to restore the correct count (subtracting the extra $1$ we added).\n6. Transition to the final halt state.\n\n---\n\n#### 2. State Transition Function\n- **q0 (Start state):**\n  - Read $1$: Write $1$, move Right, stay in $q_0$.\n  - Read $+$; Write $1$, move Right, transition to $q_1$.\n- **q1 (Search end state):**\n  - Read $1$: Write $1$, move Right, stay in $q_1$.\n  - Read $B$: Write $B$, move Left, transition to $q_2$.\n- **q2 (Delete extra state):**\n  - Read $1$: Write $B$, move Left, transition to $q_3$ (Halt/Accept).\n\n---\n\n#### 3. Transition Table\n| Current State | Input Symbol: 1 | Input Symbol: + | Input Symbol: B |\n|---|---|---|---|\n| **q0** | (q0, 1, R) | (q1, 1, R) | — |\n| **q1** | (q1, 1, R) | — | (q2, B, L) |\n| **q2** | (q3, B, L) | — | — |\n| **q3 (Final)** | — | — | — |"
      },
      {
        "id": "q-2014111-CT-qzopzt76u",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Design a Turing Machine to multiply two unary numbers.",
        "marks": 10,
        "module_name": "Module 5: Turing Machines & Undecidability",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014111-CT-h5q9v3b7i",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Explain Halting Problem of Turing Machine.",
        "marks": 5,
        "module_name": "Module 5: Turing Machines & Undecidability",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014111-CT-zu9yhab6e",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Explain Chomsky's Hierarchy of Grammars with a neat diagram.",
        "marks": 10,
        "module_name": "Module 6: Chomsky Hierarchy & Compiler Phases",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014111-CT-o8kd32z9f",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "What is a compiler? Describe different phases of a compiler.",
        "marks": 10,
        "module_name": "Module 6: Chomsky Hierarchy & Compiler Phases",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014111-CT-4bqxpyp5f",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Describe regular expressions concisely: (i) 1(0+1)*0, (ii) (aa)*(bb)*(b), (iii) (ab+ba)*, (iv) (A-Z) (a-z) *(a+e+i+o+u), (v) (a-z) (a-z | 0-9)*",
        "marks": 5,
        "module_name": "Module 1: Finite Automata & Regular Expressions",
        "year_of_exam": 2022,
        "answer": null
      },
      {
        "id": "q-2014111-CT-n2ls4x0i7",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Write regular expressions for: (i) strings over {0,1} having an odd number of 1s, (ii) strings over {0,1} having number of 10 or 11.",
        "marks": 5,
        "module_name": "Module 1: Finite Automata & Regular Expressions",
        "year_of_exam": 2022,
        "answer": null
      },
      {
        "id": "q-2014111-CT-jh0kj6hkf",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Convert given NFA to DFA with proper transition table and states description.",
        "marks": 5,
        "module_name": "Module 1: Finite Automata & Regular Expressions",
        "year_of_exam": 2022,
        "answer": null
      },
      {
        "id": "q-2014111-CT-pb34a8ip8",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Construct Mealy machine: for input over {0,1}, if input ends in 101 output x, if input ends in 110 output y, else output z.",
        "marks": 5,
        "module_name": "Module 1: Finite Automata & Regular Expressions",
        "year_of_exam": 2022,
        "answer": null
      },
      {
        "id": "q-2014111-CT-xk3c9s2ni",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Give Regular Expressions for: (i) starts with 10 and ends with 01, (ii) exactly 3 occurrences of 'b' over alphabet {a,b}.",
        "marks": 5,
        "module_name": "Module 1: Finite Automata & Regular Expressions",
        "year_of_exam": 2022,
        "answer": null
      },
      {
        "id": "q-2014111-CT-kemizdvkk",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Consider CFG: S -> aAS | a, A -> SbA | SS | ba. Derive the string 'aabbaa' using leftmost and rightmost derivation.",
        "marks": 5,
        "module_name": "Module 3: Context-Free Grammars & Simplification",
        "year_of_exam": 2022,
        "answer": null
      },
      {
        "id": "q-2014111-CT-dhjw65zsl",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Compare and Contrast between Finite Automata (FA), Push Down Automata (PDA) and Turing Machine (TM).",
        "marks": 5,
        "module_name": "Module 5: Turing Machines & Undecidability",
        "year_of_exam": 2022,
        "answer": null
      },
      {
        "id": "q-2014111-CT-7u50lt7vq",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "What is Ambiguous Grammar? Test if the arithmetic grammar S -> S+S | S*S | S-S | S/S | (S) | var | const is ambiguous for string (x+2.0)*y/(z-6.0).",
        "marks": 5,
        "module_name": "Module 3: Context-Free Grammars & Simplification",
        "year_of_exam": 2022,
        "answer": null
      },
      {
        "id": "q-2014111-CT-0nj5okuw8",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Convert the following grammar into CNF: S -> a | aA | B, A -> aBB | \\epsilon, B -> Aa | b.",
        "marks": 10,
        "module_name": "Module 3: Context-Free Grammars & Simplification",
        "year_of_exam": 2022,
        "answer": null
      },
      {
        "id": "q-2014111-CT-b00uryw8i",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Design a Turing Machine to accept the language L = { a^m b^m : m >= 1 }.",
        "marks": 10,
        "module_name": "Module 5: Turing Machines & Undecidability",
        "year_of_exam": 2022,
        "answer": null
      },
      {
        "id": "q-2014111-CT-x3azhobsr",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Construct DFA for given regular expression (a+b)* aba (a+b)*.",
        "marks": 10,
        "module_name": "Module 1: Finite Automata & Regular Expressions",
        "year_of_exam": 2022,
        "answer": null
      },
      {
        "id": "q-2014111-CT-0fcyzdgvy",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Construct NFA with epsilon-moves for regular expression 'zero or more 0s followed by zero or more 1s followed by zero or more 2s', and convert to DFA.",
        "marks": 10,
        "module_name": "Module 1: Finite Automata & Regular Expressions",
        "year_of_exam": 2022,
        "answer": null
      },
      {
        "id": "q-2014111-CT-fe8e8q75v",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "What do you mean by Right-linear and Left-linear grammars? Give examples.",
        "marks": 5,
        "module_name": "Module 2: Regular Grammars & Normalization",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014111-CT-fvdzu7jk6",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Write regular expressions for: (a) strings over {0,1} having no consecutive 0s, (b) strings containing the sequence 101, (c) strings length is multiple of 3 over {a,b}, (d) strings containing no more than two 0s.",
        "marks": 5,
        "module_name": "Module 1: Finite Automata & Regular Expressions",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014111-CT-5ikswuuv7",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "What are Moore and Mealy machines? Design Moore and Mealy machines to convert each occurrence of 'aaa' with 'zzz'.",
        "marks": 10,
        "module_name": "Module 1: Finite Automata & Regular Expressions",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014111-CT-6reua7tfb",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Design Push Down Automata (PDA) for L = { a^n b^n : n >= 1 }.",
        "marks": 10,
        "module_name": "Module 4: Pushdown Automata",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014111-CT-hy83oqm9d",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "What is Deterministic Finite Automata (DFA)? Construct a DFA for binary numbers divisible by 5 excluding leading zeros.",
        "marks": 10,
        "module_name": "Module 1: Finite Automata & Regular Expressions",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014111-CT-13eo259fw",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Convert the following grammar into CNF: S -> aSa | bSb | a | b | \\epsilon.",
        "marks": 10,
        "module_name": "Module 3: Context-Free Grammars & Simplification",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014111-CT-yvxhj1uc9",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Design a Turing Machine for L = { a^n b^m c^(n+m) | n,m >= 1 }.",
        "marks": 10,
        "module_name": "Module 5: Turing Machines & Undecidability",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014111-CT-rzh8ayp7p",
        "subject_code": "2014111-CT",
        "type": "theory",
        "question": "Write a short note on Greibach Normal Form (GNF) and its simplification steps.",
        "marks": 5,
        "module_name": "Module 3: Context-Free Grammars & Simplification",
        "year_of_exam": 2024,
        "answer": null
      }
    ]
  },
  "2014112-DBMS": {
    "theory": [
      {
        "id": "q-2014112-DBMS-tq0h94gvm",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Explain the concept of data independence. Discuss the differences between logical and physical data independence.",
        "marks": 5,
        "module_name": "Module 1: Introduction & Database Architecture",
        "year_of_exam": 2023,
        "answer": "### Mumbai University Exam Model Answer\n\n#### Data Independence\nData Independence is the capability to modify the schema at one level of the database architecture without changing the schema at the next higher level.\n\n1. **Logical Data Independence:**\n   - **Definition:** The ability to modify the conceptual schema without causing program rewrites.\n   - **Example:** Adding a new column to a table or splitting a table vertically does not require altering existing user views or application logic.\n   \n2. **Physical Data Independence:**\n   - **Definition:** The ability to modify the physical schema (internal file organizations, index modifications) without changing the conceptual or external schema.\n   - **Example:** Switching from B-Trees to Hashing on storage does not affect tables structure or queries."
      },
      {
        "id": "q-2014112-DBMS-89f96t5zy",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Describe weak entity. Provide an example of weak entity and strong entity.",
        "marks": 5,
        "module_name": "Module 2: ER Model & Relational Mapping",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-2ad7skga0",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "List and briefly explain SQL aggregate functions with suitable examples.",
        "marks": 5,
        "module_name": "Module 3: Relational Algebra & SQL",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-x7iqvqten",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Explain the concept of First Normal Form (1NF). Give example for the same.",
        "marks": 5,
        "module_name": "Module 4: Database Design & Normalization",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-74vw9bw6y",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Discuss conflict serializability with suitable example.",
        "marks": 5,
        "module_name": "Module 5: Transactions & Concurrency Control",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-s8tp50izn",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Describe the overall architecture of DBMS with suitable diagram.",
        "marks": 10,
        "module_name": "Module 1: Introduction & Database Architecture",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-it52p1w6e",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "What is deadlock? Explain wait-die and wound-wait methods with suitable example.",
        "marks": 10,
        "module_name": "Module 5: Transactions & Concurrency Control",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-igxmwx9ph",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Draw an E-R diagram for library management system. Convert it into relational schema.",
        "marks": 10,
        "module_name": "Module 2: ER Model & Relational Mapping",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-fzxjck277",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Explain the following Relational Algebra operations with suitable example: (1) Project, (2) Select, (3) Union, (4) Rename, (5) Set difference.",
        "marks": 10,
        "module_name": "Module 3: Relational Algebra & SQL",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-hgxd14sfk",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Write SQL queries for the employee database:\nEmployee(empname, street, city, date_of_joining)\nWorks(empname, company_name, salary)\nCompany(company_name, city)\n1. Modify John's lives to Mumbai.\n2. Find employees who joined in October.\n3. Give ABC Corporation employees 10% raise.\n4. Find employees earning more than their company average.\n5. List name of companies starting with A.",
        "marks": 10,
        "module_name": "Module 3: Relational Algebra & SQL",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-egeiz06nw",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Why is there a need for normalization? Explain 1NF, 2NF, 3NF and BCNF with suitable examples.",
        "marks": 10,
        "module_name": "Module 4: Database Design & Normalization",
        "year_of_exam": 2023,
        "answer": "### Mumbai University Exam Model Answer\n\n#### Normalization\nNormalization is the systematic process of organizing database tables to minimize data redundancy, update anomalies, and structural dependencies.\n\n1. **First Normal Form (1NF):**\n   - **Requirement:** A relation is in 1NF if all domain attributes contain only atomic (indivisible) values.\n   \n2. **Second Normal Form (2NF):**\n   - **Requirement:** Must be in 1NF and no non-prime attribute is partially dependent on any candidate key (no partial dependencies).\n   \n3. **Third Normal Form (3NF):**\n   - **Requirement:** Must be in 2NF and no non-prime attribute is transitively dependent on candidate keys (for every FD $X \\rightarrow Y$, $X$ is superkey or $Y$ is prime).\n   \n4. **Boyce-Codd Normal Form (BCNF):**\n   - **Requirement:** Strict version of 3NF. For every functional dependency $X \\rightarrow Y$, $X$ must be a super key."
      },
      {
        "id": "q-2014112-DBMS-28id3m3p2",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Describe ACID properties of transactions with suitable examples.",
        "marks": 10,
        "module_name": "Module 5: Transactions & Concurrency Control",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-dry55cum9",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Explain Lock based (2PL) concurrency control method with example.",
        "marks": 10,
        "module_name": "Module 5: Transactions & Concurrency Control",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-ux4u1im7p",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Explain Conversion of Specialization to relational schema with suitable example.",
        "marks": 5,
        "module_name": "Module 2: ER Model & Relational Mapping",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-qyxv985tg",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Write short note on Log based recovery.",
        "marks": 5,
        "module_name": "Module 6: Log-Based Recovery & Database Security",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-kq8pzvrsb",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Explain the Role of DBA (Database Administrator) in database systems.",
        "marks": 5,
        "module_name": "Module 1: Introduction & Database Architecture",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-0ctbrmrod",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Write a short note on Database Triggers and their uses.",
        "marks": 5,
        "module_name": "Module 6: Log-Based Recovery & Database Security",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-470dg1n2o",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Explain different Types of attributes in Entity-Relationship model.",
        "marks": 5,
        "module_name": "Module 2: ER Model & Relational Mapping",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-ht9a7yxjh",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Compare File Processing System with Database Management system.",
        "marks": 5,
        "module_name": "Module 1: Introduction & Database Architecture",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-3tuil8ez5",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Describe Transaction state transition diagram with neat sketch.",
        "marks": 5,
        "module_name": "Module 5: Transactions & Concurrency Control",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-ak40uu1i8",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Design an EER diagram for Hospital Management System and map it into Relational Model.",
        "marks": 10,
        "module_name": "Module 2: ER Model & Relational Mapping",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-9i8xaee32",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Explain Relational Algebra operators: Selection, Union, Rename, Cartesian product with examples.",
        "marks": 10,
        "module_name": "Module 3: Relational Algebra & SQL",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-i071zr3m2",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Explain in detail with example of conflict and view serializability.",
        "marks": 10,
        "module_name": "Module 5: Transactions & Concurrency Control",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-40s8eqqq0",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Explain Referential Constraints and Null Constraints in relational database design.",
        "marks": 5,
        "module_name": "Module 6: Log-Based Recovery & Database Security",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-750hmbv4y",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Explain three-level architecture of DBMS in detail with appropriate diagram.",
        "marks": 10,
        "module_name": "Module 1: Introduction & Database Architecture",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-jc236f4bb",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Discuss types of Joins in SQL (Inner Join, Left/Right Outer Join, Full Outer Join) with syntax and examples.",
        "marks": 10,
        "module_name": "Module 3: Relational Algebra & SQL",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-h7uwte1ps",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Write SQL queries for database: Employee(ename, ecode, salary, dno), Project(pno, pname, budget, dno), Works(ecode, pno, responsibility, hours)\n1) Find project pno and pname with budget > 100000.\n2) Find employee name in department D1 ordered by descending salary.\n3) Find works records where hours < 10 and responsibility is Manager.\n4) Find total employees.\n5) Raise employees salary by 10%.\n6) Find employee name with maximum salary.",
        "marks": 10,
        "module_name": "Module 3: Relational Algebra & SQL",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-kof80oocd",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Explain all types of integrity constraints with examples in SQL.",
        "marks": 10,
        "module_name": "Module 6: Log-Based Recovery & Database Security",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-s86stgu5n",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Write short notes on Lock-based and Timestamp-based protocols.",
        "marks": 10,
        "module_name": "Module 5: Transactions & Concurrency Control",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-mxqk9ggns",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "What are DDL and DML commands? Write syntax and examples for DDL and DML commands.",
        "marks": 5,
        "module_name": "Module 6: Log-Based Recovery & Database Security",
        "year_of_exam": 2025,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-3haj2ptwn",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Discuss with suitable example Extended ER features: Specialization, Generalization and Aggregation.",
        "marks": 5,
        "module_name": "Module 2: ER Model & Relational Mapping",
        "year_of_exam": 2025,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-tye301xq2",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Explain different types of users for database system and explain responsibilities of DBA.",
        "marks": 5,
        "module_name": "Module 1: Introduction & Database Architecture",
        "year_of_exam": 2025,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-hh29uwo86",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Write SQL expressions for database Customer(cust_id, cname, caddress, ph_no, balance):\ni) Select customers living in Mumbai or Delhi with balance > 50000.\nii) Add one record (105, 'Sachin', 'Kalyan', '9820011211', 25000).\niii) Find customer name with minimum balance.\niv) Find total number of customers.\nv) Write syntax of view creation.",
        "marks": 10,
        "module_name": "Module 3: Relational Algebra & SQL",
        "year_of_exam": 2025,
        "answer": null
      },
      {
        "id": "q-2014112-DBMS-2t3p4p9b1",
        "subject_code": "2014112-DBMS",
        "type": "theory",
        "question": "Explain Timestamp ordering protocol in detail.",
        "marks": 10,
        "module_name": "Module 5: Transactions & Concurrency Control",
        "year_of_exam": 2025,
        "answer": null
      }
    ]
  },
  "2014113-OS": {
    "theory": [
      {
        "id": "q-2014113-OS-imsuwvzeu",
        "subject_code": "2014113-OS",
        "type": "theory",
        "question": "Describe the functions and services provided by an Operating System.",
        "marks": 5,
        "module_name": "Module 1: Overview & OS Structures",
        "year_of_exam": 2024,
        "answer": "### Mumbai University Exam Model Answer\n\n#### Services Provided by an Operating System:\n1. **User Interface (UI):** Provides a CLI, GUI, or batch interface for user interaction.\n2. **Program Execution:** Loads program instructions into memory, assigns CPU time, and runs the process.\n3. **I/O Operations:** Coordinates and controls access to input/output devices (disks, keyboards, printers).\n4. **File System Manipulation:** Creation, deletion, reading, writing, and permission management of files/directories.\n5. **Communications:** Manages message-passing or shared memory communications between processes on same or remote systems.\n6. **Error Detection:** Continuously monitors CPU, memory, and devices to detect and gracefully handle errors.\n7. **Resource Allocation:** Assigns CPU cycles, main memory, and storage space to concurrent users/processes.\n8. **Protection and Security:** Controls access to system resources and prevents unauthorized usage."
      },
      {
        "id": "q-2014113-OS-luv6zsyh8",
        "subject_code": "2014113-OS",
        "type": "theory",
        "question": "What is a system call? Explain different categories of system calls with examples.",
        "marks": 10,
        "module_name": "Module 1: Overview & OS Structures",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014113-OS-fg3yrrj6s",
        "subject_code": "2014113-OS",
        "type": "theory",
        "question": "Draw and explain the Process State Transition diagram.",
        "marks": 5,
        "module_name": "Module 2: Process & Thread Management",
        "year_of_exam": 2024,
        "answer": "### Mumbai University Exam Model Answer\n\n#### Process State Transition Diagram\nA process transitions between the following states during its lifecycle:\n\n```\n        Admit\n          v\n   +--------------+      Dispatch      +-------------+\n   |              | -----------------> |             |\n   |    READY     |                    |   RUNNING   |\n   |              | <----------------- |             |\n   +--------------+     Time slice     +-------------+\n       ^                   expired            |\n       |                                      | Event wait\n       |                                      v\n       |                               +-------------+\n       +------------------------------ |   BLOCKED   |\n                 Event occurred        |  (WAITING)  |\n                                       +-------------+\n```\n\n1. **New:** The process is being created.\n2. **Ready:** The process is in memory, waiting to be assigned to a CPU core.\n3. **Running:** Instructions are being executed by the CPU.\n4. **Blocked (Waiting):** The process is waiting for an I/O completion or event signal.\n5. **Terminated:** The process has finished execution."
      },
      {
        "id": "q-2014113-OS-hwmzslm34",
        "subject_code": "2014113-OS",
        "type": "theory",
        "question": "Describe CPU scheduling algorithms: FCFS, SJF, SRTN, Round Robin, and Priority Scheduling. Solve a numerical example.",
        "marks": 10,
        "module_name": "Module 2: Process & Thread Management",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014113-OS-w7760ypbg",
        "subject_code": "2014113-OS",
        "type": "theory",
        "question": "Explain the difference between a process and a thread. Explain Multithreading models.",
        "marks": 5,
        "module_name": "Module 2: Process & Thread Management",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014113-OS-uirqk0p96",
        "subject_code": "2014113-OS",
        "type": "theory",
        "question": "Explain the Critical Section problem and Peterson's solution for two processes. State its requirements.",
        "marks": 10,
        "module_name": "Module 3: Process Synchronization",
        "year_of_exam": 2024,
        "answer": "### Mumbai University Exam Model Answer\n\n#### Peterson's Critical Section Solution\nPeterson's solution is a classic software-based solution for two processes ($P_0$ and $P_1$) to solve the mutual exclusion critical section problem.\n\n#### Variables Shared:\n- `boolean flag[2];` (Initialized to `false`. `flag[i] = true` means process $P_i$ wants to enter).\n- `int turn;` (Indicates whose turn it is to enter the critical section).\n\n#### Structure of Process $P_i$:\n```c\ndo {\n    flag[i] = true;\n    turn = j;\n    while (flag[j] && turn == j);\n    \n    // CRITICAL SECTION\n    \n    flag[i] = false;\n    \n    // REMAINDER SECTION\n} while (true);\n```\n\n#### Requirements Satisfied:\n1. **Mutual Exclusion:** Verified as only one process can enter since `turn` can only be $0$ or $1$.\n2. **Progress:** If no process is in CS, a process can enter without indefinite waiting.\n3. **Bounded Waiting:** A process waits at most one turn before entering."
      },
      {
        "id": "q-2014113-OS-8i66529q8",
        "subject_code": "2014113-OS",
        "type": "theory",
        "question": "What are Semaphores? Explain Producer-Consumer problem or Reader-Writer problem using semaphores.",
        "marks": 10,
        "module_name": "Module 3: Process Synchronization",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014113-OS-wb0gt5dk4",
        "subject_code": "2014113-OS",
        "type": "theory",
        "question": "What is a Deadlock? Explain the four necessary conditions for a deadlock to occur.",
        "marks": 5,
        "module_name": "Module 4: Deadlocks",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014113-OS-29c79405l",
        "subject_code": "2014113-OS",
        "type": "theory",
        "question": "Explain Banker's Algorithm for Deadlock Avoidance. Solve a resource allocation sample scenario.",
        "marks": 10,
        "module_name": "Module 4: Deadlocks",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014113-OS-ouw7qwqha",
        "subject_code": "2014113-OS",
        "type": "theory",
        "question": "Explain Paging and the logical-to-physical address translation mechanism with a neat diagram.",
        "marks": 10,
        "module_name": "Module 5: Memory Management",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014113-OS-ypcuvz07j",
        "subject_code": "2014113-OS",
        "type": "theory",
        "question": "Explain Segmentation and compare Paging with Segmentation.",
        "marks": 5,
        "module_name": "Module 5: Memory Management",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014113-OS-jw94q6inb",
        "subject_code": "2014113-OS",
        "type": "theory",
        "question": "Discuss page replacement algorithms (FIFO, LRU, Optimal). Solve a page reference string numerical.",
        "marks": 10,
        "module_name": "Module 5: Memory Management",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014113-OS-ojj0ufbrh",
        "subject_code": "2014113-OS",
        "type": "theory",
        "question": "Explain disk scheduling algorithms (FCFS, SSTF, SCAN, CSCAN, LOOK, CLOOK) with examples.",
        "marks": 10,
        "module_name": "Module 6: Storage & File Systems",
        "year_of_exam": 2023,
        "answer": null
      },
      {
        "id": "q-2014113-OS-su3q0fffv",
        "subject_code": "2014113-OS",
        "type": "theory",
        "question": "Explain file allocation methods: Contiguous Allocation, Linked Allocation, Indexed Allocation.",
        "marks": 10,
        "module_name": "Module 6: Storage & File Systems",
        "year_of_exam": 2024,
        "answer": null
      },
      {
        "id": "q-2014113-OS-9bf74er3j",
        "subject_code": "2014113-OS",
        "type": "theory",
        "question": "Write short notes on: (1) Raid levels, (2) I/O buffering.",
        "marks": 5,
        "module_name": "Module 6: Storage & File Systems",
        "year_of_exam": 2023,
        "answer": null
      }
    ]
  }
};
