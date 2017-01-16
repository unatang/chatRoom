/**
 * Created by lyon on 2017/1/13.
 */
$(function () {
    timestamp = 0;                                            /* 时间戳 */
    updateMsg();                                              /* 调用更新信息函数 */
    $("#chatform").submit(function () {                      /* URL 要用双引号 */
        $.post("chat.html",{
            message: $("#msg").val(),                         /*  逗号 */
            name: $("#author").val(),
            action: "postmsg",
            time: timestamp
        }, function () {
            $("#msg").val("");
            addMessages();
        });
        return false;                                        /* 阻止表单提交 */
    }, "json");
});
/*  更新信息函数，每隔一定时间去服务器读取数据  */
function updateMsg() {
    $.post("chat.html", {
        time: timestamp
    }, function (json) {
        $("#loading").remove();
        addMessages(json);
    });
    setTimeout("updateMsg()", 4000);                           /* 每隔4秒，读取一次 */
}
/* 解析json文档函数， 将数据显示到页面上 */
function addMessages(json) {
    if($("status", json).text() == "2") return;              /* 请求成功 但没有更新信息 */
    timestamp = $("time", json).text();                      /* 更新时间戳 */
    $("message", json).each(function () {
        var author = $("author", this).text();
        var content = $("text", this).text();
        var htmlcode = "<strong>" + author + "</strong>: " + content + "<br />";
        $("#messagewindow").prpend(htmlcode);               //添加到文档中
    });
}

