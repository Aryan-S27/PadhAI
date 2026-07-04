-- ═══════════════════════════════════════════════════════
-- Seed: Subjects catalogue (Dynamic Export)
-- Run AFTER migrations
-- ═══════════════════════════════════════════════════════

insert into public.subjects (code, name, short_name, branch, year, semester, modules)
values
(
  '2014111-CT',
  'Computational Theory',
  'CT',
  'AIDS', 2, 4,
  '[{"num":0,"title":"Prerequisite","topics":["Basic Mathematical Fundamentals: Sets, Logic, Relations, Functions, Discrete Structures."]},{"num":1,"title":"Basics Concepts and Regular Languages","topics":["Importance of TCS, Alphabets, Strings, Languages","Regular operations, Regular Expression, Arden''s theorem, RE Applications, Regular Language, Closure properties","Decision properties of RLs, Pumping lemma for RLs","Self-learning Topics: RE in text search and replace, Application of Regular Languages in Compiler Design, Text Processing, and Natural Language Processing (NLP)"]},{"num":2,"title":"Finite Automata","topics":["Finite Automata (FA) & Finite State machine (FSM)","Deterministic Finite Automata (DFA) and Nondeterministic Finite Automata (NFA): Definitions, transition diagrams and Language recognizers","Equivalence between NFA with and ϵ- transitions, NFA to DFA Conversion, Minimization of DFA, FSM with output: Moore and Mealy machines, Applications and limitations of FA","Self-learning Topics: State Elimination Method for converting FA to RE, Minimization of DFA using Equivalence Theorem, Conversion of Moore to Mealy & Mealy to Moore machine"]},{"num":3,"title":"Regular and Context Free Grammars","topics":["Grammars and Chomsky Hierarchy","Regular Grammar (RG), Equivalence of Left and Right linear grammar, Equivalence of RG and FA","Context Free Grammars (CFG): Definition, Sentential forms, Leftmost and Rightmost derivations, Parse tree, Ambiguity, Simplification of CFG: Eliminating unit productions, useless production, useless symbols, and ϵ-productions","Normal Forms: Chomsky Normal Form (CNF) and Greibach Normal Form (GNF), Context Free language (CFL) - Application: Parser, Markup languages; Pumping lemma, Closure properties","Self-learning Topics: Left Recursion and Its Elimination, Applications of CFGs in XML Parsing, and Natural Language Processing (NLP)"]},{"num":4,"title":"Pushdown Automata (PDA)","topics":["Definition, Language of PDA, PDA as generator, decider and acceptor of CFG, Deterministic PDA, Non-Deterministic PDA, Equivalence of PDA and CFG, Application of PDA","Self-learning Topics: Parsing & PDA: Top-Down Parsing, Bottom-up Parsing, Closure properties and Deterministic PDA"]},{"num":5,"title":"Turing Machine (TM)","topics":["Definition, Design of TM as generator, decider and acceptor, Variants of TM: Multitrack, Multitape, Universal TM, Applications, Power and Limitations of TMs","Self-learning Topics: Algorithms using Turing Machine, The Model of Linear Bounded Automata"]},{"num":6,"title":"Decidability and Computability","topics":["Decidability and Undecidability, Recursive and Recursively Enumerable Language, Halting Problem, Rice’s Theorem, Post Correspondence Problem","Self-learning Topics: NP Completeness of the SAT Problem, A Restricted Satisfiability Problem"]}]'
),

(
  '2014112-DBMS',
  'Database Management Systems',
  'DBMS',
  'AIDS', 2, 4,
  '[{"num":1,"title":"Introduction to Database and Data Modeling","topics":["Introduction: Definitions and application, Characteristics of databases, DBMS architecture, ACID Properties","The Entity-Relationship (ER) Model: Entity types: Weak and strong entity sets, Entity sets, Types of Attributes, Keys, Relationship constraints: Cardinality and Participation","Extended Entity-Relationship (EER) Model: Generalization, Specialization and Aggregation","Self-learning Topics: Design an ER model for any real time case study."]},{"num":2,"title":"Relational Model and Relational Algebra","topics":["Introduction to the Relational Model, relational schema and concept of keys","Mapping the ER and EER Model to the Relational Model","Relational Algebra- operators (Selection(σ), Projection(π), Union(∪), Difference(−), CartesianProduct(×), Join(⋈), Intersection(∩), Rename(ρ))","Relational Algebra Queries","Self-learning Topics: Practice writing queries to perform common database tasks (e.g., selecting data, joining tables)"]},{"num":3,"title":"Structured Query Language (SQL)","topics":["Overview of SQL, Data Definition Commands","Integrity constraints: key constraints, Domain Constraints, Referential integrity, check constraints","Data Manipulation commands, Data Control commands, Transaction Control Commands","Aggregate functions: group by, having, order by, joins","Nested and complex queries, Views in SQL, Set and string operations","Triggers, Introduction to PL/SQL Block Structure","Self-learning Topics: LeetCode (SQL practice problems), HackerRank (SQL challenges)"]},{"num":4,"title":"Database Normalization","topics":["Pitfalls in relational database designs, Concept of normalization","Functional Dependencies, FD closure","First Normal Form, 2NF, 3NF, BCNF, 4NF","Self-learning Topics: Consider any real time application and normalization upto 3NF/BCNF"]},{"num":5,"title":"Transaction Management and Concurrency Control","topics":["Transaction concept, Transaction states","Concurrent Executions, Serializability-Conflict and View","Concurrency Control: Lock-based, Timestamp-based protocols","Recovery System: log-based recovery","Introduction to Deadlock handling","Self-learning Topics: SQL challenges related to transactions and concurrency"]},{"num":6,"title":"Introduction to Modern databases","topics":["Recent trends in the industry","Introduction of Cloud Database","Introduction of Distributed Database","Introduction to NOSQL Database and Object-Oriented Databases","Self-learning Topics: Learn about emerging database technologies, explore different NoSQL types, learn how object-oriented programming concepts like objects and inheritance are applied to database management systems"]}]'
),

(
  '2014113-OS',
  'Operating Systems',
  'OS',
  'AIDS', 2, 4,
  '[{"num":1,"title":"Fundamentals of Operating System","topics":["Introduction of Operating Systems","System Boot","Objectives of Operating System","Functions of Operating System","Operating System Structure and Operations","Operating System Services","Multiprogramming","Multitasking","Multithreading","Types of Operating System","Types of System Calls","Study of various Operating System Architecture like IoT, Android"]},{"num":2,"title":"Process Management","topics":["Basic Concepts of Process","Process State Transition Model","Operations","Process Control Block","Context Switching","Introduction to Threads","Types of Threads","Thread Models","Basic Concepts of Scheduling","Types of Schedulers","Type of scheduling algorithms: Preemptive and non preemptive (FCFS, SJF, Priority and Round Robin)","Real-time Scheduling algorithms and applications"]},{"num":3,"title":"Process Synchronization and Deadlock Management","topics":["Basic Concepts of Inter-process Communication and Synchronization","Race Condition","Critical Section Problem","Peterson’s Solution","Process Synchronization","Hardware and Semaphores","Producer Consumer Problem","Deadlocks Management: System Model","Deadlock Characterization","Deadlock Prevention","Deadlock Avoidance: Bankers algorithm","Deadlock Detection and Recovery","Study a real time case study for Deadlock detection and recovery","Overview of security mechanism in OS"]},{"num":4,"title":"Memory Management","topics":["Basic Concepts of Memory Management","Swapping","Memory Allocation strategy","Paging","Structure of Page Table","Segmentation","TLB","Basic Concepts of Virtual Memory","Demand Paging","Copy-on Write","Page Replacement Algorithms","Thrashing","Memory Management of IoT, Android Operating System"]},{"num":5,"title":"File and IO Management","topics":["File Management: Basic Concepts of File System","File Access Methods","Directory Structure","File-System implementation","Allocation Methods","Overview of Mass Storage Structure","I/O devices","Organization of the I/O Function","Disk Organization","I/O Management and Disk Scheduling: FCFS, SSTF, SCAN, C-SCAN, LOOK, C-LOOK","File System for Linux and Windows","Features of I/O facility for different OS"]},{"num":6,"title":"Special-purpose Operating Systems","topics":["Open-source and Proprietary Operating System","Fundamentals of Distributed Operating System","Network Operating System","Architecture and functions: Cloud Operating System, Real-Time Operating System, Mobile Operating System","Case Study on any one Special-purpose Operating Systems"]}]'
),

(
  'MU-CS-SEM4-OS',
  'Operating Systems (Rev 2019 C Scheme)',
  'OS',
  'CS', 2, 4,
  '[{"num":1,"title":"Introduction to OS","topics":["Types of OS","Process concept","Process states","System calls"]},{"num":2,"title":"Process Management","topics":["Scheduling algorithms","CPU scheduling","Context switching","Threads"]},{"num":3,"title":"Process Synchronization","topics":["Critical section","Semaphores","Monitors","Deadlock","Banker algorithm"]},{"num":4,"title":"Memory Management","topics":["Paging","Segmentation","Virtual memory","Page replacement","Thrashing"]},{"num":5,"title":"File System","topics":["File concepts","Directory structure","Disk scheduling","RAID","File allocation"]},{"num":6,"title":"I/O and Protection","topics":["I/O hardware","Device drivers","Security","Protection","Linux overview"]}]'
),

(
  'MU-CS-SEM5-CN',
  'Computer Networks',
  'CN',
  'CS', 3, 5,
  '[{"num":1,"title":"Introduction","topics":["Network types","OSI model","TCP/IP","Protocols"]},{"num":2,"title":"Data Link Layer","topics":["Framing","Error detection","CSMA/CD","MAC addresses"]},{"num":3,"title":"Network Layer","topics":["IP addressing","Routing algorithms","CIDR","NAT"]},{"num":4,"title":"Transport Layer","topics":["TCP","UDP","Flow control","Congestion control"]},{"num":5,"title":"Application Layer","topics":["HTTP","DNS","SMTP","FTP","Socket programming"]},{"num":6,"title":"Network Security","topics":["Cryptography","SSL/TLS","Firewalls","VPN"]}]'
),

(
  'MU-CS-SEM5-DBMS',
  'Database Management Systems',
  'DBMS',
  'CS', 3, 5,
  '[{"num":1,"title":"Introduction to DBMS","topics":["ER model","Relational model","Keys","Schema"]},{"num":2,"title":"Relational Algebra & SQL","topics":["SQL DDL/DML","Joins","Subqueries","Views"]},{"num":3,"title":"Normalization","topics":["FDs","1NF 2NF 3NF BCNF","Decomposition"]},{"num":4,"title":"Transaction Management","topics":["ACID properties","Concurrency control","Locking","Serializability"]},{"num":5,"title":"Query Processing","topics":["Query optimization","Indexing","B+ trees","Hashing"]},{"num":6,"title":"Advanced Topics","topics":["NoSQL","Distributed DB","Big Data","Data warehousing"]}]'
),

(
  'MU-CS-SEM5-OS',
  'Operating Systems',
  'OS',
  'CS', 3, 5,
  '[{"num":1,"title":"Introduction to OS","topics":["Types of OS","Process concept","Process states"]},{"num":2,"title":"Process Management","topics":["Scheduling algorithms","CPU scheduling","Context switching"]},{"num":3,"title":"Process Synchronization","topics":["Critical section","Semaphores","Monitors","Deadlock"]},{"num":4,"title":"Memory Management","topics":["Paging","Segmentation","Virtual memory","Page replacement"]},{"num":5,"title":"File System","topics":["File concepts","Directory structure","Disk scheduling","RAID"]},{"num":6,"title":"I/O and Protection","topics":["I/O hardware","Device drivers","Security","Protection"]}]'
),

(
  'MU-CS-SEM6-AI',
  'Artificial Intelligence',
  'AI',
  'CS', 3, 6,
  '[{"num":1,"title":"Introduction to AI","topics":["History","Intelligent agents","PEAS","Problem formulation"]},{"num":2,"title":"Search Algorithms","topics":["BFS DFS","A* algorithm","Heuristics","Adversarial search"]},{"num":3,"title":"Knowledge Representation","topics":["Propositional logic","First-order logic","Inference"]},{"num":4,"title":"Machine Learning","topics":["Supervised learning","Decision trees","Neural networks","SVM"]},{"num":5,"title":"Natural Language Processing","topics":["Parsing","Semantic analysis","Information extraction"]},{"num":6,"title":"Expert Systems & Planning","topics":["Production rules","STRIPS","Classical planning"]}]'
),

(
  'MU-CS-SEM6-TOC',
  'Theory of Computation',
  'TOC',
  'CS', 3, 6,
  '[{"num":1,"title":"Finite Automata","topics":["DFA","NFA","Equivalence","Minimization"]},{"num":2,"title":"Regular Languages","topics":["Regular expressions","Pumping lemma","Closure properties"]},{"num":3,"title":"Context-Free Languages","topics":["CFG","PDA","Parsing","Ambiguity","CYK"]},{"num":4,"title":"Turing Machines","topics":["TM definition","Variants","Church-Turing thesis"]},{"num":5,"title":"Decidability","topics":["Decidable problems","Halting problem","Reducibility"]},{"num":6,"title":"Complexity Theory","topics":["P vs NP","NP-complete","Polynomial reductions"]}]'
)

on conflict (code) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  branch = excluded.branch,
  year = excluded.year,
  semester = excluded.semester,
  modules = excluded.modules;
