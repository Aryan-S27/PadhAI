import { Link } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { roadmaps, skillRoadmaps, bestPractices, projectCategories } from '../data/roadmaps';
import { useBookmarks } from '../hooks/useBookmarks';
import '../styles/roadmaps.css';

export const RoadmapsDashboard = () => {
  const bookmarks = useBookmarks();
  const allRoadmaps = [...roadmaps, ...skillRoadmaps];
  const bookmarkedItems = bookmarks.bookmarks.map(bm => {
    return allRoadmaps.find(rm => rm.id === bm.roadmapId);
  }).filter(Boolean);

  return (
    <MainLayout>
      <div className="roadmaps-container">
        <header className="dashboard-header animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 className="dashboard-title">Roadmaps Dashboard</h1>
              <p className="dashboard-subtitle">
                Explore our curated learning paths and skill roadmaps. Track your progress, bookmark your favorites, and level up your career.
              </p>
            </div>
            {bookmarks.bookmarks.length > 0 && (
              <Link 
                to="/roadmaps/bookmarks" 
                className="memoir-btn-ghost"
                style={{ fontSize: '12px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                🔖 Saved Bookmarks ({bookmarks.bookmarks.length})
              </Link>
            )}
          </div>
          
          {bookmarks.bookmarks.length > 0 && (
            <div className="progress-bar" style={{ maxWidth: '400px' }}>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.min(100, (bookmarks.bookmarks.length / (roadmaps.length + skillRoadmaps.length)) * 100)}%` }}
                />
              </div>
              <span className="progress-bar-text">
                {bookmarks.bookmarks.length} bookmarked
              </span>
            </div>
          )}
        </header>

        {/* Your Bookmarks */}
        {bookmarkedItems.length > 0 && (
          <section className="dashboard-section animate-in">
            <div className="dashboard-section-header">
              <h2 className="dashboard-section-title">Your Bookmarks</h2>
              <span className="dashboard-section-count">{bookmarkedItems.length} saved</span>
            </div>
            <div className="roadmap-grid">
              {bookmarkedItems.map((rm, i) => {
                if (!rm) return null;
                const bookmarkUrl = rm.externalUrl || `/roadmaps/${rm.id}`;
                return (
                  <div
                    key={`bookmark-${rm.id}`}
                    className="roadmap-card"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div>
                      <span className="roadmap-card-icon">{rm.icon}</span>
                      <h3 className="roadmap-card-title">{rm.title}</h3>
                      <p className="roadmap-card-desc">{rm.description}</p>
                    </div>
                    <div className="roadmap-card-actions">
                      <button
                        className="bookmark-btn active"
                        onClick={(e) => {
                          e.stopPropagation();
                          bookmarks.toggleBookmark(rm.id, rm.title, bookmarkUrl);
                        }}
                        aria-label="Remove bookmark"
                      >
                        <svg className="bookmark-icon" width="14" height="14" viewBox="0 0 14 14" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
                          <path d="M2.5 1.5h9v11l-4.5-3-4.5 3v-11z" />
                        </svg>
                        Bookmarked
                      </button>
                      <Link to={`/roadmaps/${rm.id}`} className="view-btn">
                        View Roadmap →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Role-Based Roadmaps */}
        <section className="dashboard-section animate-in animate-in-d1">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Role-Based Roadmaps</h2>
            <span className="dashboard-section-count">{roadmaps.length} roadmaps</span>
          </div>
          <div className="roadmap-grid">
            {roadmaps.map((rm, i) => {
              const bookmarkUrl = rm.externalUrl || `/roadmaps/${rm.id}`;
              const isMarked = bookmarks.isBookmarked(rm.id);
              return (
                <div
                  key={rm.id}
                  className="roadmap-card"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div>
                    <span className="roadmap-card-icon">{rm.icon}</span>
                    <h3 className="roadmap-card-title">{rm.title}</h3>
                    <p className="roadmap-card-desc">{rm.description}</p>
                  </div>
                  <div className="roadmap-card-actions">
                    <button
                      className={`bookmark-btn ${isMarked ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        bookmarks.toggleBookmark(rm.id, rm.title, bookmarkUrl);
                      }}
                      aria-label={isMarked ? 'Remove bookmark' : 'Add bookmark'}
                    >
                      <svg className="bookmark-icon" width="14" height="14" viewBox="0 0 14 14" fill={isMarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                        <path d="M2.5 1.5h9v11l-4.5-3-4.5 3v-11z" />
                      </svg>
                      {isMarked ? 'Bookmarked' : 'Bookmark'}
                    </button>
                    <Link to={`/roadmaps/${rm.id}`} className="view-btn">
                      View Roadmap →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Skill-Based Roadmaps */}
        <section className="dashboard-section animate-in animate-in-d2">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Skill-Based Roadmaps</h2>
            <span className="dashboard-section-count">{skillRoadmaps.length} roadmaps</span>
          </div>
          <div className="roadmap-grid">
            {skillRoadmaps.map((rm, i) => {
              const isMarked = bookmarks.isBookmarked(rm.id);
              return (
                <div key={rm.id} className="roadmap-card" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div>
                    <span className="roadmap-card-icon">{rm.icon}</span>
                    <h3 className="roadmap-card-title">{rm.title}</h3>
                    <p className="roadmap-card-desc">{rm.description}</p>
                  </div>
                  <div className="roadmap-card-actions">
                    <button
                      className={`bookmark-btn ${isMarked ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        bookmarks.toggleBookmark(rm.id, rm.title, rm.externalUrl || `/roadmaps/${rm.id}`);
                      }}
                    >
                      <svg className="bookmark-icon" width="14" height="14" viewBox="0 0 14 14" fill={isMarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                        <path d="M2.5 1.5h9v11l-4.5-3-4.5 3v-11z" />
                      </svg>
                      {isMarked ? 'Bookmarked' : 'Bookmark'}
                    </button>
                    <Link to={`/roadmaps/${rm.id}`} className="view-btn">
                      View Roadmap →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Best Practices */}
        <section className="dashboard-section animate-in animate-in-d3">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Best Practices</h2>
          </div>
          <div className="roadmap-grid">
            {bestPractices.map(bp => (
              <div key={bp.id} className="roadmap-card" style={{ minHeight: '150px' }}>
                <div>
                  <span className="roadmap-card-icon">{bp.icon}</span>
                  <h3 className="roadmap-card-title">{bp.title}</h3>
                  <p className="roadmap-card-desc">{bp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Project Categories */}
        <section className="dashboard-section animate-in animate-in-d4" style={{ marginBottom: '40px' }}>
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title">Project Ideas</h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {projectCategories.map(cat => (
              <span
                key={cat}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '-0.4px',
                  padding: '8px 16px',
                  background: 'var(--color-pure-white)',
                  borderRadius: 'var(--radius-pill)',
                  boxShadow: 'var(--shadow-card)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                }}
              >
                {cat}
              </span>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};
