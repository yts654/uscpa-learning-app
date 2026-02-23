import { getRedis } from "@/lib/redis"
import { RedisUserRepository } from "./RedisUserRepository"
import type { UserRepository } from "@/lib/domain/repositories/UserRepository"

let _repo: UserRepository | null = null

export function getUserRepository(): UserRepository {
  if (!_repo) {
    _repo = new RedisUserRepository(getRedis())
  }
  return _repo
}
