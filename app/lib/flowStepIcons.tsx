'use client';

import {
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  FlagIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  UserGroupIcon,
  StarIcon,
  PencilSquareIcon,
  BuildingOfficeIcon,
  CheckBadgeIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';

export type FlowStepIconKey =
  | 'flag'
  | 'calendar'
  | 'document'
  | 'clipboard'
  | 'envelope'
  | 'users'
  | 'clock'
  | 'star'
  | 'chat'
  | 'pencil'
  | 'building'
  | 'badge'
  | 'academic';

export const DEFAULT_FLOW_STEP_ICON: FlowStepIconKey = 'flag';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export const FLOW_STEP_ICON_OPTIONS: {
  key: FlowStepIconKey;
  label: string;
  Icon: IconComponent;
}[] = [
  { key: 'flag', label: 'Milestone', Icon: FlagIcon },
  { key: 'calendar', label: 'Date', Icon: CalendarIcon },
  { key: 'document', label: 'Document', Icon: DocumentTextIcon },
  { key: 'clipboard', label: 'Review', Icon: ClipboardDocumentCheckIcon },
  { key: 'envelope', label: 'Message', Icon: EnvelopeIcon },
  { key: 'users', label: 'Interview', Icon: UserGroupIcon },
  { key: 'clock', label: 'Waiting', Icon: ClockIcon },
  { key: 'star', label: 'Selection', Icon: StarIcon },
  { key: 'chat', label: 'Discussion', Icon: ChatBubbleLeftRightIcon },
  { key: 'pencil', label: 'Application', Icon: PencilSquareIcon },
  { key: 'building', label: 'Organization', Icon: BuildingOfficeIcon },
  { key: 'badge', label: 'Approval', Icon: CheckBadgeIcon },
  { key: 'academic', label: 'Training', Icon: AcademicCapIcon },
];

const ICON_MAP = Object.fromEntries(
  FLOW_STEP_ICON_OPTIONS.map(({ key, Icon }) => [key, Icon])
) as Record<FlowStepIconKey, IconComponent>;

export function isFlowStepIconKey(value: string | undefined): value is FlowStepIconKey {
  return Boolean(value && value in ICON_MAP);
}

export function resolveFlowStepIcon(icon?: string): FlowStepIconKey {
  return isFlowStepIconKey(icon) ? icon : DEFAULT_FLOW_STEP_ICON;
}

export function FlowStepIcon({
  icon,
  className = 'h-5 w-5',
}: {
  icon?: string;
  className?: string;
}) {
  const key = resolveFlowStepIcon(icon);
  const Icon = ICON_MAP[key];
  return <Icon className={className} aria-hidden />;
}
