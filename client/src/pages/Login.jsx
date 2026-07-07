import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input, Label } from '../components/ui/form';
import { getApiErrorMessage } from '../lib/errors';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-slate-50 px-4 py-8 lg:grid-cols-[1fr_440px]">
      <section className="hidden items-center justify-center px-8 lg:flex">
        <div className="max-w-xl">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950">Placement Prep</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Track your DSA practice, keep your profile ready, and manage interview preparation from one focused workspace.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Enter your account details to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
                <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-center text-sm text-slate-500">
                No account? <Link className="font-medium text-slate-950 hover:underline" to="/register">Create one</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
