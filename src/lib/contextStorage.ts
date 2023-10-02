import { AsyncLocalStorage } from 'async_hooks'
import { Request, Response } from 'express'
import shortid from 'shortid'

interface IContext {
	requestId: string
	ip: string
	url: string
	body: string
}

class ContextStorage {
	static storage = new AsyncLocalStorage()
	requestId: string
	ip: string
	url: string
	body: string

	static get context(): IContext {
		return this.storage.getStore() as IContext
	}

	// request情報とresponse情報も格納しておけば様々なデータをログに記録できる
	constructor(
		private req: Request,
		private res: Response //public req: Request,
	) //public res: Response
	{
		// ここでログに利用したいデータを作成
		const requestId = shortid.generate() // サンプル:QiwPqO_fH
		this.requestId = requestId
		this.ip = req.ip
		this.url = req.originalUrl
		this.body = ''
		if (Object.keys(req.body as object).length) this.body = JSON.stringify(req.body)
	}
}

export default ContextStorage
