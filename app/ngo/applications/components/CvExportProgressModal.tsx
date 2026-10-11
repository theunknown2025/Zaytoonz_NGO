'use client';

import { ArrowDownTrayIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export interface CvExportProgress {
  done: number;
  total: number;
  finished: boolean;
  generated: number;
  failed: { candidateName: string; error: string }[];
}

export default function CvExportProgressModal({
  progress,
  onClose,
}: {
  progress: CvExportProgress;
  onClose: () => void;
}) {
  const percent = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center gap-3">
          {progress.finished ? (
            progress.failed.length > 0 ? (
              <ExclamationTriangleIcon className="h-8 w-8 text-amber-500" />
            ) : (
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            )
          ) : (
            <ArrowDownTrayIcon className="h-8 w-8 text-[#556B2F] animate-bounce" />
          )}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {progress.finished ? 'CVs ready' : 'Generating CVs…'}
            </h2>
            <p className="text-sm text-gray-600">
              {progress.finished
                ? `${progress.generated} of ${progress.total} CVs generated and downloaded`
                : `${progress.done} of ${progress.total} CVs generated`}
            </p>
          </div>
        </div>

        <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#556B2F] to-[#6B8E23] transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 text-right text-xs text-gray-500">{percent}%</p>

        {progress.finished && progress.failed.length > 0 && (
          <div className="mt-4 max-h-40 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-medium mb-1">Could not generate:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {progress.failed.map((f, i) => (
                <li key={i}>
                  {f.candidateName} — {f.error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {progress.finished && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[#556B2F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#465924]"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
