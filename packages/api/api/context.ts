import jwt from 'jsonwebtoken'
import { User } from './schema'

export interface Context {
  user: User | null
}

const getAuth = (event: Request) => {
  try {
    const token = event.headers.get('authorization')
    if (!token) {
      return null
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!)
    return { sub: decoded.sub }
  } catch (err) {
    console.log(err)
    return null
  }
}

export function createContext(event: Request): Context {
  return { user: getAuth(event) }
}
