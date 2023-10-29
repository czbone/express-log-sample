import { AsyncLocalStorage } from 'async_hooks'
import { Request, Response } from 'express'
import shortid from 'short-uuid'

interface IContext {
  requestId: string
  ip: string
  url: string
  body: string
}

class ContextStorage {
  static storage = new AsyncLocalStorage()
  requestId: string
  ip: string | undefined
  url: string
  body: string

  constructor(
    private req: Request,
    private res: Response
  ) {
    // リクエスト情報を取得
    const requestId = shortid.generate()
    this.requestId = requestId
    this.ip = req.ip
    this.url = req.originalUrl
    this.body = ''
    if (Object.keys(req.body as object).length) this.body = JSON.stringify(req.body)
  }

  static get context(): IContext {
    return this.storage.getStore() as IContext
  }
}

export default ContextStorage
