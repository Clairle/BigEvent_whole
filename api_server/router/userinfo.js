const express = require('express')
// 创建路由对象
const router = express.Router()

// 导入用户信息的处理函数模块
const userinfo_handler =require('../router_handler/userinfo')

// 导入验证数据合法性的中间件
const expressjoi = require('@escook/express-joi')
// 导入需要的验证规则对象,用户信息
const { update_userinfo_schema } = require('../schema/user')
// 导入需要的验证规则对象，密码
const { update_password_schema } = require('../schema/user')
// 导入需要的验证规则对象，头像
const { update_avatar_schema } = require('../schema/user')






// 获取用户基本信息
router.get('/userinfo',userinfo_handler.getUserInfo)

// 更新用户的基本信息
// 插件导入的验证规则expressjoi(update_userinfo_schema)
router.post('/userinfo', expressjoi(update_userinfo_schema), userinfo_handler.updateUserInfo)

// 重置密码的路由
router.post('/updatepwd',expressjoi(update_password_schema), userinfo_handler.updatePassword)

// 更新用户头像的路由
router.post('/update/avatar',expressjoi(update_avatar_schema), userinfo_handler.updateAvatar)

// 向外共享路由对象
module.exports = router