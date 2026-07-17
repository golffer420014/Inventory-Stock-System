import cors from 'cors'
import express from 'express'
import { env } from '@/config/env.js'
import { errorHandlerMiddleware } from '@/middlewares/errorHandler.middleware.js'
import { authMiddleware } from '@/middlewares/auth.middleware.js'
import { apiRouter } from '@/routes/index.js'

export const app = express()

app.use(cors({ origin: env.clientOrigin }))
app.use(express.json())
app.use(authMiddleware)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', apiRouter)

app.use(errorHandlerMiddleware)
