import type { ResumeProps } from '@/types';
import { migrateResume } from './resumeMigrate';

function normalizePathSegment(segment: string): string | number {
    return /^\d+$/.test(segment) ? Number(segment) : segment;
}

export function updateResumeValueAtPath(
    resume: ResumeProps,
    path: string,
    value: string | boolean,
): ResumeProps {
    const draft = JSON.parse(JSON.stringify(migrateResume(resume))) as ResumeProps;
    const segments = path.split('.').filter(Boolean).map(normalizePathSegment);

    if (!segments.length) {
        return draft;
    }

    let cursor: Record<string | number, unknown> = draft as unknown as Record<string | number, unknown>;

    for (let index = 0; index < segments.length - 1; index += 1) {
        const segment = segments[index];
        const nextSegment = segments[index + 1];
        const current = cursor[segment];

        if (current == null || typeof current !== 'object') {
            cursor[segment] = typeof nextSegment === 'number' ? [] : {};
        }

        cursor = cursor[segment] as Record<string | number, unknown>;
    }

    cursor[segments[segments.length - 1]] = value;

    return migrateResume(draft);
}

function resolveResumePathTarget(
    resume: ResumeProps,
    path: string,
): { draft: ResumeProps; target: unknown } {
    const draft = JSON.parse(JSON.stringify(migrateResume(resume))) as ResumeProps;
    const segments = path.split('.').filter(Boolean).map(normalizePathSegment);

    let cursor: unknown = draft;
    for (const segment of segments) {
        if (cursor == null || typeof cursor !== 'object') {
            return { draft, target: undefined };
        }
        cursor = (cursor as Record<string | number, unknown>)[segment];
    }

    return { draft, target: cursor };
}

export function insertResumeListItemAtPath<T>(
    resume: ResumeProps,
    path: string,
    item: T,
    index?: number,
): ResumeProps {
    const { draft, target } = resolveResumePathTarget(resume, path);
    if (!Array.isArray(target)) {
        return draft;
    }

    const nextIndex =
        typeof index === 'number' && index >= 0 && index <= target.length ? index : target.length;
    target.splice(nextIndex, 0, item);
    return migrateResume(draft);
}

export function removeResumeListItemAtPath(
    resume: ResumeProps,
    path: string,
    index: number,
): ResumeProps {
    const { draft, target } = resolveResumePathTarget(resume, path);
    if (!Array.isArray(target) || index < 0 || index >= target.length) {
        return draft;
    }

    target.splice(index, 1);
    return migrateResume(draft);
}
