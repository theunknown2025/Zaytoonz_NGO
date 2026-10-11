'use client';

import { ArrowDownIcon, ArrowUpIcon, PlusIcon, TrashIcon, TagIcon } from '@heroicons/react/24/outline';
import {
  QUALIFICATION_GROUP_COLORS,
  getQualificationGroupColorClasses,
  type QualificationGroup,
} from '@/app/lib/qualificationGroups';

interface QualificationGroupsEditorProps {
  groups: QualificationGroup[];
  onChange: (groups: QualificationGroup[]) => void;
  error?: string;
}

export default function QualificationGroupsEditor({ groups, onChange, error }: QualificationGroupsEditorProps) {
  const updateGroup = (id: string, patch: Partial<QualificationGroup>) => {
    onChange(groups.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  };

  const removeGroup = (id: string) => {
    onChange(groups.filter((g) => g.id !== id).map((g, i) => ({ ...g, sortOrder: i })));
  };

  const moveGroup = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= groups.length) return;
    const next = [...groups];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((g, i) => ({ ...g, sortOrder: i })));
  };

  const addGroup = () => {
    const color = QUALIFICATION_GROUP_COLORS[groups.length % QUALIFICATION_GROUP_COLORS.length];
    onChange([
      ...groups,
      { id: `temp-${Date.now()}-${groups.length}`, label: '', color, sortOrder: groups.length },
    ]);
  };

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-[#556B2F]/10 to-[#6B8E23]/10 px-4 py-3 border-b border-gray-200">
        <h3 className="text-base font-medium text-[#556B2F] flex items-center">
          <TagIcon className="h-4 w-4 mr-2" />
          Qualification Groups
        </h3>
        <p className="mt-1 text-xs text-gray-600">
          Define the groups you will sort applications into in Application Management. Rename them or add more as needed.
        </p>
      </div>

      <div className="p-4 space-y-3">
        {groups.map((group, index) => {
          const colors = getQualificationGroupColorClasses(group.color);
          return (
            <div key={group.id} className="flex flex-wrap items-center gap-3 rounded-md border border-gray-200 p-3">
              <span className={`h-3 w-3 rounded-full flex-shrink-0 ${colors.dot}`} />
              <input
                type="text"
                value={group.label}
                onChange={(e) => updateGroup(group.id, { label: e.target.value })}
                placeholder="Group name"
                maxLength={50}
                className="flex-1 min-w-[160px] border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-2 focus:ring-[#556B2F] focus:border-[#556B2F]"
              />
              <div className="flex items-center gap-1">
                {QUALIFICATION_GROUP_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onClick={() => updateGroup(group.id, { color })}
                    className={`h-5 w-5 rounded-full ${getQualificationGroupColorClasses(color).dot} ${
                      group.color === color ? 'ring-2 ring-offset-1 ring-gray-700' : ''
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveGroup(index, -1)}
                  disabled={index === 0}
                  className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                  title="Move up"
                >
                  <ArrowUpIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveGroup(index, 1)}
                  disabled={index === groups.length - 1}
                  className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                  title="Move down"
                >
                  <ArrowDownIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => removeGroup(group.id)}
                  disabled={groups.length <= 1}
                  className="p-1 text-red-500 hover:text-red-700 disabled:opacity-30"
                  title="Remove group"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={addGroup}
          className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-dashed border-[#556B2F] text-[#556B2F] hover:bg-[#556B2F]/5"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add group
        </button>
      </div>
    </div>
  );
}
