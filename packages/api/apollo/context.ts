import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { User } from './schema'
import { IncomingEvent } from '@as-integrations/aws-lambda'; 

const prisma = new PrismaClient()

export interface Context {
  prisma: PrismaClient
  user: User | null
}

const getAuth = (event: IncomingEvent) => {
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

export function createContext(event: IncomingEvent): Context {
  return { prisma, user: getAuth(event) }
}
