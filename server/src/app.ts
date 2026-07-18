import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from '@/config/env.js'
import { errorHandlerMiddleware } from '@/middlewares/errorHandler.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { apiRouter } from '@/routes/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')

export const app = express()

// crossOriginResourcePolicy: cross-origin เพราะ client (5173) ต้องโหลดรูปจาก server (4000) คนละ origin
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: env.clientOrigin }))
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'))
}
app.use(express.json())
app.use(express.static(publicDir))
app.use(authMiddleware)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', apiRouter)

app.use(errorHandlerMiddleware)
