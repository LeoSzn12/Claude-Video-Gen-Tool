'use client';

import { useEffect, useState } from 'react';

interface Job {
  id: string;
  status: string;
  progress: number;
  parent_job_id?: string | null;
  outputs_json?: {
    video_url?: string;
    voice_url?: string;
    sceneImages?: string[];
  };
  created_at: string;
}

export default function RendersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs?limit=10');
        const data = await response.json();
        if (response.ok) {
          setJobs(data.jobs ?? []);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const grouped = jobs.reduce<Record<string, { parent: Job; remixes: Job[] }>>((acc, job) => {
    const key = job.parent_job_id ?? job.id;
    if (!acc[key]) {
      acc[key] = { parent: job.parent_job_id ? null : job, remixes: [] } as any;
    }
    if (job.parent_job_id) {
      acc[key].remixes.push(job);
    } else {
      acc[key].parent = job;
    }
    return acc;
  }, {});

  const groupedJobs = Object.values(grouped);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-white">Renders</h1>
      <p className="mt-2 text-slate-300">
        View your trailer job history and outputs.
      </p>

      <div className="mt-6 space-y-4">
        {isLoading && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-slate-300">
            Loading renders...
          </div>
        )}
        {!isLoading && jobs.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-slate-300">
            No renders yet.
          </div>
        )}
        {groupedJobs.map((group) => {
          const parent = group.parent;
          if (!parent) return null;
          return (
            <div
              key={parent.id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm text-slate-400">Job {parent.id}</div>
                  <div className="text-lg font-semibold text-white capitalize">
                    {parent.status}
                  </div>
                </div>
                <div className="text-sm text-slate-300">{parent.progress}%</div>
              </div>
              <div className="mt-3 text-xs text-slate-400">
                {new Date(parent.created_at).toLocaleString()}
              </div>
              {parent.outputs_json?.video_url && (
                <div className="mt-3 text-sm text-purple-200">
                  <video
                    src={parent.outputs_json.video_url}
                    controls
                    className="mt-2 w-full rounded-lg border border-slate-800"
                  />
                </div>
              )}
              {group.remixes.length > 0 && (
                <div className="mt-4 border-t border-slate-800 pt-4">
                  <div className="text-xs uppercase text-slate-400">Remixes</div>
                  <div className="mt-3 space-y-3">
                    {group.remixes.map((remix) => (
                      <div key={remix.id} className="rounded-lg border border-slate-800 p-3">
                        <div className="flex items-center justify-between text-sm text-slate-300">
                          <span>Remix {remix.id}</span>
                          <span>{remix.status}</span>
                        </div>
                        {remix.outputs_json?.video_url && (
                          <video
                            src={remix.outputs_json.video_url}
                            controls
                            className="mt-2 w-full rounded-lg border border-slate-800"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
