export type CurrentUser = {
  id: string;
  email: string;
};

export type ServerBootstrap = {
  currentUser: CurrentUser | null;
  serverTimeIso: string;
  // scalable fields for future:
  // locale?: string;
  // featureFlags?: Record<string, boolean>;
  // permissions?: string[];
};

export type ServerBootstrapResult =
  | { ok: true; data: ServerBootstrap }
  | { ok: false; error: { message: string; status?: number } };
