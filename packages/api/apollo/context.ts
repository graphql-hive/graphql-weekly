import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { User } from './schema'

const prisma = new PrismaClient()

export interface Context {
  prisma: PrismaClient
  user: User | null
}

const getAuth = (event: any) => {
  try {
    const token = event.headers.authorization
    if (!token) {
      console.log('no token')
      return null
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET)
    return { sub: decoded.sub }
  } catch (err) {
    console.log(err)
    return null
  }
}

export function createContext(req: any): Context {
  return { prisma, user: getAuth(req) }
}
