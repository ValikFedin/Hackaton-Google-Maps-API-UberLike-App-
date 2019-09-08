window.onload = () => {
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
  let infowindow = new google.maps.InfoWindow();
  let geocoder = new google.maps.Geocoder();
  let service = new google.maps.DistanceMatrixService;
  let directionsService = new google.maps.DirectionsService();
  let directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
    polylineOptions: { strokeColor: "black" }
  });
  document.getElementById("adress").addEventListener("keydown",(e)=>{
      if(e.keyCode=='13'){
          event.preventDefault();
      }
  })
 
  let ac = new google.maps.places.Autocomplete(document.getElementById('adress'));
  google.maps.event.addListener(ac, 'place_changed',inputGetPlace)
  async function initMap() {
    try {
      if (await navigator.geolocation) {
        await navigator.geolocation.getCurrentPosition(Render);
      }
    } catch (err) {
      console.log(err.toString());
    }
  }


  function Render(coords) {
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: coords.coords.latitude, lng: coords.coords.longitude },
      zoom: 14,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: true,
      streetViewControl: false,
      rotateControl: true,
      fullscreenControl: false
    });
    let CurPosMarker = new google.maps.Marker({
      position: new google.maps.LatLng(
        coords.coords.latitude,
        coords.coords.longitude
      ),
      icon: {
        url: "img/curlocation.png"
      },
      map: map
    });
    directionsRenderer.setMap(map);
    map.addListener("dragend", () => {
      getCenterLocation();
    });
    map.addListener("dragstart", () => {
      showCenterPin();
    });
    // Идем по всем такси и шпулим их на карту

    let loc = { lat: coords.coords.latitude, lng: coords.coords.longitude };
    taxiArray.forEach(taxi => {
      generateTaxiOnMap(loc, taxi);
    });
    let taxiNumber = getRandomFloat(0, 4).toFixed(0);
    // console.log(taxiNumber);
    google.maps.event.addListener(ac, 'place_changed',inputGetPlace)
  document.getElementById("goThereButton").addEventListener("click",()=>{
    loc = inputGetPlace();
    let tarif = 40;
    // map.setCenter(new google.maps.LatLng(loc.lat,loc.lng));
    document.getElementById("inform").style.display="flex";
    document.getElementById("mapContainer").style.height ="80%";
    document.getElementById("inform").style.height ="20%";
    calculateAndDisplayRoute(
        directionsRenderer,
        directionsService,
        coords.coords.latitude,
        coords.coords.longitude,
        loc.lat,
        loc.lng
      );

      let latLngA = new google.maps.LatLng(coords.coords.latitude,coords.coords.longitude);
      let latLngB = new google.maps.LatLng(loc.lat,loc.lng);
      // console.log(google.maps.geometry.spherical.computeDistanceBetween (latLngA, latLngB));
      
      service.getDistanceMatrix({
        origins: [latLngA],
        destinations: [latLngB],
        travelMode: 'DRIVING',
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
      }, function(response, status) {
        if (status !== 'OK') {
          alert('Error was: ' + status);
        } else {
          // console.log(response.destinationAddresses[0]);
          // console.log(response.originAddresses[0]);
          let distance = response.rows[0].elements[0].distance.text.split(" ");
          let duration = response.rows[0].elements[0].duration.text;
          geocoder.geocode({ location: latLngA }, function(results, status) {
            if (status === "OK") {
              if (results[0]) {
                document.getElementById("orig").innerText=results[0].address_components[1].long_name + " " +results[0].address_components[0].long_name
              } else {
                window.alert("No results found");
              }
            } else {
              window.alert("Geocoder failed due to: " + status);
            }
          });
          geocoder.geocode({ location: latLngB }, function(results, status) {
            if (status === "OK") {
              if (results[0]) {
                document.getElementById("dest").innerText=results[0].address_components[1].long_name + " " +results[0].address_components[0].long_name
              } else {
                window.alert("No results found");
              }
            } else {
              window.alert("Geocoder failed due to: " + status);
            }
          });
          
          tarif+=parseInt(distance[0])*5;
          document.getElementById("price").innerText = `${tarif} грн`
        }
       
      });
  });
  document.getElementById("closebtn").addEventListener('click',()=>{
    document.getElementById("inform").style.display="none";
    document.getElementById("mapContainer").style.height ="100%";
    document.getElementById("inform").style.height ="0%";
  })
  };


  function inputGetPlace(){
    let place = ac.getPlace();
    // console.log(place.formatted_address);
    // console.log(place.url);
    // console.log(place.geometry.location.lat());
    return {
        lat:place.geometry.location.lat(),
        lng:place.geometry.location.lng()
    }
  }
  ///Создала массив с таксишками!!!!
  let taxi = new Taxi();
  let taxiArray = [];
  for (let i = 0; i < 5; i++) {
    taxiArray[i] = new Taxi();
  }

  function calculateAndDisplayRoute(
    DirectionsRenderer,
    directionsService,
    originLat,
    originLng,
    destLat,
    destLng
  ) {
    // Retrieve the start and end locations and create a DirectionsRequest using
    // WALKING directions.
    directionsService.route(
      {
        origin: new google.maps.LatLng(originLat, originLng),
        destination: new google.maps.LatLng(destLat, destLng),
        travelMode: "DRIVING"
      },
      function(response, status) {
        // Route the directions and pass the response to a function to create
        // markers for each step.
        if (status === "OK") {
          directionsRenderer.setDirections(response);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }

  //делает маркер таксишку
  function generateTaxiOnMap(loc, taxi) {
    taxi.SetRandomLocation = loc;
    let markerTaxi = new google.maps.Marker({
      position: new google.maps.LatLng(taxi.lat1, taxi.lng1),
      icon: {
        url: "img/taxi.png"
        //size: new google.maps.Size(32, 50)
      },
      map: map
    });
  }

  let markersArray = [];

  function geocodeLatLng(latlng, geocoder, map, infowindow, marker) {
    geocoder.geocode({ location: latlng }, function(results, status) {
      if (status === "OK") {
        if (results[0]) {
          infowindow.setContent(results[0].formatted_address);
          infowindow.open(map, marker);
        } else {
          window.alert("No results found");
        }
      } else {
        window.alert("Geocoder failed due to: " + status);
      }
    });
  }

  function showCenterPin() {
    let centerPin = document.getElementById("place");
    centerPin.style.display = "block";
  }

  function getCenterLocation() {
    let centerPin = document.getElementById("place");
    centerPin.style.display = "none";
    let c = map.getCenter();
    let marker = new google.maps.Marker({
      position: new google.maps.LatLng(c.lat(), c.lng()),
      icon: {
        url: "img/pin.png"
        // size: new google.maps.Size(0, 0)
      },
      map: map
    });
    //удалили старые
    let latlng = { lat: c.lat(), lng: c.lng() };
    geocodeLatLng(latlng, geocoder, map, infowindow, marker);
    for (var i = 0; i < markersArray.length; i++) {
      markersArray[i].setMap(null);
    }
    markersArray = [];
    markersArray.push(marker);
    return {
      lat: c.lat(),
      lng: c.lng()
    };
  }
  initMap();
};