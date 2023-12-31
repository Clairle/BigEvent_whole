// 导入数据库操作模块
const { func } = require('@hapi/joi')
const db = require('../db/index')

// 导入 `bcryptjs` 加密模块
const bcrypt = require('bcryptjs')

// 用这个包来生成 Token 字符串
const jwt = require('jsonwebtoken')
// 导入密钥文件
const config = require('../schema/config')

// 注册用户的处理函数
exports.regUser = (req, res) => {
    // 接收表单数据
    const userinfo = req.body
    // 判断数据是否合法
    // if (!userinfo.username || !userinfo.password) {
    //     return res.send({
    //         status: 1,
    //         message: '用户名或密码不能为空！'
    //     })
    // }
    // 定义SQL语句
    const sql = `select * from ev_users where username=?`
    // 监测用户名是否被占用
    db.query(sql, [userinfo.username], function(err, results) {
        // 执行 SQL 语句失败
        if (err) {
            // return res.send({
            //     status: 1,
            //     message: err.message
            // })
            return res.cc(err)
        }
        // 用户名被占用
        if (results.length > 0) {
            // return res.send({
            //     status: 1,
            //     message: '用户名已被占用'
            // }) 
            return res.cc('用户名已被占用')
        }
        // TODO: 用户名可用，继续后续流程...
        // 对用户的密码,进行 bcrype 加密，返回值是加密之后的密码字符串
        userinfo.password = bcrypt.hashSync(userinfo.password, 10)
        // 定义插入用户的 SQL 语句
        const sql = `insert into ev_users set ?`
        // 调用 `db.query()` 执行 SQL 语句，插入新用户
        db.query(sql, { username: userinfo.username, password: userinfo.password }, 
            function (err,results) {
                // 执行 SQL 语句失败
                if (err) {
                    // return res.send({
                    //     status: 1,
                    //     message: err.message
                    // })
                    return res.cc(err)
                }
                // SQL 语句执行成功，但影响行数不为 1
                if (results.affectedRows !== 1) {
                    // return res.send({
                    //     status: 1,
                    //     message: '注册用户失败，请稍后再试！'
                    // })
                    return res.cc('注册用户失败，请稍后再试！')
                }
                // res.send({
                //     status: 0,
                //     message: '注册成功！'
                // })
                res.cc('注册成功！', 0)
            })
    })
}

// 登录的处理函数
exports.login = (req, res) => {
    // 接收表单数据
    const userinfo = req.body
    // 定义 SQL 语句
    const sql = `select * from ev_users where username=?`
    // 执行 SQL 语句，查询用户的数据
    db.query(sql, userinfo.username, function (err, results) {
        // 执行 SQL 语句失败
        if (err) return res.cc(err)
        // 执行 SQL 语句成功，但是查询到数据条数不等于 1
        if (results.length !== 1) {
            return res.cc('登录失败，用户名错误！')
        }
        // 拿着用户输入的密码,和数据库中存储的密码进行对比
        // 确保第一个参数是明文密码，第二个参数是加密后的密码
        const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
        // 如果对比的结果等于 false, 则证明用户输入的密码错误
        if (!compareResult) {
            return console.log(results[0].password),
            console.log(userinfo.password), 
            res.cc('登录失败，密码错误！') ,
            console.log(compareResult)
        }
        // TODO：登录成功，生成 Token 字符串
        // 过 ES6 的高级语法，快速剔除 `密码` 和 `头像` 的值
        const user= { ...results[0], password:'', user_pic: ''}
        // 生成token 字符串
        const tokenStr = jwt.sign(user, config.jwtSecretKey, {expiresIn: '10h'})
        res.send(({
            status: 0,
            message: '登录成功',
            // 为了方便客户端使用 Token，在服务器端直接拼接上 Bearer 的前缀
            token: 'Bearer ' + tokenStr,
        }))

    })
}