import type { User } from '../types'

const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'authToken',
  EMAIL: 'userEmail'
}

export class StorageService {
  // User
  static setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  }

  static getUser(): User | null {
    const user = localStorage.getItem(STORAGE_KEYS.USER)
    return user ? JSON.parse(user) : null
  }

  // Token
  static setToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
  }

  static getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  }

  // Email (for compatibility)
  static setEmail(email: string): void {
    localStorage.setItem(STORAGE_KEYS.EMAIL, email)
  }

  static getEmail(): string | null {
    return localStorage.getItem(STORAGE_KEYS.EMAIL)
  }

  // Clear
  static clear(): void {
    localStorage.removeItem(STORAGE_KEYS.USER)
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.EMAIL)
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN)
  }
}
