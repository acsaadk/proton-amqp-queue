'use strict'

require('dotenv').config()

const amqp = require('amqplib')
const AMQPQueueTest = require('./AMQPQueueTest.js')
const supertest = require('co-supertest')

describe('proton-amqp-queue class test', () => {
  it('should create a queue with the name of the class', function*() {
    const conn = yield amqp.connect(AMQPQueueTest.url, AMQPQueueTest.socketOptions)
    yield AMQPQueueTest.beforeCreateChannel(conn)
    const ch = yield conn.createChannel()
    yield ch.assertQueue('AMQPQueueTest', AMQPQueueTest.options)
    const queue = new AMQPQueueTest(ch, 'AMQPQueueTest')
    const bindings = queue.bindings
    for(let b in bindings){
      yield ch.bindQueue(queue.name, bindings[b].source, bindings[b].routingKey, bindings[b].args)
     }
    yield queue.destroy()
    yield queue.closeChannel()
    yield conn.close()
  })
})
