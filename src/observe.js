//observer数据监听器  能够对数据对象的所有属性进行监听
//给data中所有数据添加getter和setter
//方便 获取或设置data中的数据
class Observer {
    constructor(data) {
        this.data = data
        this.walk(data)
    }
    // 核心方法
    //遍历data中所有数据  都添加getter和setter
    walk(data) {
        if(!data ||  typeof data != 'object') {
            return
        }
        //遍历对象
        Object.keys(data).forEach(key => {
            //给data对象的key设置getter和setter
            this.defineReactive(data, key, data[key])
            //data中所有数据遍历  相当于递归
            //如果data[key]是一个复杂类型   相当于递归
            this.walk(data[key])
        })
    }
    //定义响应式的数据（数据劫持）
    // data中的每一个数据都应该维护一个dep对象
   // dep保存了所有的订阅了该数据的订阅者
    defineReactive(obj, key, value) {
        let that = this
        let dep = new Dep()
        Object.defineProperty(obj, key, {
            enumerabl: true,
            configurable: true,
            //获取
            get() {
                //如果Deo.target中有watcher对象，存储到订阅者数组中
                Dep.target && dep.addSub(Dep.target)   
                return value
            },
            //设置
            set(newValue) {
                if(value ===newValue) {
                    return
                }
                value = newValue
                //如果newValue是一个对象，也应该对他进行劫持
                that.walk(newValue)
                //发布通知  让所有的订阅者更新内容
                dep.notify()
            }
        })
    }



}

