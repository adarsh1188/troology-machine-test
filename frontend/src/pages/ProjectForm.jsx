import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import Spinner from '../components/Spinner';

const STATUSES = ['Pending', 'In-Progress', 'Completed'];

function toDateInput(d) {
  if (!d) return '';
  return new Date(d).toISOString().slice(0, 10);
}

export default function ProjectForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'Pending',
    assignedUsers: [],
  });
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [existingCount, setExistingCount] = useState(0);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load assignable users (admin endpoint)
    api
      .get('/users', { params: { limit: 100 } })
      .then((res) => setUsers(res.data.data))
      .catch(() => {});

    if (isEdit) {
      api
        .get(`/projects/${id}`)
        .then((res) => {
          const p = res.data.data;
          setForm({
            title: p.title,
            description: p.description || '',
            startDate: toDateInput(p.startDate),
            endDate: toDateInput(p.endDate),
            status: p.status,
            assignedUsers: (p.assignedUsers || []).map((u) => u._id),
          });
          setExistingCount(p.attachments?.length || 0);
        })
        .catch((err) => toast.error(err.response?.data?.message || 'Failed to load'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const onFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const max = 3 - existingCount;
    if (selected.length > max) {
      toast.warn(`You can add at most ${max} more attachment(s)`);
    }
    setFiles(selected.slice(0, Math.max(max, 0)));
  };

  const toggleUser = (uid) => {
    setForm((f) => ({
      ...f,
      assignedUsers: f.assignedUsers.includes(uid)
        ? f.assignedUsers.filter((x) => x !== uid)
        : [...f.assignedUsers, uid],
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      if (form.startDate) fd.append('startDate', form.startDate);
      if (form.endDate) fd.append('endDate', form.endDate);
      fd.append('status', form.status);
      fd.append('assignedUsers', JSON.stringify(form.assignedUsers));
      files.forEach((f) => fd.append('attachments', f));

      if (isEdit) {
        await api.put(`/projects/${id}`, fd);
        toast.success('Project updated');
      } else {
        await api.post('/projects', fd);
        toast.success('Project created');
      }
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-bold">{isEdit ? 'Edit Project' : 'New Project'}</h1>
      <form onSubmit={onSubmit} className="card space-y-4">
        <div>
          <label className="label">Title *</label>
          <input
            className="input"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Start Date</label>
            <input
              type="date"
              className="input"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="label">End Date</label>
            <input
              type="date"
              className="input"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Assigned Users</label>
          {users.length === 0 ? (
            <p className="text-sm text-gray-500">No users available.</p>
          ) : (
            <div className="grid max-h-40 grid-cols-1 gap-1 overflow-y-auto rounded-lg border border-gray-200 p-2 dark:border-gray-600 sm:grid-cols-2">
              {users.map((u) => (
                <label key={u._id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.assignedUsers.includes(u._id)}
                    onChange={() => toggleUser(u._id)}
                  />
                  {u.name} <span className="text-xs text-gray-400">({u.role})</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label">
            Attachments (max 3{isEdit ? `, ${existingCount} existing` : ''})
          </label>
          <input
            type="file"
            multiple
            className="input"
            onChange={onFileChange}
            disabled={existingCount >= 3}
          />
          {files.length > 0 && (
            <ul className="mt-1 text-xs text-gray-500">
              {files.map((f) => (
                <li key={f.name}>📎 {f.name}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update Project' : 'Create Project'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/projects')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
