const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class PromiseBee{
    constructor(executor) {
        this.PromiseState = PENDING
        this.PromiseResult = null
        this.PromiseFns = []
        const resolve = value => {
            // console.log('resolve', this)
            if(this.PromiseState !== PENDING) return
            this.PromiseState = FULFILLED
            this.PromiseResult = value
            for (const obj of this.PromiseFns) {
                setTimeout(() => {
                    obj.onResolved()
                })
                
            }
        }
        const reject = resoon => {
            // console.log('reject', this)
            if(this.PromiseState !== PENDING) return
            this.PromiseState = REJECTED
            this.PromiseResult = resoon
            for (const obj of this.PromiseFns) {
                setTimeout(() => {
                    obj.onRejected()
                })
            }
        }

        try{
            executor(resolve, reject)
        } catch (error) {
            reject(error)
        }
        
    }

    then(onResolved, onRejected) {
        onResolved = typeof onResolved === 'function' ? onResolved : value => value
        onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason }
        return new PromiseBee((resoved, rejected) => {
            const walk = callback => {
                // console.log('walk', callback)
                try {
                    const result = callback(this.PromiseResult)
                    if(result instanceof PromiseBee){
                        result.then(resoved, rejected)
                    } else {
                        resoved(result)
                    }
                } catch (error) {
                    rejected(error)
                }
            }

            if(this.PromiseState === PENDING){
                this.PromiseFns.push({
                    onResolved: () => {
                        walk(onResolved)
                    },
                    onRejected: () => {
                        walk(onRejected)
                    }
                })

            } else if(this.PromiseState === FULFILLED){
                setTimeout(() => {
                    walk(onResolved)
                })
            } else {
                setTimeout(() => {
                    walk(onRejected)
                })
            }

        })
    }

    catch(onRejected) {
        this.then(undefined, onRejected)
    }

    // changeStatus() {
    //     this.then(() => {
    //         return new PromiseBee(() => {})
    //     })
    // }

    static reject(reason) {
        return new PromiseBee((resolve, reject) => {
            reject(reason)
        })
    }

    static resolve(value) {
        return new PromiseBee((resolve, reject) => {
            if(value instanceof PromiseBee){
                value.then(resolve, reject)
            } else {
                resolve(value)
            }
        })
    }

    static all(promises) {
        let resolvedCount = 0
        let results = []
        let len = promises.length
        return new PromiseBee((resolve, reject) => {
            promises.forEach((promise, index) => {
                PromiseBee.resolve(promise).then(value => {
                    results[index] = value
                    resolvedCount++
                    if(resolvedCount === len){
                        resolve(results)
                    }
                }, reject)
            })
        })
    }

    static race(promises) {
        return new PromiseBee((resolve, reject) => {
            promises.forEach(promise => {
                PromiseBee.resolve(promise).then(resolve, reject)
            })
        })
    }

    
}


window.PromiseBee = PromiseBee
// window.PromiseBee = Promise