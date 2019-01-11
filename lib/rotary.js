/*
* @转盘类*/


function Rotary(opt) {
    var _DEFAULT = {
        id: 'canvas',
        canvas_width: 300,//画布宽
        canvas_height: 300,//画布高
        divide: 8,//转盘奖品划分的份数
        pin_angle: -Math.PI / 2,//指针初始角度
        pin_size: 30 * Math.PI / 180,//指针夹角(弧度)
        pin_length: 20,//指针长度，三角形顶点到圆边界的距离
        pin_color: '#f6383e',//指针颜色
        pin_step: 30 * Math.PI / 180,//指针执行动画每秒旋转的弧度
        pin_status: 0,//指针状态，0是默认,1是无限运动状态，2是缓停状态
        assets: [],//预加载资源
        fps: 60,//舞台刷新帧率
    };//初始默认值
    _DEFAULT = _.assign(_DEFAULT, opt);
    var canvas,//画布
        stage,//舞台
        loader,//加载器
        bg_contain,//背景层
        roll_contain,//画布中创建的对象集合
        pin_zhen;//指针
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
        canvas = document.getElementById(_DEFAULT.id);
        canvas.width = _DEFAULT.canvas_width;
        canvas.height = _DEFAULT.canvas_height;
        stage = new createjs.Stage(canvas);
        bg_contain = new createjs.Container();
        roll_contain = new createjs.Container();
        bgInit();
        rollInit();
        btnInit();
        stage.update();

        //初始化圆盘
        function bgInit() {
            var img = loader.getResult("pan");
            var co = new createjs.Bitmap(img);
            var bounds = co.getBounds();
            co.scaleX = co.scaleY = _DEFAULT.canvas_width / bounds.width;
            bg_contain.addChild(co);
            stage.addChild(bg_contain);
        }

        //初始化指针
        function rollInit() {
            var pin_pan = new createjs.Shape();
            pin_pan.graphics.beginFill(_DEFAULT.pin_color).drawCircle(cx, cy, cr);
            roll_contain.addChild(pin_pan);
            console.log(pin_pan);
            //计算坐标并绘制三角形指针
            pin_zhen = _this._calcPos(_DEFAULT.pin_angle, _DEFAULT.pin_step, _DEFAULT.pin_status);
            roll_contain.addChild(pin_zhen);
            stage.addChild(roll_contain);
            console.log('pin_zhen', pin_zhen);
        }

        //初始化按钮
        function btnInit() {
            var img = loader.getResult("btn");
            var co = new createjs.Bitmap(img);
            var bounds = co.getBounds();
            co.scaleX = co.scaleY = _DEFAULT.canvas_width / 4 / bounds.width;
            co.x = co.y = _DEFAULT.canvas_width / 2 - bounds.width * co.scaleX / 2;
            co.addEventListener('click', function (evt) {
                if (pin_zhen.status === 0) {
                    pin_zhen.status = 1;//修改为动画状态
                    _this.start();
                    // setTimeout(function () {
                    //     pin_zhen.status = 2;
                    // }, 3000);
                } else if (pin_zhen.status === 1) {
                    var target=_.random(0,7);
                    console.log(target);
                    _this.stopTo(target);
                }
            });
            roll_contain.addChild(co);
            stage.addChild(roll_contain);
        }

    };//初始化页面渲染

    this.start = function () {
        createjs.Ticker.removeAllEventListeners();
        createjs.Ticker.addEventListener("tick", handleTick);
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
        createjs.Ticker.setFPS(_DEFAULT.fps || 60);

        function handleTick() {
            var rad;
            if (pin_zhen.status === 1) {
                //无限循环运动
                rad = pin_zhen.angle + pin_zhen.step;
            } else if (pin_zhen.status === 2) {
                // debugger
                //渐渐停止运动
                var ds = pin_zhen.target - pin_zhen.angle;
                pin_zhen.step = ds * 0.05;
                rad = pin_zhen.angle + pin_zhen.step;
            }

            var next_pin_zhen = _this._calcPos(rad, pin_zhen.step, pin_zhen.status);
            if (pin_zhen.hasOwnProperty('target')) {
                next_pin_zhen.target = pin_zhen.target;
            }
            var index = roll_contain.getChildIndex(pin_zhen);
            roll_contain.removeChild(pin_zhen);
            roll_contain.addChildAt(next_pin_zhen, index);
            pin_zhen = next_pin_zhen;

            stage.update();
        }
    };//执行摇奖操作

    this.stopTo = function (target) {
        // debugger
        pin_zhen.status = 2;
        pin_zhen.target = pin_zhen.angle + (Math.PI * 2 * 2 - pin_zhen.angle % (Math.PI * 2)) + Math.PI * 2 / 8 * target;
    };//停止到指定角度

    this.stop = function () {
        createjs.Ticker.reset();
    };//停止抽奖操作

    this.reset = function () {
        createjs.Ticker.reset();
        roll_contain.removeAllChildren();
        this.render();
    };

    this._calcPos = function (angle, step, status) {
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
        pin.status = status;
        return pin;
    };//计算三角形指针坐标，并返回出绘制后的图形

    this._calcStep = function (pin) {
        if (pin.status == 2) {
            if (pin.step <= 0.01) {
                return pin.step = 0;
            } else {
                pin.step -= pin.damping;
                return pin.step;
            }
        } else {
            return pin.step;
        }

    };//计算旋转角度
}