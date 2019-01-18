/*
* @转盘类*/


function Rotary(opt) {
    var _DEFAULT = {
        id: 'canvas',
        canvas_width: 300,//画布宽
        canvas_height: 300,//画布高
        divide: 8,//转盘奖品划分的份数,7个奖品对应的索引值就是0~7,索引从正上方开始为0起点
        object: true,//旋转主体，true是指针旋转，false是圆盘旋转
        pin_angle: -Math.PI / 2,//指针初始角度
        pin_size: 30 * Math.PI / 180,//指针夹角(弧度)
        pin_length: 20,//指针长度，三角形顶点到圆边界的距离
        pin_color: '#f6383e',//指针颜色
        pin_step: 30 * Math.PI / 180,//指针执行动画每秒旋转的弧度
        pan_step: 10,//圆盘每帧旋转的度数(正数是顺时针旋转，负数是逆时针旋转)
        end: 2,//指针/转盘接受停止命令后渐渐停止所旋转的圈数
        lamp_number: 20,//彩灯数量
        lamp_color: 'yellow',//彩灯颜色
        lamp_radius: 4,//彩灯半径
        lamp_length: 130,//彩灯距圆心的距离
        assets: [],//预加载资源
        fps: 60//舞台刷新帧率
    };//初始默认值
    _DEFAULT = _.assign(_DEFAULT, opt);
    var canvas,//画布
        stage,//舞台
        loader,//加载器
        bg_contain,//背景层
        lamp_contain,//彩灯集合
        roll_contain,//画布中创建的对象集合
        co,//大转盘
        pin,//指针
        timer,//定时器，控制彩灯
        successCallback;//指针停止后的成功回调
    var isLight = true;
    var status = 0;//旋转状态，0是默认,1是无限运动状态，2是缓停状态
    var cx = _DEFAULT.canvas_width / 2;//针盘横坐标
    var cy = _DEFAULT.canvas_height / 2;//针盘纵坐标
    var cr = _DEFAULT.canvas_width / 8;//针盘半径
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
        if (timer) {
            clearInterval(timer);
        }
        canvas = document.getElementById(_DEFAULT.id);
        canvas.width = _DEFAULT.canvas_width;
        canvas.height = _DEFAULT.canvas_height;
        stage = new createjs.Stage(canvas);
        bg_contain = new createjs.Container();
        lamp_contain = new createjs.Container();
        roll_contain = new createjs.Container();
        bgInit();
        lampInit();
        rollInit();
        btnInit();
        stage.update();

        //初始化圆盘
        function bgInit() {
            var lamp_bg = new createjs.Shape();
            lamp_bg.graphics.beginFill('#FC3E3E').drawCircle(cx, cy, 140);
            var img = loader.getResult("pan");
            co = new createjs.Bitmap(img);
            var bounds = co.getBounds();
            co.scaleX = co.scaleY = _DEFAULT.canvas_width / bounds.width;
            co.ox = _DEFAULT.canvas_width / 2;//圆盘x坐标
            co.oy = _DEFAULT.canvas_height / 2;//圆盘y坐标
            co.or = Math.sqrt(Math.pow(co.ox, 2) + Math.pow(co.oy, 2));//转盘半径
            co.step = _DEFAULT.pan_step;
            bg_contain.addChild(lamp_bg);
            bg_contain.addChild(co);
            stage.addChild(bg_contain);
        }

        //渲染彩灯
        function lampInit() {
            var lamp_step = Math.PI * 2 / _DEFAULT.lamp_number;
            var lamp_angle = 0;
            for (var i = 0; i < _DEFAULT.lamp_number; i++) {
                lamp_angle = i * lamp_step;
                var cos = Math.cos(lamp_angle);
                var sin = Math.sin(lamp_angle);
                var lx = cx + _DEFAULT.lamp_length * sin;
                var ly = cy + _DEFAULT.lamp_length * cos;
                var lamp = new createjs.Shape();
                lamp.graphics.beginFill(_DEFAULT.lamp_color).drawCircle(lx, ly, _DEFAULT.lamp_radius);
                if (i % 2 === 0) {
                    lamp.alpha = 0.5;
                }
                lamp_contain.addChild(lamp);
            }
            timer = setInterval(function () {
                isLight = !isLight;
                lampUpdate();
            }, 1000);
            stage.addChild(lamp_contain);

            function lampUpdate() {
                _.forEach(lamp_contain.children, function (item, index) {
                    if (isLight) {
                        //奇数亮
                        if (index % 2 === 0) {
                            item.alpha = 0.5;
                        } else {
                            item.alpha = 1;
                        }
                    } else {
                        //偶数亮
                        if (index % 2 === 0) {
                            item.alpha = 1;
                        } else {
                            item.alpha = 0.5;
                        }
                    }
                });
                stage.update();
            }
        }

        //初始化指针
        function rollInit() {
            var pin_pan = new createjs.Shape();
            pin_pan.graphics.beginFill(_DEFAULT.pin_color).drawCircle(cx, cy, cr);
            roll_contain.addChild(pin_pan);
            //计算坐标并绘制三角形指针
            pin = _this._calcPos(_DEFAULT.pin_angle, _DEFAULT.pin_step, status);
            roll_contain.addChild(pin);
            stage.addChild(roll_contain);
        }

        //初始化按钮
        function btnInit() {
            var img = loader.getResult("btn");
            var co = new createjs.Bitmap(img);
            var bounds = co.getBounds();
            co.scaleX = co.scaleY = _DEFAULT.canvas_width / 4 / bounds.width;
            co.x = co.y = _DEFAULT.canvas_width / 2 - bounds.width * co.scaleX / 2;
            co.addEventListener('click', function () {
                if (status === 0) {
                    status = 1;//修改为动画状态
                    _this.start();
                }
            });
            roll_contain.addChild(co);
            stage.addChild(roll_contain);
        }

    };//初始化页面渲染

    this.start = function () {
        createjs.Ticker.removeAllEventListeners();
        createjs.Ticker.addEventListener("tick", _DEFAULT.object ? pinTick : panTick);
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
        createjs.Ticker.setFPS(_DEFAULT.fps || 60);

        //指针旋转主函数
        function pinTick() {
            if (status === 2) {
                // debugger;
                var ds = pin.target - pin.angle;
                pin.step = ds * pin.damping;
                if (pin.step < 0.01) {
                    if (successCallback) {
                        successCallback();
                        successCallback = null;
                    }
                }
            }
            var next_pin = _this._calcPos(pin.angle + pin.step, pin.step);
            if (pin.hasOwnProperty('target')) {
                next_pin.target = pin.target;
            }
            if (pin.hasOwnProperty('damping')) {
                next_pin.damping = pin.damping;
            }
            var index = roll_contain.getChildIndex(pin);
            roll_contain.removeChild(pin);
            roll_contain.addChildAt(next_pin, index);
            pin = next_pin;

            stage.update();
        }

        //圆盘旋转主函数
        function panTick() {
            if (status === 2) {
                // debugger;
                var ds = co.target - co.rotation;
                co.step = ds * co.damping;
                if ((co.step > 0 && co.step < 0.01) || (co.step < 0 && co.step > -0.01)) {
                    if (successCallback) {
                        successCallback();
                        successCallback = null;
                    }
                }
            }
            co.rotation += co.step;
            var ang = co.step * Math.PI / 180;
            var cos = Math.cos(ang);
            var sin = Math.sin(ang);
            var dx = co.x - co.ox;
            var dy = co.y - co.oy;
            co.x = co.ox + dx * cos - dy * sin;
            co.y = co.oy + dy * cos + dx * sin;
            stage.update();
        }
    };//执行摇奖操作

    this.endTo = function (target, callback) {
        status = 2;
        successCallback = callback || null;
        if (_DEFAULT.object) {
            //指针旋转
            pin.target = pin.angle + (Math.PI * 2 * (_DEFAULT.end + 1) - pin.angle % (Math.PI * 2)) + Math.PI * 2 / _DEFAULT.divide * this._clacPinIndex(target);
            pin.damping = _DEFAULT.pin_step / (pin.target - pin.angle);
        } else {
            //圆盘旋转
            if (co.step > 0) {
                //顺时针旋转
                co.target = co.rotation + (360 * (_DEFAULT.end + 1) - co.rotation % 360) + 360 / _DEFAULT.divide * _this._clacPanIndex(target);
            } else {
                //逆时针旋转
                co.target = co.rotation + (-360 * (_DEFAULT.end + 1) - co.rotation % 360) - 360 / _DEFAULT.divide * target;
            }
            co.damping = _DEFAULT.pan_step / (co.target - co.rotation);
        }
    };//停止到指定角度

    this.stop = function () {
        createjs.Ticker.reset();
    };//停止抽奖操作

    this.reset = function () {
        createjs.Ticker.reset();
        bg_contain.removeAllChildren();
        roll_contain.removeAllChildren();
        status = 0;
        this.render();
    };

    this._calcPos = function (angle, step) {
        var vertex1 = {},
            vertex2 = {},
            vertex3 = {};

        vertex1.x = cx + Math.cos(angle) * (cr + _DEFAULT.pin_length);
        vertex1.y = cx + Math.sin(angle) * (cr + _DEFAULT.pin_length);

        vertex2.x = cx + Math.cos(angle - _DEFAULT.pin_size / 2) * cr;
        vertex2.y = cx + Math.sin(angle - _DEFAULT.pin_size / 2) * cr;

        vertex3.x = cx + Math.cos(angle + _DEFAULT.pin_size / 2) * cr;
        vertex3.y = cx + Math.sin(angle + _DEFAULT.pin_size / 2) * cr;

        var pin = new createjs.Shape();
        pin.graphics.setStrokeStyle(1)
            .beginFill(_DEFAULT.pin_color)
            .moveTo(vertex1.x, vertex1.y)
            .lineTo(vertex2.x, vertex2.y)
            .lineTo(vertex3.x, vertex3.y)
            .closePath();
        pin.angle = angle;
        pin.step = step;
        return pin;
    };//计算三角形指针坐标，并返回出绘制后的图形

    this._clacPinIndex = function (target) {
        var arr = [];
        for (var i = 0; i < _DEFAULT.divide; i++) {
            arr.push(i);
        }
        _.times(_DEFAULT.divide/4,function(){
            arr.unshift(arr.pop());
        });
        return arr[target];

    };//转换索引值

    this._clacPanIndex = function (target) {
        var arr = [];
        for (var i = _DEFAULT.divide - 1; i >= 0; i--) {
            arr.push(i);
        }
        arr.unshift(arr.pop());
        return _.findIndex(arr, function (item) {
            return item === target;
        });

    };//转换索引值
}
