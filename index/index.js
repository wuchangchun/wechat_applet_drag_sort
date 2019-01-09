const app = getApp()

Page({
    data: {
        hidden: true,
        flag: false,
        //是否可以滚动
        isscroll: true,
        scrollTop: 0,
        x: 0,
        y: 0,
        mx: 0,
        my: 0,
        data: [{
                img: "1537257993771"
            },
            {
                img: "1541658529506"
            }, {
                img: "1539844042293"
            }, {
                img: "1540274174215"
            }, {
                img: "1541126507152"
            }, {
                img: "1542421093375"
            }, {
                img: "1541492639859"
            }, {
                img: "1537257993771"
            },
            {
                img: "1541658529506"
            }, {
                img: "1539844042293"
            }, {
                img: "1540274174215"
            }, {
                img: "1541126507152"
            }, {
                img: "1542421093375"
            }, {
                img: "1541492639859"
            }, {
                img: "1539844042293"
            }, {
                img: "1540274174215"
            }, {
                img: "1541126507152"
            }, {
                img: "1542421093375"
            }, {
                img: "1541492639859"
            }
        ],
        disabled: true,
        elements: [],
        //最大图片数
        maximg: 30
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        var that = this;
        //初始化节点位置
        this.nodesRef();

        wx.getSystemInfo({
            success: function(res) {
                that.setData({
                    screenHeight: res.windowHeight,
                    screenWidth: res.windowWidth
                })
            },
        })

        //获取页面初始的数据
        this.getPage();
    },
    //初始化可移动节点位置
    nodesRef: function() {

        //计算节点位置时以滚动距离0计算。判断的时候已经加上这段距离了。
        //所以先暂存。计算完了之后再还原
        var tempscrollTop = this.data.scrollTop;
        this.setData({
            scrollTop: 0
        })

        var query = wx.createSelectorQuery();
        var nodesRef = query.selectAll(".item");
        nodesRef.fields({
            dataset: true,
            rect: true

        }, (result) => {
            this.setData({
                elements: result
            })
        }).exec()

        this.setData({
            scrollTop: tempscrollTop
        })
    },
    //长按
    _longtap: function(e) {
        const detail = e.detail;
        //保存长按的位置
        this.setData({
            mx: e.detail.x - e.currentTarget.offsetLeft,
            my: e.detail.y - e.currentTarget.offsetTop
        })

        this.setData({
            x: e.currentTarget.offsetLeft,
            y: e.currentTarget.offsetTop
        })
        this.setData({
            hidden: false,
            flag: true
        })
        this.setData({
            isscroll: false
        })
    },
    //触摸开始
    touchs: function(e) {
        this.setData({
            beginIndex: e.currentTarget.dataset.index
        })
    },
    //触摸结束
    touchend: function(e) {
        if (!this.data.flag) {
            return;
        }
        var x = e.changedTouches[0].pageX
        //由于滚动所以y要加上 滚动上去的距离
        var y = e.changedTouches[0].pageY + this.data.scrollTop
        var list = this.data.elements
        let data = this.data.data
        for (var j = 0; j < list.length; j++) {

            var item = list[j];
            if (x > item.left && x < item.right && y > item.top && y < item.bottom) {
                var endIndex = item.dataset.index;
                var beginIndex = this.data.beginIndex;
                //向后移动
                if (beginIndex < endIndex) {
                    let tem = data[beginIndex];
                    for (let i = beginIndex; i < endIndex; i++) {
                        data[i] = data[i + 1]
                    }
                    data[endIndex] = tem;
                }
                //向前移动
                if (beginIndex > endIndex) {
                    let tem = data[beginIndex];
                    for (let i = beginIndex; i > endIndex; i--) {
                        data[i] = data[i - 1]
                    }
                    data[endIndex] = tem;
                }

                this.setData({
                    data: data
                })
            }
        }
        this.setData({
            hidden: true,
            flag: false,
            isscroll: true
        })
    },
    //滑动
    touchm: function(e) {
        if (this.data.flag) {
            const x = e.touches[0].pageX
            const y = e.touches[0].pageY
            this.setData({
                x: x - this.data.mx,
                y: y - this.data.my
            })
        }
    },
    //滚动
    scroll: function(e) {
        this.setData({
            scrollTop: e.detail.scrollTop
        });
    },
    /**
     * 保存按钮
     */
    formSubmit: function(e) {
        var that = this;
        var param = {};
        var nimgs = [];
        var imgs = that.data.data;
        for (var i = imgs.length - 1; i >= 0; i--) {
            nimgs.unshift(imgs[i].img)
        }
        if (nimgs.length > 0) {
            param['imgs'] = nimgs.join();
        }
    },
    /**
     * 获取页面数据
     */
    getPage: function() {
        var that = this;
        // request 获取初始化的图片
        // that.setData({
        //     data: imgs
        // })
        // //更新节点位置
        // that.nodesRef();
    },
    //绑定删除图片
    bindRemoveImg: function(e) {
        var that = this;
        wx.showModal({
            title: '提示',
            content: '您确定要删除',
            success(res) {
                if (res.confirm) {
                    var index = e.currentTarget.dataset.idx;
                    var nimgs = that.data.data;
                    nimgs.splice(index, 1);
                    that.setData({
                        data: nimgs
                    });
                    //更新节点位置
                    that.nodesRef();
                }
            }
        })
        return false;
    },
    /**
     * 绑定上传按钮
     */
    bindUploadImage: function() {
        var that = this;
        wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success(res) {
                var tempFilePaths = res.tempFilePaths

                //简单封装下上传图片的方法。
                that.uploadimg(tempFilePaths[0], function(olurl) {
                    if (olurl) {
                        var ndata = that.data.data;
                        ndata.push({
                            img: olurl
                        })
                        that.setData({
                            'data': ndata
                        })
                        //更新节点位置
                        that.nodesRef();
                    } else {
                        //请求成功返回的数据为空
                        wx.showToast({
                            title: '上传失败',
                            icon: 'none',
                            duration: 2000
                        })
                    }
                });
            }
        })
    },
    /**
     * 上传图片方法
     * localpath 微信接口获取的文件信息
     */
    uploadimg: function(localpath, cb) {
        var that = this;
        if (!localpath) {
            typeof cb == 'function' && cb('');
        }
        wx.uploadFile({
            url: 'uploadimg',
            filePath: localpath,
            name: 'img',
            formData: {
                token: ''
            }, // HTTP 请求中其他额外的 form data
            success: function(res) {
                var result = res.data;
                if (typeof result == 'string') {
                    result = JSON.parse(result);
                }
                var onlineurl = '';

                if (result.code == 1) {
                    onlineurl = result.data;
                } else if (result.code == 2) {
                    wx.showToast({
                        title: res.message || '上传失败',
                        icon: 'none',
                        duration: 2000
                    })
                }
                cb(onlineurl);
            },
            fail: function(res) {
                wx.showToast({
                    title: res.message || '出错啦，请稍后再试',
                    icon: 'none',
                    duration: 2000
                })
                cb('');
            },
            complete: function() {

            }
        })
    }
})