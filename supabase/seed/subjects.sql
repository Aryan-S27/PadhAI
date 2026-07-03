-- ═══════════════════════════════════════════════════════
-- Seed: MU CS subjects catalogue
-- Run AFTER migrations 001–007
-- ═══════════════════════════════════════════════════════

insert into public.subjects (code, name, short_name, branch, year, semester, modules)
values

-- ── CS Semester 5 ────────────────────────────────────────
(
  'MU-CS-SEM5-OS',
  'Operating Systems',
  'OS',
  'CS', 3, 5,
  '[
    {"num":1,"title":"Introduction to OS","topics":["Types of OS","Process concept","Process states"]},
    {"num":2,"title":"Process Management","topics":["Scheduling algorithms","CPU scheduling","Context switching"]},
    {"num":3,"title":"Process Synchronization","topics":["Critical section","Semaphores","Monitors","Deadlock"]},
    {"num":4,"title":"Memory Management","topics":["Paging","Segmentation","Virtual memory","Page replacement"]},
    {"num":5,"title":"File System","topics":["File concepts","Directory structure","Disk scheduling","RAID"]},
    {"num":6,"title":"I/O and Protection","topics":["I/O hardware","Device drivers","Security","Protection"]}
  ]'
),

(
  'MU-CS-SEM5-DBMS',
  'Database Management Systems',
  'DBMS',
  'CS', 3, 5,
  '[
    {"num":1,"title":"Introduction to DBMS","topics":["ER model","Relational model","Keys","Schema"]},
    {"num":2,"title":"Relational Algebra & SQL","topics":["SQL DDL/DML","Joins","Subqueries","Views"]},
    {"num":3,"title":"Normalization","topics":["FDs","1NF 2NF 3NF BCNF","Decomposition"]},
    {"num":4,"title":"Transaction Management","topics":["ACID properties","Concurrency control","Locking","Serializability"]},
    {"num":5,"title":"Query Processing","topics":["Query optimization","Indexing","B+ trees","Hashing"]},
    {"num":6,"title":"Advanced Topics","topics":["NoSQL","Distributed DB","Big Data","Data warehousing"]}
  ]'
),

(
  'MU-CS-SEM5-CN',
  'Computer Networks',
  'CN',
  'CS', 3, 5,
  '[
    {"num":1,"title":"Introduction","topics":["Network types","OSI model","TCP/IP","Protocols"]},
    {"num":2,"title":"Data Link Layer","topics":["Framing","Error detection","CSMA/CD","MAC addresses"]},
    {"num":3,"title":"Network Layer","topics":["IP addressing","Routing algorithms","CIDR","NAT"]},
    {"num":4,"title":"Transport Layer","topics":["TCP","UDP","Flow control","Congestion control"]},
    {"num":5,"title":"Application Layer","topics":["HTTP","DNS","SMTP","FTP","Socket programming"]},
    {"num":6,"title":"Network Security","topics":["Cryptography","SSL/TLS","Firewalls","VPN"]}
  ]'
),

-- ── CS Semester 6 ────────────────────────────────────────
(
  'MU-CS-SEM6-TOC',
  'Theory of Computation',
  'TOC',
  'CS', 3, 6,
  '[
    {"num":1,"title":"Finite Automata","topics":["DFA","NFA","Equivalence","Minimization"]},
    {"num":2,"title":"Regular Languages","topics":["Regular expressions","Pumping lemma","Closure properties"]},
    {"num":3,"title":"Context-Free Languages","topics":["CFG","PDA","Parsing","Ambiguity","CYK"]},
    {"num":4,"title":"Turing Machines","topics":["TM definition","Variants","Church-Turing thesis"]},
    {"num":5,"title":"Decidability","topics":["Decidable problems","Halting problem","Reducibility"]},
    {"num":6,"title":"Complexity Theory","topics":["P vs NP","NP-complete","Polynomial reductions"]}
  ]'
),

(
  'MU-CS-SEM6-AI',
  'Artificial Intelligence',
  'AI',
  'CS', 3, 6,
  '[
    {"num":1,"title":"Introduction to AI","topics":["History","Intelligent agents","PEAS","Problem formulation"]},
    {"num":2,"title":"Search Algorithms","topics":["BFS DFS","A* algorithm","Heuristics","Adversarial search"]},
    {"num":3,"title":"Knowledge Representation","topics":["Propositional logic","First-order logic","Inference"]},
    {"num":4,"title":"Machine Learning","topics":["Supervised learning","Decision trees","Neural networks","SVM"]},
    {"num":5,"title":"Natural Language Processing","topics":["Parsing","Semantic analysis","Information extraction"]},
    {"num":6,"title":"Expert Systems & Planning","topics":["Production rules","STRIPS","Classical planning"]}
  ]'
)

on conflict (code) do nothing;
