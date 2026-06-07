import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { getSocket } from '../api/socket';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';

export default function Activity() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/activity', { params: { page, limit: 20 } });
      setLogs(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  // Prepend live activity events when viewing the first page
  useEffect(() => {
    const socket = getSocket();
    const handler = (a) => {
      if (page === 1) setLogs((prev) => [a, ...prev].slice(0, 20));
    };
    socket.on('activity', handler);
    return () => socket.off('activity', handler);
  }, [page]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Activity Log</h1>
      {loading ? (
        <Spinner />
      ) : logs.length === 0 ? (
        <p className="text-gray-500">No activity yet.</p>
      ) : (
        <div className="card">
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {logs.map((log) => (
              <li key={log._id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{log.message}</p>
                  <p className="text-xs text-gray-400">{log.action}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'just now'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />
    </div>
  );
}
