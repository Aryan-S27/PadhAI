import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { roadmaps, skillRoadmaps } from '../data/roadmaps';
import { useBookmarks } from '../hooks/useBookmarks';
import type { RoadmapNode } from '../types/roadmaps';
import '../styles/roadmaps.css';

function NodeCard({ node, isCompleted, onToggle }: { node: RoadmapNode; isCompleted: boolean; onToggle: (id: string) => void }) {
  const handleClick = () => {
    onToggle(node.id);
  };

  return (
    <div
      className={`node-card ${isCompleted ? 'completed' : ''} ${node.isOptional ? 'optional' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
    >
      <div className="node-card-label">
        <span className="node-card-check">
          {isCompleted ? '✓' : ''}
        </span>
        {node.label}
      </div>
      <div className="node-card-desc">{node.description}</div>
      {node.links && node.links.length > 0 && (
        <div className="node-card-links">
          {node.links.map(link => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="node-card-link"
              onClick={e => e.stopPropagation()}
            >
              {link.label} ↗
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export const RoadmapDetail = () => {
  const { roadmapId } = useParams<{ roadmapId: string }>();
  const navigate = useNavigate();
  const bookmarks = useBookmarks();
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  const allRoadmaps = [...roadmaps, ...skillRoadmaps];
  const roadmap = allRoadmaps.find(r => r.id === roadmapId);
  const bookmarkUrl = roadmap ? (roadmap.externalUrl || `/roadmaps/${roadmap.id}`) : '';

  useEffect(() => {
    if (roadmap && roadmap.sections.length > 0) {
      try {
        const stored = localStorage.getItem(`progress-${roadmap.id}`);
        if (stored) setProgress(JSON.parse(stored));
      } catch {}
    }
  }, [roadmap?.id]);

  const handleToggle = (nodeId: string) => {
    const newProgress = { ...progress, [nodeId]: !progress[nodeId] };
    setProgress(newProgress);
    if (roadmap) {
      localStorage.setItem(`progress-${roadmap.id}`, JSON.stringify(newProgress));
    }
  };

  if (!roadmap) {
    return (
      <MainLayout>
        <div className="roadmaps-container">
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <p className="empty-state-text">Roadmap not found.</p>
            <Link to="/roadmaps" className="btn btn-primary" style={{ marginTop: '16px', textDecoration: 'none' }}>
              Back to Roadmaps
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (roadmap.sections.length === 0) {
    const isBookmarked = bookmarks.isBookmarked(roadmap.id);
    return (
      <MainLayout>
        <div className="roadmaps-container">
          <div className="empty-state">
            <div className="empty-state-icon">{roadmap.icon}</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', letterSpacing: '-0.07em', marginBottom: '12px', color: 'var(--color-ink-black)' }}>
              {roadmap.title}
            </h2>
            <p className="empty-state-text" style={{ marginBottom: '20px', color: 'var(--color-ink-muted)' }}>
              {roadmap.description}
            </p>
            <p className="empty-state-text" style={{ marginBottom: '24px' }}>
              Explore the full content on{' '}
              <a href={roadmap.externalUrl || `https://roadmap.sh/${roadmap.id.replace('-roadmap', '')}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>
                roadmap.sh ↗
              </a>
            </p>

            <div className="roadmap-page-actions" style={{ justifyContent: 'center', marginBottom: '24px' }}>
              <button
                className={`btn ${isBookmarked ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => bookmarks.toggleBookmark(roadmap.id, roadmap.title, bookmarkUrl)}
              >
                {isBookmarked ? '🔖 Bookmarked' : '🔖 Bookmark this Roadmap'}
              </button>
              <a
                href={roadmap.externalUrl || `https://roadmap.sh/${roadmap.id.replace('-roadmap', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ textDecoration: 'none' }}
              >
                View on roadmap.sh ↗
              </a>
            </div>

            <Link to="/roadmaps" className="btn btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Back to Dashboard
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  const totalNodes = roadmap.sections.reduce((sum, s) => sum + s.nodes.length, 0);
  const completedNodes = Object.values(progress).filter(Boolean).length;
  const progressPercent = totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

  const externalUrl = roadmap.externalUrl;

  return (
    <MainLayout>
      <div className="roadmaps-container">
        <div className="roadmap-page">
          <header className="roadmap-page-header animate-in">
            <button className="roadmap-page-back" onClick={() => navigate('/roadmaps')}>
              ← Back to Dashboard
            </button>
            <h1 className="roadmap-page-title">{roadmap.icon} {roadmap.title}</h1>
            <p className="roadmap-page-desc">{roadmap.description}</p>

            <div className="progress-bar" style={{ marginTop: '20px', maxWidth: '500px' }}>
              <div className="progress-bar-track">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
              </div>
              <span className="progress-bar-text">
                {completedNodes} / {totalNodes} topics ({progressPercent}%)
              </span>
            </div>

            <div className="roadmap-page-actions">
              <button
                className={`btn ${bookmarks.isBookmarked(roadmap.id) ? 'btn-secondary' : 'btn-primary'}`}
                onClick={() => bookmarks.toggleBookmark(roadmap.id, roadmap.title, bookmarkUrl)}
              >
                {bookmarks.isBookmarked(roadmap.id) ? '🔖 Bookmarked' : '🔖 Bookmark this Roadmap'}
              </button>
              {externalUrl && (
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ textDecoration: 'none' }}
                >
                  View on roadmap.sh ↗
                </a>
              )}
            </div>
          </header>

          {roadmap.sections.map((section, si) => (
            <section key={section.id} className={`roadmap-section animate-in animate-in-d${Math.min(si + 1, 5)}`}>
              <h2 className="roadmap-section-title">{section.title}</h2>
              <div className="node-grid">
                {section.nodes.map((node, ni) => (
                  <div
                    key={node.id}
                    style={{ animationDelay: `${(si * 3 + ni) * 0.03}s` }}
                  >
                    <NodeCard
                      node={node}
                      isCompleted={!!progress[node.id]}
                      onToggle={handleToggle}
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};
