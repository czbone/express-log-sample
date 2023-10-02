import { Router } from 'express'
import { UserController } from '../controllers'

const router = Router()
router.get('/init', UserController.initData)
router.get('/error1', UserController.errorPattern1)
router.get('/error2', UserController.errorPattern2)
router.get('/error3', UserController.errorPattern3)
export default router
