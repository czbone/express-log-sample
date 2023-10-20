import mongoose from 'mongoose'
import { dbLogger } from '../lib/logger'

export const initDB = async () => {
  // MongoDB初期接続
  try {
    mongoose.set('strictQuery', false)
    await mongoose.connect(process.env.MONGO_URI!) //「!」で文字列にキャスト

    dbLogger.info('[MongoDB] connection established.')
  } catch (err) {
    dbLogger.error('[MongoDB]', err)
    throw new Error('[MongoDB] Critical System error.') // uncaughtExceptionを発生させシステム終了
  }
}
