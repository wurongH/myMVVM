//watcher模块负责把compile模块与observer模块关联起来  将compile的解析结果与observer所观察的对象连接起来，在observer观察到对象数据变化时候，接收通知  同时更新DOM

class Watcher {
    //vm：当前vue实例
    //expr：data中数据的名字
    //一旦数据发生改变  需要调用cb
    constructor(vm, expr, cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb

        //this表示的就是新创建的对象
        //存储到Dep.target属性
        Dep.target = this 
        //需要把expr的旧值给存起来
        this.oldvalue = this.getVMValue(vm, expr) 
        //清空Dep.target
        Dep.target = null

    }
    //对外暴露的一个方法  用于更新页面
    updata() {
        //对比expr是否发生改变  如果改变  需调用cb
        let oldvalue = this.oldvalue
        let newValue = this.getVMValue(this.vm, this.expr)
        if(oldvalue != newValue) {
            this.cb(newValue, oldvalue)
        }
    }


      //用于获取vm中的数据
  getVMValue(vm, expr) {
    // 获取到data中的数据
    let data = vm.$data
    expr.split(".").forEach(key => {
      data = data[key]
    })
    return data
  }
}


//Dep对象用于管理所欲的订阅者和通知这些订阅者
class Dep {
    constructor() {
        //用于管理订阅者
        this.subs = []
    }
    //添加订阅者方法
    addSub(watcher) {
        this.subs.push(watcher)
    }
    //发布消息
    notify () {
        //遍历所有订阅者  调用watcher的updata方法
        this.subs.forEach(sub => {
            sub.updata()
        })
    }
}













