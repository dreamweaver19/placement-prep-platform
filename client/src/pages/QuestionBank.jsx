import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, FilterX, Plus, ThumbsUp } from 'lucide-react';
import api from '../services/api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input, Label, Select } from '../components/ui/form';
import { cn } from '../lib/utils';
import { getApiErrorMessage } from '../lib/errors';

const CATEGORIES = ['Technical', 'HR', 'Aptitude'];
const ROLES = ['SDE', 'Data Analyst', 'Product', 'DevOps', 'Any'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const emptyForm = {
  company: '',
  role: 'SDE',
  category: 'Technical',
  question: '',
  answer: '',
  difficulty: 'Medium',
};

const difficultyVariant = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'danger',
};

const categoryVariant = {
  Technical: 'info',
  HR: 'secondary',
  Aptitude: 'warning',
};

export default function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [filters, setFilters] = useState({ company: '', category: '', role: '', difficulty: '' });
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.company) params.company = filters.company;
      if (filters.category) params.category = filters.category;
      if (filters.role) params.role = filters.role;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      const res = await api.get('/questions', { params });
      setQuestions(res.data);
      setError('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load questions'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/questions/companies');
      setCompanies(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load companies'));
    }
  };

  const handleUpvote = async (id) => {
    try {
      const res = await api.put(`/questions/${id}/upvote`);
      setQuestions(questions.map((question) => question._id === id ? res.data : question));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not upvote question'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/questions', form);
      setQuestions([res.data, ...questions]);
      if (!companies.includes(res.data.company)) {
        setCompanies([...companies, res.data.company].sort());
      }
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Error adding question'));
    }
  };

  const setFilter = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const clearFilters = () => setFilters({ company: '', category: '', role: '', difficulty: '' });

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Question Bank</h2>
          <p className="mt-1 text-sm text-slate-500">
            {questions.length} questions across {companies.length} companies.
          </p>
        </div>
        <Button type="button" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          {showForm ? 'Close form' : 'Contribute'}
        </Button>
      </section>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={!filters.company ? 'default' : 'outline'}
              onClick={() => setFilters({ ...filters, company: '' })}
            >
              All Companies
            </Button>
            {companies.map((company) => (
              <Button
                key={company}
                type="button"
                size="sm"
                variant={filters.company === company ? 'default' : 'outline'}
                onClick={() => setFilters({ ...filters, company })}
              >
                {company}
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Select value={filters.category} onChange={setFilter('category')} className="w-40">
              <option value="">All Categories</option>
              {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </Select>
            <Select value={filters.role} onChange={setFilter('role')} className="w-40">
              <option value="">All Roles</option>
              {ROLES.map((role) => <option key={role}>{role}</option>)}
            </Select>
            <Select value={filters.difficulty} onChange={setFilter('difficulty')} className="w-40">
              <option value="">All Difficulty</option>
              {DIFFICULTIES.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}
            </Select>
            {(filters.company || filters.category || filters.role || filters.difficulty) && (
              <Button type="button" variant="outline" size="icon" onClick={clearFilters} aria-label="Clear filters">
                <FilterX className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Contribute a Question</CardTitle>
            <CardDescription>Add a question with answer notes for future interview prep.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={form.company} onChange={set('company')} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select id="role" value={form.role} onChange={set('role')}>
                    {ROLES.map((role) => <option key={role}>{role}</option>)}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select id="category" value={form.category} onChange={set('category')}>
                    {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select id="difficulty" value={form.difficulty} onChange={set('difficulty')}>
                    {DIFFICULTIES.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <textarea
                  id="question"
                  value={form.question}
                  onChange={set('question')}
                  required
                  rows={3}
                  className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">Answer or hint</Label>
                <textarea
                  id="answer"
                  value={form.answer}
                  onChange={set('answer')}
                  rows={3}
                  className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                />
              </div>
              <Button type="submit">Submit Question</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
          <CardDescription>Open answers, upvote useful items, and narrow the list with filters.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-500">
              Loading questions...
            </div>
          ) : questions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center">
              <p className="font-medium text-slate-900">No questions found</p>
              <p className="mt-1 text-sm text-slate-500">Try another filter or contribute the first question.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {questions.map((question) => (
                <article key={question._id} className="grid gap-3 py-4 lg:grid-cols-[auto_1fr_auto]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpvote(question._id)}
                    className="w-fit self-start"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    {question.upvotes || 0}
                  </Button>
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{question.company}</Badge>
                      <Badge variant="secondary">{question.role}</Badge>
                      <Badge variant={categoryVariant[question.category]}>{question.category}</Badge>
                      <Badge variant={difficultyVariant[question.difficulty]}>{question.difficulty}</Badge>
                      {question.contributedBy?.name && (
                        <span className="text-xs text-slate-400">by {question.contributedBy.name}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium leading-6 text-slate-950">{question.question}</p>
                    {expanded === question._id && question.answer && (
                      <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-medium text-slate-500">Answer</p>
                        <p className="mt-1 text-sm leading-6 text-slate-700">{question.answer}</p>
                      </div>
                    )}
                  </div>
                  {question.answer && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpanded(expanded === question._id ? null : question._id)}
                      className={cn('w-fit self-start', expanded === question._id && 'bg-slate-100')}
                    >
                      {expanded === question._id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      {expanded === question._id ? 'Hide' : 'Answer'}
                    </Button>
                  )}
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
