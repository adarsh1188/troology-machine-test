export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <button
        className="btn-secondary"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>
      <span className="px-2 text-sm text-gray-600 dark:text-gray-300">
        Page {page} of {pages}
      </span>
      <button
        className="btn-secondary"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
