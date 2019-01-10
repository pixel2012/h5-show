var conf = {
    id: 'canvas',
    canvas_width: 300,//画布宽
    canvas_height: 500,//画布高
    total: 10,//球的随机总数量
    min_radius: 0.1,//最小半径
    max_radius: 2,//最大半径
    min_speed: 1,//最小速度
    max_speed: 3,//最大速度
    fps: 60,//舞台刷新帧率
    assets: [
        {
            id: 'rp',
            src: '../img/red-packet-wars/rp.png'
        },
        {
            id: 'bz',
            src: '../img/red-packet-wars/bz.png'
        }
    ],//预加载资源
};


var ernie = new RedPacketWars(conf); //创建红包雨实例

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
