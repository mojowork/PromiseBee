# PromiseBee
## Promise 对象最小实现，完善最核心的功能

## Usage

```
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
```