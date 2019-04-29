//专门负责解析el模板内容
//compile模块解析器  能够对模板中的指令和插值表达式进行解析  并且赋予不同操作
class Compile {
    //参数1 el模板
    //参数2 vm => 整个vue实例
    constructor(el, vm) {
        //el(模板): new Vue 时传递选择器 或者dom对象 所以用三元表达式
        this.el = typeof el === 'string' ? document.querySelector(el) : el
        //VM: new 的Vue实例
        this.vm = vm
        //编译模板  el模板有内容
        if(this.el) {
            //1. 把el中所有的子节点都放入内存中  fragment文档碎片（在内存中）
            //DocumentFragment是dom节点，不是主dom树的一部分，所以子元素插入到文档片段时不会引起页面的回流(页面重新渲染) 
            let fragment = this.node2fragment(this.el)
            //console.log(this.el) 
            //console.dir(fragment)
            //2. 在内存中去编译fragment
            this.compile(fragment)
            //3. 把fragment一次性的添加到页面
            this.el.appendChild(fragment)
       }
    }
    //核心方法  与编译相关
    //node2fragment()节点转化代码片段  node来自this.el参数
    node2fragment(node) {
        //console.log(node) 
        //1. 把el中所有的子节点都放入内存中  fragment文档碎片（在内存中）
        let fragment = document.createDocumentFragment()
        //把el中所有子节点  添加文档片段中
        let childNodes = node.childNodes //类数组
        this.toArray(childNodes).forEach(node => {
            //把所有的子节点添加到fragment中
            fragment.appendChild(node)
        })
        return fragment
    }

    //编译文档碎片  （内存中）
    compile(fragment) {
        let childNodes = fragment.childNodes
        this.toArray(childNodes).forEach(node => {
            //console.log(node)
            //编译子节点
            //如果是元素，需要解析指令
            if(this.isElementNode(node)) {
                this.compileElement(node)
            }
            //如果是文本节点，需要解析插值表达式
            if(this.isTextNode(node)) {
                this.compileText(node)
            }

            //如果当前节点还有子节点  做递归处理解析
            if (node.childNodes && node.childNodes.length > 0) {
                this.compile(node)
            }
        })
    }
    //解析html标签
    compileElement(node) {
        //console.log(node)
        //1.获取当前节点下所有的属性
        let attributes = node.attributes
        this.toArray(attributes).forEach(attr => {
            //2. 解析vue的指令（所有以v-开头的指令）
            //console.dir(attr)            
            let attrName = attr.name
            let attrValue = attr.value
            if(this.isDirective(attrName)) {
                let type = attrName.slice(2)
                let expr = attr.value
                /*
                注释掉的代码未优化
                //如果是v-text指令
                if (type === 'text') {
                   // node.textContent = this.vm.$data[expr]    
                   CompileUtil['text'](node, this.vm, expr)              
                }
                //如果是v-html指令
                if (type === 'html') {
                    node.innerHTML = this.vm.$data[expr]
                }
                //如果是v-model指令
                if (type === 'model') {
                    node.value = this.vm.$data[expr]
                }
                
                //如果是v-on指令
                if (this.isEventDirective(type)) {
                    //给当前元素注册事件
                    //这里事件类型  click
                    let eventType = type.split(':')[1]                
                    //.bind创建一个新函数，在调用时设置this关键字为提供的值，并在调用新函数时，给定参数列表作为原函数的参数序列的前若干项
                    node.addEventListener(eventType, this.vm.$methods[expr].bind(this.vm))  //此时给按钮注册事件 谁调用指向谁  此时node按钮调用   this指向按钮  通过bind改变this指向   
                }
                */
               //上面指令判断的简写
               if (this.isEventDirective(type)) {
                   CompileUtil['eventHandler'](node, this.vm,type, expr)
               }    else {
                   CompileUtil[type] && CompileUtil[type](node, this.vm, expr)
               }
            }
        })
        }
    //解析文本节点
    compileText(node) {
        /*可以把这个方法封装在 CompileUtil.mustache()里面
        let txt = node.textContent
        //匹配插值表达式  
        let reg = /\{\{(.+)\}\}/
        //console.log(reg)
        if (reg.test(txt)) {
            let expr = RegExp.$1
            //console.log(expr) 
            node.textContent = txt.replace(reg, CompileUtil.getVmValue(this.vm, expr))
        }
        */
       CompileUtil.mustache(node, this.vm)
    }
    //工具方法   辅助作用
    toArray(likeArray) {
        //类数组转成array[].slice.call()
        return [].slice.call(likeArray)
        
        
    }
    isElementNode(node) {
        //nodeType: 节点类型  1 元素节点  3文本节点
        return node.nodeType ===1
    }
    isTextNode(node) {
        return node.nodeType ===3
    }
    isDirective(attrName) {
        return attrName.startsWith('v-')
    }
    isEventDirective(type) {
        return type.split(':')[0] === 'on'
    }
}
//编译相关的方法都在CompileUtil
let CompileUtil = {
    mustache(node, vm) {
        let txt = node.textContent
        //匹配插值表达式  
        let reg = /\{\{(.+)\}\}/
        //console.log(reg)
        if (reg.test(txt)) {
            let expr = RegExp.$1
            //console.log(expr) 
            node.textContent = txt.replace(reg, CompileUtil.getVmValue(vm, expr))
            new Watcher(vm, expr, newValue => {
                node.textContent = txt.replace(reg, newValue)
            })
        }
    },
    //处理v-text指令
    text(node, vm, expr) {
        //node.textContent =vm.$data[expr] 
        node.textContent = this.getVmValue(vm, expr)
        //通过watcher对象，监听exper的数据的变化  一旦变化  指向回调函数
        new Watcher(vm, expr, newValue => {
            node.textContent = newValue
        })
    },
    //如果是v-html指令
    html(node, vm, expr) {
        node.innerHTML = this.getVmValue(vm, expr)
        new Watcher(vm, expr, newValue => {
            node.innerHTML = newValue
        })
    },
    //如果是v-model指令
    model(node, vm, expr) {
        let self = this
        node.value = this.getVmValue(vm, expr)
        //实现双向的数据绑定， 给node注册input事件 当当前元素的value值发生改变  修改对应的数据
        node.addEventListener('input', function() {
            self.setVmValue(vm, expr, this.value)
        })
        new Watcher(vm, expr, newValue => {
            node.value = newValue
        })
    },
    //如果是事件指令
    eventHandler(node, vm, type, expr) {
        //给当前元素注册事件
        //这里事件类型  click
        let eventType = type.split(':')[1]                
        //如果页面没有methods  不至于报错  所做的一种防错措施
        let fn = vm.$methods && vm.$methods[expr]
        if (eventType && fn) {
            //.bind创建一个新函数，在调用时设置this关键字为提供的值，并在调用新函数时，给定参数列表作为原函数的参数序列的前若干项
            node.addEventListener(eventType, fn.bind(vm))  //此时给按钮注册事件 谁调用指向谁  此时node按钮调用   this指向按钮  通过bind改变this指向
        }
    },
    //这个方法用于获取vm中的数据
    getVmValue(vm, expr) {
        //获取数data中的数据
        let data = vm.$data
        expr.split('.').forEach(key => {
            //console.log(item)
            data = data[key] 
        })
        return data
    },
    setVmValue(vm,expr, value) {
        let data = vm.$data
        let arr  =expr.split('.')
        arr.forEach((key, index) => {
            //如果idnex是最后一个
            if (index < arr.length-1) {
                data = data[key]
            } else {
                data[key] = value
            }
        })
    }
}


















