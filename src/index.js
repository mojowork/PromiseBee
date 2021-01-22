
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
        try{
            executor(this.resolve.bind(this), this.reject.bind(this))
        } catch(err) {
            this.reject(err)
        }
        
    }

    then(onResolved = emptyFn, onRejected = emptyFn) {
        if(this.state === pending){
            this.resolvedfns.push(onResolved)
            this.rejectedfns.push(onRejected)
        } else {
            if(this.state === fulfilled){
                onResolved(this.value)
            }
            if(this.state === rejected){
                onRejected(this.value)
            }
        }

    }

    resolve(value) {
        console.log(this)
        if(this.state !== pending) return 
        this.state = fulfilled
        this.value = value
        while(this.resolvedfns.length){
            let fn = this.resolvedfns.pop()
            fn(this.value)
        }
    }

    reject(error) {
        console.log(this)
        if(this.state !== pending) return 
        this.state = rejected
        this.value = error
        while(this.rejectedfns.length){
            let fn = this.rejectedfns.pop()
            fn(this.value)
        }
    }


}

console.log('PromiseBee', PromiseBee)
new PromiseBee((resolved, rejected) => {
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
.then(value => {
    console.log('value ==>', value)
}, err => {
    console.log('err ==>', err)
})