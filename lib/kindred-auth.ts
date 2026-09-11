import type { UserProfile } from "./kindred-data"

type Account = {
  password: string
  profile: UserProfile | null
}

type AccountStore = Record<string, Account>

const ACCOUNTS_KEY = "kindred-accounts"

function readStore(): AccountStore {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    return raw ? (JSON.parse(raw) as AccountStore) : {}
  } catch {
    return {}
  }
}

function writeStore(store: AccountStore) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(store))
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

/**
 * Verifies credentials against any previously saved account.
 * - Unknown email: creates and saves a new account with this password.
 * - Known email + matching password: succeeds.
 * - Known email + wrong password: fails.
 */
export function authenticate(email: string, password: string): { ok: true } | { ok: false; error: string } {
  const key = normalizeEmail(email)
  const store = readStore()
  const existing = store[key]

  if (!existing) {
    store[key] = { password, profile: null }
    writeStore(store)
    return { ok: true }
  }

  if (existing.password !== password) {
    return { ok: false, error: "That password doesn't match this account. Try again." }
  }

  return { ok: true }
}

export function getAccountProfile(email: string): UserProfile | null {
  const store = readStore()
  return store[normalizeEmail(email)]?.profile ?? null
}

export function saveAccountProfile(email: string, profile: UserProfile) {
  const key = normalizeEmail(email)
  const store = readStore()
  const existing = store[key]
  store[key] = { password: existing?.password ?? "", profile }
  writeStore(store)
}
