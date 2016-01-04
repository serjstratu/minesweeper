(function ($) {
    'use strict';

    //Global variables
    var columns, mines = 0;
    var timer = false;
    var count = 0;
    var cells = [];
    $('.message').html('');
    $("#start").on("click", function (e) {
        $('#game>table').remove();
        $('.message').html('');
        $(document).off("contextmenu");
        timer = false;
        count = 0;

        var columns = $("#columns").val();
        var mines = $("#mines").val();

        var bombs = mines;
        var space = columns*columns - mines;

        var gameWinOrLose = false;

        $('.bomb-count').html('');
        $('#clickcounter').html('0');
        $('#timer').html('0');

        if (columns == 0 || mines == 0){
            $('.message').html('Fields cant be negative or equal 0').addClass("error");
            return false;
        }

        var aviablebombs = Math.pow(columns, 2)-1;
        var input = document.getElementById("mines");
        input.setAttribute("max",aviablebombs);
        document.getElementsByClassName('bomb-count')[0].innerHTML += bombs;

        function init() {
            cells = [];
            for (var i = 0; i < columns; i++) {
                for (var j = 0; j < columns; j++) {
                    cells.push(
                        {
                            x: i,
                            y: j,
                            valuee: 0,
                            open: false
                        }
                    );
                }
            }
        }

        function drawTable(){
            var tablearea = document.getElementById('game');
            var tbl = document.createElement('table');
            for (var i = 0; i < columns; i++) {
                var tr = document.createElement('tr');
                tbl.appendChild(tr);
                for (var j = 0; j < columns; j++) {
                    var number = cells[i*columns+j].valuee;
                    if(number==0){
                        number = '';
                    }
                    var tdcell = $('<td>'+ number+ '</td>');
                    tdcell.attr("data-row", i);
                    tdcell.attr("data-col", j);
                    tdcell.addClass("cell hidden");
                    var index = i * Math.sqrt(cells.length) + j;
                    $(tdcell).appendTo($(tr));

                }
            }
            tablearea.appendChild(tbl);
        }

        function placeMines() {
            cells = shuffle(cells);
            while (mines-- > 0) {
                cells[mines].valuee = -1;
                var x = cells[mines].x;
                var y = cells[mines].y;
            }
            cells.sort(sortCells);
        }

        function clickCell() {
            $('.cell').on('click', function () {
                timer = true;
                var self = $(this);
                var x = self.data('row');
                var y = self.data('col');
                var obj = cells.filter(function (el) { return el.x === x && el.y === y })[0];

                if ($(self).hasClass("hidden")){
                    $('#clickcounter').html(function(i, val) { return val*1+1 });
                }

                if(obj.valuee == 0){
                    floodFill(x,y);
                }

                else if (obj.valuee !== -1) {
                    self.addClass("empty").removeClass("hidden").unbind('click');
                    checkWin();
                }
                else {
                    self.addClass("mine-cell").unbind('click');
                    $('.cell').unbind('click');
                    gameWinOrLose = true;
                    loseGame();
                }

            });
        }

        function showMins() {
            for (var i = 0; i < columns; i++) {
                for (var j = 0; j < columns; j++) {
                    var myTd = $('[data-row="' + i + '"][data-col="' + j + '"]');
                    var index = i * Math.sqrt(cells.length) + j;
                    if (cells[index].valuee == -1) {
                        $(myTd).addClass("bomb");
                    }
                    if (cells[index].valuee == -1 && $(myTd).hasClass("flag")) {
                        $(myTd).removeClass("flag").addClass("smile");
                    }
                }
            }
        }

        function calcNeighbours() {
            for (var i = 0; i < columns; i++) {
                for (var j = 0; j < columns; j++) {
                    var index = i * columns + j;
                    if (cells[index].valuee > -1) {
                        var number = 0;

                        if (i - 1 >= 0 && j - 1 >= 0 && i - 1 < columns && j - 1 < columns) {
                            var cIndex = (i - 1) * columns + (j - 1);
                            if (cells[cIndex].valuee == -1) {
                                number++;
                            }
                        }

                        if (i - 1 >= 0 && j >= 0 && i - 1 < columns && j < columns) {
                            var cIndex = (i - 1) * columns + j;
                            if (cells[cIndex].valuee == -1) {
                                number++;
                            }
                        }

                        if (i - 1 >= 0 && j + 1 >= 0 && i - 1 < columns && j + 1 < columns) {
                            var cIndex = (i - 1) * columns + (j + 1);
                            if (cells[cIndex].valuee == -1) {
                                number++;
                            }
                        }

                        if (i >= 0 && j - 1 >= 0 && i < columns && j - 1 < columns) {
                            var cIndex = i * columns + (j - 1);
                            if (cells[cIndex].valuee == -1) {
                                number++;
                            }
                        }

                        if (i >= 0 && j + 1 >= 0 && i < columns && j + 1 < columns) {
                            var cIndex = i * columns + (j + 1);
                            if (cells[cIndex].valuee == -1) {
                                number++;
                            }
                        }

                        if (i + 1 >= 0 && j - 1 >= 0 && i + 1 < columns && j - 1 < columns) {
                            var cIndex = (i + 1) * columns + (j - 1);
                            if (cells[cIndex].valuee == -1) {
                                number++;
                            }
                        }

                        if (i + 1 >= 0 && j >= 0 && i + 1 < columns && j < columns) {
                            var cIndex = (i + 1) * columns + j;
                            if (cells[cIndex].valuee == -1) {
                                number++;
                            }
                        }

                        if (i + 1 >= 0 && j + 1 >= 0 && i + 1 < columns && j + 1 < columns) {
                            var cIndex = (i + 1) * columns + (j + 1);
                            if (cells[cIndex].valuee == -1) {
                                number++;
                            }
                        }

                        cells[index].valuee = number;
                    }

                }
            }
        }

        function floodFill(x, y){
            var index = x * columns + y;
            if(cells[index].valuee == -1 || cells[index].open === true ){
                return;
            }
            if(cells[index].valuee > 0){
                $('[data-row="' + x + '"][data-col="' + y + '"]').addClass('empty').removeClass('hidden');
                cells[index].open = true;
                return;
            }

            if(cells[index].open === false && x-1 >= 0 && y-1 >= 0 && ((x-1)*columns+(y-1)) < columns*columns ){
                var cIndex = (x-1)*columns+(y-1);
                if (cells[cIndex].valuee !== -1 && cells[cIndex].valuee !== 0){
                    cells[cIndex].open = true;
                    $('[data-row="' + (x-1) + '"][data-col="' + (y-1) + '"]').addClass('empty').removeClass('hidden');
                }

            }

            if(cells[index].open === false && x-1>=0 && y+1 >= 0 && ((x-1)*columns+(y+1)) < columns*columns ){
                var cIndex = (x-1)*columns+(y+1);
                if (cells[cIndex].valuee !== -1 && cells[cIndex].valuee !== 0){
                    cells[cIndex].open = true;
                    $('[data-row="' + (x-1) + '"][data-col="' + (y+1) + '"]').addClass('empty').removeClass('hidden');
                }

            }

            if(cells[index].open === false && x+1>=0 && y-1 >= 0 && ((x+1)*columns+(y-1)) < columns*columns ){
                var cIndex = (x+1)*columns+(y-1);
                if (cells[cIndex].valuee !== -1 && cells[cIndex].valuee !== 0){
                    cells[cIndex].open = true;
                    $('[data-row="' + (x+1) + '"][data-col="' + (y-1) + '"]').addClass('empty').removeClass('hidden');
                }

            }

            if(cells[index].open === false && x+1>=0 && y+1 >= 0 && ((x+1)*columns+(y+1)) < columns*columns ){
                var cIndex = (x+1)*columns+(y+1);
                if (cells[cIndex].valuee !== -1 && cells[cIndex].valuee !== 0){
                    cells[cIndex].open = true;
                    $('[data-row="' + (x+1) + '"][data-col="' + (y+1) + '"]').addClass('empty').removeClass('hidden');
                }

            }

            if(cells[index].open === false && x-1 >= 0 && y >= 0 && ((x-1)*columns+y) < columns*columns ){
                var cIndex = (x-1)*columns+y;
                if (cells[cIndex].valuee !== -1 && cells[cIndex].valuee !== 0){
                    cells[cIndex].open = true;
                    $('[data-row="' + (x-1) + '"][data-col="' + y + '"]').addClass('empty').removeClass('hidden');
                }

            }

            if(cells[index].open === false && x+1 >= 0 && y >= 0 && ((x+1)*columns+y) < columns*columns ){
                var cIndex = (x+1)*columns+y;
                if (cells[cIndex].valuee !== -1 && cells[cIndex].valuee !== 0){
                    cells[cIndex].open = true;
                    $('[data-row="' + (x+1) + '"][data-col="' + y + '"]').addClass('empty').removeClass('hidden');
                }

            }

            if(cells[index].open === false && x >= 0 && y-1 >= 0 && (x*columns+(y-1)) < columns*columns ){
                var cIndex = x*columns+(y-1);
                if (cells[cIndex].valuee !== -1 && cells[cIndex].valuee !== 0){
                    cells[cIndex].open = true;
                    $('[data-row="' + x + '"][data-col="' + (y-1) + '"]').addClass('empty').removeClass('hidden');
                }

            }

            if(cells[index].open === false && x >= 0 && y+1 >= 0 && (x*columns+(y+1)) < columns*columns ){
                var cIndex = x*columns+(y+1);
                if (cells[cIndex].valuee !== -1 && cells[cIndex].valuee !== 0){
                    cells[cIndex].open = true;
                    $('[data-row="' + x + '"][data-col="' + (y+1) + '"]').addClass('empty').removeClass('hidden');
                }

            }
            var cell = $('[data-row="' + x + '"][data-col="' + y + '"]');
            cells[index].open = true;
            $(cell).addClass("empty").removeClass('hidden');

            if (x > 0){ // left
                floodFill(x-1, y);
            }
            if(y > 0){ // up
                floodFill(x, y-1);
            }
            if(x < columns-1){ // right
                floodFill(x+1, y);
            }
            if(y < columns-1){ // down
                floodFill(x, y+1);
            }

        }

        function checkWin(){
            var numItems = $('.empty').length;
            var win = space - numItems;
            if (win == 0){
                $('.hidden').removeClass("flag");
                gameWinOrLose = true;
                winGame();
            }
        }

        function winGame(){
            document.getElementsByClassName('message')[0].innerHTML += 'Win Game';
            showMins();
            timer = false;
        }

        function loseGame(){
            //document.getElementsByClassName('message')[0].innerHTML += 'Game Over';
            $('.message').html('Game Over').addClass("error");
            showMins();
            timer = false;
        }


        $(document).on("contextmenu", '.hidden', function (event) {
            event.preventDefault();

            if (!gameWinOrLose){
                event.stopPropagation();
                $( this ).toggleClass('flag');

                if ($(this).hasClass('flag')){
                    $(this).unbind('click');
                    bombs--;
                    checkWin();
                }else{
                    $(this).bind(clickCell());
                    bombs++;
                }
                $('.bomb-count').html('');
                document.getElementsByClassName('bomb-count')[0].innerHTML += bombs;
            }
            return false;
        });

        $(document).on("contextmenu", '.empty', function (event) {
            event.preventDefault();
            if (!gameWinOrLose){
                event.stopPropagation();
                if ($(this).hasClass('flag')){
                    $(this).removeClass("flag").removeClass("empty").addClass("hidden");
                    $(this).bind(clickCell());
                }else{
                    $(this).unbind('click');
                    checkWin();
                }
                $('.bomb-count').html('');
                document.getElementsByClassName('bomb-count')[0].innerHTML += bombs;
            }
            return false;
        });

        //call functions
        init();
        placeMines();
        calcNeighbours();
        drawTable();
        clickCell();
    });

    setInterval(function () {
        if (timer) {
            $('#timer').html(count);
            count++;
        }
    }, 1000);

    function shuffle(o) {
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }

    function sortCells(a, b) {
        var x = a.x - b.x;
        if (x) return x;
        var x = a.y - b.y;
        return x;
    }
})(jQuery);