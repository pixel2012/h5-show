var conf = {
    id: 'canvas',
    canvas_width: 300,//画布宽
    canvas_height: 300,//画布高
    assets: [
        {
            id: 'pan',
            src: '../img/rotary/pan.png'
        },
        {
            id: 'btn',
            src: '../img/rotary/btn.png'
        },
        {
            id: 'pin',
            src: '../img/rotary/pin.png'
        }
    ],//预加载资源
};


var rotary = new Rotary(conf); //创建摇奖机实例

rotary.load({
    onProgress: function (evt) {
        console.log(evt);
        var num = evt.progress;
        console.log(num);
    },//进度
    onComplete: function (evt) {
        console.log(evt);
        rotary.render();
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
    rotary.start();
});

$('#pause').on('click', function () {
    rotary.stop();
});

$('#reset').on('click', function () {
    rotary.reset();
});
