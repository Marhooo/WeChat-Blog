//var app = getApp()

const Auth = {}


//检查登录态是否过期(我这里应该不需要用这个小轮子了，我用interceptor解决了)
Auth.checkLogin = function(appPage) {
    let wxLoginInfo = wx.getStorageSync('wxLoginInfo');
    //wxLoginInfo中只会放入js_code
    wx.checkSession({
        success: function() {
            if (!wxLoginInfo.code) {
                Auth.wxLogin().then(res => {
                    appPage.setData({
                        wxLoginInfo: res
                    })
                    wx.setStorageSync('wxLoginInfo', res);
                })
            }
        },
        fail: function() {
            Auth.wxLogin().then(res => {
                appPage.setData({
                    wxLoginInfo: res
                })
                wx.setStorageSync('wxLoginInfo', res);
            })
        }
    })
}

function getPageInstance() {
    var pages = getCurrentPages()
    return pages[pages.length -1]
}

//手动简易中间件路由守卫
Auth.pageLoginCheck = function(pageObj) {
    if(pageObj.onLoad) {
        let _onLoad = pageObj.onLoad
        pageObj.onLoad = function (options) {
            if(wx.getStorageSync('token')) {
                let currentInstance = getPageInstance();
                _onLoad.call(currentInstance, options)
            } else {
                wx.removeStorageSync('hasUserInfo')
                wx.removeStorageSync('userInfo')                
                wx.reLaunch({
                    url: '/pages/user/user'
                })
            }
        }
    }
    return Page(pageObj)
}

//wxLogin登录方法换取openid换取三要素之一的js_code
Auth.wxLogin = function() {
    return new Promise(function (resolve, reject) {
        wx.login({
            success: function(res) {
                resolve(res);
            },
            fail: function(err) {
                reject(err);
            }
        })
    })
}

module.exports = Auth