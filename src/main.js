import { createApp } from 'vue'
import App from './App.vue'

let init = false;

function initializeApp() {
    if (!init) {
        let app = createApp(App).mount('#app');
    }
    init = true;
}

/*function inititalizeLookup() {
    var lookup = document.getElementById('lookup');
    lookup.addEventListener('click', geoLocate, false);
}*/


/*function geoLocate(event) {
    console.log(event);
    let location = document.getElementById('location');
    let url = 'https://nominatim.openstreetmap.org/search?q=' + location.value +
              '&format=json&limit=25&accept-language=en'
    getJSON(url, (data) => {
        let ul = document.getElementById('result');
        let i;
        for (i=0; i<data.length; i++) {
            let list = document.createElement("li");
            list.textContent = data[i].display_name + " (" + data[i].lat + ", " + data[i].lon + ")";
            ul.appendChild(list);
        }
        if (ul.length > 0 ) {
            for (let i=0; i<data.length; i++) {
                ul.removeChild(list);
            }
        }
    });
}

function getJSON(url, callback) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = () => {
        if (req.readyState == 4 && req.status == 200) {
            callback(JSON.parse(req.response));
        }
    };
    req.open("GET", url, true);
    req.send();
}*/


window.initializeApp = initializeApp;
