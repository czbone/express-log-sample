import mongoose from 'mongoose'
import { AsyncErrorParam, dbLogger, getStackTrace } from '../lib/logger'
import { userRoles } from '../types/role'

const { roles } = userRoles()

const schema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: roles,
      default: 'user'
    }
  },
  {
    timestamps: true, // createdAt,updatedAtのタイムスタンプ追加
    statics: {
      async initData(): Promise<any> {
        try {
          await User.deleteMany({})

          const user = await User.create({
            email: 'admin@example.com',
            name: '管理者',
            password: 'password',
            role: 'admin'
          })
          return user
        } catch (err) {
          dbLogger.error({
            message: err,
            stack: getStackTrace(),
            args: undefined
          } as AsyncErrorParam) // パラメータの型を制限
          return null
        }
      },
      async addUser(args: {
        email: string
        password: string
        name: string
        role: string
      }): Promise<any> {
        try {
          const user = await User.create({
            email: args.email,
            password: args.password,
            name: args.name,
            role: args.role
          })
          return user
        } catch (err) {
          // エラーメッセージ出力
          dbLogger.error({
            message: err,
            stack: getStackTrace(),
            args: args,
            detail: '追加情報'
          } as AsyncErrorParam) // パラメータの型を制限
          return null
        }
      },
      async createNotFoundError(): Promise<any> {
        try {
          // ### Mongooseから例外が出ない場合でエラーメッセージを残したい場合は以下の方法で可能
          const users = await User.find({ email: 'none@example.com' })
          if (users.length) {
            return users
          } else {
            throw new Error('ユーザが見つかりません。')
          }
        } catch (err) {
          // エラーメッセージ出力
          dbLogger.error({
            message: err,
            stack: getStackTrace(),
            args: undefined
          } as AsyncErrorParam)
          return null
        }
      }
    }
  }
)

const User = mongoose.model('User', schema, 'user' /* MongoDBのコレクション名 */)

// コレクションのすべての「unique」ドキュメントにインデックスを張る
;(async () => {
  try {
    await User.createIndexes()
  } catch (err) {
    //dbLogger.error({ message: err, stack: getStackTrace() })
    // エラーメッセージ出力
    dbLogger.error({
      message: err,
      stack: getStackTrace(),
      args: undefined
    } as AsyncErrorParam)

    // ### initDB()でDBの接続チェックするのでここでは落とさない
    //throw new Error('[MongoDB] Critical System error.') // uncaughtExceptionを発生させシステム終了
  }
})()

export default User
