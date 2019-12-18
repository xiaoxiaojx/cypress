import debugModule from 'debug'
import { Request } from 'request'
import { Readable } from 'stream'
import { HttpMiddleware } from './'

const debug = debugModule('cypress:proxy:http:error-middleware')

export type ErrorMiddleware = HttpMiddleware<{
  error: Error
  incomingResStream?: Readable
  outgoingReq?: Request
}>

const LogError: ErrorMiddleware = function () {
  debug('error proxying request %o', {
    error: this.error,
    url: this.req.url,
    headers: this.req.headers,
  })

  this.next()
}

export const AbortRequest: ErrorMiddleware = function () {
  if (this.outgoingReq) {
    debug('aborting outgoingReq')
    this.outgoingReq.abort()
  }

  this.next()
}

export const UnpipeResponse: ErrorMiddleware = function () {
  if (this.incomingResStream) {
    debug('unpiping resStream from response')
    this.incomingResStream.unpipe()
  }

  this.next()
}

export const DestroyResponse: ErrorMiddleware = function () {
  this.res.destroy()
  this.end()
}

export default {
  LogError,
  AbortRequest,
  UnpipeResponse,
  DestroyResponse,
}
