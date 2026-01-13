'use client';

import { useEffect, useMemo, useState } from 'react';

interface TemplateDetail {
  id: string;
  name: string;
  description?: string;
  status?: string;
  version?: number;
  template_json?: Record<string, unknown>;
  template_group_id?: string;
}

interface TemplateDetailPageProps {
  params: { templateId: string };
}

export default function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState<{
    preview_url: string | null;
    fit_score: number;
    breakdown: Record<string, number>;
    alerts: string[];
    recommendations: string[];
  } | null>(null);

  const defaultConfig = useMemo(
    () => ({
      beats: [
        { role: 'hook', minDuration: 3, maxDuration: 4 },
        { role: 'stakes', minDuration: 3, maxDuration: 4 },
        { role: 'montage', minDuration: 4, maxDuration: 5 },
        { role: 'title', minDuration: 3, maxDuration: 4 },
      ],
      pacingCurve: 'balanced',
      cutDensityBand: 'medium',
      transitions: { hard_cut: 40, dip: 25, zoom: 20, blur: 15 },
      textRules: { maxCards: 4, maxWordsPerCard: 14, minDuration: 2.5 },
      defaults: { runtime: 12, aspectRatio: '16:9' },
    }),
    []
  );

  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch(`/api/templates/${params.templateId}`);
        const data = await response.json();
        if (response.ok) {
          setTemplate(data.template);
          const incoming = data.template.template_json ?? {};
          setConfig({
            ...defaultConfig,
            ...incoming,
            textRules: { ...defaultConfig.textRules, ...(incoming.textRules ?? {}) },
            transitions: { ...defaultConfig.transitions, ...(incoming.transitions ?? {}) },
            defaults: { ...defaultConfig.defaults, ...(incoming.defaults ?? {}) },
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [params.templateId, defaultConfig]);

  const updateBeat = (index: number, key: 'role' | 'minDuration' | 'maxDuration', value: string) => {
    setConfig((prev) => {
      const beats = [...prev.beats];
      const beat = { ...beats[index] };
      if (key === 'role') {
        beat.role = value;
      } else {
        beat[key] = Number(value);
      }
      beats[index] = beat;
      return { ...prev, beats };
    });
  };

  const moveBeat = (index: number, direction: number) => {
    setConfig((prev) => {
      const beats = [...prev.beats];
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= beats.length) {
        return prev;
      }
      const [removed] = beats.splice(index, 1);
      beats.splice(nextIndex, 0, removed);
      return { ...prev, beats };
    });
  };

  const handleSaveDraft = async () => {
    if (!template) return;
    setIsSaving(true);
    try {
      const payload = {
        name: template.name,
        description: template.description,
        templateJson: config,
        templateGroupId: template.template_group_id,
      };

      if (template.status === 'published') {
        const response = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error ?? 'Failed to create draft');
        }
        setTemplate(data.template);
      } else {
        const response = await fetch(`/api/templates/${template.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error ?? 'Failed to save draft');
        }
        setTemplate(data.template);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!template) return;
    const response = await fetch(`/api/templates/${template.id}/publish`, { method: 'POST' });
    const data = await response.json();
    if (response.ok) {
      setTemplate(data.template);
    } else {
      alert(data?.error ?? 'Failed to publish');
    }
  };

  const handleDuplicateVersion = async () => {
    if (!template) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          templateGroupId: template.template_group_id,
          templateJson: config,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error ?? 'Failed to duplicate version');
      }
      setTemplate(data.template);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to duplicate version');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestTemplate = async () => {
    if (!template) return;
    const response = await fetch(`/api/templates/${template.id}/test`, { method: 'POST' });
    const data = await response.json();
    if (response.ok) {
      setTestResult(data);
    } else {
      alert(data?.error ?? 'Failed to test template');
    }
  };

  const applyRecommendations = () => {
    setConfig((prev) => ({
      ...prev,
      textRules: {
        ...prev.textRules,
        maxWordsPerCard: Math.min(prev.textRules.maxWordsPerCard, 14),
        minDuration: Math.max(prev.textRules.minDuration, 3),
      },
      transitions: prev.transitions ?? { hard_cut: 40, dip: 25, zoom: 20, blur: 15 },
    }));
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10 text-slate-300">Loading...</div>
    );
  }

  if (!template) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10 text-slate-300">Template not found.</div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-white">{template.name}</h1>
          <p className="mt-2 text-slate-300">{template.description}</p>
          <div className="mt-2 text-sm text-slate-400">
            Status: {template.status ?? 'draft'} • v{template.version ?? 1}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSaveDraft}
            className="rounded-lg bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-500 disabled:bg-slate-700"
            disabled={isSaving}
          >
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-slate-500"
          >
            Publish Version
          </button>
          <button
            onClick={handleDuplicateVersion}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-slate-500"
          >
            Duplicate as New Version
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold text-white">Beat Builder</h2>
          <p className="text-sm text-slate-400">
            Define the beat order and duration ranges.
          </p>
          <div className="mt-4 space-y-3">
            {config.beats.map((beat, index) => (
              <div key={`${beat.role}-${index}`} className="rounded-lg border border-slate-800 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <input
                    value={beat.role}
                    onChange={(event) => updateBeat(index, 'role', event.target.value)}
                    className="w-32 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                  />
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <label>
                      Min
                      <input
                        type="number"
                        value={beat.minDuration}
                        onChange={(event) => updateBeat(index, 'minDuration', event.target.value)}
                        className="ml-2 w-16 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                      />
                    </label>
                    <label>
                      Max
                      <input
                        type="number"
                        value={beat.maxDuration}
                        onChange={(event) => updateBeat(index, 'maxDuration', event.target.value)}
                        className="ml-2 w-16 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                      />
                    </label>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => moveBeat(index, -1)}
                      className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveBeat(index, 1)}
                      className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-200"
                    >
                      ↓
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-4">
            <div>
              <label className="text-sm text-slate-300">Pacing Curve</label>
              <select
                value={config.pacingCurve}
                onChange={(event) => setConfig((prev) => ({ ...prev, pacingCurve: event.target.value }))}
                className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              >
                <option value="slow-burn">Slow Burn</option>
                <option value="balanced">Balanced</option>
                <option value="fast">Fast</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-300">Cut Density Band</label>
              <select
                value={config.cutDensityBand}
                onChange={(event) => setConfig((prev) => ({ ...prev, cutDensityBand: event.target.value }))}
                className="mt-2 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(config.transitions).map(([key, value]) => (
                <label key={key} className="text-xs text-slate-300">
                  {key}
                  <input
                    type="number"
                    value={value}
                    onChange={(event) =>
                      setConfig((prev) => ({
                        ...prev,
                        transitions: { ...prev.transitions, [key]: Number(event.target.value) },
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <h2 className="text-xl font-semibold text-white">Text & Defaults</h2>
            <div className="mt-4 grid gap-3">
              <label className="text-xs text-slate-300">
                Max Cards
                <input
                  type="number"
                  value={config.textRules.maxCards}
                  onChange={(event) =>
                    setConfig((prev) => ({
                      ...prev,
                      textRules: { ...prev.textRules, maxCards: Number(event.target.value) },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                />
              </label>
              <label className="text-xs text-slate-300">
                Max Words/Card
                <input
                  type="number"
                  value={config.textRules.maxWordsPerCard}
                  onChange={(event) =>
                    setConfig((prev) => ({
                      ...prev,
                      textRules: { ...prev.textRules, maxWordsPerCard: Number(event.target.value) },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                />
              </label>
              <label className="text-xs text-slate-300">
                Min Duration
                <input
                  type="number"
                  step="0.1"
                  value={config.textRules.minDuration}
                  onChange={(event) =>
                    setConfig((prev) => ({
                      ...prev,
                      textRules: { ...prev.textRules, minDuration: Number(event.target.value) },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                />
              </label>
              <label className="text-xs text-slate-300">
                Runtime (sec)
                <input
                  type="number"
                  value={config.defaults.runtime}
                  onChange={(event) =>
                    setConfig((prev) => ({
                      ...prev,
                      defaults: { ...prev.defaults, runtime: Number(event.target.value) },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                />
              </label>
              <label className="text-xs text-slate-300">
                Aspect Ratio
                <input
                  value={config.defaults.aspectRatio}
                  onChange={(event) =>
                    setConfig((prev) => ({
                      ...prev,
                      defaults: { ...prev.defaults, aspectRatio: event.target.value },
                    }))
                  }
                  className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Template Fit Test</h2>
              <button
                onClick={handleTestTemplate}
                className="rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-700"
              >
                Test Template
              </button>
            </div>
            {testResult && (
              <div className="mt-4 space-y-4">
                {testResult.preview_url && (
                  <video
                    src={testResult.preview_url}
                    controls
                    className="w-full rounded-lg border border-slate-800"
                  />
                )}
                <div>
                  <div className="text-sm text-slate-300">Fit Score</div>
                  <div className="mt-2 h-3 w-full rounded-full bg-slate-800">
                    <div
                      className="h-3 rounded-full bg-purple-500"
                      style={{ width: `${testResult.fit_score}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{testResult.fit_score}/100</div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  {Object.entries(testResult.breakdown).map(([key, value]) => (
                    <div key={key} className="rounded-md border border-slate-800 p-2">
                      <div className="uppercase text-[10px] text-slate-500">{key.replace('_', ' ')}</div>
                      <div className="text-sm text-white">{value}</div>
                    </div>
                  ))}
                </div>
                {testResult.alerts.length > 0 && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
                    <div className="font-semibold">Alerts</div>
                    <ul className="mt-2 list-disc pl-4">
                      {testResult.alerts.map((alert) => (
                        <li key={alert}>{alert}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {testResult.recommendations.length > 0 && (
                  <div className="rounded-lg border border-slate-800 p-3 text-xs text-slate-300">
                    <div className="font-semibold text-white">Recommendations</div>
                    <ul className="mt-2 list-disc pl-4">
                      {testResult.recommendations.map((rec) => (
                        <li key={rec}>{rec}</li>
                      ))}
                    </ul>
                    <button
                      onClick={applyRecommendations}
                      className="mt-3 rounded-md bg-purple-600 px-3 py-2 text-xs text-white"
                    >
                      Apply Recommendations
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
