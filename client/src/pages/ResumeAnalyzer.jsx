import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, History, Trash2, CheckCircle2, AlertCircle, ArrowRight, Award } from 'lucide-react';
import api from '../services/api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label, Input } from '../components/ui/form';
import { getApiErrorMessage } from '../lib/errors';
import toast from 'react-hot-toast';

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState('');
  const [role, setRole] = useState('Software Engineer');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/resume/history');
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!resumeText.trim() || !role.trim()) {
      toast.error('Resume text and target role are required');
      return;
    }

    setLoading(true);
    setError('');
    setCurrentAnalysis(null);

    try {
      const res = await api.post('/resume/analyze', {
        resumeText,
        role,
        company,
        jobDescription
      });
      setCurrentAnalysis(res.data);
      toast.success('Resume analyzed successfully!');
      fetchHistory();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to analyze resume. Please try again.'));
      toast.error('Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHistory = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this analysis?')) return;

    try {
      await api.delete(`/resume/history/${id}`);
      setHistory(history.filter(h => h._id !== id));
      if (currentAnalysis && currentAnalysis._id === id) {
        setCurrentAnalysis(null);
      }
      toast.success('Analysis deleted');
    } catch (err) {
      toast.error('Failed to delete history');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getScoreStrokeColor = (score) => {
    if (score >= 80) return '#10b981'; // emerald-500
    if (score >= 60) return '#f59e0b'; // amber-500
    return '#f43f5e'; // rose-500
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">AI Resume Analyzer</h2>
          <p className="mt-1 text-sm text-slate-500">Upload your resume details to scan for ATS alignment, missing keywords, and get Google XYZ bullet recommendations.</p>
        </div>
      </section>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="space-y-6">
          {!currentAnalysis ? (
            <Card>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle>New Resume Scan</CardTitle>
                <CardDescription>Paste your current resume and specify your target role details.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAnalyze} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="role">Target Role *</Label>
                      <Input
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Software Engineer, Data Analyst"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Target Company (Optional)</Label>
                      <Input
                        id="company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="e.g. Google, Amazon, TCS"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobDescription">Target Job Description (Optional)</Label>
                    <textarea
                      id="jobDescription"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description keywords and requirements here to match against..."
                      rows={4}
                      className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resumeText">Paste Resume Text *</Label>
                    <textarea
                      id="resumeText"
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Copy and paste the entire text of your resume here..."
                      rows={12}
                      className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                    <Sparkles className="h-4 w-4" />
                    {loading ? 'Analyzing with Gemini AI...' : 'Scan Resume'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* ATS SCORE & GENERAL OVERVIEW CARD */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-xl">ATS Analysis Results</CardTitle>
                    <CardDescription>Target: {currentAnalysis.role} {currentAnalysis.company && `at ${currentAnalysis.company}`}</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setCurrentAnalysis(null)}>
                    Scan Another
                  </Button>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid gap-6 md:grid-cols-[1fr_2fr] items-center">
                    {/* Gauge Circle */}
                    <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="relative h-28 w-28">
                        <svg className="h-full w-full" viewBox="0 0 100 100">
                          {/* Background track */}
                          <circle
                            className="text-slate-200"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="38"
                            cx="50"
                            cy="50"
                          />
                          {/* Score track */}
                          <circle
                            strokeWidth="8"
                            strokeDasharray={`${2 * Math.PI * 38}`}
                            strokeDashoffset={`${2 * Math.PI * 38 * (1 - currentAnalysis.atsScore / 100)}`}
                            strokeLinecap="round"
                            stroke={getScoreStrokeColor(currentAnalysis.atsScore)}
                            fill="transparent"
                            r="38"
                            cx="50"
                            cy="50"
                            style={{
                              transform: 'rotate(-90deg)',
                              transformOrigin: '50% 50%',
                              transition: 'stroke-dashoffset 0.5s ease-in-out'
                            }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-slate-900">{currentAnalysis.atsScore}</span>
                          <span className="text-[10px] font-semibold text-slate-500 uppercase">ATS Score</span>
                        </div>
                      </div>
                      <Badge className="mt-3" variant={currentAnalysis.atsScore >= 80 ? 'success' : currentAnalysis.atsScore >= 60 ? 'warning' : 'danger'}>
                        {currentAnalysis.atsScore >= 80 ? 'Strong Match' : currentAnalysis.atsScore >= 60 ? 'Average Match' : 'Weak Match'}
                      </Badge>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <Award className="h-4 w-4 text-indigo-500" />
                          AI Match Summary
                        </h4>
                        <p className="text-sm leading-6 text-slate-600">{currentAnalysis.feedback}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KEYWORDS HIGHLIGHT CARD */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Keywords & Skill Matching</CardTitle>
                  <CardDescription>Verify matching credentials and patch critical gaps highlighted in red.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      Matched Keywords ({currentAnalysis.skillsMatched?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {currentAnalysis.skillsMatched?.length ? (
                        currentAnalysis.skillsMatched.map((skill) => (
                          <Badge key={skill} variant="success">{skill}</Badge>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">None detected. Try incorporating keywords from the job description.</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-rose-500" />
                      Missing Keywords ({currentAnalysis.skillsMissing?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {currentAnalysis.skillsMissing?.length ? (
                        currentAnalysis.skillsMissing.map((skill) => (
                          <Badge key={skill} variant="danger">{skill}</Badge>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">Excellent! No major keyword gaps identified.</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* BULLET POINT OPTIMIZATION CARD */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Google XYZ Rewrite Suggestions</CardTitle>
                  <CardDescription>
                    Review suggestions that rewrite your resume lines to the standard: 
                    <span className="font-semibold text-slate-800"> "Accomplished [X] as measured by [Y], by doing [Z]"</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {currentAnalysis.bulletPointRewrites?.length ? (
                    <div className="divide-y divide-slate-100">
                      {currentAnalysis.bulletPointRewrites.map((rewrite, idx) => (
                        <div key={idx} className="p-5 space-y-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-1">
                              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Original Bullet</p>
                              <div className="p-3 rounded-md bg-rose-50/50 border border-rose-100/50 text-sm text-slate-700">
                                {rewrite.original}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">AI Recommended (XYZ Formula)</p>
                              <div className="p-3 rounded-md bg-emerald-50/50 border border-emerald-100/50 text-sm text-slate-800 font-medium">
                                {rewrite.recommended}
                              </div>
                            </div>
                          </div>
                          {rewrite.reason && (
                            <div className="text-xs text-slate-500 italic mt-2 bg-slate-50 p-2 rounded border border-slate-100">
                              <span className="font-semibold not-italic text-slate-700">Why this works:</span> {rewrite.reason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-5 py-8 text-center text-sm text-slate-500">
                      Your bullet points are well-structured! No modifications recommended.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* SIDEBAR HISTORY */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <History className="h-4 w-4 text-slate-600" />
              <div>
                <CardTitle className="text-base">Scan History</CardTitle>
                <CardDescription>View past evaluations</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              {history.length === 0 ? (
                <div className="px-4 py-8 text-center text-xs text-slate-400">
                  No scans saved yet. Run your first analysis.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {history.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => setCurrentAnalysis(item)}
                      className={`flex w-full items-center justify-between p-3.5 text-left transition-colors hover:bg-slate-50 ${currentAnalysis && currentAnalysis._id === item._id ? 'bg-slate-50 border-l-2 border-slate-900' : ''}`}
                    >
                      <div className="min-w-0 pr-3">
                        <p className="truncate text-xs font-semibold text-slate-900">{item.role}</p>
                        <p className="truncate text-[10px] text-slate-500">
                          {item.company || 'General'} / {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`rounded px-1.5 py-0.5 text-xs font-bold ${getScoreColor(item.atsScore)}`}>
                          {item.atsScore}%
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteHistory(item._id, e)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          aria-label="Delete history entry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
