/*
* @摇奖机类*/


function RedPacketWars(opt) {
    var _DEFAULT = {
        id: 'canvas',
        canvas_width: 200,//画布宽
        canvas_height: 200,//画布高
        total: 10,//球的随机总数量
        min_radius: 0.1,//最小半径
        max_radius: 1,//最大半径
        min_speed: 3,//最小速度
        max_speed: 5,//最大速度
        fps: 60,//舞台刷新帧率
        assets: [],//预加载资源
        clickFn: function (evt, next) {
        }//点击红包回调,evt对象，next()
    };//初始默认值
    _DEFAULT = _.assign(_DEFAULT, opt);
    var canvas,//画布
        stage,//舞台
        loader,//加载器
        bg_container,//背景容器
        rp_contain,//红包容器
        fz_contain;//字体容器
    var sum = 0,//红包总数
        amount = 0;//红包金额

    var textArr = [
        {
            label: 'FPS：',
            value: 'FPS',
            x: 10,
            y: 10
        },
        {
            label: 'fps',
            value: 0,
            x: 40,
            y: 10
        },
        {
            label: 'redpkg_sum',
            value: '红包个数：',
            x: 120,
            y: 10
        },
        {
            label: 'sum',
            value: 0,
            x: 170,
            y: 10
        },
        {
            label: 'redpkg_amount',
            value: '红包金额：',
            x: 200,
            y: 10
        },
        {
            label: 'amount',
            value: 0,
            x: 250,
            y: 10
        }
    ];

    var _this = this;

    this.load = function (cb) {
        loader = new createjs.LoadQueue();
        loader.loadManifest(_DEFAULT.assets);// 加载多个文件使用
        loader.on('complete', cb.onComplete);
        loader.on('error', cb.onError);
        loader.on('progress', cb.onProgress);
        loader.on('fileload', cb.onFileLoad);
        loader.on('fileprogress', cb.onFileProgress);
    };//预加载

    this.render = function () {
        canvas = document.getElementById(_DEFAULT.id);
        canvas.width = conf.canvas_width;
        canvas.height = conf.canvas_height;
        stage = new createjs.Stage(canvas);

        //初始化小球
        bg_container = new createjs.Container();
        for (var i = 0; i < 50; i++) {
            var cr = _.random(conf.min_radius, conf.max_radius);
            var cx = _.random(cr, conf.canvas_width - cr);
            var cy = _.random(cr, conf.canvas_height - cr);
            var cc = '#' + _.times(3, function () {
                return _.random(0, 255).toString(16);
            }).join('');//随机球体颜色
            var ca = _.random(0, 1, true);//浮点数
            var co = new createjs.Shape();
            co.graphics.beginFill(cc).drawCircle(cx, cy, cr);
            co.alpha = ca;
            bg_container.addChild(co);
        }
        stage.addChild(bg_container);

        //初始化红包
        rp_contain = new createjs.Container();
        for (var j = 0; j < 20; j++) {
            var img = loader.getResult("rp");
            var bitmap = new createjs.Bitmap(img);
            var bounds = bitmap.getBounds();
            var zoomX = 40;//图片缩放后的宽度
            var zoom = zoomX / bounds.width;//通过宽度得到缩放系数
            bitmap.scaleX = zoom;
            bitmap.scaleY = zoom;
            var zoomY = bounds.height * zoom;
            var rx = _.random(0, conf.canvas_width - zoomX);
            var ry = _.random((conf.canvas_height * 2 + zoomY) * -1, 0);
            bitmap.zoomX = zoomX;
            bitmap.zoomY = zoomY;
            bitmap.x = rx;
            bitmap.y = ry;
            bitmap.money = _.random(0, 10);
            rp_contain.addChild(bitmap);

            bitmap.addEventListener('click', handleClick);

            function handleClick(evt) {
                sum += 1;
                amount += evt.target.money;
                var img2 = loader.getResult("bz");
                var bitmap2 = new createjs.Bitmap(img2);
                var bounds = bitmap2.getBounds();
                var zoomX = 60;//图片缩放后的宽度
                var zoom = zoomX / bounds.width;//通过宽度得到缩放系数
                bitmap2.scaleX = zoom;
                bitmap2.scaleY = zoom;
                var zoomY = bounds.height * zoom;
                bitmap2.zoomX = zoomX;
                bitmap2.zoomY = zoomY;
                bitmap2.x = evt.target.x - 10;
                bitmap2.y = evt.target.y;
                bitmap2.spy = evt.target.spy;
                rp_contain.addChild(bitmap2);
                rp_contain.removeChild(evt.target);
                setTimeout(function () {
                    rp_contain.removeChild(bitmap2);
                }, 500);

                _.forEach(fz_contain.children, function (item) {
                    if (item.label === 'sum') {
                        _this._update(item, sum);
                    }
                    if (item.label === 'amount') {
                        _this._update(item, amount);
                    }
                });
                stage.update();
            }
        }
        stage.addChild(rp_contain);

        //初始化文字
        fz_contain = new createjs.Container();
        _.forEach(textArr, function (item) {
            var cache = new createjs.Text(item.value, "10px Arial", "#ff7700");
            cache.x = item.x;
            cache.y = item.y;
            cache.label = item.label;
            cache.value = item.value;
            fz_contain.addChild(cache);
        });
        stage.addChild(fz_contain);

        console.log(stage);
        stage.update();
    };//初始化页面渲染

    this.start = function () {
        createjs.Ticker.removeAllEventListeners();
        createjs.Ticker.addEventListener("tick", handleTick);
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
        createjs.Ticker.setFPS(_DEFAULT.fps || 60);

        function handleTick() {
            _.forEach(bg_container.children, function (item) {
                item.spx = item.spx || _.random(-1, 1);//横坐标移动速度
                item.spy = item.spy || _.random(-1, 1);//纵坐标移动速度

                if (item.graphics.command.x + item.graphics.command.radius < 0) {
                    item.graphics.command.x += _DEFAULT.canvas_width + item.graphics.command.radius * 2;
                } else if (item.graphics.command.x - item.graphics.command.radius > _DEFAULT.canvas_width) {
                    item.graphics.command.x -= _DEFAULT.canvas_width + item.graphics.command.radius * 2;
                }
                else if (item.graphics.command.y + item.graphics.command.radius < 0) {
                    item.graphics.command.y += _DEFAULT.canvas_height + item.graphics.command.radius * 2;
                } else if (item.graphics.command.y - item.graphics.command.radius > _DEFAULT.canvas_height) {
                    item.graphics.command.y -= _DEFAULT.canvas_height + item.graphics.command.radius * 2;
                }

                item.graphics.command.x += item.spx;
                item.graphics.command.y += item.spy;
            });

            _.forEach(rp_contain.children, function (item) {
                item.spy = item.spy || _.random(conf.min_speed, conf.max_speed);//纵坐标移动速度

                if (item.y > _DEFAULT.canvas_height) {
                    item.x = _.random(0, conf.canvas_width - item.zoomX);
                    item.y -= _DEFAULT.canvas_height * 2 + item.zoomY * 2;
                }
                item.y += item.spy;
            });

            _.forEach(fz_contain.children, function (item) {
                if (item.label === 'fps') {
                    var frame = Math.ceil(createjs.Ticker.getMeasuredFPS());
                    _this._update(item, frame);
                }
            });

            stage.update();
        }
    };//执行下红包雨


    this.stop = function () {
        createjs.Ticker.reset();
    };//停止红包雨

    this._update = function (item, frame) {
        var index = fz_contain.getChildIndex(item);
        var text = new createjs.Text(frame, "10px Arial", "#ff7700");
        text.x = item.x;
        text.y = item.y;
        text.label = item.label;
        text.value = item.value;
        fz_contain.removeChildAt(index);
        fz_contain.addChildAt(text, index);
    };
}