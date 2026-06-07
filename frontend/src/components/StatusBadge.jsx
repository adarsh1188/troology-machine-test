const STYLES = {
  Pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'In-Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  Completed: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${STYLES[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}
