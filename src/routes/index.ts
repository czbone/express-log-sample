import { NextFunction, Request, RequestHandler, Response, Router } from 'express'
import userRouter from './user'

const router = Router()

router.use(
  '/user',
  (req: Request, res: Response, next: NextFunction) => {
    next()
  },
  userRouter as RequestHandler
) // ユーザ情報

export default router
