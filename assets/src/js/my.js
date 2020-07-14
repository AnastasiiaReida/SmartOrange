var pageSize = 3;

//для отслеживания добавления и удаления класса у элемента
(function(){
    var originFnAdd = $.fn.addClass;
    $.fn.addClass = function(){
        var result = originFnAdd.apply( this, arguments );
        $(this).trigger('classChanged');
        return result;
    }
})();

window.onload = function(){
    
    //для увеличения фото в галерии при пролистовании
    var galeryContent = $('.selected-photo');
    forCarusel(galeryContent, "galery-photo", "active-img", 2);

    //для индикации выбранного размера плана квартиры при пролистовании
    var plansContent = $('#plans .tab-content');
    forCarusel(plansContent, "room-size", "active", 0);
    
    //функция изменения данных при пролистывании
    function forCarusel(galery, classCollection, classActive, needChild){
        var tabsGalery = galery.children().length;
        
        for(i=0;i< tabsGalery;i++){
            var tabImgContent = galery.children(":eq("+i+")");
            var idCarusel = tabImgContent.children()[0].id;
            $('#'+ idCarusel).on('slide.bs.carousel', function (e) {
                var e = e || window.event;
                var currentId = this.id;
                var childNumber = e.relatedTarget.children[0].name.slice(-1);
                $('#'+ currentId + ">." + classCollection).children().removeClass(classActive);
                e.target.children[needChild].children[childNumber].classList.add(classActive);
            })
        }
    }

    //для раздела plans если разрешение экрана меньше 992рх
    //перемещение активного раздела (1КІМНАТНІ, 2КІМНАТНІ...) на вторую строку
    
    $('#all-plans a').on('click', function () {
        $('#all-plans').children().removeClass('active');
        $(this).parent().addClass('active');
        
    })

    
    //пролистывание стрелками #navbar-club
    $('#navbar-club .nav-control-prev').on('click', function () {
        var nextEl = $("#navbar-club .active");
        console.dir(nextEl);
        if(nextEl.prev().length == 0){
            window.location.hash = "#contacts";
        }else{
            window.location.hash = nextEl.prev().attr('href');
        };
    });
    $('#navbar-club .nav-control-next').on('click', function () {
        var nextEl = $("#navbar-club .active");
        if(!nextEl.next().hasClass('nav-link')){
            window.location.hash = "#home";
        }else{
            window.location.hash = nextEl.next().attr('href');
        };
    });

    //для изменения цвета нижней стрелки в навигаторе navbar-club
    $('#navbar-club a:eq(3)').bind('classChanged', function(){
        $('#navbar-club .nav a:eq(-1) .nav-control-next-icon').addClass('white');
    });
    $('#navbar-club a:not(:nth-child(4)):not(:last-child)').bind('classChanged', function(){
        $('#navbar-club .nav a:eq(-1) .nav-control-next-icon').removeClass('white');
    });
    
    
    
    //Pagination
    
    if(window.innerWidth < 992){
        pageSize = 2;
    }
    //индикация и пагинация #docs
    $('#docs-card .carousel-control-prev').on('click', function () {
        var nextEl = $("#pagin .active").prev();
        if(nextEl.length == 0){
            var currentEl = "#pagin li:eq(-1)";
        }else{
            var currentEl = nextEl;
        };
        $("#pagin li").removeClass("active");
        showPage($(currentEl).addClass("active").attr("name").slice(-1));
    });
    
    $('#docs-card .carousel-control-next').on('click', function () {
        var nextEl = $("#pagin .active").next();
        if(nextEl.length == 0){
            var currentEl = "#pagin li:eq(0)";
        }else{
            var currentEl = nextEl;
        };
        $("#pagin li").removeClass("active");
        showPage($(currentEl).addClass("active").attr("name").slice(-1));
    });

    var pgs = Math.ceil($('#docs-card .card').length/pageSize);
    var pgnt = '<li class="active" name="pagin1"></li>';
    for(var i = 2; i <= pgs; i++){
	    pgnt += '<li name="pagin'+i+'"></li>';
    };
    $('#pagin').html(pgnt);
    $("#pagin li").click(function() {
	
        $("#pagin li").removeClass("active");
          $(this).addClass("active");
          showPage(parseInt($(this).attr("name").slice(-1))) //.text()
    });
    showPage(1);

    $("#contacts .adress a").click(function(event) {
        event.preventDefault();
        // If the browser supports the Geolocation API
        if (typeof navigator.geolocation == "undefined") {
            $("#error").text("Ваш браузер не поддерживает Geolocation API");
            return;
        }
            
        var from;

        navigator.geolocation.getCurrentPosition(function(position) {
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                "location": new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
            },
            function(results, status) {
                console.dir(status);
            if (status == google.maps.GeocoderStatus.OK){
                from = results[0].formatted_address;
                console.dir(from);
                calculateRoute(from);
            }else
                updateStatus("Невозможно получить ваш адрес<br />");
            });
        },
        function handleError(error) {
            switch (error.code) {
                case 0:
                    updateStatus("При попытке определить местоположение возникала ошибка: " + error.message);
                    break;
                case 1:
                    updateStatus("Пользователь запретил получение данных о местоположении." + error.message);
                    break;
                case 2:
                    updateStatus("Браузеру не удалось определить местоположение: " + error.message);
                    break;
                case 3:
                    updateStatus("Истекло доступное время ожидания.");
                    break;
            };
        },
        {
            enableHighAccuracy: true,
            timeout: 10 * 1000 // 10 seconds
        });
        
    });
    $("#error").click(function(){
        $(this).text("");
    });
};

function showPage(page) {
    $('#docs-card .card').hide();
    $('#docs-card .card:gt('+((page-1)*pageSize)+'):lt('+(pageSize-1)+')').show();
    $('#docs-card .card:eq('+((page-1)*pageSize)+')').show();
}
function updateStatus(message) {
    document.getElementById("error").innerHTML = message;
}
window.onresize = function() {
    var currentPageSize = pageSize;
    if(window.innerWidth < 992){
        pageSize = 2;
    }else{pageSize = 3;}

    if(currentPageSize != pageSize){
        var pgs = Math.ceil($('#docs-card .card').length/pageSize);
        
        var pgnt = '<li class="active" name="pagin1"></li>';
        for(var i = 2; i <= pgs; i++){
	        pgnt += '<li name="pagin'+i+'"></li>';
        };
        $('#pagin').html(pgnt);
        
        showPage(1);
    }
    
};

var map;

// Функция initMap которая отрисует карту на странице
function initMap() {

    // В переменной map создаем объект карты GoogleMaps и вешаем эту переменную на <div id="map"></div>
    map = new google.maps.Map(document.getElementById('map'), {
        // При создании объекта карты необходимо указать его свойства
        // center - определяем точку на которой карта будет центрироваться
        center: {lat: 50.475857, lng: 30.670049},
        // zoom - определяет масштаб. 0 - видно всю платнеу. 18 - видно дома и улицы города.
        zoom: 17
    });
    
    // Создаем наполнение для информационного окна
    var contentHouse = '<div class="content"><img id="infoWin1" src="../img/лого клаб.png" alt=""></img></div>';
    // Создаем информационное окно
    var infowindow1 = new google.maps.InfoWindow({
        // Определяем позицию маркера
        position: {lat: 50.475686, lng: 30.669889},

        // Указываем на какой карте он должен появится.
        map: map,
        content: contentHouse,
        maxWidth: 85

    });
    
    var contentResidence = '<div class="content"><img id="infoWin2" src="../img/Club_residence 1.png" alt=""></img></div>';
    var infowindow2 = new google.maps.InfoWindow({
        
        position: {lat: 50.476159, lng: 30.669697},

        map: map,
        content: contentResidence,
        maxWidth: 85

    });
    
    var contentString = '<div class="content" id="infoWin3">Офис продаж</div>';
    var infowindow3 = new google.maps.InfoWindow({
        
        position: {lat: 50.476787, lng: 30.669375},

        map: map,
        content: contentString,
        maxWidth: 105

    });
    
    
}

function calculateRoute(from) {
    
    var directionsService = new google.maps.DirectionsService();
    var directionsRequest = {
      origin: from,
      destination: {lat: 50.476787, lng: 30.669375},
      travelMode: google.maps.DirectionsTravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC
    };
    directionsService.route(
        directionsRequest,
        function(response, status)
        {
            if (status == google.maps.DirectionsStatus.OK)
            {
            new google.maps.DirectionsRenderer({
                map: map,
                directions: response
            });
            }
            else
            updateStatus("Невозможно получить ваш путь<br />");
        }
    );
}

  