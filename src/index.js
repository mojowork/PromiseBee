
const pending = 'pending',
    fulfilled = 'fulfilled',
    rejected = 'rejected',
    emptyFn = () => {}

export default class PromiseBee{
    constructor(executor) {
        this.state = pending
        this.value = null
        this.resolvedfns = []
        this.rejectedfns = []
        const resolve = (value) => {
            if(this.state !== pending) return 
            this.state = fulfilled
            this.value = value
            while(this.resolvedfns.length){
                let onResolved = this.resolvedfns.pop()
                
                return new PromiseBee((resolved, rejected) => {
                    try{
                        var result = onResolved(this.value)
                    } catch (err){
                        rejected(err)
                    }
                    if(result instanceof PromiseBee){
                        result.then(resolved, rejected)
                    } else {
                        resolved(result)
                    }
                })   
            }
        }
        const reject = (error) => {
            if(this.state !== pending) return 
            this.state = rejected
            this.value = error
            while(this.rejectedfns.length){
                let onRejected = this.rejectedfns.pop()
                return new PromiseBee((resolved, rejected) => {
                    try{
                        var result = onRejected(this.value)
                    } catch (err){
                        rejected(err)
                    }
                    if(result instanceof PromiseBee){
                        result.then(resolved, rejected)
                    } else {
                        resolved(result)
                    }
                })               
            }
        }

        try{
            executor(resolve, reject)
        } catch(err) {
            reject(err)
        }
    }

    then(onResolved = emptyFn, onRejected = emptyFn) {
        if(this.state === pending){
            this.resolvedfns.push(onResolved)
            this.rejectedfns.push(onRejected)
        } else if(this.state === fulfilled)  {
            
            return new PromiseBee((resolved, rejected) => {
                try{
                    var result = onResolved(this.value)
                } catch (err){
                    rejected(err)
                }
                if(result instanceof PromiseBee){
                    result.then(resolved, rejected)
                } else {
                    resolved(result)
                }
            })
        } else if(this.state === rejected){
            return new PromiseBee((resolved, rejected) => {
                try{
                    var result = onRejected(this.value)
                } catch (err){
                    rejected(err)
                }
                if(result instanceof PromiseBee){
                    result.then(resolved, rejected)
                } else {
                    resolved(result)
                }
            })
        }
    }

}

console.log('PromiseBee', PromiseBee)
let p = new PromiseBee((resolved, rejected) => {
    setTimeout(() => {
        let number = Math.random()
        if(number > .5){
            resolved(number)
        } else {
            rejected(number)
        }
    }, 5000);
    // let number = Math.random()
    // if(number > .5){
    //     resolved(number)
    // } else {
    //     rejected(number)
    // }
})
let p2 = p.then(value => {
    throw new Error('Error')
}, err => {
    console.log('err ==>', err)
})

console.log('instance', p2)