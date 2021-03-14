/**
 * 实现promiseA+规范的promise
*/

const PENDING = 'pending',
    FULFILLED = 'fulfilled',
    REJECTED = 'rejectd',
    isObject = x => x !== null && typeof x === 'object'
    // Promise 解决过程
    ressolvePromise = (promise2, x , resolve, reject) => {
        // x 与 promise 相等, 以 TypeError 为据因拒绝执行 promise
        if(promise2 === x){
            reject(new TypeError('instance promise not return'))
            // 如果 x 为 Promise ，则使 promise 接受 x 的状态
        } else if(x instanceof Promise){
            x.then(value => ressolvePromise(promise2, value , resolve, reject), reject)
            // 如果 x 为对象或者函数
        } else if(isObject(x) || typeof x === 'function'){
            // 被同一参数调用了多次，则优先采用首次调用并忽略剩下的调用
            let called = false
            try {
                // 如果取 x.then 的值时抛出错误 e ，则以 e 为据因拒绝
                let then = x.then
                // 如果 then 是函数，将 x 作为函数的作用域 this 调用
                if(typeof then === 'function'){
                    then.call(x, value => {
                        if(called) return
                        called = true
                        ressolvePromise(promise2, value , resolve, reject)
                    }, reason => {
                        if(called) return
                        called = true
                        reject(reason)
                    })
                } else {
                    if(called) return
                        called = true
                    resolve(x)
                }
            } catch (error) {
                if(called) return
                called = true
                reject(error)
            }
            
        } else {
            // 如果 x 不为对象或者函数，以 x 为参数执行 promise
            resolve(x)
        }

    }

    class Promise{
        constructor(executor) {
            if(typeof executor !== 'function') {
                throw new TypeError(`executor ${executor} is not function`)
            }
            this._status = PENDING
            this._value = this._reason = undefined
            this.onFulfilledCallbacks = []
            this.onRejectedCallbacks = []

            const resolve = value => {
                if(this._status !== PENDING) return 
                this._status = FULFILLED
                this._value = value
                this.onFulfilledCallbacks.forEach(fn => fn())
            }

            const reject = reason => {
                if(this._status !== PENDING) return 
                this._status = REJECTED
                this._reason = reason
                this.onRejectedCallbacks.forEach(fn => fn())
            }

            try {
                executor(resolve, reject)
            } catch (e) {
                reject(e)
            }

        }
        // promise 是一个拥有 then 方法的对象或函数
        then(onResolved, onRejected) {
            // 如果 onFulfilled , onRejected 不是函数，其必须被忽略
            onResolved = typeof onResolved === 'function' ? onResolved: value => value
            onRejected = typeof onRejected === 'function' ? onRejected: reason => { throw reason }
            // then 方法必须返回一个 promise 对象
            const instance = new Promise((resolve, reject) => {
                if(this._status === FULFILLED){
                    setTimeout(() => {
                        try {
                            let x = onResolved(this._value)
                            ressolvePromise(instance, x, resolve, reject)
                        } catch (error) {
                            reject(error)
                        }
                    })
                } else if(this._status === REJECTED){
                    setTimeout(() => {
                        try {
                            let x = onRejected(this._reason)
                            ressolvePromise(instance, x, resolve, reject)
                        } catch (error) {
                            reject(error)
                        }
                    })
                } else {
                    // 需按照其注册顺序依次回调
                    this.onFulfilledCallbacks.push(() => {
                        // onFulfilled 和 onRejected 只有在执行环境堆栈仅包含平台代码时才可被调用 
                        setTimeout(() => {
                            try {
                                // onFulfilled 和 onRejected 必须被作为函数调用（即没有 this 值）
                                let x = onResolved(this._value)
                                ressolvePromise(instance, x, resolve, reject)
                            } catch (error) {
                                reject(error)
                            }
                        })
                    })
                    this.onRejectedCallbacks.push(() => {
                        setTimeout(() => {
                            try {
                                let x = onRejected(this._reason)
                                ressolvePromise(instance, x, resolve, reject)
                            } catch (error) {
                                reject(error)
                            }
                        })
                    })
                }
            })
            return instance
        }
    }
    // 测试Promise是否符合PromiseA+规范
    Promise.defer = Promise.deferred = function () {
        let dfd = {}
        dfd.promise = new Promise((resolve,reject)=>{
          dfd.resolve = resolve;
          dfd.reject = reject;
        });
        return dfd;
    }
    module.exports = Promise