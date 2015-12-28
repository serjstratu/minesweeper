(function ($) {
    'use strict';
    $("#start").on("click", function () {
        $('#game>table').remove();

        var cells = [];
        var columns = parseInt($("#columns").val(), 10);
        var mines = parseInt($("#mins").val(), 10);
        var space = columns*columns - mines;
        var flag = 0;



            if (mines >= Math.pow(columns, 2)) {
                $('.message').html('To much mines').addClass("error").delay(3000).fadeOut('slow');
            }

            else if (columns >= 100 || mines >= 100) {
                $('.message').html('Too high a value').addClass("error").delay(3000).fadeOut('slow');
            }

            else if (columns < 0 || mines < 0) {
                $('.message').html('Fields cant be negative or equal 0').addClass("error").delay(3000).fadeOut('slow');
            }

            else{
                init();
            }


        function init() {
            $('.message').html('');
            $('#win').html('');
            $('#end').html('');
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

        function drawTable(mapData){
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
                    tdcell.addClass("cell");
                    tdcell.addClass("hidden");

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
                var self = $(this);
                var x = self.data('row');
                var y = self.data('col');

                var obj = cells.filter(function (el) { return el.x === x && el.y === y })[0]
                if(obj.valuee == 0){
                    floodFill(x,y);
                    self.removeClass("hidden");
                }

                if (obj.valuee !== -1) {
                    self.addClass("empty").removeClass("hidden").off('click');
                    var numItems = $('.empty').length;

                    //check win
                    var win = space - numItems;
                    if (win == 0){
                        $('.hidden').removeClass("flag");
                        $('#end').html('Win Game').addClass("success").delay(5000).fadeOut('slow');
                        showMins();
                    }
                }
                 else {
                    self.addClass("smile").off('click');
                    $('#win').html('Game Over').addClass("error").delay(5000).fadeOut('slow');
                    showMins();
                    //$('.hidden').removeClass("flag");
                    $('.cell').off('click');
                }

            });
        }



        function showMins() {
            for (var i = 0; i < columns; i++)
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

        //function startGame(){
            //init();
            placeMines();
            calcNeighbours();
            drawTable();
            clickCell();




        function shuffle(o) {
            for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
            return o;
        }

        function sortCells(a, b) {
            // Sort by X
            var x = a.x - b.x;
            if (x) return x;

            // If there is a tie, Y
            var x = a.y - b.y;
            return x;
        }

        window.oncontextmenu = function () {

            $('.hidden').mousedown(function(ev) {
                if(ev.which == 3)
                {
                    $( this ).toggleClass('flag');

                }

            });
            $('.empty').mousedown(function(ev) {
                if(ev.which == 3)
                {
                    return false;

                }

            });

            return false;     // cancel default menu
        }

        //$('.empty').bind('contextmenu', function(e) {
        //    return false;
        //});



        //document.getElementById('hidden').oncontextmenu = function() {
        //    alert('right click!')
        //}



    });


})(jQuery)