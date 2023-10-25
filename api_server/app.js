const express = require('express') // 导入 express 模块
const app= express()  // 创建 express 的服务器实例

const cors = require('cors') // 导入 cors 中间件
app.use(cors())  // 将 cors 注册为全局中间件

// 导入户信息验证规则模块
const joi = require('@hapi/joi')

// 配置解析 `application/x-www-form-urlencoded` 格式的表单数据的中间件
app.use(express.urlencoded({ extended: false }))













// 在处理函数中，需要多次调用 `res.send()` 向客户端响应 `处理失败` 的结果
// 响应数据的中间件
// 一定要配置在路由的前面
// express-jwt中间件抛出错误会直接给错误中间件，这样会跳过res.cc中间件导致错误中间件中的res.cc函数执行出错
app.use(function (req, res, next) {
    // status = 0 为成功； status = 1 为失败； 默认将 status 的值设置为 1，方便处理失败的情况
    res.cc = function (err, status = 1 ) {
        res.send({
            // 状态
            status,
            // 状态描述，判断 err 是 错误对象 还是 字符串
            message: err instanceof Error ? err.message : err,
        })
    }
    next()
})





// 导入jwt密钥文件
const config =require('./schema/config')
// 解析 token 的中间件
const expressJWT = require('express-jwt')
// 用密钥文件解析token
// 使用 .unless({ path: [/^\/api\//] }) 指定哪些接口不需要进行 Token 的身份认证
app.use(expressJWT ({ secret: config.jwtSecretKey}).unless({ path: [/^\/api\//] }))


// 托管静态资源文件
app.use('/uploads', express.static('./uploads'))






// 个人中心的路由
const userinfoRouter = require('./router/userinfo')
// 注意：以 /my 开头的接口，都是有权限的接口，需要进行 Token 身份认证
app.use('/my', userinfoRouter)

// 登录，注册的路由
const userRouter = require('./router/user')
app.use('/api',userRouter)

// 导入并使用文章分类路由模块
const artCateRouter = require('./router/artcate')
app.use('/my/article', artCateRouter)

// 导入并使用文章路由模块
const articleRouter = require('./router/article')
app.use('/my/article', articleRouter)


// 错误中间件
app.use(function (err, req, res, next){
    // 验证数据失败
    if (err instanceof joi.ValidationError) {
        return res.cc(err)
    }
    // 捕获使用错误token导致的份认证失败的错误
    if (err.name === 'UnauthorizedError') {
        return res.cc('身份认证失败！')
    }
    // 未知错误
    res.cc(err)
})

// 调用 app.listen 方法，指定端口号并启动web服务器
app.listen(3007, function () {
    console.log('api server running at http://127.0.0.1:3007')
})