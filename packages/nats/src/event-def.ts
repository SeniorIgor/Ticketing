/* eslint-disable @typescript-eslint/no-explicit-any */
import type { z } from 'zod';

export type EventDef<TSubject extends string, TData> = {
  subject: TSubject;
  type: string; // e.g. "TicketCreated"
  version: number;
  schema: z.ZodType<TData>;
};

export type EventFamily<TSubject extends string> = {
  subject: TSubject;
  type: string;
  schemaByVersion: Record<number, z.ZodTypeAny>;
  latestVersion?: number;
};

export function defineEvent<TSubject extends string, TData>(def: EventDef<TSubject, TData>) {
  return def;
}

export function defineEventFamily<TSubject extends string>(def: EventFamily<TSubject>) {
  return def;
}

export function isEventFamily<TSubject extends string>(
  def: EventDef<TSubject, any> | EventFamily<TSubject>,
): def is EventFamily<TSubject> {
  return (def as EventFamily<TSubject>).schemaByVersion !== undefined;
}

export function getLatestVersion(family: EventFamily<any>): number {
  if (family.latestVersion != null) {
    return family.latestVersion;
  }

  const versions = Object.keys(family.schemaByVersion)
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n));

  if (versions.length === 0) {
    throw new Error('EventFamily.schemaByVersion must not be empty');
  }

  return Math.max(...versions);
}

export function getSchemaForVersion(
  def: EventDef<any, any> | EventFamily<any>,
  version: number,
): z.ZodTypeAny | undefined {
  if (!isEventFamily(def)) {
    return def.version === version ? def.schema : undefined;
  }

  return def.schemaByVersion[version];
}
