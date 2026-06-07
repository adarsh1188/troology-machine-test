import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';

function StatCard({ label, value, accent }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${accent || ''}`}>{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setData(res.data.data))
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return null;

  const { totalUsers, totalProjects, projectsByStatus, projectsEndingWithin7Days, endingSoonProjects } = data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {totalUsers !== null && totalUsers !== undefined && (
          <StatCard label="Total Users" value={totalUsers} accent="text-brand-600" />
        )}
        <StatCard label="Total Projects" value={totalProjects} accent="text-brand-600" />
        <StatCard label="Ending in 7 days" value={projectsEndingWithin7Days} accent="text-red-500" />
        <StatCard label="Completed" value={projectsByStatus.Completed} accent="text-green-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Status breakdown */}
        <div className="card lg:col-span-1">
          <h2 className="mb-4 font-semibold">Projects by Status</h2>
          <div className="space-y-3">
            {Object.entries(projectsByStatus).map(([status, count]) => {
              const pct = totalProjects ? Math.round((count / totalProjects) * 100) : 0;
              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <StatusBadge status={status} />
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded-full bg-brand-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ending soon */}
        <div className="card lg:col-span-2">
          <h2 className="mb-4 font-semibold">⏰ Ending within 7 days</h2>
          {endingSoonProjects.length === 0 ? (
            <p className="text-sm text-gray-500">No projects ending soon. 🎉</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {endingSoonProjects.map((p) => (
                <li key={p._id} className="flex items-center justify-between py-2">
                  <Link to={`/projects/${p._id}`} className="font-medium hover:text-brand-600">
                    {p.title}
                  </Link>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={p.status} />
                    <span className="text-sm text-gray-500">
                      {new Date(p.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
