import type { Roadmap } from '../types/roadmaps';

export const roadmaps: Roadmap[] = [
  {
    id: 'full-stack',
    title: 'Full Stack Developer',
    description: 'Comprehensive guide to becoming a full stack web developer. Covers frontend, backend, databases, and DevOps.',
    category: 'role-based',
    icon: '🖥️',
    color: '#000000',
    externalUrl: 'https://roadmap.sh/full-stack',
    sections: [
      {
        id: 'foundations',
        title: 'Foundations',
        nodes: [
          { id: 'html', label: 'HTML', description: 'Semantic markup, forms, accessibility, SEO basics', links: [{ label: 'MDN HTML', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' }] },
          { id: 'css', label: 'CSS', description: 'Flexbox, Grid, responsive design, animations', links: [{ label: 'MDN CSS', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' }] },
          { id: 'javascript', label: 'JavaScript', description: 'ES6+, DOM manipulation, async/await, promises', links: [{ label: 'MDN JS', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' }] },
          { id: 'git', label: 'Git', description: 'Version control, branching, merging, pull requests', links: [{ label: 'Git SCM', url: 'https://git-scm.com/' }] },
          { id: 'http-ssl', label: 'HTTP / SSL', description: 'Protocols, REST, HTTPS, certificates', links: [{ label: 'MDN HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP' }] },
        ],
      },
      {
        id: 'frontend',
        title: 'Frontend Development',
        nodes: [
          { id: 'react', label: 'React', description: 'Components, hooks, state management, routing', links: [{ label: 'React Docs', url: 'https://react.dev/' }] },
          { id: 'typescript', label: 'TypeScript', description: 'Static types, interfaces, generics', links: [{ label: 'TS Docs', url: 'https://www.typescriptlang.org/' }] },
          { id: 'tailwind', label: 'Tailwind CSS', description: 'Utility-first CSS framework', links: [{ label: 'Tailwind', url: 'https://tailwindcss.com/' }] },
          { id: 'state-mgmt', label: 'State Management', description: 'Context API, Zustand, Redux', isOptional: true },
          { id: 'testing-front', label: 'Testing', description: 'Jest, React Testing Library, Vitest', links: [{ label: 'Vitest', url: 'https://vitest.dev/' }] },
        ],
      },
      {
        id: 'backend',
        title: 'Backend Development',
        nodes: [
          { id: 'nodejs', label: 'Node.js', description: 'Server-side JavaScript, npm, Express', links: [{ label: 'Node.js', url: 'https://nodejs.org/' }] },
          { id: 'python', label: 'Python', description: 'Django, Flask, FastAPI', links: [{ label: 'Python', url: 'https://www.python.org/' }] },
          { id: 'apis', label: 'REST & GraphQL', description: 'API design, OpenAPI, Apollo', links: [{ label: 'GraphQL', url: 'https://graphql.org/' }] },
          { id: 'auth', label: 'Authentication', description: 'JWT, OAuth, sessions, cookies', links: [{ label: 'JWT', url: 'https://jwt.io/' }] },
        ],
      },
      {
        id: 'database',
        title: 'Database Management',
        nodes: [
          { id: 'sql', label: 'SQL', description: 'PostgreSQL, MySQL, queries, indexing', links: [{ label: 'PostgreSQL', url: 'https://www.postgresql.org/' }] },
          { id: 'nosql', label: 'NoSQL', description: 'MongoDB, Redis, Firebase', links: [{ label: 'MongoDB', url: 'https://www.mongodb.com/' }] },
          { id: 'orms', label: 'ORMs', description: 'Prisma, TypeORM, Sequelize', links: [{ label: 'Prisma', url: 'https://www.prisma.io/' }] },
        ],
      },
      {
        id: 'devops',
        title: 'DevOps & Deployment',
        nodes: [
          { id: 'docker', label: 'Docker', description: 'Containers, images, compose', links: [{ label: 'Docker', url: 'https://www.docker.com/' }] },
          { id: 'cicd', label: 'CI/CD', description: 'GitHub Actions, pipelines, automation', links: [{ label: 'GitHub Actions', url: 'https://github.com/features/actions' }] },
          { id: 'cloud', label: 'Cloud', description: 'AWS, Vercel, Netlify, deployment', links: [{ label: 'Vercel', url: 'https://vercel.com/' }] },
        ],
      },
    ],
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    description: 'Step-by-step guide to becoming a data analyst. Learn data collection, cleaning, analysis, and visualization.',
    category: 'role-based',
    icon: '📊',
    color: '#000000',
    externalUrl: 'https://roadmap.sh/data-analyst',
    sections: [
      {
        id: 'fundamentals',
        title: 'Fundamentals',
        nodes: [
          { id: 'statistics', label: 'Statistics', description: 'Descriptive & inferential statistics, probability', links: [{ label: 'Khan Academy', url: 'https://www.khanacademy.org/math/statistics-probability' }] },
          { id: 'excel', label: 'Excel / Sheets', description: 'Pivot tables, VLOOKUP, formulas, data cleaning', links: [{ label: 'Excel Guide', url: 'https://support.microsoft.com/en-us/excel' }] },
          { id: 'sql-da', label: 'SQL', description: 'SELECT, JOINs, aggregations, window functions', links: [{ label: 'SQL Tutorial', url: 'https://www.w3schools.com/sql/' }] },
        ],
      },
      {
        id: 'programming',
        title: 'Programming for Data',
        nodes: [
          { id: 'python-da', label: 'Python', description: 'Pandas, NumPy, data wrangling', links: [{ label: 'Pandas', url: 'https://pandas.pydata.org/' }] },
          { id: 'r-lang', label: 'R', description: 'Tidyverse, dplyr, ggplot2', isOptional: true, links: [{ label: 'R Project', url: 'https://www.r-project.org/' }] },
          { id: 'jupyter', label: 'Jupyter Notebooks', description: 'Interactive computing, notebooks, sharing' },
        ],
      },
      {
        id: 'data-wrangling',
        title: 'Data Wrangling & Cleaning',
        nodes: [
          { id: 'cleaning', label: 'Data Cleaning', description: 'Handling missing data, outliers, deduplication' },
          { id: 'etl', label: 'ETL', description: 'Extract, Transform, Load pipelines' },
          { id: 'web-scraping', label: 'Web Scraping', description: 'Beautiful Soup, Selenium, Scrapy', isOptional: true },
        ],
      },
      {
        id: 'visualization',
        title: 'Data Visualization',
        nodes: [
          { id: 'matplotlib', label: 'Matplotlib / Seaborn', description: 'Static visualizations in Python', links: [{ label: 'Seaborn', url: 'https://seaborn.pydata.org/' }] },
          { id: 'tableau', label: 'Tableau / Power BI', description: 'Business intelligence dashboards', links: [{ label: 'Tableau', url: 'https://www.tableau.com/' }] },
          { id: 'looker', label: 'Looker', description: 'Enterprise BI platform', isOptional: true },
        ],
      },
      {
        id: 'analysis',
        title: 'Analysis Techniques',
        nodes: [
          { id: 'eda', label: 'Exploratory Data Analysis', description: 'Summary stats, correlation, distributions' },
          { id: 'ab-testing', label: 'A/B Testing', description: 'Hypothesis testing, significance, experiment design' },
          { id: 'regression', label: 'Regression Analysis', description: 'Linear, logistic, interpretation' },
          { id: 'time-series', label: 'Time Series', description: 'Trends, seasonality, forecasting', isOptional: true },
        ],
      },
    ],
  },
  {
    id: 'ai-data-scientist',
    title: 'AI Data Scientist',
    description: 'Complete pathway to becoming an AI/data scientist. Covers machine learning, deep learning, and MLOps.',
    category: 'role-based',
    icon: '🤖',
    color: '#000000',
    externalUrl: 'https://roadmap.sh/ai/roadmap-chat/ai-data-scientist',
    sections: [
      {
        id: 'math-foundations',
        title: 'Mathematical Foundations',
        nodes: [
          { id: 'linear-algebra', label: 'Linear Algebra', description: 'Vectors, matrices, eigenvalues, SVD', links: [{ label: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/linear-algebra' }] },
          { id: 'calculus', label: 'Calculus', description: 'Derivatives, gradients, optimization' },
          { id: 'probability', label: 'Probability', description: 'Distributions, Bayes theorem, expectation' },
        ],
      },
      {
        id: 'ml-fundamentals',
        title: 'Machine Learning Fundamentals',
        nodes: [
          { id: 'supervised', label: 'Supervised Learning', description: 'Regression, classification, SVMs, decision trees', links: [{ label: 'Scikit-learn', url: 'https://scikit-learn.org/' }] },
          { id: 'unsupervised', label: 'Unsupervised Learning', description: 'Clustering, PCA, t-SNE, anomaly detection' },
          { id: 'ensemble', label: 'Ensemble Methods', description: 'Random Forest, XGBoost, Gradient Boosting', links: [{ label: 'XGBoost', url: 'https://xgboost.readthedocs.io/' }] },
          { id: 'feature-eng', label: 'Feature Engineering', description: 'Selection, extraction, transformation' },
        ],
      },
      {
        id: 'deep-learning',
        title: 'Deep Learning',
        nodes: [
          { id: 'neural-nets', label: 'Neural Networks', description: 'Perceptron, backpropagation, activation functions' },
          { id: 'cnn', label: 'CNNs', description: 'Convolutional networks, image processing', links: [{ label: 'PyTorch', url: 'https://pytorch.org/' }] },
          { id: 'rnn-transformer', label: 'RNNs / Transformers', description: 'Sequence models, attention, BERT, GPT', links: [{ label: 'Hugging Face', url: 'https://huggingface.co/' }] },
          { id: 'gan-vae', label: 'GANs / VAEs', description: 'Generative models', isOptional: true },
        ],
      },
      {
        id: 'mlops',
        title: 'MLOps & Production',
        nodes: [
          { id: 'model-deploy', label: 'Model Deployment', description: 'APIs, Docker, serving, scaling' },
          { id: 'experiment-tracking', label: 'Experiment Tracking', description: 'MLflow, weights & biases', links: [{ label: 'MLflow', url: 'https://mlflow.org/' }] },
          { id: 'data-eng', label: 'Data Engineering', description: 'Pipelines, Spark, data lakes', isOptional: true },
        ],
      },
      {
        id: 'specialization',
        title: 'Specialization Areas',
        nodes: [
          { id: 'nlp', label: 'NLP', description: 'Text processing, embeddings, language models', links: [{ label: 'Hugging Face NLP', url: 'https://huggingface.co/learn/nlp-course' }] },
          { id: 'cv', label: 'Computer Vision', description: 'Image classification, object detection, segmentation' },
          { id: 'rl', label: 'Reinforcement Learning', description: 'Q-learning, policy gradients', isOptional: true },
          { id: 'recommender', label: 'Recommender Systems', description: 'Collaborative filtering, matrix factorization', isOptional: true },
        ],
      },
    ],
  },
];

export const skillRoadmaps: Roadmap[] = [
  {
    id: 'react-roadmap',
    title: 'React',
    description: 'Learn React from basics to advanced patterns, hooks, and ecosystem.',
    category: 'skill-based',
    icon: '⚛️',
    color: '#000000',
    sections: [],
  },
  {
    id: 'python-roadmap',
    title: 'Python',
    description: 'Master Python programming for web, data science, and automation.',
    category: 'skill-based',
    icon: '🐍',
    color: '#000000',
    sections: [],
  },
  {
    id: 'sql-roadmap',
    title: 'SQL',
    description: 'Comprehensive SQL guide from queries to database design and optimization.',
    category: 'skill-based',
    icon: '🗄️',
    color: '#000000',
    sections: [],
  },
  {
    id: 'docker-roadmap',
    title: 'Docker',
    description: 'Containerization essentials — from images to production deployments.',
    category: 'skill-based',
    icon: '🐳',
    color: '#000000',
    sections: [],
  },
  {
    id: 'system-design',
    title: 'System Design',
    description: 'Architecture patterns, scaling, distributed systems, and design interviews.',
    category: 'skill-based',
    icon: '🏗️',
    color: '#000000',
    sections: [],
  },
  {
    id: 'kubernetes',
    title: 'Kubernetes',
    description: 'Container orchestration, clusters, networking, and production ops.',
    category: 'skill-based',
    icon: '☸️',
    color: '#000000',
    sections: [],
  },
];

export const bestPractices = [
  { id: 'api-security', title: 'API Security', description: 'Best practices for securing your APIs', icon: '🔒' },
  { id: 'code-review', title: 'Code Review', description: 'Effective code review practices and guidelines', icon: '👁️' },
  { id: 'performance', title: 'Performance', description: 'Web performance optimization techniques', icon: '⚡' },
];

export const projectCategories = ['Frontend', 'Backend', 'DevOps', 'Data Science', 'Mobile'];
