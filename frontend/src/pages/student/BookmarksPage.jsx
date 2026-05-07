import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { jobsAPI } from "../api/jobsAPI";
import { LoadingPage, EmptyState, Button } from "../components/ui";
import JobCard from "../components/jobs/JobCard";
import { BookMarked, Trash2 } from "lucide-react";

const BookmarksPage = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState(
    () => { try { return JSON.parse(localStorage.getItem("bookmarks") || "[]"); } catch { return []; } }
  );

  useEffect(() => {
    const fetchBookmarkedJobs = async () => {
      if (!bookmarks.length) { setIsLoading(false); return; }
      setIsLoading(true);
      try {
        // Fetch each bookmarked job (small list, fine to parallel fetch)
        const results = await Promise.allSettled(bookmarks.map((id) => jobsAPI.getById(id)));
        const loaded = results
          .filter((r) => r.status === "fulfilled")
          .map((r) => r.value.data.job);
        setJobs(loaded);
      } catch { /* silent */ }
      finally { setIsLoading(false); }
    };
    fetchBookmarkedJobs();
  }, [bookmarks.join(",")]);

  const removeBookmark = (jobId) => {
    const updated = bookmarks.filter((id) => id !== jobId);
    setBookmarks(updated);
    setJobs((prev) => prev.filter((j) => j._id !== jobId));
    localStorage.setItem("bookmarks", JSON.stringify(updated));
  };

  const clearAll = () => {
    setBookmarks([]);
    setJobs([]);
    localStorage.removeItem("bookmarks");
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Saved Jobs</h1>
            <p className="text-gray-500 text-sm mt-0.5">{bookmarks.length} job{bookmarks.length !== 1 ? "s" : ""} saved</p>
          </div>
          {bookmarks.length > 0 && (
            <Button variant="danger" size="sm" onClick={clearAll}>
              <Trash2 size={13} /> Clear All
            </Button>
          )}
        </div>

        {isLoading ? (
          <LoadingPage message="Loading saved jobs..." />
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={<BookMarked size={28} />}
            title="No saved jobs yet"
            description="Bookmark jobs you're interested in to revisit them later."
            action={<Link to="/jobs"><Button>Browse Jobs</Button></Link>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => (
              <div key={job._id} className="relative">
                <JobCard job={job} isBookmarked={true} onBookmark={(id) => removeBookmark(id)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarksPage;
