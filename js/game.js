/*
    main-1.3
    update:2015-04-23 tabooc@163.com
    github:https://github.com/tabooc/numbersSort
*/

var Game = function(level) {
    this.lock = false;
    this.level = level;
    this.box = "J_game";
    this.timeBox = 'J_time';
    this.stepBox = 'J_step';
    this.row = this.level;
    this.col = this.level;
    this.totalTime = 0;
    this.T = null;
    this.totalCells = this.row * this.col;
    this.step = 0;
    this.blankCellIndex = 0;
    this.numbers = [];
    this.emptyCellClass = "emptycell";
    this.init(this.level);
}
Game.prototype = {
    constructor: Game,
    //初始化
    init: function(level) {
        //初始化数字序列
        for (var n = 0; n < this.totalCells; n++) {
            this.numbers.push(n);
        }

        // 当数组为有序数组的时候,随机打乱数字序列
        while (this.isOrder()) {
            this.numbers.sort(function() {
                return Math.random() - 0.5;
            });
        }

        //生成dom
        var nodes = document.createDocumentFragment(),
            li,
            index = 0;
        this.getId(this.box).innerHTML = '';

        for (var i = 0; i < this.row; i++) {
            for (var j = 0; j < this.col; j++) {
                li = document.createElement("li");
                li.id = "J_cells_" + i + "_" + j;
                li.index = index;
                if (this.numbers[index] == 0) {
                    li.innerHTML = '';
                    li.className = this.emptyCellClass;
                    this.blankCellIndex = index;
                } else {
                    li.innerHTML = this.numbers[index];
                }
                nodes.appendChild(li);
                index++;
            }
        }
        this.getId(this.box).style.width = this.col * 51 + "px";
        this.getId(this.box).style.height = this.row * 51 + "px";
        this.getId(this.box).appendChild(nodes);
        this.run();
    },
    run: function() {
        var timebox = this.getId(this.timeBox),
            _this = this;

        this.T = setInterval(function() {
            _this.totalTime += 1;
            timebox.innerHTML = _this.totalTime;
        }, 1000);

        this.addClickEvent();
    },
    addClickEvent: function() {
        var _this = this;

        //格子点击事件,托管到父级容器
        this.getId(this.box).onclick = function(e) {
            var e = e || window.event;
            var target = e.target || e.srcElement; //兼容ie7,8  
            
            if (_this.lock) {
                alert("游戏已暂停或结束,请点击继续或选择新的难度..");
                return false;
            }
            if (_this.numbers[target.index] == 0) {
                return false;
            }

            var cellInfo = _this.getCellInfo(target.id);
            cellInfo.index = target.index;
            _this.findCells(cellInfo);
        };

        this.getId("J_pause").onclick = function() {
            var text = this.innerHTML,
                timebox = _this.getId(_this.timeBox);

            if (_this.lock) {
                _this.lock = false;
                this.innerHTML = "暂停游戏";
                _this.T = setInterval(function() {
                    _this.totalTime += 1;
                    timebox.innerHTML = _this.totalTime;
                }, 1000);
            } else {
                _this.lock = true;
                this.innerHTML = "继续游戏";
                _this.pause();
            }

        }
        this.getId("J_stop").onclick = function() {
            _this.stop();
        }

    },
    getCellInfo: function(id) {
        var idInfo = id.split("_");
        return {
            row: parseInt(idInfo[2]),
            col: parseInt(idInfo[3])
        };

    },
    findCells: function(obj) { //在四周查找空白格
        var blankCell;
        if (obj.row - 1 >= 0) {
            blankCell = this.isBlankCell(obj.row - 1, obj.col);
            if (blankCell) {
                this.exChange(obj, blankCell);
                return false;
            }
        }
        if (obj.row + 1 < this.row) {
            blankCell = this.isBlankCell(obj.row + 1, obj.col);
            if (blankCell) {
                this.exChange(obj, blankCell);
                return false;
            }
        }
        if (obj.col - 1 >= 0) {
            blankCell = this.isBlankCell(obj.row, obj.col - 1);
            if (blankCell) {
                this.exChange(obj, blankCell);
                return false;
            }
        }
        if (obj.col + 1 < this.col) {
            blankCell = this.isBlankCell(obj.row, obj.col + 1);
            if (blankCell) {
                this.exChange(obj, blankCell);
                return false;
            }
        }

    },
    isBlankCell: function(row, col) { //是否空格

        var cell = this.getId('J_cells_' + row + "_" + col),
            status = cell.index,
            obj = {};

        if (this.numbers[status] == 0) {
            obj.row = row;
            obj.col = col;
            return obj;
        } else {
            return false;
        }

    },
    exChange: function(current, blankCell) { //交换位置
        var currentDomObj = this.getId('J_cells_' + current.row + '_' + current.col),
            blankCellDomObj = this.getId('J_cells_' + blankCell.row + '_' + blankCell.col),
            currentIndex = current.index,
            temp = this.numbers[currentIndex];

        currentDomObj.innerHTML = '';
        currentDomObj.className = this.emptyCellClass;
        blankCellDomObj.innerHTML = temp;
        blankCellDomObj.className = '';

        this.step++;
        this.getId(this.stepBox).innerHTML = this.step;
        this.numbers.splice(this.blankCellIndex, 1, temp);
        this.numbers.splice(currentIndex, 1, 0);
        this.blankCellIndex = currentIndex;
        // console.log(this.numbers);
        this.result(this.isOrder());

    },
    isOrder: function() {
        var next;
        //空白必须在最后 
        if(this.numbers[0] == 0){
            return false;
        }
        
        for (var i = 0, len = this.numbers.length - 2; i < len; i++) {
            next = i + 1;
            if (this.numbers[i] > this.numbers[next]) {
                return false;
                break;
            }
        }
        return true;

    },
    result: function(complete) {
        if (complete) {
            alert("WIN!");
            this.stop();
        }
    },
    pause: function() {
        clearInterval(this.T);
    },
    stop: function() {
        clearInterval(this.T);
        window.location.reload();
    },
    getId: function(id) {
        return document.getElementById(id);
    }
}

document.getElementById("J_play").onclick = function() {
    var lock = this.getAttribute("data-st"),
        level = document.getElementById("J_level").value;
    if (lock == "1") {
        return false;
    }
    document.getElementById('J_game').style.display = 'block';
    document.getElementById("J_level").setAttribute("disabled", "disabled");
    this.className = this.className.replace(/ z-enable/, "") + " z-disabled";
    document.getElementById("J_pause").className = document.getElementById("J_pause").className + " z-enable";
    document.getElementById("J_stop").className = document.getElementById("J_stop").className + " z-enable";
    this.setAttribute("data-st", 1);
    new Game(level);
}