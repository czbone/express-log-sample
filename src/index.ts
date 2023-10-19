import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import morgan from 'morgan'
import path from 'node:path'
import { initDB } from './db/mongoDB'
import ContextStorage from './lib/contextStorage'
import { appLogger } from './lib/logger'
import router from './routes'

dotenv.config()

const port = process.env.SERVER_PORT
const app = express()
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev')) // デバッグ時ログ出力
app.use(express.json())

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, 'public')))

// ルーティング設定
app.use((req, res, next) => {
	// コンテキスト機能組み込み
	ContextStorage.storage.run(new ContextStorage(req, res), () => {
		next()
	})
})

// home page
app.get('/', (req: Request, res: Response) => {
	res.render('index')
})

// APIをルーティング
app.use('/api', router)

// サーバ起動
const run = async () => {
	try {
		// MongoDB接続初期化
		await initDB()

		app.listen(port, () => {
			appLogger.info(`サーバが開始されました: http://localhost:${port}`)
		})
	} catch (err) {
		// システム異常終了
		appLogger.error(err)

		// exitイベントでログをとる
		process.exitCode = 10
	}
}
run().catch(console.dir)

// プロセス終了処理
process.on('exit', (exitCode) => {
	if (exitCode === 0) {
		appLogger.info('サーバが終了しました')
	} else {
		appLogger.error(`サーバが異常終了しました: 終了コード=${exitCode}`)
	}
	appLogger.end()
})
process.on('SIGINT', () => process.exit(0))
process.on('SIGTERM', () => process.exit(0))
