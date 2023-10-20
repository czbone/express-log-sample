import { NextFunction, Request, RequestHandler, Response } from 'express'
import { appLogger } from '../lib/logger'
import { User } from '../models'

class UserController {
  initData: RequestHandler = async (req: Request, res: Response, _next: NextFunction) => {
    appLogger.info('#データ初期化')

    const user = await User.initData()
    if (user) {
      appLogger.info('⇒ 正常に終了しました')
      res.json()
    } else {
      appLogger.error('⇒ エラーが発生しました')
      res.status(400).json({ message: 'エラーが発生しました' })
    }
  }
  errorPattern1: RequestHandler = async (req: Request, res: Response, _next: NextFunction) => {
    appLogger.info('#テストパターン1')

    // Validataionエラー(Mongooseのエラー)を発生するパターン
    const user = await User.addUser({
      email: 'user@example.com',
      name: '一般ユーザ',
      password: 'password',
      role: 'none' // 不正値
    })
    if (user) {
      appLogger.info('⇒ 正常に終了しました')
      res.json()
    } else {
      appLogger.error('⇒ エラーが発生しました')
      res.status(400).json({ message: 'エラーが発生しました' })
    }
  }
  errorPattern2: RequestHandler = async (req: Request, res: Response, _next: NextFunction) => {
    appLogger.info('#テストパターン2')

    // ユーザの二重登録エラー(MongoDBのエラー)を発生するパターン
    const user = await User.addUser({
      email: 'admin@example.com',
      name: 'sample',
      password: 'sample',
      role: 'admin'
    })
    if (user) {
      appLogger.info('⇒ 正常に終了しました')
      res.json()
    } else {
      appLogger.error('⇒ エラーが発生しました')
      res.status(400).json({ message: 'エラーが発生しました' })
    }
  }
  errorPattern3: RequestHandler = async (req: Request, res: Response, _next: NextFunction) => {
    appLogger.info('#テストパターン3')

    // 任意作成のエラーを発生するパターン
    const user = await User.createNotFoundError()
    if (user) {
      appLogger.info('⇒ 正常に終了しました')
      res.json()
    } else {
      appLogger.error('⇒ エラーが発生しました')
      res.status(400).json({ message: 'エラーが発生しました' })
    }
  }
}
export default new UserController()
