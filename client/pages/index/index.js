

/*<remove trigger="prod">*/
import {test, test2} from '../../lib/api-mock'
/*</remove>*/

/*<jdists trigger="prod">
import {test, test2} from '../../lib/api'
</jdists>*/

//index.js
//获取应用实例
const app = getApp()

var id = `"HBmkPItFU9ZCkNoFBqCfK9BuJLeDc5khkkOSY+KRBkPlX+UWifSKaYEyaQ84h6gU1XJNmnR9lHjzgHzKspmVQn7f0jCzMpHVdOL0DrKLJBJ3iUMgys+LTEoQ+q88bmI7ZA1CBFdSe33XRU6aDXbFChVhxx3CFNw3oqo7tof6yLroIWLz0jrhCiGUkEBULAPBVjW2w+4u8Pjjjss="`

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    hasUserInfoWording: '',
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    dataMsg: '',
    statusMsg: '',
    fileID: '无，请先上传',
    tempFilePath: '',
    uploadProgress: '',
    downloadProgress: '',
    hasRecommend: false,
    recommendOpenid: '',
    recommend: [],
    // db
    showDBInfo: false,
    db: {
      raw: '',
      imgs: []
    }
  },

  uploadFile: function() {
    wx.chooseImage({
      success: (dRes) => {
        this.setData({
          statusMsg: '开始上传文件'
        })

        const uploadTask = wx.cloud.uploadFile({
          cloudPath: 'my-photo.png',
          filePath: dRes.tempFilePaths[0],
          success: (res) => {
            console.log('上传成功', res)
            this.setData({
              statusMsg: '上传成功',
              fileID: res.fileID
            })

            this.saveToDB(res.fileID)
          },
          fail: (err) => {
            console.error('上传失败', err)
            this.setData({
              statusMsg: `上传失败：${err.errMsg}`,
              tempFilePath: res.fileID
            })
          }
        })

        uploadTask.onProgressUpdate((event) => {
          this.setData({
            uploadProgress: event.progress + '%'
          })
        })
      },
      fail: console.error
    })
  },

  saveToDB: function(fileID) {
    const db = wx.cloud.database()
    db
      .collection('photo')
      .add({
        data: {
          fileID
        }
      })
      .then((res) => {
        this.setData({
          statusMsg: '上传并保存到数据库成功'
        })
      })
      .catch((err) => {
        this.setData({
          statusMsg: `保存到数据库失败：${err.errMsg}`
        })
      })
  },

  downloadFile: function() {
    this.setData({
      statusMsg: `开始下载文件，文件 ID： ${this.data.fileID}`
    })

    const t = wx.cloud.downloadFile({
      fileID: this.data.fileID,
      success: (res) => {
        console.log('下载成功', res)

        this.setData({
          statusMsg: `下载成功，临时文件链接 ${res.tempFilePath}`,
          tempFilePath: res.tempFilePath
        })
      },
      fail: (err) => {
        console.error('下载失败', err)
        this.setData({
          statusMsg: `下载失败：${err.errMsg}`
        })
      }
    })

    t.onProgressUpdate((event) => {
      this.setData({
        downloadProgress: event.progress + '%'
      })
    })
  },

  getTempFileURL: function() {
    this.setData({
      statusMsg: '开始获取链接'
    })
    wx.cloud
      .getTempFileURL({
        fileList: [
          {
            fileID: this.data.fileID
          },
          {
            fileID: id,
            maxAge: 10 * 60 * 60
          }
        ]
      })
      .then((res) => {
        console.log('获取成功', res)
        this.setData({
          statusMsg: `获取成功：${res.fileList[1].tempFileURL}`
        })
      })
      .catch((err) => {
        console.error('获取失败', err)
        this.setData({
          statusMsg: `获取失败：${err.errMsg}`
        })
      })
  },

  callFunction: function() {
    this.setData({
      statusMsg: '开始调用云函数，函数名：test'
    })

    test({a: 1})
      .then((res) => {
        console.log('调用成功', res)
        this.setData({
          statusMsg: `调用成功，返回结果：${res.result}`
        })
      })
      .catch((err) => {
        console.error('调用失败', err)
        this.setData({
          statusMsg: `调用失败：${err.errMsg}`
        })
      })
  },

  callFunction2: function() {
    this.setData({
      statusMsg: '开始调用云函数，函数名：test2'
    })

    test2()
      .then((res) => {
        console.log('调用成功', res)
        const result = JSON.parse(res.result)
        this.setData({
          statusMsg: `调用成功，返回结果：${res.result}`,
          hasRecommend: true,
          recommendOpenid: result.openid,
          recommend: result.titles
        })
      })
      .catch((err) => {
        console.error('调用失败', err)
        this.setData({
          statusMsg: `调用失败：${err.errMsg}`
        })
      })
  },

  deleteFile: function() {
    this.setData({
      statusMsg: '开始删除文件'
    })
    wx.cloud.deleteFile({
      fileList: [this.data.fileID],
      success: (res) => {
        console.log('删除文件成功', res)
        this.setData({
          statusMsg: `删除文件成功`
        })
      },
      fail: (err) => {
        console.log('删除文件成功', res)
        this.setData({
          statusMsg: `删除文件成功`
        })
      }
    })
  },

  showDBInfo: function() {
    this.setData({
      showDBInfo: true,
      statusMsg: '正在获取数据库 photo 集合信息'
    })

    const db = wx.cloud.database()
    const _ = db.command
    db
      .collection('user')
      .where({
        // age: _.gt(23),
        age: {
          $gt: 23
        }
      })
      .get()
      .then((res) => {
        this.setData({
          'db.raw': JSON.stringify(res.data, null, 2),
          'db.imgs': res.data.map((item) => {
            return {
              src: item.avatarUrl
            }
          }),
          statusMsg: '获取成功'
        })
      })

    /*
    db.collection('photo').get().then(res => {
      this.setData({
        'db.raw': JSON.stringify(res.data, null, 2),
        statusMsg: '获取成功',
      })

      wx.cloud.getTempFileURL({
        fileList: res.data.map(item => {
          return {
            fileID: item.fileID
          }
        }),
        success: res => {

          console.log(res)

          this.setData({
            'db.imgs': res.fileList.map(item => {
              return {
                src: item.tempFileURL
              }
            })
          })
        },
        fail: console.error,
      })

    })
    */
  },

  //事件处理函数
  bindViewTap: function() {
    return
    wx.navigateTo({
      url: '../logs/logs'
    })
  },

  //
  promptDBUsage: function() {
    console.warn(`
数据库 API 简要 Demo

const db = wx.cloud.database()
const _ = db.command

// 取 user 集合所有文档
db.collection('user').get().then(console.log).catch(console.error)

// 取某一文档
db.collection('user').doc('WyuJ_bvMViICc9Yo').get().then(console.log).catch(console.error)

// 添加一个文档
db.collection('user').add({
  data: {
    name: 'charles',
    age: 30
  }
}).then(console.log).catch(console.error)

// 查询年龄大于 20 的用户
db.collection('user').where({
  age: _.gt(20)
}).then(console.log).catch(console.error)

// 更新：添加/更新 mail 字段
db.collection('user').update({
  data: {
    mail: ['bonjour@paris.fr']
  }
}).then(console.log).catch(console.error)

// 更新：年龄加一
db.collection('user').update({
  data: {
    age: _.inc(1)
  }
}).then(console.log).catch(console.error)

更多用法可查阅文档

`)
  },

  onLoad: function() {
    this.promptDBUsage()

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
      this.saveUserInfo(app.globalData.userInfo)
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
          hasUserInfoWording: '（已获取）'
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: (res) => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  saveUserInfo: function(userInfo) {
    const db = wx.cloud.database()

    db.collection('user').get().then((res) => {
      console.log('db users', res.data)
      if (res.data.find((item) => item.avatarUrl === userInfo.avatarUrl)) {
        console.log('found user in db')
      } else {
        db
          .collection('user')
          .add({
            data: userInfo
          })
          .then(console.log)
          .catch(console.error)
      }
    })
  },

  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  }
})
