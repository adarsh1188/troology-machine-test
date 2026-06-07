import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api, { fileBaseUrl } from '../api/axios';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';

const STATUSES = ['Pending', 'In-Progress', 'Completed'];

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === 'admin';

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get(`/projects/${id}`)
      .then((res) => setProject(res.data.data))
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to load');
        navigate('/projects');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const updateStatus = async (status) => {
    try {
      const { data } = await api.patch(`/projects/${id}/status`, { status });
      setProject(data.data);
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const removeAttachment = async (attId) => {
    if (!window.confirm('Remove this attachment?')) return;
    try {
      const { data } = await api.delete(`/projects/${id}/attachments/${attId}`);
      setProject(data.data);
      toast.success('Attachment removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <Spinner />;
  if (!project) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/projects" className="text-sm text-brand-600 hover:underline">
          ← Back to projects
        </Link>
        {isAdmin && (
          <div className="flex gap-2">
            <Link to={`/projects/${id}/edit`} className="btn-secondary">
              Edit
            </Link>
            <button onClick={remove} className="btn-danger">
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="card space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold">{project.title}</h1>
          <StatusBadge status={project.status} />
        </div>

        <p className="whitespace-pre-line text-gray-600 dark:text-gray-300">
          {project.description || 'No description provided.'}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Start Date</p>
            <p className="font-medium">
              {project.startDate ? new Date(project.startDate).toLocaleDateString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">End Date</p>
            <p className="font-medium">
              {project.endDate ? new Date(project.endDate).toLocaleDateString() : '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Created By</p>
            <p className="font-medium">{project.createdBy?.name || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Created At</p>
            <p className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Update status (admin or assigned user) */}
        <div>
          <label className="label">Update Status</label>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(s)}
                className={s === project.status ? 'btn-primary' : 'btn-secondary'}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Assigned users */}
      <div className="card">
        <h2 className="mb-3 font-semibold">👥 Assigned Users</h2>
        {project.assignedUsers?.length ? (
          <ul className="space-y-2">
            {project.assignedUsers.map((u) => (
              <li key={u._id} className="flex items-center justify-between text-sm">
                <span>{u.name}</span>
                <span className="text-gray-500">{u.email}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No users assigned.</p>
        )}
      </div>

      {/* Attachments */}
      <div className="card">
        <h2 className="mb-3 font-semibold">📎 Attachments ({project.attachments?.length || 0}/3)</h2>
        {project.attachments?.length ? (
          <ul className="space-y-2">
            {project.attachments.map((a) => {
              const href = a.storage === 'cloudinary' ? a.url : `${fileBaseUrl}${a.url}`;
              return (
                <li
                  key={a._id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-700/50"
                >
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-brand-600 hover:underline"
                  >
                    {a.originalName}
                  </a>
                  {isAdmin && (
                    <button
                      onClick={() => removeAttachment(a._id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No attachments.</p>
        )}
      </div>
    </div>
  );
}
