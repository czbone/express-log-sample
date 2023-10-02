import winston, { format, transports } from 'winston'
import ContextStorage from '../lib/contextStorage'

type AsyncErrorParam = {
	message: unknown
	stack: string | undefined
	args: object | undefined
}

const customFormat = format((info) => {
	if (info instanceof Error) {
		console.log('#Error object found(2)')
		info = Object.assign(
			{
				message: info.message as string,
				stack: info.stack
			},
			info
		)
	} else if (info.message instanceof Error) {
		console.log('#Error object found(1)')
		info = Object.assign(info, {
			message: info.message.message,
			stack: info.stack ? (info.stack as string) : info.message.stack
		})
	}

	// リクエスト情報
	if (ContextStorage.context?.requestId) {
		info.requestId = ContextStorage.context?.requestId
		info.ip = ContextStorage.context?.ip
		info.url = ContextStorage.context?.url
		if (ContextStorage.context?.body) info.body = ContextStorage.context?.body
	}
	return info
	/*
	console.log(ContextStorage.context?.requestId)
		console.log(ContextStorage.context?.url)
		console.log(ContextStorage.context.req.originalUrl) // コンテキストからHTTPリクエストも参照できる(contextがany型の場合)
		console.log(ContextStorage.context)
	 */
})

const options = {
	app_file: {
		level: 'info', // info以上を出力
		filename: 'logs/app.log',
		//handleExceptions: true, // サーバの例外(uncaughtException等)を出力する
		maxsize: 5242880, // 5MB
		maxFiles: 5,
		format: format.combine(format.json())
	},
	db_file: {
		level: 'info', // info以上を出力
		filename: 'logs/db.log',
		//handleExceptions: true, // サーバの例外(uncaughtException等)を出力する
		maxsize: 5242880, // 5MB
		maxFiles: 5,
		format: format.combine(format.json())
	},
	// ### VSCodeから起動の場合はデバッグコンソールに出力
	console: {
		level: 'debug', // debug以上を出力
		//handleExceptions: true, // サーバの例外(uncaughtException等)を出力する
		format: format.combine(
			format.colorize(), // メッセージレベルをカラー化
			// Errorオブジェクトが引数の場合stackに値がセットされる
			format.printf(({ level, message, timestamp, stack, requestId }) => {
				let messageFormat = `[${timestamp}] [${level}]`
				if (requestId) messageFormat += ` [${requestId}]`
				if (stack) {
					return (messageFormat += ` ${message}\n  ${stack}`)
					//return `[${timestamp}] [${level}] [${requestId}] ${message}\n  ${stack}`
				} else {
					// messageがErrorオブジェクトの場合
					if (message.stack) {
						return (messageFormat += ` ${message.message}\n  ${message.stack}`)
						//return `[${timestamp}] [${level}] [${requestId}] ${message.message}\n  ${message.stack}`
					} else {
						return (messageFormat += ` ${message}`)
						//return `[${timestamp}] [${level}] [${requestId}] ${message}`
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

// ##### カスタムフォーマットはすべてのtransportの共通になるように設定する #####
container.add('applog', {
	format: format.combine(
		customFormat(),
		format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss' // タイムスタンプを付加
		})
	),
	transports: appTransports
})
container.add('dblog', {
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

//const asyncWrapper = async (func: (...args: any[]) => Promise<any>): Promise<any> => {
const asyncWrapper = async (func: Promise<object>): Promise<unknown> => {
	try {
		const data = await func
		return data as Promise<unknown>
	} catch (err) {
		//dbLogger.error(err)

		dbLogger.error({
			message: err,
			stack: getStackTrace()
		})
		return null
	}
}
const getStackTrace = () => {
	const err = new Error()
	Error.captureStackTrace(err, getStackTrace)
	//return err.stack

	// スタックトレースのタイトルを「Trace」に変更
	const trace = 'Trace\n' + err.stack?.split('\n').slice(1).join('\n') // １行目(タイトル部分)を除いたスタックトレース取得
	return trace
}

export { AsyncErrorParam, appLogger, asyncWrapper, dbLogger, getStackTrace }
