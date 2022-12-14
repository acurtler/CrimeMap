<script>
import $ from 'jquery'

/*import Calendar from 'v-calendar/lib/components/calendar.umd'
import DatePicker from 'v-calendar/lib/components/date-picker.umd'

// Register components in your 'main.js'
Vue.component('calendar', Calendar)
Vue.component('date-picker', DatePicker)*/

export default {
    data() {
        return {
            view: 'map',
            limit: 1000,
            codes: [],
            neighborhoods: [],
            incidents: [],
            newIncident: [],
            checkedNeighborhoods: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],
            checkedIncidents: [],
            max: [],
            el: '...',
            /*components: {
                Calendar,
                DatePicker,
                date: new Date(),
            },*/

            leaflet: {
                map: null,
                center: {
                    lat: 44.955139,
                    lng: -93.102222,
                    address: ""
                },
                zoom: 12,
                bounds: {
                    nw: {lat: 45.008206, lng: -93.217977},
                    se: {lat: 44.883658, lng: -92.993787}
                },
                neighborhood_markers: [
                    {location: [44.942068, -93.020521], marker: null},
                    {location: [44.977413, -93.025156], marker: null},
                    {location: [44.931244, -93.079578], marker: null},
                    {location: [44.956192, -93.060189], marker: null},
                    {location: [44.978883, -93.068163], marker: null},
                    {location: [44.975766, -93.113887], marker: null},
                    {location: [44.959639, -93.121271], marker: null},
                    {location: [44.947700, -93.128505], marker: null},
                    {location: [44.930276, -93.119911], marker: null},
                    {location: [44.982752, -93.147910], marker: null},
                    {location: [44.963631, -93.167548], marker: null},
                    {location: [44.973971, -93.197965], marker: null},
                    {location: [44.949043, -93.178261], marker: null},
                    {location: [44.934848, -93.176736], marker: null},
                    {location: [44.913106, -93.170779], marker: null},
                    {location: [44.937705, -93.136997], marker: null},
                    {location: [44.949203, -93.093739], marker: null}
                ] 
            },
        };
    },
    methods: {
        viewMap(event) {
            this.view = 'map';
        },

        viewNewIncident(event) {
            this.view = 'new_incident';
        },

        viewAbout(event) {
            this.view = 'about';
        },
        
        geoLocate(event) {
            console.log(event);
            let location = document.getElementById('location');
            let url = 'https://nominatim.openstreetmap.org/search?q=' + location.value +
              '&format=json&limit=1&accept-language=en';
              this.getJSON(url).then( (data) => {
                    console.log('longitude is '+ data[0].lon);
                    console.log(data);
                    let lat = data[0].lat;
                    let lon = data[0].lon;
                    // use data and this.leaflet.map
                    var marker = L.marker([data[0].lat, data[0].lon],{}).addTo(this.leaflet.map);
                    this.leaflet.map.flyTo([data[0].lat, data[0].lon], 1);
                    /*this.leaflet.map = this.leaflet.map.panTo([this.leaflet.center.lat, this.leaflet.center.lon], 1);*/
              }).catch((error) => {
                    console.log(error);
              });
        },

        newIncident(event) {
            console.log(event);
            /*let initialdata = [];
            let case_number = document.getElementById('case_number');
            initialdata.push(case_number);
            let date = document.getElementById('date');
            initialdata.push(date);
            let time = document.getElementById('time');
            initialdata.push(time);
            let code = document.getElementById('code');
            initialdata.push(code);
            let incident = document.getElementById('incident');
            initialdata.push(incident);
            let police_grid = document.getElementById('police_grid');
            initialdata.push(police_grid);
            let neighborhood_number = document.getElementById('neighborhood_number');
            initialdata.push(neighborhood_number);
            let block = document.getElementById('block');
            initialdata.push(block);*/
            let url = "http://localhost:8000/new-incident";
            /*let url = "http://localhost:8000/new-incident?case_number=" + case_number + '&date_time=' + date + '\
                T' + time + '&code=' + code + '&incident=' + incident + '&police_grid=' + police_grid + '\
                &neighborhood_number=' + neighborhood_number + '&block=' + block;*/
            this.uploadJSON('PUT', url, this.newIncident).then( (data) => {
                console.log(data);
            }).catch((error) => {
                console.log(error);
            });
        },

        getJSON(url) {
            return new Promise((resolve, reject) => {
                $.ajax({
                    dataType: 'json',
                    url: url,
                    success: (response) => {
                        resolve(response);
                    },
                    error: (status, message) => {
                        reject({status: status.status, message: status.statusText});
                    }
                });
            });
        },

        uploadJSON(method, url, data) {
            return new Promise((resolve, reject) => {
                $.ajax({
                    type: method,
                    url: url,
                    contentType: 'application/json; charset=utf-8',
                    data: JSON.stringify(data),
                    dataType: 'text',
                    success: (response) => {
                        resolve(response);
                    },
                    error: (status, message) => {
                        reject({status: status.status, message: status.statusText});
                    }
                });
            });
        }
    },
    mounted() {
        this.leaflet.map = L.map('leafletmap').setView([this.leaflet.center.lat, this.leaflet.center.lng], this.leaflet.zoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            minZoom: 11,
            maxZoom: 18
        }).addTo(this.leaflet.map);
        this.leaflet.map.setMaxBounds([[44.883658, -93.217977], [45.008206, -92.993787]]);
        let district_boundary = new L.geoJson();
        district_boundary.addTo(this.leaflet.map);

        let codePromise = this.getJSON('http://localhost:8000/codes');
        let neighborhoodPromise = this.getJSON('http://localhost:8000/neighborhoods');
        let incidentPromise = this.getJSON('http://localhost:8000/incidents');
        let geoPromise = this.getJSON('/data/StPaulDistrictCouncil.geojson');

        let url = "http://localhost:8000/incidents"

        //this.checkedNeighborhoods = this.checkedNeighborhoods.join(',');
        console.log(this.checkedNeighborhoods);

        /*if (this.checkedNeighborhoods.length>0) {
            console.log('neighborhoods are ' + this.checkedNeighborhoods);
            for (let i=0; i<this.checkedNeighborhoods.length; i++) {
                new_url = url + '?neighborhood=' + this.checkedNeighborhoods[i];
                if (i != this.checkedNeighborhoods.length - 1) {
                    new_url = new_url + ',';
                }
            }
            incidentPromise = this.getJSON(new_url)
        }*/

        if (this.max.length>0) {
            console.log('max incidents is ' + this.max);
            for (i in this.max) {
                new_url = 'http://localhost:8000/incidents?limit=' + this.max[i];
            }
            incidentPromise = this.getJSON(new_url)
        }

        Promise.all([codePromise, neighborhoodPromise, incidentPromise, geoPromise]).then((results) => {
            this.codes = results[0];
            this.neighborhoods = results[1];
            this.incidents = results[2];
            $(results[3].features).each((key, value) => {
                district_boundary.addData(value);
            });
        }).catch((error) => {
            console.log('Error:', error);
        });

        /*this.getJSON('http://localhost:8000/codes').then((result) => {
            this.codes = result;
        }).catch((error) => {
            console.log('Error:', error);
        });

        this.getJSON('http://localhost:8000/codes').then((result) => {
            this.codes = result;
        }).catch((error) => {
            console.log('Error:', error);
        });

        this.getJSON('/data/StPaulDistrictCouncil.geojson').then((result) => {
            // St. Paul GeoJSON
            $(result.features).each((key, value) => {
                district_boundary.addData(value);
            });
        }).catch((error) => {
            console.log('Error:', error);
        });*/
    }
}
</script>

<template>
    <div class="grid-container">
        <div class="grid-x grid-padding-x">
            <p :class="'cell small-4 ' + ((view === 'map') ? 'selected' : 'unselected')" @click="viewMap">Map</p>
            <p :class="'cell small-4 ' + ((view === 'new_incident') ? 'selected' : 'unselected')" @click="viewNewIncident">New Incident</p>
            <p :class="'cell small-4 ' + ((view === 'about') ? 'selected' : 'unselected')" @click="viewAbout">About</p>
        </div>
    </div>
    <div v-show="view === 'map'">
        <div class="grid-container">
            <div class="grid-x grid-padding-x">
                <div id="leafletmap" class="cell auto"></div>
            </div>

            <div class="grid-x grid-padding-x">
                <input id="location" class = "cell small-9" type="text" placeholder="enter location"/> 
                <button id="lookup" class="cell small-3 button" type="button" @click="geoLocate">Look Up</button>
            </div>

            <div class="grid-x grid-padding-x">
                <div id="filters" class="cell small-3">
                    <span><b>Filters</b></span>
                    <br>
                    <br>

                    <span>Incident Type</span>
                    <br>
                        <input type="checkbox" id="homicide" value="Homicide" v-model="checkedIncidents"><label for="homicide">Homicide</label>
                        <input type="checkbox" id="murder" value="Murder" v-model="checkedIncidents"><label for="murder">Murder</label>
                        <input type="checkbox" id="rape" value="Rape" v-model="checkedIncidents"><label for="rape">Rape</label>
                        <input type="checkbox" id="robbery" value="Robbery" v-model="checkedIncidents"><label for="robbery">Robbery</label>
                        <input type="checkbox" id="aggravated assault" value="Aggravated Assault" v-model="checkedIncidents"><label for="aggravated assault">Aggravated Assault</label>
                        <input type="checkbox" id="burglary" value="Burglary" v-model="checkedIncidents"><label for="">Burglary</label>
                        <input type="checkbox" id="att. burglary" value="Att. Burglary" v-model="checkedIncidents"><label for="att. burglary">Attempted Burglary</label>
                        <input type="checkbox" id="theft" value="Theft" v-model="checkedIncidents"><label for="theft">Theft</label>
                        <input type="checkbox" id="arson" value="Arson" v-model="checkedIncidents"><label for="arson">Arson</label>
                        <input type="checkbox" id="damage" value="Damage" v-model="checkedIncidents"><label for="damage">Damage to Property</label>
                        <input type="checkbox" id="narcotics" value="Narcotics" v-model="checkedIncidents"><label for="narcotics">Narcotics</label>
                        <input type="checkbox" id="weapon" value="Weapon" v-model="checkedIncidents"><label for="weapon">Weapon</label>
                        <input type="checkbox" id="death_investigation" value="Death Investigation" v-model="checkedIncidents"><label for="death_investigation">Death Investigation</label>
                        <input type="checkbox" id="police_visit" value="Police Visit" v-model="checkedIncidents"><label for="police_visit">Police Visit</label>
                        <input type="checkbox" id="event" value="Engagement Event" v-model="checkedIncidents"><label for="event">Community Engagement Event</label>
                        <input type="checkbox" id="foot_patrol" value="Foot Patrol" v-model="checkedIncidents"><label for="foot_patrol">Proactive Foot Patrol</label>
                        <input type="checkbox" id="other" value="Other" v-model="checkedIncidents"><label for="other">Other</label>
                    <br>
                    
                    <span>Neighborhoods</span>
                    <br>
                        <div class="neighborhoods" :style="'border border-dark'">
                            <input type="checkbox" id="1" value="Conway/Battlecreek/Highwood" v-model="checkedNeighborhoods[0]">
                                <label for="1">Conway/Battlecreek/Highwood</label>
                            <input type="checkbox" id="2" value="Greater East Side" v-model="checkedNeighborhoods[1]">
                                <label for="2">Greater East Side</label>
                            <input type="checkbox" id="3" value="West Side" v-model="checkedNeighborhoods[2]">
                                <label for="3">West Side</label>
                            <input type="checkbox" id="4" value="Dayton's Bluff" v-model="checkedNeighborhoods[3]">
                                <label for="4">Dayton's Bluff</label>
                            <input type="checkbox" id="5" value="Payne/Phalen" v-model="checkedNeighborhoods">
                                <label for="5">Payne/Phalen</label>
                            <input type="checkbox" id="6" value="North End" v-model="checkedNeighborhoods">
                                <label for="6">North End</label>
                            <input type="checkbox" id="7" value="Thomas/Dale(Frogtown)" v-model="checkedNeighborhoods">
                                <label for="7">Thomas/Dale(Frogtown)</label>
                            <input type="checkbox" id="8" value="Summit/University" v-model="checkedNeighborhoods">
                                <label for="8">Summit/University</label>
                            <input type="checkbox" id="9" value="West Seventh" v-model="checkedNeighborhoods">
                                <label for="9">West Seventh</label>
                            <input type="checkbox" id="10" value="Como" v-model="checkedNeighborhoods">
                                <label for="10">Como</label>
                            <input type="checkbox" id="11" value="Hamline/Midway" v-model="checkedNeighborhoods">
                                <label for="11">Hamline/Midway</label>
                            <input type="checkbox" id="12" value="St. Anthony" v-model="checkedNeighborhoods">
                                <label for="12">St. Anthony</label>
                            <input type="checkbox" id="13" value="Union Park" v-model="checkedNeighborhoods">
                                <label for="13">Union Park</label>
                            <input type="checkbox" id="14" value="Macalester-Groveland" v-model="checkedNeighborhoods">
                                <label for="14">Macalester-Groveland</label>
                            <input type="checkbox" id="15" value="Highland" v-model="checkedNeighborhoods">
                                <label for="15">Highland</label>
                            <input type="checkbox" id="16" value="Summit Hill" v-model="checkedNeighborhoods">
                                <label for="16">Summit Hill</label>
                            <input type="checkbox" id="17" value="Capitol River" v-model="checkedNeighborhoods">
                                <label for="17">Capitol River</label>
                        </div>
                    <br>

                    <span>Date</span>
                    <br>
                        <!--<v-date-picker v-model="range" is-range />-->
                    <br>


                    <span>Max Incidents</span>
                    <br>
                        <input type="checkbox" id="10" value="limit_10" v-model="max"><label for="10">10</label>
                        <input type="checkbox" id="50" value="limit_50" v-model="max"><label for="50">50</label>
                        <input type="checkbox" id="100" value="limit_100" v-model="max"><label for="100">100</label>
                        <input type="checkbox" id="500" value="limit_500" v-model="max"><label for="500">500</label>
                    

                </div>
                <div id="data" class="cell small-9">
                    <table>
                        <thead>
                            <tr>
                                <th>Case Number</th>
                                <th>Incident Type</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Neighborhood Name</th>
                                <th>Block</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in incidents">
                                <td>{{ item.case_number }}</td>
                                <td>{{ item.incident }}</td>
                                <td>{{ item.date_time.split('T')[0] }}</td>
                                <td>{{ item.date_time.split('T')[1] }}</td>
                                <td>{{ neighborhoods[item.neighborhood_number - 1].name }}</td>
                                <td>{{ item.block }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>

    </div>
    <div v-if="view === 'new_incident'">
        <!-- Replace this with your actual form: can be done here or by making a new component -->
        <div class="grid-container">
            <div class="grid-x grid-padding-x">
                <h1 class="cell auto">New Incident Form</h1>
            </div>
        </div>

        <div class="grid-container">
            <div class="grid-x grid-padding-x">
                <div>
                        <span>Case Number</span><br>
                        <input id="case_number" type="text" placeholder="Example: 11111111" v-model="newIncident"/><br>

                        <span>Date</span><br>
                        <input id="date" type="email" placeholder="Example: 2022-05-31" v-model="newIncident"/><br>

                        <span>Time</span><br>
                        <input id="time" type="email" placeholder="Example: 12:03:43" v-model="newIncident"/><br>

                        <span>Code</span><br>
                        <input id="code" type="email" placeholder="Example: 110" v-model="newIncident"/><br>

                        <span>Incident</span><br>
                        <input id="incident" type="email" placeholder="Example: Murder, Non Negligent Manslaughter" v-model="newIncident"/><br>

                        <span>Police Grid</span><br>
                        <input id="police_grid" type="email" placeholder="Example: 87" v-model="newIncident"/><br>

                        <span>Neighborhood Number</span><br>
                        <input id="neighborhood_number" type="email" placeholder="Example: 7" v-model="newIncident"/>
                        <br>

                        <span>Block</span><br>
                        <input id="block" type="email" placeholder="Example: THOMAS AV & VICTORIA" v-model="newIncident"/><br>

                        <button id="lookup" class="cell small-3 button" type="button" @click="newIncident">Submit</button>
                </div>
            </div>
        </div>

    </div>
    <div v-if="view === 'about'">
        <!-- Replace this with your actual about the project content: can be done here or by making a new component -->
        <div class="grid-container">
            <div class="grid-x grid-padding-x">
                <h1 class="cell auto">About the Project</h1>
            </div>
        </div>
    </div>
</template>

<style>
#leafletmap {
    height: 500px;
}

.selected {
    background-color: rgb(10, 100, 126);
    color: white;
    border: solid 1px white;
    text-align: center;
    cursor: pointer;
}
.unselected {
    background-color: rgb(200, 200, 200);
    color: black;
    border: solid 1px white;
    text-align: center;
    cursor: pointer;
}
.neighborhoods {
    border: 2rem;
}



</style>
