import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input, Label, Select } from '../components/ui/form';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || '',
    college: user?.college || '',
    branch: user?.branch || 'CSE',
    graduationYear: user?.graduationYear || 2027,
    targetCompanies: (user?.targetCompanies || []).join(', ')
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.put('/auth/profile', {
        ...form,
        graduationYear: Number(form.graduationYear),
        targetCompanies: form.targetCompanies
          .split(',')
          .map((company) => company.trim())
          .filter(Boolean)
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Profile update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update the details used across your placement workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
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
            <div className="space-y-2">
              <Label htmlFor="companies">Target companies</Label>
              <Input
                id="companies"
                value={form.targetCompanies}
                onChange={set('targetCompanies')}
                placeholder="Google, Microsoft, Amazon"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save profile'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
