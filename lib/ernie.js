/*
* @摇奖机类*/


function Ernie(opt) {
    var _DEFAULT = {
        id: 'canvas',
        canvas_width: 200,//画布宽
        canvas_height: 200,//画布高
        total: 10,//球的随机总数量
        min_radius: 25,//最小半径
        max_radius: 25,//最大半径
        min_speed: -3,//最小速度
        max_speed: 3,//最大速度
        assets: [],//预加载资源
        fps: 1,//舞台刷新帧率
        b2b: false,//小球与小球是否碰撞检测
        simulation: true,//模拟真实，重力加速度及反弹系数生效
        gravity: 0.3,//重力加速度
        bounce: 0.98,//反弹系数
    };//初始默认值
    _DEFAULT = _.assign(_DEFAULT, opt);
    var canvas,//画布
        stage,//舞台
        loader,//加载器
        co,//大圆
        bg_contain,//背景层
        roll_contain;//画布中创建的对象集合
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
        co = new createjs.Shape();
        co.graphics.beginFill('yellow').drawCircle(_DEFAULT.canvas_width / 2, _DEFAULT.canvas_height / 2, _DEFAULT.canvas_width / 2);
        bg_contain.addChild(co);
        stage.addChild(bg_contain);
        // debugger
        roll_contain = new createjs.Container();
        var OX, OY, OR;//大圆缩小一周小圆半径的安全区圆心横坐标，纵坐标及半径
        for (var i = 0; i < conf.total; i++) {
            var cr = _.random(conf.min_radius, conf.max_radius);//随机半径
            OX = OY = OR = conf.canvas_width / 2;
            OR = OR - cr;
            var ox = _.random(cr, conf.canvas_width - cr);//小圆圆心随机横坐标
            var oy_max = Math.abs(Math.sqrt(Math.pow(OR, 2) - Math.pow(OX - ox, 2)));//当x为_ox时，_oy的最大值
            var oy = _.random(OY - oy_max, OY + oy_max);//小圆圆心随机横坐标
            var cx = ox - cr;//随机横坐标
            var cy = oy - cr;//随机纵坐标
            var cc = '#' + _.times(3, function () {
                return _.random(0, 255).toString(16);
            }).join('');//随机球体颜色
            var img = loader.getResult("pao");
            var bitmap = new createjs.Bitmap(img);
            bitmap.x = cx;
            bitmap.y = cy;
            bitmap.cr = cr;
            // let co = new createjs.Shape();
            // co.graphics.beginFill().drawCircle(cx + cr / 2, cy + cr / 2, cr);
            // bitmap.mask = co;
            // roll_container.addChild(bitmap);
            // roll_container.addChild(co);
            // console.log(roll_container);
            roll_contain.addChild(bitmap);
        }
        stage.addChild(roll_contain);
        stage.update();
    };//初始化页面渲染

    this.start = function () {
        createjs.Ticker.removeAllEventListeners();
        createjs.Ticker.addEventListener("tick", handleTick);
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
        createjs.Ticker.setFPS(_DEFAULT.fps || 60);

        function handleTick() {
            for (var i = 0; i < roll_contain.children.length; i++) {
                var item = roll_contain.children[i];

                var now_x = item.x + item.cr;//当前小圆圆心x坐标
                var now_y = item.y + item.cr;//当前小圆圆心y坐标
                //1,，初始化移动速度
                if (!item.hasOwnProperty('spx')) {
                    item.spx = 0;//_.random(conf.min_speed, conf.max_speed);//横坐标移动速度
                }
                if (!item.hasOwnProperty('spy')) {
                    item.spy = _.random(conf.min_speed, conf.max_speed);//纵纵标移动速度
                }

                //2，碰撞检测
                var Oo = _this._getCenterDistance(co.graphics.command.x, co.graphics.command.y, now_x, now_y) + item.cr;//两圆心之间的距离
                var Rr = co.graphics.command.radius;//两圆半径之和
                if (Oo > Rr) {
                    // debugger;
                    var now_d_x = now_x - co.graphics.command.x;//两圆心x坐标之差
                    var now_d_y = now_y - co.graphics.command.y;//两圆心y坐标之差
                    if (now_d_y === 0) {
                        //两圆心处于水平线上
                        item.spx *= -1;
                    } else if (now_d_x === 0) {
                        //两圆心处于垂直线上
                        item.spy *= -1;
                    } else {
                        // console.log('碰撞中x,y,spx,spy', now_x, now_y, item.spx, item.spy);
                        // debugger;
                        //其余情况
                        //计算小球上一帧的小圆圆心的位置
                        var old_x = now_x - item.spx;
                        var old_y = now_y - item.spy;
                        //计算小球上一帧的小圆圆心相对于大圆圆心的相对x,y距离
                        var old_d_x = old_x - co.graphics.command.x;
                        var old_d_y = old_y - co.graphics.command.y;
                        //计算小球上一帧的小圆圆心相对于大圆圆心的倾斜角(弧度)
                        var old_ang = Math.atan2(old_d_y, old_d_x);

                        //计算当前切点小圆圆心相对于大圆圆心的倾斜角度(弧度)
                        var now_ang = Math.atan2(now_d_y, now_d_x);

                        var d_ang = (now_ang - old_ang) * 2;//当前小圆与上一帧小圆圆心相对于大圆圆心的偏移夹角(弧度)

                        //计算反弹后的小圆圆心（相对于上一帧）的坐标
                        var cos = Math.cos(d_ang);
                        var sin = Math.sin(d_ang);

                        var new_x = co.graphics.command.x + old_d_x * cos - old_d_y * sin;
                        var new_y = co.graphics.command.y + old_d_y * cos + old_d_x * sin;

                        if (_DEFAULT.simulation) {
                            item.spx = (new_x - now_x) * _DEFAULT.bounce;
                            item.spy = (new_y - now_y) * _DEFAULT.bounce;
                        } else {
                            item.spx = new_x - now_x;
                            item.spy = new_y - now_y;
                        }
                    }
                }
                // debugger;
                if (_DEFAULT.simulation) {
                    if (Math.abs(item.spx) < 0.1) {
                        item.spx = 0
                    }
                    if (item.spx === 0 && Math.abs(item.spy) < 0.2) {
                        item.spy = 0
                    }
                    item.spy += _DEFAULT.gravity;
                }
                item.x += item.spx;
                var cacheY = item.y + item.spy;
                var maxY = co.graphics.command.y + co.graphics.command.radius - item.cr*2;
                item.y = cacheY > maxY ? maxY : cacheY;

                //大圆x边界

            }


            stage.update();
        }
    };//执行摇奖操作

    this.stop = function () {
        createjs.Ticker.reset();
    };//停止抽奖操作

    this.reset = function () {
        createjs.Ticker.reset();
        roll_contain.removeAllChildren();
        this.render();
    };

    this._getCenterDistance = function (x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    };
}