import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpenCheck, Bot, Building2, CheckCircle2, GraduationCap, LibraryBig, ListTodo, UserRound, TrendingUp, Target, FileText, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const companies = user?.targetCompanies || [];

  const [dsaStats, setDsaStats] = useState(null);
  const [interviewSessions, setInterviewSessions] = useState([]);
  const [latestResume, setLatestResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dsaRes, interviewRes, resumeRes] = await Promise.all([
          api.get('/dsa/stats').catch(() => ({ data: null })),
          api.get('/interview/sessions').catch(() => ({ data: [] })),
          api.get('/resume/history').catch(() => ({ data: [] }))
        ]);

        setDsaStats(dsaRes.data);
        setInterviewSessions(interviewRes.data || []);
        if (resumeRes.data && resumeRes.data.length > 0) {
          setLatestResume(resumeRes.data[0]); // latest is first in list
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calculate weak topics from DSA stats
  const getWeakTopics = () => {
    if (!dsaStats || !dsaStats.byTopic) return [];
    const topics = Object.entries(dsaStats.byTopic);
    return topics
      .map(([name, data]) => {
        const solveRate = data.total > 0 ? data.solved / data.total : 0;
        return { name, solveRate, ...data };
      })
      .filter(t => t.total > 0 && t.solveRate < 0.7)
      .sort((a, b) => a.solveRate - b.solveRate || b.total - a.total)
      .slice(0, 3);
  };

  const weakTopics = getWeakTopics();

  // Create tools list
  const tools = [
    {
      title: 'DSA Practice',
      body: 'Track coding problems by topic, difficulty, and status.',
      icon: ListTodo,
      action: () => navigate('/dsa'),
    },
    {
      title: 'Question Bank',
      body: 'Review company-wise interview questions and answers.',
      icon: LibraryBig,
      action: () => navigate('/questions'),
    },
    {
      title: 'AI Mock Interview',
      body: 'Generate interview questions and get answer feedback.',
      icon: Bot,
      action: () => navigate('/interview'),
    },
  ];

  // Helper calculations for SVG Donut
  const getDsaDonutSegments = () => {
    if (!dsaStats) return [];
    const { solved = 0, attempted = 0, todo = 0 } = dsaStats;
    const total = solved + attempted + todo;
    if (total === 0) return [];

    const segments = [
      { label: 'Solved', value: solved, color: '#10b981' },      // emerald-500
      { label: 'Attempted', value: attempted, color: '#f59e0b' },   // amber-500
      { label: 'Todo', value: todo, color: '#64748b' }            // slate-500
    ];

    const radius = 35;
    const circumference = 2 * Math.PI * radius;
    let accumulatedOffset = 0;

    return segments.map(seg => {
      const percentage = seg.value / total;
      const strokeLength = percentage * circumference;
      const strokeOffset = circumference - strokeLength + accumulatedOffset;
      accumulatedOffset -= strokeLength;

      return {
        ...seg,
        strokeLength,
        strokeOffset,
        circumference,
        percentage: Math.round(percentage * 100)
      };
    });
  };

  const donutSegments = getDsaDonutSegments();

  // Render SVG Line Chart for Mock Interviews
  const renderInterviewChart = () => {
    if (interviewSessions.length === 0) {
      return (
        <div className="flex h-44 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center p-4">
          <Bot className="h-8 w-8 text-slate-400 mb-2" />
          <p className="text-sm font-medium text-slate-900">No session metrics yet</p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">Complete an AI mock interview to generate performance telemetry.</p>
        </div>
      );
    }

    // Sort chronologically (oldest first)
    const sortedSessions = [...interviewSessions]
      .reverse()
      .slice(-7); // show last 7

    const paddingX = 30;
    const paddingY = 25;
    const chartWidth = 320;
    const chartHeight = 160;

    const pointsCount = sortedSessions.length;
    const stepX = pointsCount > 1 ? (chartWidth - paddingX * 2) / (pointsCount - 1) : 0;

    const points = sortedSessions.map((session, idx) => {
      const score = session.overallScore || 0; // 0 to 10
      const x = paddingX + idx * stepX;
      // Map 0-10 score to Y-axis (top is 10, bottom is 0)
      const y = chartHeight - paddingY - (score / 10) * (chartHeight - paddingY * 2);
      return { x, y, score, date: new Date(session.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), company: session.company };
    });

    // Generate Path Data for the Line
    let pathD = '';
    let areaD = '';

    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      areaD = `M ${points[0].x} ${chartHeight - paddingY} L ${points[0].x} ${points[0].y}`;

      for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i].x} ${points[i].y}`;
        areaD += ` L ${points[i].x} ${points[i].y}`;
      }

      areaD += ` L ${points[points.length - 1].x} ${chartHeight - paddingY} Z`;
    }

    return (
      <div className="w-full overflow-x-auto">
        <svg className="mx-auto" width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#f1f5f9" strokeWidth="1" />
          <line x1={paddingX} y1={(chartHeight) / 2} x2={chartWidth - paddingX} y2={(chartHeight) / 2} stroke="#f1f5f9" strokeWidth="1" />
          <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#e2e8f0" strokeWidth="1" />

          {/* Y Axis Labels */}
          <text x={paddingX - 8} y={paddingY + 4} fill="#94a3b8" fontSize="9" textAnchor="end">10</text>
          <text x={paddingX - 8} y={(chartHeight) / 2 + 3} fill="#94a3b8" fontSize="9" textAnchor="end">5</text>
          <text x={paddingX - 8} y={chartHeight - paddingY + 3} fill="#94a3b8" fontSize="9" textAnchor="end">0</text>

          {/* Area under the line */}
          {points.length > 0 && (
            <path d={areaD} fill="url(#chartGradient)" />
          )}

          {/* Line Path */}
          {points.length > 0 && (
            <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Points */}
          {points.map((pt, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle cx={pt.x} cy={pt.y} r="4" fill="#ffffff" stroke="#6366f1" strokeWidth="2" />
              <circle cx={pt.x} cy={pt.y} r="7" fill="transparent" className="hover:fill-indigo-500/10" />
              {/* Tooltip on hover */}
              <title>{`${pt.company}: ${pt.score}/10 on ${pt.date}`}</title>
            </g>
          ))}

          {/* X Axis Labels */}
          {points.map((pt, idx) => (
            <text key={idx} x={pt.x} y={chartHeight - 8} fill="#94a3b8" fontSize="8" textAnchor="middle">
              {pt.date}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm font-medium text-slate-500">
        Loading analytics profiles...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardDescription>Welcome back</CardDescription>
            <CardTitle className="text-2xl">Hi, {user?.name || 'student'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Keep your placement profile, practice log, question bank, and mock interview feedback in one focused workspace. Use the AI Resume Analyzer to optimize your credentials.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => navigate('/interview')}>
                <Bot className="h-4 w-4" />
                Start Mock Interview
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/resume')}>
                <FileText className="h-4 w-4" />
                Scan Resume
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/dsa')}>
                <BookOpenCheck className="h-4 w-4" />
                Open DSA Tracker
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PROFILE SNAPSHOT */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Snapshot</CardTitle>
            <CardDescription>Your current placement details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">{user?.college || 'College not added'}</span>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4 text-slate-500" />
              <span className="text-slate-600">{user?.branch || 'Branch'} / {user?.graduationYear || 'Year'}</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {companies.length ? companies.map((company) => (
                <Badge key={company} variant="secondary">{company}</Badge>
              )) : <Badge variant="secondary">No target companies yet</Badge>}
            </div>

            {/* Resume Analyzer Mini-widget */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-500" />
                <span className="text-slate-700 font-medium">Latest Resume Score:</span>
              </div>
              {latestResume ? (
                <Badge variant={latestResume.atsScore >= 80 ? 'success' : latestResume.atsScore >= 60 ? 'warning' : 'danger'}>
                  {latestResume.atsScore}% ATS
                </Badge>
              ) : (
                <button type="button" onClick={() => navigate('/resume')} className="text-xs text-indigo-600 hover:underline font-medium">
                  Scan Now
                </button>
              )}
            </div>

            <Button type="button" variant="outline" size="sm" onClick={() => navigate('/profile')} className="w-full mt-2">
              <UserRound className="h-4 w-4" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* ANALYTICS SECTION */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* DSA Donut Progress */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4.5 w-4.5 text-emerald-500" />
              DSA Tracker Status
            </CardTitle>
            <CardDescription>Topic & practice completion metrics.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {dsaStats && dsaStats.total > 0 ? (
              <div className="flex items-center justify-around py-2">
                {/* SVG Donut */}
                <div className="relative h-24 w-24">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle
                      className="text-slate-100"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="35"
                      cx="50"
                      cy="50"
                    />
                    {donutSegments.map((seg, idx) => (
                      <circle
                        key={idx}
                        strokeWidth="10"
                        strokeDasharray={`${seg.circumference}`}
                        strokeDashoffset={`${seg.strokeOffset}`}
                        strokeLinecap="round"
                        stroke={seg.color}
                        fill="transparent"
                        r="35"
                        cx="50"
                        cy="50"
                        style={{
                          transform: 'rotate(-90deg)',
                          transformOrigin: '50% 50%',
                        }}
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-slate-800">{dsaStats.solved}</span>
                    <span className="text-[9px] text-slate-500 uppercase font-semibold">Solved</span>
                  </div>
                </div>

                {/* Legends */}
                <div className="space-y-1.5">
                  {donutSegments.map((seg, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                      <span className="text-slate-600 font-medium">{seg.label}:</span>
                      <span className="text-slate-800 font-bold">{seg.value} ({seg.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex h-36 flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center p-4">
                <ListTodo className="h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-900">No practice problems logged</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">Log problems in your DSA Tracker to visualize completion rates.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mock Interview Progress */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-500" />
              Mock Interview Score Trend
            </CardTitle>
            <CardDescription>Score progression across recent sessions.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {renderInterviewChart()}
          </CardContent>
        </Card>

        {/* Actionable Weakness Detection / Focus Card */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
              AI Focus Areas
            </CardTitle>
            <CardDescription>Topics requiring immediate reinforcement.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            {weakTopics.length > 0 ? (
              <div className="space-y-3 py-1">
                {weakTopics.map(topic => (
                  <div key={topic.name} className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 border border-amber-100 text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{topic.name} Topic</p>
                      <p className="text-slate-500 mt-0.5">{topic.solved} of {topic.total} problems solved</p>
                    </div>
                    <Badge variant="warning">{Math.round(topic.solveRate * 100)}% Match</Badge>
                  </div>
                ))}
                <p className="text-[11px] text-slate-500 leading-normal">
                  * Analysis suggests practicing these DSA categories to raise matching scoring indicators.
                </p>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center p-4">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                <p className="text-sm font-medium text-slate-900">Good Topic Balance</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">No critical gaps identified in DSA problem topics. Keep practicing!</p>
              </div>
            )}
            <Button type="button" variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate('/dsa')}>
              Practice Problems
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* CORE TOOLS SECTION */}
      <section className="grid gap-4 md:grid-cols-3">
        {tools.map(({ title, body, icon: Icon, action }) => (
          <button key={title} type="button" onClick={action} className="text-left">
            <Card className="h-full transition-colors hover:border-slate-300 hover:bg-slate-50">
              <CardHeader>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                  <Icon className="h-4 w-4" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-600">{body}</p>
              </CardContent>
            </Card>
          </button>
        ))}
      </section>
    </div>
  );
}
