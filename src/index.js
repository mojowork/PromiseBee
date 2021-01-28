const PADDING = 'padding'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class PromiseBee{
    constructor(executor) {
        this.PromiseState = PADDING
        this.PromiseResult = null
        this.PromiseFns = []
        const resolve = value => {
            // console.log('resolve', this)
            if(this.PromiseState !== PADDING) return
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
            if(this.PromiseState !== PADDING) return
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
        debugger
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

            if(this.PromiseState === PADDING){
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

}


window.PromiseBee = PromiseBee
// window.PromiseBee = Promise