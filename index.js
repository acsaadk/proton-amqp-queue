'use strict'

const co = require('co')

module.exports = class AMQPQueue {

  constructor(channel, name) {
    this._channel = channel
    this._name = name
    const _this = this
    this._channel.on('close', () => _this.onClose())
    this._channel.on('error', err => _this.onError(err))
    this._channel.on('return', msg => _this.onReturn(msg))
    this._channel.on('drain', () => _this.onDrain())
    this._channel.consume(this._name, msg => co.wrap(_this.consume.bind(_this))(msg), this.consumeOptions)
  }

/**
  * @method url
  * @description This method must be overriden to specify the url connection
  * @throws Error by default if it's not implemented
  * @returns String containing the url of AMQP server
  * @author Antonio Saad
*/
  static get url() {
    throw new Error('You must implement the `static get url()` getter method, returning a string with the url to connect to AMQP server')
  }

/**
  * @method socketOptions
  * @description This method can be overriden to specify options for the socket connection.
  * For more info, check: http://www.squaremobius.net/amqp.node/channel_api.html#connect
  * @returns undefined by default, otherwise it must return a JSON with the options
  * @author Antonio Saad
*/
  static get socketOptions() {
    return undefined
  }

/**
  * @method customName
  * @description This method can be overriden to set a specific name for the queue.
  * A tipical use case could be to use the object with an existing queue.
  * @returns undefined or any falsey value to indicate that the name should be
  * the class's name, otherwise it must return a string with the desired name. If
  * the returned value is an empty string, the AMQP server will generate a random
  * name for the queue
*/
  static get customName() {
    return undefined
  }

/**
  * @method options
  * @description This method can be overriden to specify a JSON with options for creating the queue.
  * For more info, check: http://www.squaremobius.net/amqp.node/channel_api.html#channel_assertQueue
  * @returns undefined by default, otherwise it must return a JSON
  * @author Antonio Saad
*/
  static get options() {
    return undefined
  }

/**
  * @method beforeCreateChannel
  * @description Invoked before creating the channel for this queue
  * @param conn Object Connection to the AMQP server.
  * WARNING: This connection is the underlying socket shared between all the
  * created channels, so any change will affect all channels
  * @author Antonio Saad
*/
  static *beforeCreateChannel(conn) {

  }

/**
  * @method consumeOptions
  * @description This method can be overriden to pass aditional options to the
  * consumer function.
  * For more info, check: http://www.squaremobius.net/amqp.node/channel_api.html#channel_consume
  * @returns undefined by default, otherwise it must be a JSON
*/
  get consumeOptions() {
    return undefined
  }

/**
  * @method bindings
  * @description This method can be overriden to specify bindings to exchanges
  * @returns Array of JSON objects with the following structure:
  * [
  *   {
  *      routingKey: "routing key pattern"
  *      source: "exchange name which wants to join",
  *      args: { OPTIONAL }
  *   },
  *   ...
  * ]
  * @author Antonio Saad
*/
  get bindings() {
    return []
  }

/**
  * @method name
  * @description Queue's name. It'll be the name of the child class
  * @returns string containing the queue's name
  * @author Antonio Saad
*/
  get name() {
    return this._name
  }

/**
  * @method channel
  * @description AMQP native channel
  * @returns Object to handle the underlying channel provided by the API.
  * For more info, check: http://www.squaremobius.net/amqp.node/channel_api.html#channel
  * @author Antonio Saad
*/
  get channel() {
    return this._channel
  }

/**
  * @method askForMessages
  * @description Asks for a message
  * @param opts JSON with one meaningfull attribute:
  * - noAck (boolean): if true, the message will be assumed by the server to be
  *                    acknowledged. Default is false
  * @param cb Callback to execute to handle the possible message
  * @returns Promise if no callback specified
  * @author Antonio Saad
*/
  askForMessages(opts, cb) {
    return this._channel.get(this._name, opts, cb)
  }

/**
  * @method consume
  * @description This method must be overriden to handle the incoming messages
  * @param msg Buffer The incoming message
  * @author Antonio Saad
*/
  consume(msg) {
    throw new Error('You must implement the `consume(msg)` method to get the incoming message')
  }

/**
  * @method closeChannel
  * @description Closes the channel
  * @param cb Callback to execute after the channel is closed.
  * It has the following format: function(err) {...}
  * @returns Promise if no callback specified
  * @author Antonio Saad
*/
  closeChannel(cb) {
    return this._channel.close(cb)
  }

/**
  * @method ack
  * @description Acknowledge the given message, or all messages up to and including the given message
  * @param msg The message to be acknoledged
  * @param allUpTo (boolean) If true, all outstanding messages prior to and including
  * the given message shall be considered acknoledged
  * @author Antonio Saad
*/
  ack(msg, allUpTo) {
    return this._channel.ack(msg, allUpTo)
  }

/**
  * @method ackAll
  * @description Acknowledge all outstanding messages on the channel
  * @author Antonio Saad
*/
  ackAll() {
    return this._channel.ackAll()
  }

/**
  * @method nack
  * @description Reject a message. This instructs the server to either requeue
  * the message or throw it away.
  * @param msg The message to be rejected
  * @param allUpTo (boolean) If true, all outstanding messages prior to and including
  * the given message shall be considered acknoledged
  * @param requeue (boolean) If true, the server will try to put the message or messages
  * back on the queue or queues from which they came. Defaults to true.
  * @author Antonio Saad
*/
  nack(msg, allUpTo, requeue) {
    return this._channel.nack(msg, allUpTo, requeue)
  }

/**
  * @method nackAll
  * @description Reject all messages outstanding on this channel
  * @param requeue (boolean) If true or omitted, the server will try to re-queue
  * the messages
  * @author Antonio Saad
*/
  nackAll(requeue) {
    return this._channel.nackAll(requeue)
  }

/**
  * @method reject
  * @description Reject a message. Equivalent to make nack(msg, false, true)
  * @param msg The message to be rejected
  * @param requeue (boolean) If true, the server will try to put the message or messages
  * back on the queue or queues from which they came. Defaults to true.
  * @author Antonio Saad
*/
  reject(msg, requeue) {
    return this._channel.reject(msg, requeue)
  }

/**
  * @method prefetch
  * @description Set the prefetch count for this channel
  * @param count The maximum number of messages sent over the channel that can be
  * awaiting acknowledgement.
  * @param global (boolean) Use this flag to get the per-channel behaviour
  * @author Antonio Saad
*/
  prefetch(count, global) {
    return this._channel.prefetch(count, global)
  }

/**
  * @method recover
  * @description Requeue unacknowledged messages on this channel
  * @param cb Callback to execute after the messages have been requeued
  * @returns Promise if no callback specified
  * @author Antonio Saad
*/
  recover(cb) {
    return this._channel.recover(cb)
  }

/**
  * @method unbindFrom
  * @description Remove a binding to an exchange
  * @param exchangeName String source exchange name
  * @param pattern String Routing key pattern
  * @param args Object arguments extension
  * @param cb Callback to execute after exchange binding has been removed
  * It has the following format: function(err, ok) {...}
  * @returns Promise if no cb specified
  * @author Antonio Saad
*/
  unbindFrom(exchangeName, pattern, args, cb) {
    return this._channel.unbindQueue(this._name, exchangeName, args, cb)
  }

/**
  * @method destroy
  * @description Delete an exchange from the AMQP server
  * @param opts The available fields are:
              - ifUnused (boolean): if true and the exchange has bindings,
                it will not be deleted and the channel will be closed.
              - ifEmpty (boolean): if true and the queue contains messages,
                the queue will not be deleted and the channel will be closed.
  * @returns Promise
  * @author Antonio Saad
*/
  destroy(opts) {
    return this._channel.deleteQueue(this._name, opts)
  }

/**
  * @method purge
  * @description Remove all undelivered messages from the queue
  * @param cb Callback to execute after all undelivered messages have been removed
  * @return Promise if no callback specified
  * @author Antonio Saad
*/
  purge(cb) {
    return this._channel.purgeQueue(this._name, cb)
  }

/**
  * @method onClose
  * @description Invoked when channel has been clossed
  * @author Antonio Saad
*/
  onClose() {

  }

/**
  * @method onError
  * @description Invoked when the server closes the channel for any reason
  * @param err Object containing the error
  * @author Antonio Saad
*/
  onError(err) {

  }

/**
  * @method onReturn
  * @description Invoked when the published message cannot be routed
  * @param msg Buffer the returned message
  * @author Antonio Saad
*/
  onReturn(msg) {

  }

/**
  * @method onDrain
  * @description Invoked once the write buffer has been emptied (i.e., once it is
  * ready for writes again)
  * @author Antonio Saad
*/
  onDrain() {

  }
}
