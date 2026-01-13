'use client';

import { useState } from 'react';

export default function StudyPage() {
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [studyId, setStudyId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [dnaJson, setDnaJson] = useState<Record<string, unknown> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!referenceFile) return;

    setIsSubmitting(true);
    setStatus('queued');
    setDnaJson(null);

    try {
      const uploadUrlResponse = await fetch('/api/study/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: referenceFile.name,
          contentType: referenceFile.type || 'video/mp4',
        }),
      });
      const uploadUrlData = await uploadUrlResponse.json();

      if (!uploadUrlResponse.ok) {
        throw new Error(uploadUrlData?.error ?? 'Failed to create upload URL');
      }

      const uploadResponse = await fetch(uploadUrlData.signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': referenceFile.type || 'video/mp4',
        },
        body: referenceFile,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload reference video');
      }

      const response = await fetch('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storage_path: uploadUrlData.storage_path,
          source_type: 'upload',
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? 'Failed to start study run');
      }

      const id = data.studyRun.id;
      setStudyId(id);
      setStatus(data.studyRun.status);
      setDnaJson(data.studyRun.dna_json);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to run study';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-white">Study</h1>
      <p className="mt-2 text-slate-300">
        Upload reference footage to extract Trailer DNA.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <label className="text-sm font-medium text-slate-200">
          Reference video upload
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={(event) => setReferenceFile(event.target.files?.[0] ?? null)}
          className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
        />
        <button
          onClick={handleSubmit}
          disabled={!referenceFile || isSubmitting}
          className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-500 disabled:bg-slate-700"
        >
          {isSubmitting ? 'Extracting DNA...' : 'Extract DNA'}
        </button>

        {studyId && (
          <div className="mt-4 text-sm text-slate-300">
            Study run: {studyId} • Status: {status}
          </div>
        )}

        {dnaJson && (
          <pre className="mt-4 rounded-lg bg-slate-950 p-4 text-xs text-slate-200">
            {JSON.stringify(dnaJson, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
