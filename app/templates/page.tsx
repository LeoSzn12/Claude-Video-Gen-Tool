'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Template {
  id: string;
  name: string;
  description?: string;
  status?: string;
  version?: number;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch('/api/templates');
        const data = await response.json();
        if (response.ok) {
          setTemplates(data.templates ?? []);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-white">Templates</h1>
      <p className="mt-2 text-slate-300">
        Browse Trailer DNA templates.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {isLoading && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-slate-300">
            Loading templates...
          </div>
        )}
        {!isLoading && templates.length === 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-slate-300">
            No templates found.
          </div>
        )}
        {templates.map((template) => (
          <Link
            key={template.id}
            href={`/templates/${template.id}`}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-purple-500"
          >
            <h3 className="text-lg font-semibold text-white">{template.name}</h3>
            <p className="mt-2 text-sm text-slate-300">
              {template.description ?? 'No description yet.'}
            </p>
            <div className="mt-3 text-xs text-slate-400">
              {template.status ?? 'draft'} • v{template.version ?? 1}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
