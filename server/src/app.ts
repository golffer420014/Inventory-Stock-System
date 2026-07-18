import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from '@/config/env.js'
import { errorHandlerMiddleware } from '@/middlewares/errorHandler.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { apiRouter } from '@/routes/index.js'

export const app = express()

app.use(helmet())
app.use(cors({ origin: env.clientOrigin }))
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'))
}
app.use(express.json())
app.use(authMiddleware)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', apiRouter)

app.use(errorHandlerMiddleware)
