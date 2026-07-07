import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input, Label, Select } from '../components/ui/form';
import { getApiErrorMessage } from '../lib/errors';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    college: '', branch: 'CSE', graduationYear: 2027
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({ ...form, graduationYear: Number(form.graduationYear) });
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
            <UserPlus className="h-5 w-5" />
          </div>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Set up your placement preparation workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={form.name} onChange={set('name')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={set('email')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={form.password} onChange={set('password')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                <Input id="college" value={form.college} onChange={set('college')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select id="branch" value={form.branch} onChange={set('branch')}>
                  <option>CSE</option>
                  <option>IT</option>
                  <option>ECE</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation year</Label>
                <Select id="graduationYear" value={form.graduationYear} onChange={set('graduationYear')}>
                  <option>2026</option>
                  <option>2027</option>
                  <option>2028</option>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </Button>
            <p className="text-sm text-slate-500">
              Have an account? <Link className="font-medium text-slate-950 hover:underline" to="/login">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
