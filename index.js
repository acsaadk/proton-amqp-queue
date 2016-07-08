'use strict'

module.exports = class AMQPQueue {

  constructor(channel, name) {
    this._channel = channel
    this._name = name
    const _this = this
    this._channel.on('close', () => _this.onClose())
    this._channel.on('error', err => _this.onError(err))
    this._channel.on('return', msg => _this.onReturn(msg))
    this._channel.on('drain', () => _this.onDrain())
    this._channel.consume(this._name, this.consume.bind(this), this.consumeOptions)
  }

  static get url() {
    throw new Error('You must implement the `static get url()` getter method, returning a string with the url to connect to AMQP server')
  }

  static get socketOptions() {
    return undefined
  }

  static get options() {
    return undefined
  }

  static *beforeCreateChannel(conn) {

  }

  get consumeOptions() {
    return undefined
  }

  get bindings() {
    return []
  }

  get name() {
    return this._name
  }

  get channel() {
    return this._channel
  }

  askForMessages(opts, cb) {
    return this._channel.get(this._name, opts, cb)
  }

  consume(msg) {
    throw new Error('You must implement the `consume(msg)` method to get the incoming message')
  }

  closeChannel(cb) {
    return this._channel.close(cb)
  }

  ack(msg, allUpTo) {
    return this._channel.ack(msg, allUpTo)
  }

  ackAll() {
    return this._channel.ackAll()
  }

  nack(msg, allUpTo, requeue) {
    return this._channel.nack(msg, allUpTo, requeue)
  }

  nackAll(requeue) {
    return this._channel.nackAll(requeue)
  }

  reject(msg, requeue) {
    return this._channel.reject(msg, requeue)
  }

  prefetch(count, global) {
    return this._channel.prefetch(count, global)
  }

  recover(cb) {
    return this._channel.recover(cb)
  }

  unbindFrom(exchangeName, pattern, args, cb) {
    return this._channel.unbindQueue(this._name, exchangeName, args, cb)
  }

  destroy(opts) {
    return this._channel.deleteQueue(this._name, opts)
  }

  purge(cb) {
    return this._channel.purgeQueue(this._name, cb)
  }

  onClose() {

  }

  onError(err) {

  }

  onReturn(msg) {

  }

  onDrain() {

  }
}
