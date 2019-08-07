//API key AIzaSyCDz9nTD3ZvX96FT3OjKUJxBdrE4CAAeyQ
function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}
class Taxi {
    constructor(lat, lng) {
            this.lat1 = lat;
            this.lng1 = lng;
        }
        //сеттер для задавания рандомных позицый рядом с нашей локацией
    set SetRandomLocation(location) {
        let a = Number(getRandomFloat(-0.03, 0.03).toFixed(5));
        let b = Number(getRandomFloat(-0.03, 0.03).toFixed(5));

        this.lat1 = location.lat + a;
        this.lng1 = location.lng + b;
    }
}




let map;
let geocoder = new google.maps.Geocoder;
let infowindow = new google.maps.InfoWindow;
var directionsService = new google.maps.DirectionsService();
var directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true,polylineOptions: {strokeColor: "black"}});


function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8,
    } );
}




///Создала массив с таксишками!!!!
let taxi = new Taxi;
let taxiArray = [];
for (let i = 0; i < 5; i++) {
    taxiArray[i] = new Taxi;
}
////
function getLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((coords) => {
                resolve(coords);
            });
        } else {
            reject("Geolocation is not supported by this browser.");
        }
    })
}

getLocation().then((coords) => {

        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: coords.coords.latitude, lng: coords.coords.longitude },
            zoom: 14,
        });

        let CurPosmarker = new google.maps.Marker({
            position: new google.maps.LatLng(coords.coords.latitude, coords.coords.longitude),
            icon: {
                url: 'img/curlocation.png',
                // size: new google.maps.Size(50, 50)
            },
            map: map
        });
        directionsRenderer.setMap(map);
        
 

        // Идем по всем такси и шпулим их на карту
        map.addListener("dragend", () =>{
            getCenterLocation();
        })
        let loc = { lat: coords.coords.latitude, lng: coords.coords.longitude };
        taxiArray.forEach(taxi => {
            generateTaxiOnMap(loc, taxi);
        });
        let taxiNumber =getRandomFloat(0,4).toFixed(0);
        console.log(taxiNumber);
        calculateAndDisplayRoute(directionsRenderer, directionsService,coords.coords.latitude,coords.coords.longitude,taxiArray[0].lat1,taxiArray[0].lng1);

    });


    function calculateAndDisplayRoute(DirectionsRenderer, directionsService,originLat,originLng,destLat,destLng) {
      // Retrieve the start and end locations and create a DirectionsRequest using
      // WALKING directions.
      directionsService.route({
        origin: new google.maps.LatLng(originLat, originLng),
        destination: new google.maps.LatLng(destLat, destLng),
        travelMode: 'DRIVING'
      }, function(response, status) {
        // Route the directions and pass the response to a function to create
        // markers for each step.
        if (status === 'OK') {
          directionsRenderer.setDirections(response);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
    }



    //делает маркер таксишку
function generateTaxiOnMap(loc, taxi) {
    taxi.SetRandomLocation = loc;
    console.log(taxi.lat1, taxi.lng1);
    let markerTaxi = new google.maps.Marker({
        position: new google.maps.LatLng(taxi.lat1, taxi.lng1),
        icon: {
            url: 'img/taxi.png',
            //size: new google.maps.Size(32, 50)
        },
        map: map
    });

}

let markersArray = [];

function geocodeLatLng(latlng,geocoder, map, infowindow,marker) {
    geocoder.geocode({'location': latlng}, function(results, status) {
      if (status === 'OK') {
        if (results[0]) {
          infowindow.setContent(results[0].formatted_address);
          infowindow.open(map, marker);
        } else {
          window.alert('No results found');
        }
      } else {
        window.alert('Geocoder failed due to: ' + status);
      }
    });
  }




function getCenterLocation() {

    let c = map.getCenter();
    let marker = new google.maps.Marker({
        position: new google.maps.LatLng(c.lat(), c.lng()),
        icon: {
            url: 'img/pin.png',
            // size: new google.maps.Size(0, 0)
        },
        map: map
    });
    //удалили старые
    let latlng = {lat: c.lat(), lng: c.lng()};
    geocodeLatLng(latlng,geocoder,map,infowindow,marker);
    for (var i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(null);
    }
    markersArray = [];
    markersArray.push(marker);

    // let infowindow = new google.maps.InfoWindow({

    //     content: geocodeLatLng(c.lat(),c.lng(),geocoder,map)
    // });
    // infowindow.open(map, markersArray[0]);

    return {
        lat: c.lat(),
        lng: c.lng()
    }
}

// document.addEventListener("mouseup", () => { getCenterLocation(); });