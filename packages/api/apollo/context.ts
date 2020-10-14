import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { User } from './schema'

const prisma = new PrismaClient()

export interface Context {
  prisma: PrismaClient
  user: User | null
}

const getAuth = (req: any) => {
  try {
    const token = req.headers.authorization
    if (!token) {
      return null
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET)
    return { sub: decoded.sub }
  } catch (err) {
    return null
  }
}

export function createContext(req: any): Context {
  return { prisma, user: getAuth(req) }
}
