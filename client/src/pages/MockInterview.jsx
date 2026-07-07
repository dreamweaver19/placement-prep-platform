import { useEffect, useState } from 'react';
import { Bot, CheckCircle2, History, RotateCcw, Send, Sparkles, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import api from '../services/api';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label, Select } from '../components/ui/form';
import { getApiErrorMessage } from '../lib/errors';

const COMPANIES = ['TCS', 'Infosys', 'Wipro', 'Amazon', 'Microsoft', 'Google', 'Accenture', 'Cognizant', 'Other'];
const ROLES = ['SDE', 'Data Analyst', 'Product', 'DevOps'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const scoreVariant = (score) => {
  if (score >= 8) return 'success';
  if (score >= 5) return 'warning';
  return 'danger';
};

function SetupStage({ sessions, onStart }) {
  const [form, setForm] = useState({ company: 'TCS', role: 'SDE', difficulty: 'Medium' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/interview/generate', form);
      onStart({ ...form, questions: res.data.questions || [] });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to generate questions. Check the Gemini API key and backend server.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
            <Bot className="h-5 w-5" />
          </div>
          <CardTitle>AI Mock Interview</CardTitle>
          <CardDescription>Generate five interview questions and evaluate answers with AI feedback.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Select id="company" value={form.company} onChange={set('company')}>
                {COMPANIES.map((company) => <option key={company}>{company}</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select id="role" value={form.role} onChange={set('role')}>
                {ROLES.map((role) => <option key={role}>{role}</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select id="difficulty" value={form.difficulty} onChange={set('difficulty')}>
                {DIFFICULTIES.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}
              </Select>
            </div>
          </div>
          <Button type="button" onClick={handleStart} disabled={loading}>
            <Sparkles className="h-4 w-4" />
            {loading ? 'Generating questions...' : 'Start Interview'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>Your last mock interview attempts.</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No sessions yet.
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 5).map((session) => (
                <div key={session._id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-950">{session.company} / {session.role}</p>
                    <p className="text-xs text-slate-500">{new Date(session.completedAt).toLocaleDateString()} / {session.difficulty}</p>
                  </div>
                  <Badge variant={scoreVariant(session.overallScore)}>{session.overallScore}/10</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InterviewStage({ setup, onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');

  // Voice States
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const question = setup.questions[currentIdx];
  const isLast = currentIdx === setup.questions.length - 1;
  const progress = Math.round(((currentIdx + 1) / setup.questions.length) * 100);

  // Setup speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = Array.from(event.results)
          .slice(event.resultIndex)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setCurrentAnswer(prev => prev ? prev + ' ' + transcript : transcript);
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error', e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speak question when active index or voiceEnabled changes
  useEffect(() => {
    if (voiceEnabled && question) {
      speak(question.question);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentIdx, voiceEnabled, question]);

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  const handleEvaluate = async () => {
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }
    if (!currentAnswer.trim()) return;
    setEvaluating(true);
    setError('');
    try {
      const res = await api.post('/interview/evaluate', {
        question: question.question,
        answer: currentAnswer,
        role: setup.role,
      });
      setEvaluation(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Evaluation failed'));
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    const result = {
      question: question.question,
      userAnswer: currentAnswer,
      aiFeedback: evaluation?.feedback || '',
      score: evaluation?.score || 0,
      strongPoints: evaluation?.strongPoints || '',
      improvements: evaluation?.improvements || '',
    };
    const nextAnswers = [...answers, result];

    if (isLast) {
      onComplete(nextAnswers);
      return;
    }

    setAnswers(nextAnswers);
    setCurrentAnswer('');
    setEvaluation(null);
    setCurrentIdx(currentIdx + 1);
  };

  if (!question) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-slate-600">No interview questions were generated.</CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>Question {currentIdx + 1} of {setup.questions.length}</span>
          <div className="flex items-center gap-3">
            <span>{setup.company} / {setup.role} / {setup.difficulty}</span>
            <button
              type="button"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-medium cursor-pointer"
            >
              {voiceEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5 text-slate-400" />}
              {voiceEnabled ? 'Voice Aloud' : 'Muted'}
            </button>
          </div>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-slate-950 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={question.type === 'Technical' ? 'info' : 'secondary'}>{question.type || 'Interview'}</Badge>
            </div>
            <CardTitle className="text-base leading-6">{question.question}</CardTitle>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={() => speak(question.question)}
            title="Read question out loud"
          >
            <Volume2 className="h-4 w-4 text-indigo-600" />
          </Button>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Answer</CardTitle>
          <CardDescription>Write or speak a clear, structured response before requesting feedback.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={currentAnswer}
            onChange={(event) => setCurrentAnswer(event.target.value)}
            disabled={!!evaluation}
            rows={6}
            placeholder={isListening ? "Listening... Speak your answer now. Clicking 'Stop Mic' or 'Evaluate' stops transcription." : "Type or speak your answer here..."}
            className={`flex w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-950 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-70 ${isListening ? 'border-indigo-400 ring-2 ring-indigo-100 animate-pulse' : 'border-slate-200'}`}
          />
          <div className="flex flex-wrap gap-2">
            {!evaluation ? (
              <>
                <Button type="button" onClick={handleEvaluate} disabled={evaluating || !currentAnswer.trim()}>
                  <Send className="h-4 w-4" />
                  {evaluating ? 'Evaluating...' : 'Evaluate Answer'}
                </Button>
                <Button
                  type="button"
                  variant={isListening ? "danger" : "outline"}
                  onClick={toggleListening}
                  disabled={evaluating}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4 text-indigo-500" />}
                  {isListening ? 'Stop Mic' : 'Speak Answer'}
                </Button>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {evaluation && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>AI Feedback</CardTitle>
                <CardDescription>Score and improvement notes for this answer.</CardDescription>
              </div>
              <Badge variant={scoreVariant(evaluation.score)}>{evaluation.score}/10</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-slate-700">{evaluation.feedback}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-medium text-emerald-700">Strong points</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{evaluation.strongPoints}</p>
              </div>
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="text-xs font-medium text-amber-700">Improve</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{evaluation.improvements}</p>
              </div>
            </div>
            <Button type="button" onClick={handleNext}>
              <CheckCircle2 className="h-4 w-4" />
              {isLast ? 'Finish Interview' : 'Next Question'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ResultsStage({ setup, answers, onRestart, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [overallFeedback, setOverallFeedback] = useState('');
  const [error, setError] = useState('');
  const avgScore = Math.round(answers.reduce((sum, answer) => sum + answer.score, 0) / answers.length);

  useEffect(() => {
    const save = async () => {
      setSaving(true);
      setError('');
      try {
        const res = await api.post('/interview/save', {
          company: setup.company,
          role: setup.role,
          difficulty: setup.difficulty,
          questions: answers,
        });
        setOverallFeedback(res.data.overallFeedback);
        onSaved();
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to save interview session'));
      } finally {
        setSaving(false);
      }
    };

    save();
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Card>
        <CardHeader className="text-center">
          <Badge className="mx-auto" variant={scoreVariant(avgScore)}>{avgScore}/10</Badge>
          <CardTitle className="text-2xl">Interview Complete</CardTitle>
          <CardDescription>{setup.company} / {setup.role} / {setup.difficulty}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-center">
          {overallFeedback && <p className="mx-auto max-w-xl text-sm leading-6 text-slate-600">{overallFeedback}</p>}
          {saving && <p className="text-xs text-slate-500">Saving session...</p>}
          {error && <p className="text-sm text-red-700">{error}</p>}
          <Button type="button" onClick={onRestart}>
            <RotateCcw className="h-4 w-4" />
            Start New Interview
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {answers.map((answer, index) => (
          <Card key={`${answer.question}-${index}`}>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium leading-6 text-slate-950">{answer.question}</p>
                <Badge variant={scoreVariant(answer.score)}>{answer.score}/10</Badge>
              </div>
              <p className="rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-600">{answer.userAnswer}</p>
              <p className="text-sm leading-6 text-slate-700">{answer.aiFeedback}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function MockInterview() {
  const [stage, setStage] = useState('setup');
  const [setup, setSetup] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [sessions, setSessions] = useState([]);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/interview/sessions');
      setSessions(res.data);
    } catch {
      setSessions([]);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleStart = (data) => {
    setSetup(data);
    setStage('interview');
  };

  const handleComplete = (newAnswers) => {
    setAnswers(newAnswers);
    setStage('results');
  };

  const handleRestart = () => {
    setSetup(null);
    setAnswers([]);
    setStage('setup');
    fetchSessions();
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">AI Mock Interview</h2>
          <p className="mt-1 text-sm text-slate-500">Practice with generated questions and score-based feedback.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <History className="h-4 w-4" />
          {sessions.length} saved sessions
        </div>
      </section>

      {stage === 'setup' && <SetupStage sessions={sessions} onStart={handleStart} />}
      {stage === 'interview' && setup && <InterviewStage setup={setup} onComplete={handleComplete} />}
      {stage === 'results' && setup && (
        <ResultsStage setup={setup} answers={answers} onRestart={handleRestart} onSaved={fetchSessions} />
      )}
    </div>
  );
}
