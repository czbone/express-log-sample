import winston, { format, transports } from 'winston'
import ContextStorage, { IBody } from '../lib/contextStorage'

const MAX_DATA_SIZE = 100 // POSTデータの最大長

interface AsyncErrorParam {
  message: Error
  stack: string
  args?: object
}
const customFormat = format((info) => {
  if (info instanceof Error) {
    info = Object.assign(
      {
        message: info.message as string,
        stack: info.stack
      },
      info
    )
  } else if (info.message instanceof Error) {
    info = Object.assign(info, {
      message: info.message.message,
      stack: info.stack ? (info.stack as string) : info.message.stack
    })
  }

  // リクエスト情報
  if (ContextStorage.context?.requestId) {
    if (info.level === 'info') {
      info.requestId = ContextStorage.context.requestId
      info.url = ContextStorage.context.url
    } else {
      info.requestId = ContextStorage.context.requestId
      info.url = ContextStorage.context.url
      info.ip = ContextStorage.context.ip

      if (ContextStorage.context.body) {
        if (!ContextStorage.context.bodySaved) {
          const destBody: IBody = {}
          const body = ContextStorage.context.body
          Object.keys(body).forEach((key) => {
            let data = body[key]
            const dataSizeInBytes = Buffer.from(data).length

            // 最大サイズまで取得
            if (dataSizeInBytes > MAX_DATA_SIZE) {
              data = data.slice(0, MAX_DATA_SIZE) + '…' // 省略記号付加
            }
            destBody[key] = data
          })
          ContextStorage.context.bodySaved = destBody
        }
        info.body = ContextStorage.context.bodySaved
      }
    }
  }
  return info
})

const options = {
  app_file: {
    level: 'info', // info以上を出力
    filename: 'logs/app.log',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: format.combine(format.json())
  },
  db_file: {
    level: 'info', // info以上を出力
    filename: 'logs/db.log',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    format: format.combine(format.json())
  },

  // コンソール出力
  // ### VSCodeから起動の場合はデバッグコンソールに出力
  console: {
    level: 'debug', // debug以上を出力
    format: format.combine(
      format.colorize(), // メッセージレベルをカラー化

      // Errorオブジェクトが引数の場合stackに値がセットされる
      format.printf(({ level, message, timestamp, stack, requestId }) => {
        let messageFormat = `[${timestamp}] [${level}]`
        if (requestId) messageFormat += ` [${requestId}]`
        if (stack) {
          return (messageFormat += ` ${message}\n  ${stack}`)
        } else {
          // messageがErrorオブジェクトの場合
          if (message.stack) {
            return (messageFormat += ` ${message.message}\n  ${message.stack}`)
          } else {
            return (messageFormat += ` ${message}`)
          }
        }
      })
    )
  }
}

const container = new winston.Container()
const appTransports = [
  new transports.File(options.app_file),
  new transports.Console(options.console)
]
const dbTransports = [new transports.File(options.db_file), new transports.Console(options.console)]

// ログフォーマットの設定
//  カスタムフォーマットはすべてのtransportの共通になるように設定する
container.add('applog', {
  levels: winston.config.syslog.levels, // alertメッセージが出せるようにする
  format: format.combine(
    customFormat(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss' // タイムスタンプを付加
    })
  ),
  transports: appTransports
})
container.add('dblog', {
  levels: winston.config.syslog.levels, // alertメッセージが出せるようにする
  format: format.combine(
    customFormat(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss' // タイムスタンプを付加
    })
  ),
  transports: dbTransports
})

const appLogger = container.get('applog')
const dbLogger = container.get('dblog')

const getStackTrace = () => {
  const err = new Error()
  Error.captureStackTrace(err, getStackTrace)

  // スタックトレースのタイトルを「Trace」に変更
  const trace = 'Trace\n' + err.stack?.split('\n').slice(1).join('\n') // １行目(タイトル部分)を除いたスタックトレース取得
  return trace
}

export { AsyncErrorParam, appLogger, dbLogger, getStackTrace }
