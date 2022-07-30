function Game_State(m_game, m_player) {
    this.game = m_game;
    this.player = m_player;
}

function Game(m_jushu, m_changfeng, m_benchang) {
    this.jushu = m_jushu; //局数
    this.changfeng = m_changfeng; //场风
    this.benchang = m_benchang; //本场数
    this.lichi_num = 0;
}

function Player(m_playerName, m_Point) {
    this.playerName = m_playerName;
    this.Point = m_Point;
    this.PointHistory = new Array();
}

// localStorage.setItem('paoking',)

if(localStorage.getItem('roundNum') == 'NaN'){
    localStorage.setItem('roundNum', 1);
}
chickenList = [0, 0, 0, 0];
rankDict = {
    0: 15000,
    1: 5000,
    2: -5000,
    3: -15000,
}

richi_img = {
    '帅气的主播': 'richi2.png',
    '帅松': 'sword3.png',
}

set_list = [
    [0, 1, 2, 3],
    [0, 1, 3, 2],
    [0, 2, 1, 3],
    [0, 2, 3, 1],
    [0, 3, 1, 2],
    [0, 3, 2, 1],
    [1, 0, 2, 3],
    [1, 0, 3, 2],
    [1, 2, 0, 3],
    [1, 2, 3, 0],
    [1, 3, 0, 2],
    [1, 3, 2, 0],
    [2, 0, 1, 3],
    [2, 0, 3, 1],
    [2, 1, 0, 3],
    [2, 1, 3, 0],
    [2, 3, 0, 1],
    [2, 3, 1, 0],
    [3, 0, 1, 2],
    [3, 0, 2, 1],
    [3, 1, 0, 2],
    [3, 1, 2, 0],
    [3, 2, 0, 1],
    [3, 2, 1, 0],
]

// rankDict = {
//     0: 18000,
//     1: 1000,
//     2: -7000,
//     3: -12000,
// }

var game = new Game(1, '东', 0);
var InitScore = 25000;
var player = [new Player('帅气的主播', InitScore), new Player('刘霸天', InitScore), new Player('帅松', InitScore), new Player('猛男！', InitScore)];
var game_state = new Array();

var rong_flag = [false, false, false, false]; //胡牌
var dianpao_flag = [false, false, false, false]; //点炮
var lichi_flag = [false, false, false, false]; //立直
var pao_count = [0, 0, 0, 0];
var hu_count = [0, 0, 0, 0];
var totalRound = 1;

var mainView = 0; //点差模式下主视角
var rong_list = [-1]; //[点炮者,[胡牌者1,点数],[胡牌者2,点数]]
var game_area_lock = false;

var IsClosePanel = false;

var Draw_Line_Curl = true;

var game_isStart = false;

var game_mode = 1;//1 半庄 2 速东 3 三麻 4 团战

var no_print = 0;

function clear_record(){
    localStorage.clear();
    localStorage.setItem('roundNum', 1);
    game_isStart = false;
    game = new Game(1, '东', 0);
    player = [new Player(player[0].playerName, InitScore), new Player(player[1].playerName, InitScore), new Player(player[2].playerName, InitScore), new Player(player[3].playerName, InitScore)];
    chickenList = [0, 0, 0, 0]
    game_state = new Array();
    RecordCurGameState();
    UpdateAllView(false);
};

function next_Game(Is_oya_win,bencheng_keep_flag) {  // 下一把 不是下一轮
    printGameStatus();
    game_isStart = true;
    if (Is_oya_win) {
        game.benchang += 1;
        
    } else {
        if(bencheng_keep_flag)
            game.benchang += 1;
        else
            game.benchang = 0;
        game.jushu += 1;
        if (game.jushu > 4) {
            game.jushu = 1;
            var cf = ['东', '南', '西', '北'];
            for (var i = 0; i < 4; i++) {
                if (cf[i] == game.changfeng) {
                    game.changfeng = cf[(i + 1) % 4];
                    break;
                }
            }
        }
    }
    
}

function sortPao(a, b) {
    if (pao_count[a] != pao_count[b])
        return pao_count[a] - pao_count[b];
    else
        return pao_count[b] - pao_count[a];
}
function sortHu(a, b) {
    if (hu_count[a] != hu_count[b])
        return hu_count[a] - hu_count[b];
    else
        return hu_count[b] - hu_count[a];
}

function show_status() {
    var ori = [0, 1, 2, 3];
    ori = ori.sort(sortPao);
    var ori2 = [0, 1, 2, 3];
    ori2 = ori2.sort(sortHu);
    alert('今日炮王已鉴定\n' + player[ori[3]].playerName + '! 点炮次数为' +  pao_count[ori[3]] + '次！\n' + '今日雀圣已鉴定\n' + 
    player[ori2[3]].playerName + '! 和牌次数为' +  hu_count[ori2[3]] + '次！\n');
    // alert(hu_count[0] + ' ' + hu_count[1] + ' ' + hu_count[2] + ' ' + hu_count[3] + '\n'
    // + ori[0] + ' ' + ori[1] + ' ' + ori[2] + ' ' + ori[3]+ '\n'
    // +pao_count[0] + ' ' + pao_count[1] + ' ' + pao_count[2] + ' ' + pao_count[3]+ '\n'
    // + ori2[0] + ' ' + ori2[1] + ' ' + ori2[2] + ' ' + ori2[3]+ '\n');
    
}

function chang_line_mode() {
    Draw_Line_Curl = !Draw_Line_Curl;
    $('#change_line_mode span').text(Draw_Line_Curl ? "绘制直线" : "绘制曲线");
    DrawLine();
}

function random_dice() {
    var bias = [0, -50, -106, -163, -219, -275];
    for (var i = 0; i < 2; i++) {
        var dice_value = parseInt(Math.random() * 6);
        $q('.dice', i).css("background-position", bias[dice_value] + 'px')
    }
}

function RecordCurGameState() {
    game_state.push(new Game_State(clone(game), clone(player)));
    DrawLine();
    DrawPieChart();
}

function RecoverGameState() {
    if ($('#liuju_btn').text() != '流') {
        $('#liuju_btn').text('流');
        $('.liuju_icon').removeClass('liuju_ting');
        $('.liuju_icon').addClass('liuju_noting');
        $(".liuju_icon").css("visibility", "hidden");
    } else {
        if (game_state.length > 1) {
            game_state.pop();
            game = clone(game_state[game_state.length - 1].game);
            player = clone(game_state[game_state.length - 1].player);
            $("#myTab0_Content3").append('<br>'  + '撤回' + '</br>');
            DrawLine();
            DrawPieChart();
            UpdateAllView();
        }
    }
}

function resizeCanvas() {
    $("#linechartContainer").width(document.documentElement.clientWidth - 450 + (IsClosePanel ? 1 : 0) * 400 + 'px');
    $("#linechartContainer").height(450 + 'px');
};

$(document).ready(
    function () {
        $(window).resize(resizeCanvas);
        resizeCanvas();
        $('input').bind('change', EditPlayerName);
        UpdateUserName();

        $('#myonoffswitch').change(ChangePointShowMode);
        ShowPoint(false);

        UpdateAllView();
        $('#fanfu_ok').attr("disabled", true);

        RecordCurGameState();
        ChangeSetOption();
        $("#change_set").bind('change', function(){
            set_index = eval("[" + $("#change_set").val().slice($("#change_set").val().length-7,$("#change_set").val().length) + "]");
            playername_0 = player[set_index[0]].playerName;
            playername_1 = player[set_index[1]].playerName;
            playername_2 = player[set_index[2]].playerName;
            playername_3 = player[set_index[3]].playerName;
            player[0].playerName = playername_0;
            player[1].playerName = playername_1;
            player[2].playerName = playername_2;
            player[3].playerName = playername_3;
            UpdateUserName();
        })
        //set_tooltip();
    }
);

function ScoreAnimate() {
    for (var i = 0; i < 4; i++) {
        var score_dif = player[i].Point - parseInt($q('.playerscore', i).text());

        if (score_dif == 0)
            continue;
        if (score_dif > 0) score_dif = "+" + score_dif;
        $q(".playerscore_animate", i).text(score_dif);
        $q(".playerscore_animate", i).css("top", "40px");
        $q(".playerscore_animate", i).css("opacity", "1.0");
        $q(".playerscore_animate", i).animate({
            top: "-=100px",
            opacity: '0.6',
        }, 1000).animate({
            opacity: '0.0',
        }, 3000);
    }
}

function UpdateAllView() {
    if (arguments.length == 0)
        ScoreAnimate();
    ChangePointShowMode(); //更新点差显示模式
    UpdateGameProcess(); //更新右上角进度
    UpdateFengwei(); //更新风位
    UpdateRank(); //更新顺位
    UpdateChicken(); //更新烧鸡！
    $("#lichi_num").text(game.lichi_num);
    random_dice();
}

function UpdateChicken() {
    for (var i=0; i<4; i++){
        if(chickenList[i]==0){
            $("#player" + (i + 1) + " .yakitori").show()
        }else{
            $("#player" + (i + 1) + " .yakitori").hide()
        }
    }
}

function sortRank(a, b) {
    /*同分逻辑需要重写，高位同分首庄开始算起(已完成)，地位同分离高位近的开始算起！！*/
    if (player[a].Point != player[b].Point)
        return player[b].Point - player[a].Point;
    else
        return a - b;
}

function UpdateRank() {
    var ori = [0, 1, 2, 3];
    ori = ori.sort(sortRank);
    for (var i = 0; i < 4; i++) {
        $q('.weici', ori[i]).text(i + 1 + '位');
    }
}

function ShowPoint(DiffMode) {
    for (var i = 0; i < 4; i++) {
        if (DiffMode) {
            var score_diff = player[i].Point - player[mainView].Point * (i != mainView);
            $('.playerscore', $('.playerinfoarea')[i]).text((score_diff>0 && i!=mainView?"+":"")+score_diff);
        } else {
            $('.playerscore', $('.playerinfoarea')[i]).text(player[i].Point);
        }
    }
}

function UpdateFengwei() //更新风位
{
    $q('.playerpos', (game.jushu + 3) % 4).text('东');
    $q('.playerpos', (game.jushu + 4) % 4).text('南');
    $q('.playerpos', (game.jushu + 5) % 4).text('西');
    $q('.playerpos', (game.jushu + 6) % 4).text('北');

}

function ChangePointShowMode() {
    $('.playerpos').not(function (id) {
        return id == mainView
    }).removeClass('mainviewcl');
    $q('.playerpos', mainView).addClass('mainviewcl');
    ShowPoint(!$("#myonoffswitch").is(':checked'));
}

function EditPlayerName() {
    for (var i = 0; i < 4; i++) {
        player[i].playerName = $('#playerName input')[i].value;
    }
    UpdateUserName();
}

function UpdateUserName() {
    for (var i = 0; i < 4; i++) {
        $("#playerName  input")[i].value = player[i].playerName;
        $('.playername', $('.playerinfoarea')[i]).text(player[i].playerName);
        if(player[i].playerName in richi_img){
            $('.playerscorediff', $('.playerinfoarea')[i]).css('background','url(img/' + richi_img[player[i].playerName] + ') no-repeat');
            $('.playerscorediff', $('.playerinfoarea')[i]).css('background-size','100% 100%');
        }else{
            $('.playerscorediff', $('.playerinfoarea')[i]).css('background','url(img/lichi.gif) no-repeat');
            $('.playerscorediff', $('.playerinfoarea')[i]).css('background-size','100% 100%');
        }
    }
    DrawPieChart();
    DrawLine();
    ChangeSetOption();
}


function ChangeSetOption(){
    $("#change_set").empty();
    for(var i=0;i<24;i++){
        $("#change_set").append("<option>" + "东:" + player[set_list[i][0]].playerName + " 南:" + player[set_list[i][1]].playerName +
        " 西:" + player[set_list[i][2]].playerName + " 北:" + player[set_list[i][3]].playerName + set_list[i] + "</option>");
    }
}

function UpdateGameProcess() {
    var chn = ['一', '二', '三', '四'];
    $("#changkuang").text(game.changfeng + chn[game.jushu - 1] + '局');
    $("#benchangshu").text(game.benchang + '本场');
    if (no_print == 0) {
        $("#myTab0_Content3").append('<br>'+game.changfeng + chn[game.jushu - 1] + '局' + game.benchang + '本场 ' + '总第' + totalRound+ '局' + '</br>');
        totalRound++;
    }
}

function printGameStatus() {
    $("#myTab0_Content3").append(''+ '分数统计：'+player[0].playerName + ':' + player[0].Point);
    $("#myTab0_Content3").append(':'+player[1].playerName + ':' + player[1].Point);
    $("#myTab0_Content3").append(':'+player[2].playerName + ':' + player[2].Point);
    $("#myTab0_Content3").append(':'+player[3].playerName + ':' + player[3].Point + '<br>');
}

//随机换座位
function make_random_position() {
    if (game_isStart) {
        ShowErrorStr(-7);
        return;
    }
    var name_tmp = [player[0].playerName, player[1].playerName, player[2].playerName, player[3].playerName]
    name_tmp = randomOrder(name_tmp)
    for (var i = 0; i < 4; i++)
        player[i].playerName = name_tmp[i];
    UpdateUserName();
}

function rong_click(idx) {
    if (game_area_lock) return;
    rong_flag[idx] = !rong_flag[idx];
    if (rong_flag[idx] == false) {
        $("#player" + idx + "_rong").text("自摸");
        // $("#myTab0_Content3").append(player[idx].playerName+ ' 自摸！');
        $("#player" + idx + "_rong").removeClass('t_btn_click');
    } else {
        $("#player" + idx + "_rong").text("取消");
        // $("#myTab0_Content3").append(player[idx].playerName+ ' 取消自摸！');
        $("#player" + idx + "_rong").addClass('t_btn_click');
        if (dianpao_flag[idx] == true) {
            $("#player" + idx + "_dianpao").text("点炮");
            $("#player" + idx + "_dianpao").removeClass('t_btn_click');
            dianpao_flag[idx] = false;
        }
    }
    Set_OKbtn_Text();
}

function dianpao_click(idx) {
    if (game_area_lock) return;
    dianpao_flag[idx] = !dianpao_flag[idx];
    if (dianpao_flag[idx] == false) {
        $("#player" + idx + "_dianpao").text("点炮");
        // $("#myTab0_Content3").append(player[idx].playerName+ ' 点炮！');
        $("#player" + idx + "_dianpao").removeClass('t_btn_click');
    } else {
        $("#player" + idx + "_dianpao").text("取消");
        // $("#myTab0_Content3").append(player[idx].playerName+ ' 取消点炮！');
        $("#player" + idx + "_dianpao").addClass('t_btn_click');
        if (rong_flag[idx] == true) { //不可能同时胡牌和点炮
            $("#player" + idx + "_rong").text("自摸");
            $("#player" + idx + "_rong").removeClass('t_btn_click');
            rong_flag[idx] = false;
        }
        for (var i = 0; i < 4; i++) //逻辑保证只能有一个点炮的
        {
            if (i == idx) continue;
            dianpao_flag[i] = false;
            $("#player" + i + "_dianpao").removeClass('t_btn_click');
        }
    }

    var has_dianpao = dianpao_flag[0] || dianpao_flag[1] || dianpao_flag[2] || dianpao_flag[3];
    for (var i = 0; i < 4; i++) {
        if (rong_flag[idx] == false) {
            $("#player" + i + "_rong").text(has_dianpao ? "胡牌" : "自摸");
        }
    }
}

function lichi_click(idx) {
    if (game_area_lock) return;
    lichi_flag[idx] = !lichi_flag[idx];
    if (player[idx].playerName == "帅松") {
        var audio = document.getElementById('chao_bgm');
        audio.pause();
        var audio = document.getElementById('song_bgm');
        audio.pause();
        audio.currentTime = 0;//音乐从头播放
        audio.play();
    } else if (player[idx].playerName == "帅气的主播") {
        var audio = document.getElementById('song_bgm');
        audio.pause();
        var audio = document.getElementById('chao_bgm');
        audio.pause();
        audio.currentTime = 0;//音乐从头播放
        audio.play();
    }

    if (lichi_flag[idx]) {
        $q('.playerinfoarea', idx).addClass("lichi");
        player[idx].Point -= 1000;
        $("#myTab0_Content3").append(player[idx].playerName+ ' 立直！-' + 1000 + ' 点 ');
        game.lichi_num += 1;
        $('#player' + parseInt(idx + 1)).animate({
            left: "+=2%"
        }, 100).animate({
            left: "-=2%"
        }, 100).animate({
            left: "+=2%"
        }, 100).animate({
            left: "-=2%"
        }, 100).animate({
            left: "+=2%"
        }, 100).animate({
            left: "-=2%"
        }, 100).animate({
            left: "+=2%"
        }, 100).animate({
            left: "-=2%"
        }, 100)
    } else {
        $q('.playerinfoarea', idx).removeClass("lichi");
        player[idx].Point += 1000;
        $("#myTab0_Content3").append(player[idx].playerName+ ' +' + 1000 + ' 点 ');
        game.lichi_num -= 1
    }
    no_print = 1;
    UpdateAllView();
    no_print = 0;
}

function changeView(idx) {
    mainView = idx;
    ChangePointShowMode();
}

function Set_OKbtn_Text() {
    var text = "确定";
    $('#fanfu_ok').attr("disabled", true);
    for (var i = 0; i < 4; i++) {
        if (rong_flag[i]) {
            text += "(" + player[i].playerName + ")";
            $('#fanfu_ok').attr("disabled", false);
            break;
        }
    }
    $('#fanfu_ok')[0].value = text;
}

function Cal_BaseScore() { //基本点计算
    var fanshu_idx = -1;
    var fushu_idx = -1;
    $('#fanshu_field .fanfu_btn').each(function (idx) {
        if ($q('#fanshu_field .fanfu_btn', idx).hasClass('fanshu_clk'))
            fanshu_idx = idx;
    })
    if (fanshu_idx == -1) {
        return -1;
    }

    if (fanshu_idx < 4) { //  ≤4番
        $('#fushu_field .fanfu_btn').each(function (idx) {
            if ($q('#fushu_field .fanfu_btn', idx).hasClass('fushu_clk'))
                fushu_idx = idx;
        })
        if (fushu_idx == 0 && fanshu_idx == 0) //1番20符的特例要变1番30符
        {
            fushu_idx = 2;
        }
        if (fushu_idx == 1 && fanshu_idx == 0) //1番25符的情况不存在
        {
            return -3;
        }
        if (fushu_idx == -1) {
            return -2;
        }
        var t = parseInt($q('#fushu_field .fanfu_btn', fushu_idx)[0].value) * Math.pow(2, fanshu_idx + 1 + 2);
        return t < 2000 ? t : 2000;

    } else {
        var score_idx = [2000, 3000, 4000, 6000]; //满贯，跳满，倍满，三倍满
        if (fanshu_idx != 8)
            return score_idx[fanshu_idx - 4];
        else
            return 8000 * parseInt($q('#fanshu_field .fanfu_btn', 8)[0].value[0]); //役满数目
    }
}

function ShowErrorStr(base_score) {
    if (base_score == -1)
        $('#fanfu_ok')[0].value = '番数未设置';
    if (base_score == -2)
        $('#fanfu_ok')[0].value = '符数未设置';
    if (base_score == -3)
        $('#fanfu_ok')[0].value = '一番25符是不可能的！！';
    if (base_score == -4)
        $('#fanfu_ok')[0].value = '自摸人数太多了！！';
    if (base_score == -5)
        $('#fanfu_ok')[0].value = '一炮三响是流局！！';
    if (base_score == -6)
        $('#fanfu_ok')[0].value = '四人点炮你逗我？！！';
    if (base_score == -7)
        $('#fanfu_ok')[0].value = '游戏已经开始了';
    setTimeout("Set_OKbtn_Text()", 1000);
}

function score_give(from, to, score) {
    player[from].Point -= score;
    player[to].Point += score;
}

function CalScore_OK() {
    var audio = document.getElementById('chao_bgm');
    audio.pause();
    var audio = document.getElementById('song_bgm');
    audio.pause();
    var rong_num = rong_flag[0] + rong_flag[1] + rong_flag[2] + rong_flag[3];
    var is_zimo = !dianpao_flag[0] && !dianpao_flag[1] && !dianpao_flag[2] && !dianpao_flag[3];

    if (!is_zimo && rong_num == 3) { //一炮三响
        ShowErrorStr(-5);
        liuju_cal([0, 0, 0, 0], !rong_flag[game.jushu - 1]);
        return;
    }
    if (!is_zimo && rong_num == 4) { //胡牌人数四个人，你特么在逗我？！
        ShowErrorStr(-6);
        return;
    }

    if (is_zimo & rong_num > 1) { //超过1人自摸
        ShowErrorStr(-4);
        return;
    }

    var base_score = Cal_BaseScore();
    if (base_score < 0) {
        ShowErrorStr(base_score);
        return;
    }

    var zimo_idx = rong_flag[0] ? 0 : (rong_flag[1] ? 1 : (rong_flag[2] ? 2 : 3));
    if (is_zimo) { //自摸    
        if (zimo_idx == game.jushu - 1) { //庄家自摸
            var tmp = 0;
            for (var i = 0; i < 4; i++) {
                if (i == zimo_idx) {
                    
                    continue;
                }
                
                score_give(i, zimo_idx, ScoreUpper(base_score * 2) + 100 * game.benchang);
                tmp = ScoreUpper(base_score * 2) + 100 * game.benchang;
                $("#myTab0_Content3").append('<STRONG>'+player[i].playerName+ '</STRONG> 失去' + tmp + ' 点 ');
                chickenList[zimo_idx] = 1;
            }
            $("#myTab0_Content3").append('<STRONG>'+player[zimo_idx].playerName+ '</STRONG> 自摸！得到' + tmp*3 + ' 点 ');
            hu_count[zimo_idx]++;
            $("#myTab0_Content3").append('<br>');
            next_Game(true, true);
        } else { //闲家自摸
            for (var i = 0; i < 4; i++) {
                var tmp = 0;
                if (i == zimo_idx) {
                    var tmp2 = base_score * 3 + 300 * game.benchang;
                    $("#myTab0_Content3").append('<STRONG>'+player[zimo_idx].playerName+ '</STRONG> 自摸！得到' + tmp2+ ' 点 ');
                    hu_count[zimo_idx]++;
                    continue;
                }
                score_give(i, zimo_idx, ScoreUpper(base_score * (1 + (i == game.jushu - 1))) + 100 * game.benchang);
                tmp = ScoreUpper(base_score * (1 + (i == game.jushu - 1))) + 100 * game.benchang;
                $("#myTab0_Content3").append('<STRONG>'+player[i].playerName+ '</STRONG> 失去' + tmp + ' 点 ');
                chickenList[zimo_idx] = 1;
            }
            $("#myTab0_Content3").append('<br>');
            next_Game(false,false);
        }
        //处理立直棒
        collect_lichi(zimo_idx);
        Reset_Game_panel();
        UpdateAllView();
        RecordCurGameState();
        Set_OKbtn_Text();
    } //自摸-END
    else { //点炮
        var dianpao_player_idx = dianpao_flag[0] ? 0 : (dianpao_flag[1] ? 1 : (dianpao_flag[2] ? 2 : 3));
        // $("#myTab0_Content3").append(player[dianpao_player_idx].playerName+ ' 放炮！失去 ' + base_score + ' 点 ');
        rong_list[0] = dianpao_player_idx;
        for (var i = 0; i < 4; i++) {
            if (rong_flag[i]) {
                rong_flag[i] = false;
                $("#player" + i + "_rong").text("胡牌");
                $("#player" + i + "_rong").removeClass('t_btn_click');
                rong_list.push([i, base_score]);
                
                chickenList[i] = 1;
                break;
            }
        }
        $("#myTab0_Content3").append('<br>');
        Set_OKbtn_Text();
        if (rong_flag[0] + rong_flag[1] + rong_flag[2] + rong_flag[3] == 0) { //处理完全部胡牌了
            deal_dianpao();
        } else {
            game_area_lock = true; //一炮双响,锁定面板，不允许操作
        }
    }

}

function collect_lichi(idx) { //第idx玩家获得剩下所有立直棒。
    if (game.lichi_num != 0) {
        $("#myTab0_Content3").append('<strong>'+player[idx].playerName+ '</strong> 得到立直棒 ' + game.lichi_num*1000 + ' 点 ');
    }
    player[idx].Point += 1000 * game.lichi_num;
    game.lichi_num = 0;
}

function deal_dianpao() {
    var oya_win = false;

    var dianpao_player = rong_list[0];
    var nearest_dis = 999999;
    var nearest_idx = -1;
    for (var i = 1; i < rong_list.length; i++) {
        var rong_player = rong_list[i][0];
        var score = rong_list[i][1];
        score_give(dianpao_player, rong_player, ScoreUpper(score * (4 + 2 * (rong_player == game.jushu - 1))) + 300 * game.benchang);
        var tmp = ScoreUpper(score * (4 + 2 * (rong_player == game.jushu - 1))) + 300 * game.benchang;
        $("#myTab0_Content3").append('<STRONG>'+player[dianpao_player].playerName+ '</STRONG> 点炮！ ' + '<EM>' + player[rong_player].playerName 
        + ' </EM>得到 '+ tmp + ' 点 ');
        pao_count[dianpao_player]++;
        hu_count[rong_player]++;
        //寻找最近的作为立直棒所有者
        var dis = rong_player > dianpao_player ? rong_player - dianpao_player : rong_player - dianpao_player + 4;
        if (nearest_dis > dis) {
            nearest_dis = dis;
            nearest_idx = rong_player;
        }

        if (rong_player == game.jushu - 1) {
            oya_win = true;
        }
    }

    collect_lichi(nearest_idx);
    game_area_lock = false;
    next_Game(oya_win,oya_win);
    UpdateAllView();
    Reset_Game_panel();
    RecordCurGameState();
    rong_list = [-1];
}

function liuju() {
    if (game_area_lock) return;
    if ($('#liuju_btn').text() == '流') {
        $(".liuju_icon").css("visibility", "visible");
        $('#liuju_btn').text('定');
        for (var i = 0; i < 4; i++) { //立直流局必然听牌。。。。。。吧。。。。反正可以撤销
            if ($q('.playerinfoarea', i).hasClass("lichi")) {
                $q('.liuju_icon', i).removeClass('liuju_noting');
                $q('.liuju_icon', i).addClass('liuju_ting');
            }
        }
    } else {
        //流局逻辑
        var tingpai = [0, 0, 0, 0];
        var tingpai_user_ct = 0;
        for (var i = 0; i < 4; i++) {
            if ($q('.liuju_icon', i).hasClass('liuju_ting')) {
                tingpai[i] = 1;
                tingpai_user_ct += 1;
            }
        }
        if (tingpai_user_ct == 0 || tingpai_user_ct == 4) {
            liuju_cal([0, 0, 0, 0], tingpai_user_ct == 0);
        } else {
            for (var i = 0; i < 4; i++) {
                if (tingpai_user_ct == 1)
                    tingpai[i] = tingpai[i] ? 3000 : -1000;
                else if (tingpai_user_ct == 2)
                    tingpai[i] = tingpai[i] ? 1500 : -1500;
                else
                    tingpai[i] = tingpai[i] ? 1000 : -3000;
            }
            liuju_cal(tingpai, tingpai[game.jushu - 1] > 0 ? false : true);
        }
        $('#liuju_btn').text('流');
        $('.liuju_icon').removeClass('liuju_ting');
        $('.liuju_icon').addClass('liuju_noting');
        $(".liuju_icon").css("visibility", "hidden");
    }
}

function Reset_Game_panel() {
    rong_flag = [false, false, false, false];
    dianpao_flag = [false, false, false, false];
    lichi_flag = [false, false, false, false];
    for (var i = 0; i < 4; i++) {
        $q('.rong_btn', i).text('自摸');
        $q('.dianpao_btn', i).text('点炮');
    }
    $('.rong_btn').removeClass('t_btn_click');
    $('.dianpao_btn').removeClass('t_btn_click');
    $('.playerinfoarea').removeClass("lichi");
}

function liuju_cal(score_list, oya_lose) {
    if (game_area_lock) return;
    for (var i = 0; i < 4; i++) {
        player[i].Point += score_list[i];
        $("#myTab0_Content3").append('<strong>'+player[i].playerName+ '</strong>  + ' + score_list[i]+' 流局！！！！ <br>');
    }
    next_Game(!oya_lose,true);
    UpdateAllView();
    Reset_Game_panel();
    RecordCurGameState();
}


function end_game() {
    rankList = [parseInt($("#player1 .weici").text().slice(0,1))-1,
        parseInt($("#player2 .weici").text().slice(0,1))-1,
        parseInt($("#player3 .weici").text().slice(0,1))-1,
        parseInt($("#player4 .weici").text().slice(0,1))-1];
        $("#myTab0_Content3").append('<br>半庄结算:' +
            player[0].playerName + ":" + (rankList[0] + 1) + "位:" + player[0].Point + ':' +
            player[1].playerName + ":" + (rankList[1] + 1) + "位:" + player[1].Point + ':' +
            player[2].playerName + ":" + (rankList[2] + 1) + "位:" + player[2].Point + ':' +
            player[3].playerName + ":" + (rankList[3] + 1) + "位:" + player[3].Point +
        '</br>');
    alert(player[0].playerName + (rankList[0] + 1) + "位 " + rankDict[rankList[0]] + '\n' +
        player[1].playerName + (rankList[1] + 1) + "位 " + rankDict[rankList[1]] + '\n' +
        player[2].playerName + (rankList[2] + 1) + "位 " + rankDict[rankList[2]] + '\n' +
        player[3].playerName + (rankList[3] + 1) + "位 " + rankDict[rankList[3]]
    );
    player[0].Point += rankDict[rankList[0]];
    player[1].Point += rankDict[rankList[1]];
    player[2].Point += rankDict[rankList[2]];
    player[3].Point += rankDict[rankList[3]];
    chickenPlayer = [];
    chickenSum = chickenList[0] + chickenList[1] + chickenList[2] + chickenList[3];
    if(chickenSum == 1){
        for(i=0;i<4;i++){
            if(chickenList[i] == 0){
                player[i].Point -= 5000
                chickenPlayer.push(player[i].playerName + '-5000')
            }else{
                player[i].Point += 15000
            }
        }
    }else{
        if(chickenSum == 2){
            for(i=0;i<4;i++){
                if(chickenList[i] == 0){
                    player[i].Point -= 5000
                    chickenPlayer.push(player[i].playerName + '-5000')
                }else{
                    player[i].Point += 5000
                }
            }
        }else{
            if(chickenSum == 3){
                for(i=0;i<4;i++){
                    if(chickenList[i] == 0){
                        player[i].Point -= 15000
                        chickenPlayer.push(player[i].playerName + '-15000')
                    }else{
                        player[i].Point += 5000
                    }
                }
            }
        }
    }
    if(chickenPlayer.length>0){
        alert('义眼丁真，鉴定为 烧!\n' + chickenPlayer.join('\n'));
    }
    scoreRecord = {
        player0:{name:player[0].playerName,score:player[0].Point},
        player1:{name:player[1].playerName,score:player[1].Point},
        player2:{name:player[2].playerName,score:player[2].Point},
        player3:{name:player[3].playerName,score:player[3].Point}
    };
    scoreString = JSON.stringify(scoreRecord);
    roundNum = parseInt(localStorage.getItem('roundNum'));
    localStorage.setItem('round' + roundNum.toString(), scoreString);
    localStorage.setItem('roundNum', roundNum + 1);

    game_isStart = false;
    game = new Game(1, '东', 0);
    player = [new Player(player[0].playerName, InitScore), new Player(player[1].playerName, InitScore), new Player(player[2].playerName, InitScore), new Player(player[3].playerName, InitScore)];
    chickenList = [0, 0, 0, 0]
    game_state = new Array();
    RecordCurGameState();
    UpdateAllView(false);
}

function end_game_no_record() {
    game_isStart = false;
    game = new Game(1, '东', 0);
    player = [new Player(player[0].playerName, InitScore), new Player(player[1].playerName, InitScore), new Player(player[2].playerName, InitScore), new Player(player[3].playerName, InitScore)];
    game_state = new Array();
    RecordCurGameState();
    UpdateAllView(false);
}

function change_game_mode() {
    if (game_isStart) {
        alert("请先结束战斗！！");
        return;
    }
    if(game_mode == 1)
    {
        $('#change_game_mode span').html('速东模式');
        game_mode = 2;
        InitScore = 20000;
        end_game_no_record();
    }
    else
    {
        $('#change_game_mode span').html('半庄模式');
        game_mode = 1;
        InitScore = 25000;
        end_game_no_record();
    }
}

function close_setting_panel() {
    $(".nTab").css("position", "absolute");
    $(".nTab").css("left", "-1000px");
    IsClosePanel = true;
    resizeCanvas();
    DrawLine();
}

function expand_panel() {
    $(".nTab").css("position", "relative");
    $(".nTab").css("left", "-0px");
    IsClosePanel = false;
    resizeCanvas();
    DrawLine();
}

function totalScore(){
    roundNum = localStorage.getItem('roundNum') - 1;
    playerList = [];
    for(i=1; i<=roundNum; i++){
        roundData = JSON.parse(localStorage.getItem('round' + i));
        if(playerList.indexOf(roundData['player0']['name']) == -1){
            playerList.push(roundData['player0']['name'])
        };
        if(playerList.indexOf(roundData['player1']['name']) == -1){
            playerList.push(roundData['player1']['name'])
        };
        if(playerList.indexOf(roundData['player2']['name']) == -1){
            playerList.push(roundData['player2']['name'])
        };
        if(playerList.indexOf(roundData['player3']['name']) == -1){
            playerList.push(roundData['player3']['name'])
        };
    }
    
    $("#myTab0_Content1").empty();
    $("#myTab0_Content1").append('<table id="scoreTable"></table>');
    $("#scoreTable").append('<tr id="scoreTitle"></tr>')
    $("#scoreTitle").append('<th>选手</th>')
    for(i=1; i<=roundNum; i++){
        $("#scoreTitle").append('<th>round' + i + '</th>')
    }
    $("#scoreTitle").append('<th>总分</th>')
    for(j=0;j<playerList.length;j++){
        $("#scoreTable").append('<tr id="scoreRow' + j + '"></tr>');
        $("#scoreRow" + j).append('<td>' + playerList[j] + '</td>');
        scoreSum = 0;
        for(i=1; i<=roundNum; i++){
            roundData = JSON.parse(localStorage.getItem('round' + i));
            scoreTd = '';
            if(playerList[j]==roundData['player0']['name']){
                scoreTd = roundData['player0']['score'];
                scoreSum += roundData['player0']['score'] - 25000;
            };
            if(playerList[j]==roundData['player1']['name']){
                scoreTd = roundData['player1']['score'];
                scoreSum += roundData['player1']['score'] - 25000;
            };
            if(playerList[j]==roundData['player2']['name']){
                scoreTd = roundData['player2']['score'];
                scoreSum += roundData['player2']['score'] - 25000;
            };
            if(playerList[j]==roundData['player3']['name']){
                scoreTd = roundData['player3']['score'];
                scoreSum += roundData['player3']['score'] - 25000;
            };
            $("#scoreRow" + j).append('<td>' + scoreTd + '</td>')
        }
        $("#scoreRow" + j).append('<td>' + scoreSum + '</td>')
    }

}

function playJiupai() {
    var audio = document.getElementById('jiupai_bgm');
    audio.pause();
    audio.currentTime = 0;//音乐从头播放
    audio.play();
}

function playSifeng() {
    var audio = document.getElementById('sifeng_bgm');
    audio.pause();
    audio.currentTime = 0;//音乐从头播放
    audio.play();
}