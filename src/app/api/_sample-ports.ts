/**
 * Ports used by the abridged API route samples.
 *
 * The route files in this folder show the request flow (auth guard ->
 * validation -> action dispatch -> response). Everything that touches storage,
 * secrets or third-party services is hidden behind the small interfaces below;
 * their real implementations are not part of this public sample.
 */
import type { NextRequest } from "next/server";

const omitted = (): never => {
  throw new Error("Implementation omitted in the public sample");
};

/** Throws an Error("UNAUTHORIZED") when the request is not made by a signed-in doctor. */
export const verifyAdmin = async (_req: NextRequest): Promise<void> => omitted();

/** Stores uploaded images and returns a public URL. */
export const imageStorage = {
  upload: async (_file: File): Promise<string> => omitted(),
  remove: async (_url: string): Promise<void> => omitted(),
};

/** Generic repository shape; each resource has its own typed instance in the real project. */
export interface Repo<T = Record<string, unknown>> {
  list(opts: { skip: number; limit: number }): Promise<{ items: T[]; total: number }>;
  get(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  save(entity: T): Promise<T>;
  remove(id: string): Promise<boolean>;
}

export const patients: Repo<any> & { codeExists(code: string): Promise<boolean> } = omitted() as never;
export const appointments: Repo<any> = omitted() as never;

/** Credential check + session handling for the doctor account. */
export const adminAuth = {
  verifyCredentials: async (_email: string, _password: string): Promise<{ id: string } | null> => omitted(),
  issueSessionCookie: (_adminId: string): string => omitted(), // returns a Set-Cookie header value
  clearSessionCookie: (): string => omitted(),
  createAdmin: async (_email: string, _password: string): Promise<void> => omitted(),
};
