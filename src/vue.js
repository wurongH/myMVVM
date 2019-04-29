/*
 * vue实现思路：
 * 1. 实现一个compile模板解析器  能够对模板中的指令和插值表达式进行解析，并且赋予不同的操作
 * 
 * 2. 实现一个observer数据监听器，能够对数据对象的所有属性进行监听
 * 
 * 3. 实现一个watcher观察者 将compile的解析结果 与observer所观察的对象连接起来  建立关系       在observer观察到的对象数据变化时， 接收通知  同时更新DOM
 * 
 * 4. 创建一个公共的入口对象，接收初始化的配置并且协调上面的三个模块  也就是vue
 * 
*/

//定义一个类(构造函数)   只要创建vue实例就行
class Vue {
    constructor(options = {}) {
        //console.log(options)
        
        //给vue实例增加属性  vue有个习惯会加上$
        this.$el = options.el
        this.$data = options.data
        this.$methods = options.methods

//监视data中数据
    new Observer(this.$data)
        //把data中的所有数据代理到vm上
        this.proxy(this.$data)
        //把methods中所有的数据代理到vm上
        this.proxy(this.$methods)
        //如果指定el参数  就对el进行解析
        if(this.$el) {
            // new Compile()   Compile负责解析el模板的内容
            // 1.需要模板 el
            // 2.需要数据 data (不要局限于数据   直接把vue实例传过去 后期vue实例会增加属性  this指向vue实例)
            let c = new Compile(this.$el, this)
            //console.log(c)
            
        }
    }
    //设置代理
    proxy(data) {
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                enumerable: true,
                configurable: true,
                get() {
                    return data[key]
                },
                set(newValue) {
                    if (data[key] == newValue) {
                        return
                    }
                    data[key] = newValue
                }
            })
        })
    }
}
