import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';

const STATUSES = ['Pending', 'In-Progress', 'Completed'];

export default function Projects() {
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';

  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 6 };
      if (search) params.search = search;
      if (status) params.status = status;
      const { data } = await api.get('/projects', { params });
      setProjects(data.data);
      setPagination(data.pagination);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    load();
  }, [load]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/projects/${id}/status`, { status: newStatus });
      toast.success('Status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Projects</h1>
        {isAdmin && (
          <Link to="/projects/new" className="btn-primary">
            + New Project
          </Link>
        )}
      </div>

      {/* Filters */}
      <form onSubmit={onSearchSubmit} className="flex flex-wrap gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search by title or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input max-w-[180px]"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-secondary">
          Search
        </button>
      </form>

      {loading ? (
        <Spinner />
      ) : projects.length === 0 ? (
        <p className="text-gray-500">No projects found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p._id} className="card flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <Link
                  to={`/projects/${p._id}`}
                  className="font-semibold hover:text-brand-600"
                >
                  {p.title}
                </Link>
                <StatusBadge status={p.status} />
              </div>
              <p className="mt-1 line-clamp-2 flex-1 text-sm text-gray-500">
                {p.description || 'No description'}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span>👥 {p.assignedUsers?.length || 0} assigned</span>
                {p.attachments?.length > 0 && <span>📎 {p.attachments.length}</span>}
                {p.endDate && (
                  <span>📅 {new Date(p.endDate).toLocaleDateString()}</span>
                )}
              </div>

              {/* Status update (admin or assigned user) */}
              <div className="mt-3 flex items-center gap-2">
                <select
                  className="input !py-1 text-xs"
                  value={p.status}
                  onChange={(e) => updateStatus(p._id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {isAdmin && (
                  <>
                    <Link to={`/projects/${p._id}/edit`} className="btn-secondary !py-1 text-xs">
                      Edit
                    </Link>
                    <button
                      onClick={() => remove(p._id)}
                      className="btn-danger !py-1 text-xs"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} onChange={setPage} />
    </div>
  );
}
