
$(document).ready(function () {

    if ($('#sn_main').length == 1) {

        var info = '' +
            '<div id="sn_info">' +
            '   <span id="sn_options">' + 
            '       <input id="sn_width" type="number" class="sn_input" placeholder="width" title="width (min: 250)" min="250" step="10" value="250" />' +
            '       <input id="sn_height" type="number" class="sn_input" placeholder="height" title="height (min: 250)" min="250" step="10" value="250" />' +
            '       <select id="sn_speed" type="number" title="speed">' +
            '           <option>slow</option>' +
            '           <option selected>medium</option>' +
            '           <option>fast</option>' +
            '           <option>light</option>' +
            '           <option>speed of flash</option>' +
            '       </select>' +
            '       <label for="sn_auto" >CPU:</label> <input id="sn_auto" type="checkbox" />' +
            '       <button id="sn_startBtn" type="button" onclick="sn_start()">Lets Go!</button>' +
            '   </span>' +
            '   <br>' +
            '   <span class="hideOnStart">Controls:Arrow Keys</span>' +
            '   <br>' +
            '   <span class="hideOnStart">Your Score:</span> <span id="sn_score"></span>' +
            '</div>';

        var init = '' +
            '<div id="p1" class="sn_point hideOnStart" style="top:20px;left:0px;z-index: 1;background-color:black"></div>' +
            '<div id="p2" class="sn_point hideOnStart" style="top:10px;left:0px;"></div>' +
            '<div id="p3" class="sn_point hideOnStart" style="top:0px;left:0px;"></div>';

        var container = $('<div style="margin:20px">');

        $('#sn_main').before(container).prepend(init).after(info);
        container.append($('#sn_main'));

        $('.hideOnStart').hide();
    }
});

function sn_start() {

    var speed = $('#sn_speed').val();
    if (speed == 'slow')
        speed = 1;
    else if (speed == 'medium')
        speed = 3;
    else if (speed == 'fast')
        speed = 6;
    else if (speed == 'light')
        speed = 12;
    else if (speed == 'speed of flash')
        speed = 50;

    new Snake({ width: $('#sn_width').val(), height: $('#sn_height').val(), speed: speed, auto: $('#sn_auto').is(':checked') }).start();
}

function Snake(ops) {

    var snake = this;

    this.init = function (ops) {

        $('.hideOnStart').show();

        if (!ops.width) {

            var w = $(window).width() - 40;
            if (w < 250)
                w = 250;
            w = w - (w % 10);
            ops.width = w;
        }
        else if (ops.width < 250)
            ops.width = 250;

        if (!ops.height) {

            var h = $(window).height() - 40;
            if (h < 250)
                h = 250;
            h = h - (h % 10);
            ops.height = h;
        }
        else if (ops.height < 250)
            ops.height = 250;

        $.extend(snake.options, ops);
        if (snake.options.width % 10 > 0)
            snake.options.width = snake.options.width - (snake.options.width % 10);
        if (snake.options.height % 10 > 0)
            snake.options.height = snake.options.height - (snake.options.height % 10);

        $('#sn_main').width(snake.options.width).height(snake.options.height);
        snake.setOptionsStr();

        for (var i = 0; i < snake.options.width; i = i + 10) {
            for (var j = 0; j < snake.options.height; j = j + 10) {
                if (i == 0 && j < 21)
                    snake.bodyArray.push([i, j]);
                else
                    snake.emptyArray.push([i, j]);
            }
        }
    };

    this.setOptionsStr = function () {

        if (snake.options.speed == 1)
            snake.options.speed = 'slow';
        else if (snake.options.speed == 3)
            snake.options.speed = 'medium';
        else if (snake.options.speed == 6)
            snake.options.speed = 'fast';
        else if (snake.options.speed == 12)
            snake.options.speed = 'light';
        else if (snake.options.speed == 50)
            snake.options.speed = 'speed of flash';

        $('#sn_options').html('options: ' + JSON.stringify(snake.options));

        if (snake.options.speed == 'slow')
            snake.options.speed = 1;
        else if (snake.options.speed == 'medium')
            snake.options.speed = 3;
        else if (snake.options.speed == 'fast')
            snake.options.speed = 6;
        else if (snake.options.speed == 'light')
            snake.options.speed = 12;
        else if (snake.options.speed == 'Speed of flash')
            snake.options.speed = 50;
    }

    this.options = { speed: 2, auto: false };
    this.emptyArray = [];
    this.bodyArray = [];
    this.reasonsOfDeath = { LIMITS: 0, COLLISION: 1 };
    this.directions = { UP: 0, DOWN: 1, RIGHT: 2, LEFT: 3 };

    snake.init(ops);

    this.dir = snake.directions.DOWN;
    this.p_index = $('.sn_point').length;
    this.head = $('#p1');
    this.limit = { left: 0, top: 0, right: snake.options.width - 10, bottom: snake.options.height - 10 };

    this.start = function () {

        $(document).keydown(snake.keyDown);
        snake.feed();
        snake.move();
    };

    this.move = function () {

        if (snake.options.auto)
            snake.autoTurn();

        if (snake.control()) {

            var prevTop = snake.head.position().top;
            var prevLeft = snake.head.position().left;

            if (snake.dir == snake.directions.RIGHT)
                snake.head.css('left', (prevLeft + 10) + 'px');
            else if (snake.dir == snake.directions.LEFT)
                snake.head.css('left', (prevLeft - 10) + 'px');
            else if (snake.dir == snake.directions.UP)
                snake.head.css('top', (prevTop - 10) + 'px');
            else if (snake.dir == snake.directions.DOWN)
                snake.head.css('top', (prevTop + 10) + 'px');

            var headPos = snake.head.position();

            snake.bodyArray.push([headPos.left, headPos.top]);
            snake.emptyArray = snake.removeArrayElement(snake.emptyArray, headPos.left, headPos.top);

            var foodPos = $('.sn_food').position();
            var hungry = true;
            if (headPos.top == foodPos.top && headPos.left == foodPos.left) {

                snake.eat();
                hungry = false;
            }

            $('#sn_score').text(snake.p_index);

            for (var i = snake.bodyArray.length - 3; i >= 0; i--) {

                $('#p' + (snake.bodyArray.length - i - 1)).css('left', prevLeft + 'px').css('top', prevTop + 'px');

                prevLeft = snake.bodyArray[i][0];
                prevTop = snake.bodyArray[i][1];
            }

            if (hungry) {

                snake.emptyArray.push([prevLeft, prevTop]);
                snake.bodyArray = snake.removeArrayElement(snake.bodyArray, prevLeft, prevTop);
            }

            setTimeout(function () { snake.move(); }, 100 / snake.options.speed);
        }
        else {

            console.log("Reason Of Death: " + Object.keys(snake.reasonsOfDeath)[snake.reasonOfDeath]);
            console.log("Last Direction: " + Object.keys(snake.directions)[snake.dir]);
            snake.head.css('background-color', 'black');
            $('#sn_score').after('<a href="#" class="sn_reload" onclick="javascript:location.reload();">Retry</a>');
        }
    };

    this.removeArrayElement = function (arr, left, top) {

        var i = 0;
        var found = false;
        for (; i < arr.length; i++) {

            if (arr[i][0] == left && arr[i][1] == top) {
                found = true;
                break;
            }
        }
        if (found)
            arr.splice(i, 1);

        return arr;
    };

    this.reasonOfDeath = '';
    this.control = function () {

        var pos = snake.head.position();
        var result = true;

        if (snake.dir == snake.directions.UP) {

            if (pos.top == snake.limit.top)
                result = false;
        }
        else if (snake.dir == snake.directions.DOWN) {

            if (pos.top == snake.limit.bottom)
                result = false;
        }
        else if (snake.dir == snake.directions.RIGHT) {

            if (pos.left == snake.limit.right)
                result = false;
        }
        else if (snake.dir == snake.directions.LEFT) {

            if (pos.left == snake.limit.left)
                result = false;
        }

        if (result == false) {

            snake.reasonOfDeath = snake.reasonsOfDeath.LIMITS;
            return false;
        }
        else {

            for (var i = 0; i < snake.bodyArray.length - 1; i++) {

                if (snake.dir == snake.directions.UP) {

                    if (pos.left == snake.bodyArray[i][0] && pos.top == snake.bodyArray[i][1] + 10) {
                        result = false;
                        break;
                    }
                }
                else if (snake.dir == snake.directions.DOWN) {

                    if (pos.left == snake.bodyArray[i][0] && pos.top == snake.bodyArray[i][1] - 10) {
                        result = false;
                        break;
                    }
                }
                else if (snake.dir == snake.directions.RIGHT) {

                    if (pos.top == snake.bodyArray[i][1] && pos.left == snake.bodyArray[i][0] - 10) {
                        result = false;
                        break;
                    }
                }
                else if (snake.dir == snake.directions.LEFT) {

                    if (pos.top == snake.bodyArray[i][1] && pos.left == snake.bodyArray[i][0] + 10) {
                        result = false;
                        break;
                    }
                }
            }

            if (result == false) {

                snake.reasonOfDeath = snake.reasonsOfDeath.COLLISION;
                return false;
            }
            else return true;
        }
    };

    this.feed = function () {

        var rand = snake.emptyArray[Math.floor(Math.random() * snake.emptyArray.length)];
        $('#sn_main').append('<div class="sn_food" style="top:' + rand[1] + 'px;left:' + rand[0] + 'px"></div>');
    };

    this.eat = function () {

        var pos = $('#p' + snake.p_index).position();
        $('#p' + snake.p_index).after('<div style="top:' + pos.top + 'px;left:' + pos.left + 'px" id="p' + (++snake.p_index) + '" class="sn_point"></div>');
        $('.sn_food').remove();
        snake.feed();
    };

    //for both wasd and arrow keys

    this.keyDown = function (e) {

        var headPos = snake.head.position();
        var p2Pos = $('#p2').position();

        if (e.which == 87 || e.which == 38) { 

            if (headPos.top == p2Pos.top)
                snake.dir = snake.directions.UP;
        }
        else if (e.which == 83 || e.which == 40) { 

            if (headPos.top == p2Pos.top)
                snake.dir = snake.directions.DOWN;
        }
        else if (e.which == 68 || e.which == 39) { 

            if (headPos.left == p2Pos.left)
                snake.dir = snake.directions.RIGHT;
        }
        else if (e.which == 65 || e.which == 37) { 

            if (headPos.left == p2Pos.left)
                snake.dir = snake.directions.LEFT;
        }
    };

    this.turn = {

        up: function () { $.event.trigger({ type: 'keydown', which: 87 }); }
        , down: function () { $.event.trigger({ type: 'keydown', which: 83 }); }
        , right: function () { $.event.trigger({ type: 'keydown', which: 68 }); }
        , left: function () { $.event.trigger({ type: 'keydown', which: 65 }); }
    };

    this.counterForAuto = 0;

    this.nextMoveDir = null;

    this.autoTurn = function () {

        snake.saveTheSnake();

        if (++snake.counterForAuto >= snake.p_index) {

            var foodPos = $('.sn_food').position();
            var pos = snake.head.position();

            var leftDiff = foodPos.left - pos.left;
            var topDiff = foodPos.top - pos.top;

            if (leftDiff != 0 || topDiff != 0) { 

                if (leftDiff == 0) {

                    if (topDiff > 0) {

                        var bodyPartsAtDown = snake.bodyArray.filter(function (x) { return x[0] == foodPos.left && x[1] < foodPos.top && x[1] > pos.top; });
                        if (bodyPartsAtDown.length > 0) {

                            if (pos.top != snake.limit.top && snake.bodyParts.upEmpty())
                                snake.turn.up();
                        }
                        else {

                            if (pos.top != snake.limit.bottom && snake.bodyParts.downEmpty())
                                snake.turn.down();
                        }
                    }
                    else {

                        var bodyPartsAtUp = snake.bodyArray.filter(function (x) { return x[0] == foodPos.left && x[1] > foodPos.top && x[1] < pos.top; });
                        if (bodyPartsAtUp.length > 0) {

                            if (pos.top != snake.limit.bottom && snake.bodyParts.downEmpty())
                                snake.turn.down();
                        }
                        else {

                            if (pos.top != snake.limit.top && snake.bodyParts.upEmpty())
                                snake.turn.up();
                        }
                    }

                    snake.counterForAuto = 0;
                }
                else if (topDiff == 0) {

                    if (leftDiff > 0) {

                        var bodyPartsAtRight = snake.bodyArray.filter(function (x) { return x[0] < foodPos.left && x[0] > pos.left && x[1] == foodPos.top; });
                        if (bodyPartsAtRight.length > 0) {

                            if (pos.left != snake.limit.left && snake.bodyParts.leftEmpty())
                                snake.turn.left();
                        }
                        else {

                            if (pos.left != snake.limit.right && snake.bodyParts.rightEmpty())
                                snake.turn.right();
                        }
                    }
                    else {

                        var bodyPartsAtLeft = snake.bodyArray.filter(function (x) { return x[0] > foodPos.left && x[0] < pos.left && x[1] == foodPos.top; });
                        if (bodyPartsAtLeft.length > 0) {

                            if (pos.left != snake.limit.right && snake.bodyParts.rightEmpty())
                                snake.turn.right();
                        }
                        else {

                            if (pos.left != snake.limit.left && snake.bodyParts.leftEmpty())
                                snake.turn.left();
                        }
                    }

                    snake.counterForAuto = 0;
                }
            }
        }
    };

    this.inCircle = function () { 

        var pos = snake.head.position();

        var bodyPartAtUp = snake.bodyParts.upEmpty() ? 0 : 1;
        var bodyPartAtDown = snake.bodyParts.downEmpty() ? 0 : 1;
        var bodyPartAtRight = snake.bodyParts.rightEmpty() ? 0 : 1;
        var bodyPartAtLeft = snake.bodyParts.leftEmpty() ? 0 : 1;

        if (bodyPartAtUp == 0 && pos.top == snake.limit.top)
            bodyPartAtUp++;
        if (bodyPartAtDown == 0 && pos.top == snake.limit.bottom)
            bodyPartAtDown++;
        if (bodyPartAtRight == 0 && pos.left == snake.limit.right)
            bodyPartAtRight++;
        if (bodyPartAtLeft == 0 && pos.left == snake.limit.left)
            bodyPartAtLeft++;

        if (bodyPartAtUp + bodyPartAtDown + bodyPartAtRight + bodyPartAtLeft == 3) { // is in circle

            if (bodyPartAtUp == 0)
                return snake.directions.UP;
            else if (bodyPartAtDown == 0)
                return snake.directions.DOWN;
            else if (bodyPartAtRight == 0)
                return snake.directions.RIGHT;
            else if (bodyPartAtLeft == 0)
                return snake.directions.LEFT;
        }
        else return null;
    };

    this.bodyParts = {

        getIndex: function (left, top) {

            for (var i = 1; i <= snake.bodyArray.length; i++) {

                var pos = $('#p' + i).position()
                if (pos.left == left && pos.top == top)
                    return i;
            }
            return snake.bodyArray.length; 
        }

        , upEmpty: function () {

            var pos = snake.head.position();
            return snake.bodyArray.filter(function (x) { return x[0] == pos.left && x[1] == pos.top - 10; }).length == 0;
        }

        , downEmpty: function () {

            var pos = snake.head.position();
            return snake.bodyArray.filter(function (x) { return x[0] == pos.left && x[1] == pos.top + 10; }).length == 0;
        }

        , rightEmpty: function () {

            var pos = snake.head.position();
            return snake.bodyArray.filter(function (x) { return x[0] == pos.left + 10 && x[1] == pos.top; }).length == 0;
        }

        , leftEmpty: function () {

            var pos = snake.head.position();
            return snake.bodyArray.filter(function (x) { return x[0] == pos.left - 10 && x[1] == pos.top; }).length == 0;
        }
    };

    this.saveTheSnake = function () {

        if (!snake.control()) { 
            var pos = snake.head.position();
            if (snake.reasonOfDeath == snake.reasonsOfDeath.LIMITS) {

                if (snake.dir == snake.directions.UP || snake.dir == snake.directions.DOWN) {

                    var bodyPartsAtLeft = snake.bodyArray.filter(function (x) { return x[0] < pos.left && x[1] == pos.top; });
                    var bodyPartsAtRight = snake.bodyArray.filter(function (x) { return x[0] > pos.left && x[1] == pos.top; });

                    if (Math.abs(snake.limit.left - pos.left) > Math.abs(snake.limit.right - pos.left)) {

                        if (bodyPartsAtLeft.length > bodyPartsAtRight.length && pos.left != snake.limit.right)
                            snake.turn.right();
                        else
                            snake.turn.left();
                    }
                    else {

                        if (bodyPartsAtLeft.length < bodyPartsAtRight.length && pos.left != snake.limit.left)
                            snake.turn.left();
                        else
                            snake.turn.right();
                    }
                }
                else if (snake.dir == snake.directions.RIGHT || snake.dir == snake.directions.LEFT) {

                    var bodyPartsAtUp = snake.bodyArray.filter(function (x) { return x[0] == pos.left && x[1] < pos.top; });
                    var bodyPartsAtDown = snake.bodyArray.filter(function (x) { return x[0] == pos.left && x[1] > pos.top; });

                    if (Math.abs(snake.limit.top - pos.top) > Math.abs(snake.limit.bottom - pos.top)) {

                        if (bodyPartsAtUp.length > bodyPartsAtDown.length && pos.top != snake.limit.bottom)
                            snake.turn.down();
                        else
                            snake.turn.up();
                    }
                    else {

                        if (bodyPartsAtUp.length < bodyPartsAtDown.length && pos.top != snake.limit.top)
                            snake.turn.up();
                        else
                            snake.turn.down();
                    }
                }
            }
            else if (snake.reasonOfDeath == snake.reasonsOfDeath.COLLISION) {

                var turnToThisDirectionIfInCircle = snake.inCircle();
                if (turnToThisDirectionIfInCircle != null) {

                    if (turnToThisDirectionIfInCircle == snake.directions.UP) {

                        snake.turn.up();
                        if (snake.bodyArray.filter(function (x) { return x[0] == pos.left - 10 && x[1] == pos.top - 10; }).length == 0)
                            snake.nextMoveDir = snake.directions.LEFT;
                        else if (snake.bodyArray.filter(function (x) { return x[0] == pos.left + 10 && x[1] == pos.top - 10; }).length == 0)
                            snake.nextMoveDir = snake.directions.RIGHT;
                    }
                    else if (turnToThisDirectionIfInCircle == snake.directions.DOWN) {

                        snake.turn.down();
                        if (snake.bodyArray.filter(function (x) { return x[0] == pos.left - 10 && x[1] == pos.top + 10; }).length == 0)
                            snake.nextMoveDir = snake.directions.LEFT;
                        else if (snake.bodyArray.filter(function (x) { return x[0] == pos.left + 10 && x[1] == pos.top + 10; }).length == 0)
                            snake.nextMoveDir = snake.directions.RIGHT;
                    }
                    else if (turnToThisDirectionIfInCircle == snake.directions.RIGHT) {

                        snake.turn.right();
                        if (snake.bodyArray.filter(function (x) { return x[0] == pos.left + 10 && x[1] == pos.top + 10; }).length == 0)
                            snake.nextMoveDir = snake.directions.DOWN;
                        else if (snake.bodyArray.filter(function (x) { return x[0] == pos.left + 10 && x[1] == pos.top - 10; }).length == 0)
                            snake.nextMoveDir = snake.directions.UP;
                    }
                    else if (turnToThisDirectionIfInCircle == snake.directions.LEFT) {

                        snake.turn.left();
                        if (snake.bodyArray.filter(function (x) { return x[0] == pos.left - 10 && x[1] == pos.top - 10; }).length == 0)
                            snake.nextMoveDir = snake.directions.UP;
                        else if (snake.bodyArray.filter(function (x) { return x[0] == pos.left - 10 && x[1] == pos.top + 10; }).length == 0)
                            snake.nextMoveDir = snake.directions.DOWN;
                    }
                }
                else {

                    if (snake.dir == snake.directions.UP || snake.dir == snake.directions.DOWN) {

                        if (pos.left == snake.limit.left)
                            snake.turn.right();
                        else {

                            var index = snake.bodyParts.getIndex(pos.left, (snake.dir == snake.directions.UP ? (pos.top - 10) : (pos.top + 10))) - 1;
                            var tempPos = $('#p' + index).position();
                            if (pos.left == snake.limit.right || tempPos.left > pos.left)
                                snake.turn.left();
                            else
                                snake.turn.right();
                        }
                    }
                    else if (snake.dir == snake.directions.RIGHT || snake.dir == snake.directions.LEFT) {

                        if (pos.top == snake.limit.top)
                            snake.turn.down();
                        else {

                            var index = snake.bodyParts.getIndex((snake.dir == snake.directions.LEFT ? (pos.left - 10) : (pos.left + 10)), pos.top) - 1;
                            var tempPos = $('#p' + index).position();
                            if (pos.top == snake.limit.bottom || tempPos.top > pos.top)
                                snake.turn.up();
                            else
                                snake.turn.down();
                        }
                    }
                }
            }
        }
        else if (snake.nextMoveDir != null) {

            if (snake.nextMoveDir == snake.directions.UP)
                snake.turn.up();
            else if (snake.nextMoveDir == snake.directions.DOWN)
                snake.turn.down();
            else if (snake.nextMoveDir == snake.directions.RIGHT)
                snake.turn.right();
            else if (snake.nextMoveDir == snake.directions.LEFT)
                snake.turn.left();

            snake.nextMoveDir = null;
        }
    };
}
