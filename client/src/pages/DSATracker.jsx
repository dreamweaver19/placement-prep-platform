import { useEffect, useState } from 'react';
import { ExternalLink, FilterX, Pencil, Plus, Trash2 } from 'lucide-react';
import api from '../services/api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input, Label, Select } from '../components/ui/form';

const TOPICS = ['Array', 'String', 'LinkedList', 'Tree', 'Graph', 'DP', 'Recursion', 'Stack', 'Queue', 'Heap', 'Binary Search', 'Greedy', 'Backtracking', 'Trie', 'Math'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const STATUSES = ['Todo', 'Attempted', 'Solved'];

const emptyForm = { title: '', link: '', difficulty: 'Easy', topic: 'Array', status: 'Todo', notes: '' };

const difficultyVariant = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'danger',
};

const statusVariant = {
  Todo: 'secondary',
  Attempted: 'info',
  Solved: 'success',
};

export default function DSATracker() {
  const [problems, setProblems] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({ status: '', difficulty: '', topic: '' });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProblems();
    fetchStats();
  }, [filters]);

  const fetchProblems = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.topic) params.topic = filters.topic;
      const res = await api.get('/dsa', { params });
      setProblems(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Could not load problems');
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/dsa/stats');
      setStats(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Could not load stats');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editId) {
        const res = await api.put(`/dsa/${editId}`, form);
        setProblems(problems.map((p) => p._id === editId ? res.data : p));
      } else {
        const res = await api.post('/dsa', form);
        setProblems([res.data, ...problems]);
      }
      setForm(emptyForm);
      setShowForm(false);
      setEditId(null);
      await fetchStats();
    } catch (err) {
      setError(err.response?.data?.msg || 'Error saving problem');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this problem?')) return;
    try {
      await api.delete(`/dsa/${id}`);
      setProblems(problems.filter((p) => p._id !== id));
      await fetchStats();
    } catch (err) {
      setError(err.response?.data?.msg || 'Error deleting problem');
    }
  };

  const handleEdit = (problem) => {
    setForm({
      title: problem.title,
      link: problem.link || '',
      difficulty: problem.difficulty,
      topic: problem.topic,
      status: problem.status,
      notes: problem.notes || '',
    });
    setEditId(problem._id);
    setShowForm(true);
  };

  const handleStatusChange = async (problem, newStatus) => {
    try {
      const res = await api.put(`/dsa/${problem._id}`, { ...problem, status: newStatus });
      setProblems(problems.map((p) => p._id === problem._id ? res.data : p));
      await fetchStats();
    } catch (err) {
      setError(err.response?.data?.msg || 'Error updating problem');
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const setFilter = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });
  const clearFilters = () => setFilters({ status: '', difficulty: '', topic: '' });

  const statCards = [
    { label: 'Total', value: stats?.total || 0 },
    { label: 'Solved', value: stats?.solved || 0 },
    { label: 'Attempted', value: stats?.attempted || 0 },
    { label: 'Todo', value: stats?.todo || 0 },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">DSA Tracker</h2>
          <p className="mt-1 text-sm text-slate-500">Maintain a clean practice log by topic, status, and difficulty.</p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setShowForm(!showForm);
            setEditId(null);
            setForm(emptyForm);
          }}
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Close form' : 'Add problem'}
        </Button>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editId ? 'Edit Problem' : 'Add Problem'}</CardTitle>
            <CardDescription>Save the problem, source link, topic, status, and quick notes.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Problem title</Label>
                  <Input id="title" value={form.title} onChange={set('title')} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link">Problem link</Label>
                  <Input id="link" value={form.link} onChange={set('link')} placeholder="https://leetcode.com/..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Select id="topic" value={form.topic} onChange={set('topic')}>
                    {TOPICS.map((topic) => <option key={topic}>{topic}</option>)}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select id="difficulty" value={form.difficulty} onChange={set('difficulty')}>
                    {DIFFICULTIES.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select id="status" value={form.status} onChange={set('status')}>
                    {STATUSES.map((status) => <option key={status}>{status}</option>)}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input id="notes" value={form.notes} onChange={set('notes')} placeholder="Pattern, trick, or revision note" />
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editId ? 'Update problem' : 'Add problem'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Problem List</CardTitle>
              <CardDescription>Filter and update your progress from one view.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filters.status} onChange={setFilter('status')} className="w-36">
                <option value="">All Status</option>
                {STATUSES.map((status) => <option key={status}>{status}</option>)}
              </Select>
              <Select value={filters.difficulty} onChange={setFilter('difficulty')} className="w-40">
                <option value="">All Difficulty</option>
                {DIFFICULTIES.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}
              </Select>
              <Select value={filters.topic} onChange={setFilter('topic')} className="w-40">
                <option value="">All Topics</option>
                {TOPICS.map((topic) => <option key={topic}>{topic}</option>)}
              </Select>
              {(filters.status || filters.difficulty || filters.topic) && (
                <Button type="button" variant="outline" size="icon" onClick={clearFilters} aria-label="Clear filters">
                  <FilterX className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {problems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
              <p className="font-medium text-slate-900">No problems found</p>
              <p className="mt-1 text-sm text-slate-500">Add your first problem or clear filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {problems.map((problem) => (
                <div key={problem._id} className="grid gap-3 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {problem.link ? (
                        <a className="inline-flex min-w-0 items-center gap-2 font-medium text-slate-950 hover:underline" href={problem.link} target="_blank" rel="noreferrer">
                          <span className="truncate">{problem.title}</span>
                          <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                        </a>
                      ) : (
                        <p className="font-medium text-slate-950">{problem.title}</p>
                      )}
                      <Badge variant={difficultyVariant[problem.difficulty]}>{problem.difficulty}</Badge>
                      <Badge variant="secondary">{problem.topic}</Badge>
                    </div>
                    {problem.notes && <p className="text-sm text-slate-500">{problem.notes}</p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={problem.status}
                      onChange={(e) => handleStatusChange(problem, e.target.value)}
                      className="w-36"
                    >
                      {STATUSES.map((status) => <option key={status}>{status}</option>)}
                    </Select>
                    <Badge variant={statusVariant[problem.status]}>{problem.status}</Badge>
                    <Button type="button" variant="outline" size="icon" onClick={() => handleEdit(problem)} aria-label="Edit problem">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" onClick={() => handleDelete(problem._id)} aria-label="Delete problem">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
