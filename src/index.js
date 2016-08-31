/**
 * snake game
 * build by rwson @8/31/2016
 * mail:rw_Song@sina.com
 */

"use strict";

(function () {

    var speed = 7,
        canvas, canvasPos, realPos, cxt, snake, food, points, animation;

    //  requestAnimationFrame and cancelAnimationFrame polyfill
    var _requestAnimation = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        function (callback) {
            return window.setTimeout(callback, 1000 / speed);
        };

    var _cancelAnimation = window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.oCancelAnimationFrame ||
        function (id) {
            window.clearTimeout(id);
        };

    //  collision check method
    function _collisionCheck(x1, y1, x2, y2, distance) {
        var a = x1 - x2,
            b = y1 - y2,
            c = Math.sqrt(a * a + b * b);
        distance = distance || 20;
        return (c < distance);
    }

    //  get elememt position infomation
    function _getPosition(element) {
        if (element.getBoundingClientRect) {
            return element.getBoundingClientRect();
        } else {
            return {
                top: element.offsetTop,
                lef: element.offsetLeft,
                right: element.offsetLeft + element.offsetWidth,
                bottom: element.offsetTop + element.offsetHeight,
                width: element.offsetWidth,
                height: element.offsetHeight
            };
        }
    }

    //  generate a random color(#fabcde)
    function _randomColor() {
        return Math.random().toString(16).slice(2, 8);
    }

    //  generate a random number between min and max
    function _randomRange(min, max) {
        return Number(Math.floor((max - min) * Math.random()) + min);
    }

    //  food position is or not at same position as snake's head or body
    function _inListRange(pos, list) {
        for (var i = 0, len = list.length; i < len; i++) {
            if (pos.x === list[i].x && pos.y === list[i].y) {
                return true;
            }
        }
        return false;
    }

    //  Rect constructor
    function _DrawRect(info) {
        return new _DrawRect.prototype.init(info);
    }

    _DrawRect.prototype = {

        constructor: _DrawRect,

        init: function (info) {
            this.x = info.x || 0;
            this.y = info.y || 0;
            this.w = info.w || 0;
            this.h = info.h || 0;
            this.color = info.color || "#000";
            return this;
        },

        draw: function (cxt) {
            cxt.beginPath();
            cxt.fillStyle = this.color;
            cxt.rect(this.x, this.y, this.w, this.h);
            cxt.fill();
            cxt.stroke();
        }

    };
    _DrawRect.prototype.init.prototype = _DrawRect.prototype;

    //  Food constructor
    function _Food(range, exceptList, cxt) {
        return new _Food.prototype.init(range, exceptList, cxt);
    }

    _Food.prototype = {

        constructor: _Food,

        init: function (range, exceptList, cxt) {
            var x = _randomRange(range.left, range.right);
            var y = _randomRange(range.top, range.bottom);

            //  if can't all div by 20
            if (x % 20) {
                x = Math.floor(x / 20) * 20;
            }
            if (y % 20) {
                y = Math.floor(y / 20) * 20;
            }

            var info = {
                x: x,
                y: y
            };

            //  generate again,the point is a part of snake
            while (_inListRange(info, exceptList)) {
                info = {
                    x: _randomRange(info.left, info.right),
                    y: _randomRange(info.top, info.bottom)
                };
            }

            //  final food position information
            var pos = {
                x: info.x,
                y: info.y,
                w: 20,
                h: 20,
                color: "#" + _randomColor()
            };

            this.rect = _DrawRect(pos);
            this.x = x;
            this.y = y;
            this.cxt = cxt;

            return this;
        },

        draw: function () {
            this.rect.draw(this.cxt);
        }
    };
    _Food.prototype.init.prototype = _Food.prototype;

    //  Snake constructor
    function _Snake(range, cxt) {
        return new _Snake.prototype.init(range, cxt);
    }

    _Snake.prototype = {

        constructor: _Snake,

        init: function (range, cxt) {
            var info = {
                x: 0,
                y: 0,
                w: 20,
                h: 20,
                color: "#ccc"
            };

            //  default direction
            this.direction = "right";
            this.cxt = cxt;
            this.alive = true;
            this.range = range;
            this.point = 0;
            this.snakeParts = [];

            for (var i = 0; i < 4; i++) {
                //  every snake part lateral start position
                info.x = i * info.w;
                this.snakeParts.splice(0, 0, _DrawRect(info));
            }

            this.head = this.snakeParts[0];
            this.head.color = "#f00";
            return this;
        },

        draw: function () {
            if (this.alive) {
                this.snakeParts.forEach(function (part, index) {
                    part.draw(this.cxt);
                }, this);
                this.head = this.snakeParts[0];
            }
        },

        changeDirection: function (dir) {
            if (dir) {
                this.direction = dir;
            }
        },

        move: function (callback) {
            var head = this.head;
            var range = this.range;
            var snakeParts = this.snakeParts;
            var direction = this.direction;
            var react = _DrawRect({
                x: head.x,
                y: head.y,
                w: head.w,
                h: head.h,
                color: "#ccc"
            });

            this.snakeParts.splice(1, 0, react);

            if (_collisionCheck(food.x, food.y, head.x, head.y)) {
                this.point++;
                food = _Food(this.range, this.snakeParts, this.cxt);
                callback(this.point);
            } else {
                this.snakeParts.pop();
            }

            //  move position
            switch (direction) {
                case "left":
                    this.head.x -= this.head.w;
                    break;
                case "right":
                    this.head.x += this.head.w;
                    break;
                case "top":
                    this.head.y -= this.head.h;
                    break;
                case "bottom":
                    this.head.y += this.head.h;
                    break;
                default:
                    break;
            }

            //  collision with self
            for (var i = 1, len = this.snakeParts.length; i < len; i++) {
                if (snakeParts[i].x === head.x && snakeParts[i].y === head.y) {
                    alert("你死了...");
                    this.die();
                }
            }

            //  got the bound of canvas
            if (head.x >= range.right ||
                head.x < range.left ||
                head.y >= range.bottom ||
                head.y < range.top) {
                this.die();
                alert("你死了...");
            }
        },

        die: function () {
            this.alive = false;
        }

    };
    _Snake.prototype.init.prototype = _Snake.prototype;

    //  bind load event on window
    window.onload = function () {
        canvas = document.querySelector("#canvas");
        canvasPos = _getPosition(canvas);
        points = document.querySelector("#points");

        realPos = {
            top: 0,
            right: canvasPos.right - canvasPos.left,
            bottom: canvasPos.bottom - canvasPos.top,
            left: 0,
            width: canvasPos.width,
            height: canvasPos.height
        };

        cxt = canvas.getContext("2d");

        //  startGame
        function startGame() {
            //  initialize snake Object
            snake = _Snake(realPos, cxt);

            //  initialize food Object
            food = _Food(realPos, snake.snakeParts, cxt);
            food.draw();

            //  initialize method
            function _init() {
                setTimeout(function () {
                    if (snake.alive) {
                        cxt.clearRect(0, 0, canvas.width, canvas.height);
                        snake.move(function (p) {
                            points.innerHTML = "分数" + p;
                        });
                        snake.draw();
                        food.draw();
                        animation = _requestAnimation(_init);
                    } else {
                        _cancelAnimation(animation);
                    }
                }, 1000 / speed);
            }

            animation = _requestAnimation(_init);

            //  keyup to change move direction
            document.onkeyup = null;
            document.onkeyup = function (ev) {
                switch (ev.keyCode) {
                    case 37:
                        if (snake.direction !== "right") {
                            snake.changeDirection("left");
                        }
                        break;
                    case 38:
                        if (snake.direction !== "bottom") {
                            snake.changeDirection("top");
                        }
                        break;
                    case 39:
                        if (snake.direction !== "left") {
                            snake.changeDirection("right");
                        }
                        break;
                    case 40:
                        if (snake.direction !== "top") {
                            snake.changeDirection("bottom");
                        }
                        break;
                    default:
                        break;
                }
                ev.preventDefault();
                return false;
            };
        }

        document.querySelector("#start").onclick = startGame;
    };


})();
