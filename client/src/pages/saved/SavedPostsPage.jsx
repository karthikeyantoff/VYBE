import { useCallback, useEffect, useState } from "react";
import { Bookmark, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import Banner from "../../components/ui/Banner.jsx";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import PostCardSkeleton from "../../components/ui/skeletons/PostCardSkeleton.jsx";
import PostCard from "../../components/post/PostCard.jsx";

import useDocumentTitle from "../../hooks/useDocumentTitle.js";
import useInfiniteScroll from "../../hooks/useInfiniteScroll.js";
import * as postService from "../../services/postService.js";

const SKELETON_COUNT = 3;

export default function SavedPostsPage() {
  useDocumentTitle("Saved Posts · Pulse");

  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);

  const loadSaved = useCallback(() => {
    setReloadToken((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await postService.getSavedPosts();
        if (!cancelled) {
          setPosts(data.items || []);
          setNextCursor(data.nextCursor);
          setHasMore(Boolean(data.hasMore));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load saved posts.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const data = await postService.getSavedPosts(nextCursor);
      setPosts((prev) => [...prev, ...(data.items || [])]);
      setNextCursor(data.nextCursor);
      setHasMore(Boolean(data.hasMore));
    } catch {
      // Best-effort pagination
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, nextCursor]);

  const sentinelRef = useInfiniteScroll({
    hasMore,
    loading: loadingMore,
    onLoadMore: loadMore,
  });

  const handlePostDelete = useCallback((deletedId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedId));
  }, []);

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
            <Bookmark className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Saved Posts
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Only you can see the posts you&apos;ve bookmarked.
            </p>
          </div>
        </div>
      </header>

      {error && (
        <Banner variant="error" onRetry={loadSaved}>
          {error}
        </Banner>
      )}

      {loading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading saved posts">
          {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
            <PostCardSkeleton key={idx} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved posts yet"
          description="When you see a post you want to revisit later, click the bookmark icon to save it here."
          action={
            <Button as={Link} to="/explore" variant="primary">
              <Sparkles className="size-4" />
              Explore posts
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post, idx) => (
            <PostCard
              key={post._id}
              post={post}
              priority={idx === 0}
              onDelete={handlePostDelete}
            />
          ))}

          {hasMore && (
            <div ref={sentinelRef} className="py-6 text-center">
              {loadingMore && <Spinner label="Loading more saved posts" />}
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="py-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
              You&apos;ve reached the end of your saved posts.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
