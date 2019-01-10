var conf = {
    id: 'canvas',
    canvas_width: 200,//画布宽
    canvas_height: 200,//画布高
    total: 5,//球的随机总数量
    min_radius: 25,//最小半径
    max_radius: 25,//最大半径
    min_speed: 0,//最小速度
    max_speed: 10,//最大速度
    assets: [
        {
            id: 'pao',
            src: '../img/lottery/pao.png'
        }
    ],//预加载资源
};


var ernie = new Ernie(conf); //创建摇奖机实例

ernie.load({
    onProgress: function (evt) {
        console.log(evt);
        var num = evt.progress;
        console.log(num);
    },//进度
    onComplete: function (evt) {
        console.log(evt);
        ernie.render();
    },//全部加载完成
    onError: function (evt) {
        console.log(evt);
    },//加载出现失败
    onFileLoad: function (evt) {
        console.log(evt);
    },
    onFileProgress: function (evt) {
        console.log(evt);
    }
});

$('#start').on('click', function () {
    ernie.start();
});

$('#pause').on('click', function () {
    ernie.stop();
});

$('#reset').on('click', function () {
    ernie.reset();
});
