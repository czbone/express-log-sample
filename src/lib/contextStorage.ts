import { AsyncLocalStorage } from 'async_hooks'
import { Request, Response } from 'express'
import shortid from 'short-uuid'

export interface IBody {
  [key: string]: string
}
export interface IContext {
  requestId: string
  url: string
  ip: string
  body: IBody
  bodySaved: IBody
}

class ContextStorage {
  static storage = new AsyncLocalStorage()
  requestId: string
  url: string
  ip: string | undefined
  body: IBody | undefined
  bodySaved: IBody | undefined

  constructor(
    private req: Request,
    private res: Response
  ) {
    // リクエスト情報を取得
    const requestId = shortid.generate()
    this.requestId = requestId
    this.url = req.originalUrl
    this.ip = req.ip
    if (Object.keys(req.body as object).length) this.body = req.body as IBody
  }

  static get context(): IContext {
    return this.storage.getStore() as IContext
  }
}

export default ContextStorage
