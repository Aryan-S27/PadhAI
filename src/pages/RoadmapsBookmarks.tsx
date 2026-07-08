import { Link } from 'react-router-dom';
import { MainLayout } from '../components/MainLayout';
import { useBookmarks } from '../hooks/useBookmarks';
import '../styles/roadmaps.css';

const isExternalUrl = (url: string) => url.startsWith('http://') || url.startsWith('https://');

export const RoadmapsBookmarks = () => {
  const bookmarks = useBookmarks();

  return (
    <MainLayout>
      <div className="roadmaps-container">
        <header className="dashboard-header animate-in">
          <Link to="/roadmaps" className="roadmap-page-back">
            ← Back to Roadmaps
          </Link>
          <h1 className="dashboard-title">Bookmarked Roadmaps</h1>
          <p className="dashboard-subtitle">
            Your saved learning paths for quick access. Toggled nodes and progress are preserved.
          </p>
        </header>

        {bookmarks.bookmarks.length === 0 ? (
          <div className="empty-state animate-in animate-in-d1">
            <div className="empty-state-icon">🔖</div>
            <p className="empty-state-text" style={{ color: 'var(--color-ink-muted)' }}>
              No bookmarks yet. Browse the roadmaps dashboard and save learning paths to revisit them later.
            </p>
            <Link 
              to="/roadmaps" 
              className="memoir-btn-primary" 
              style={{ marginTop: '20px', textDecoration: 'none', display: 'inline-block' }}
            >
              Browse Roadmaps
            </Link>
          </div>
        ) : (
          <div className="bookmarks-list animate-in animate-in-d1">
            {bookmarks.bookmarks.map(bm => {
              const isExternal = isExternalUrl(bm.url);
              return (
                <div key={bm.roadmapId} className="bookmark-item">
                  <div className="bookmark-item-info">
                    <div className="bookmark-item-title">{bm.title}</div>
                    <div className="bookmark-item-date">
                      Added {new Date(bm.addedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {isExternal && <span> · External link</span>}
                    </div>
                  </div>
                  {isExternal ? (
                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-btn"
                      style={{ textDecoration: 'none' }}
                    >
                      Open ↗
                    </a>
                  ) : (
                    <Link
                      to={bm.url}
                      className="view-btn"
                      style={{ textDecoration: 'none' }}
                    >
                      Open →
                    </Link>
                  )}
                  <button
                    className="bookmark-btn active"
                    onClick={() => bookmarks.removeBookmark(bm.roadmapId)}
                    aria-label={`Remove ${bm.title} bookmark`}
                    style={{ marginLeft: '12px' }}
                  >
                    ✕ Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
