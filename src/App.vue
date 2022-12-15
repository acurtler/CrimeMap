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
            new_incident: {
                case_number: "",
                date: "",
                time: "",
                code: "",
                incident: "",
                police_grid: "",
                neighborhood_number: "",
                block: ""
            },
            checkedNeighborhoods: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            checkedIncidents: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
            /*checkedNeighborhoods: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],*/
            /*checkedIncidents: [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true],*/
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
        
        setFilter(event) {
            let codePromise = this.getJSON('http://localhost:8000/codes');
            let neighborhoodPromise = this.getJSON('http://localhost:8000/neighborhoods');
            let incidentPromise = this.getJSON('http://localhost:8000/incidents');

            if (this.max.length>0) {
                for (let i=0; i<this.max.length; i++) {
                    let incidentPromise = this.getJSON('http://localhost:8000/incidents?limit=' + this.max[i]);
                }
            }

            for (let i=0; i<this.checkedNeighborhoods.length; i++) {
                if (this.checkedNeighborhoods[i] == 'true') {
                    let neighborhoodPromise = this.getJSON('http://localhost:8000/neighborhoods?name='+this.checkedNeighborhoods[i]);
                }
            }

            for (let i=0; i<this.checkedIncidents.length; i++) {
                if (this.checkedIncidents[i] == 'true') {
                    let codePromise = this.getJSON('http://localhost:8000/codes');
                }
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
        },

        geoLocate(event) {
            console.log(event);
            console.log(this.checkedIncidents);
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
            let url = "http://localhost:8000/new-incident";
            this.uploadJSON('PUT', url, this.new_incident).then( (data) => {
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

        /*for (let i=0; i<this.checkedNeighborhoods.length; i++) {
            if (this.checkedNeighborhoods[i] = 'true') {

            }
        }*/

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

        /*for(i=0;i<this.neighborhoods.length;i++) {
            var marker = L.marker([neighborhoods[i].lat, neighborhoods[i].lon]);
            marker.addTo(this.leaflet.map);
            marker.bindPopup(neighborhoods[i].incidents.length);
        }*/

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
                    <span><b>Search by Filter:</b></span>
                    <br>
                    <br>

                    <span><u>Incident Type</u>:</span>
                    <br>
                        <input type="checkbox" id="homicide" value="Homicide" v-model="checkedIncidents[0]"><label for="homicide">Homicide</label><br>
                        <input type="checkbox" id="murder" value="Murder" v-model="checkedIncidents[1]"><label for="murder">Murder</label><br>
                        <input type="checkbox" id="rape" value="Rape" v-model="checkedIncidents[2]"><label for="rape">Rape</label><br>
                        <input type="checkbox" id="robbery" value="Robbery" v-model="checkedIncidents[3]"><label for="robbery">Robbery</label><br>
                        <input type="checkbox" id="aggravated assault" value="Aggravated Assault" v-model="checkedIncidents[4]"><label for="aggravated assault">Aggravated Assault</label><br>
                        <input type="checkbox" id="burglary" value="Burglary" v-model="checkedIncidents[5]"><label for="">Burglary</label><br>
                        <input type="checkbox" id="att. burglary" value="Att. Burglary" v-model="checkedIncidents[6]"><label for="att. burglary">Attempted Burglary</label><br>
                        <input type="checkbox" id="theft" value="Theft" v-model="checkedIncidents[7]"><label for="theft">Theft</label><br>
                        <input type="checkbox" id="arson" value="Arson" v-model="checkedIncidents[8]"><label for="arson">Arson</label><br>
                        <input type="checkbox" id="damage" value="Damage" v-model="checkedIncidents[9]"><label for="damage">Damage to Property</label><br>
                        <input type="checkbox" id="narcotics" value="Narcotics" v-model="checkedIncidents[10]"><label for="narcotics">Narcotics</label><br>
                        <input type="checkbox" id="weapon" value="Weapon" v-model="checkedIncidents[11]"><label for="weapon">Weapon</label><br>
                        <input type="checkbox" id="death_investigation" value="Death Investigation" v-model="checkedIncidents[12]"><label for="death_investigation">Death Investigation</label><br>
                        <input type="checkbox" id="police_visit" value="Police Visit" v-model="checkedIncidents[13]"><label for="police_visit">Police Visit</label><br>
                        <input type="checkbox" id="event" value="Engagement Event" v-model="checkedIncidents[14]"><label for="event">Community Engagement Event</label><br>
                        <input type="checkbox" id="foot_patrol" value="Foot Patrol" v-model="checkedIncidents[15]"><label for="foot_patrol">Proactive Foot Patrol</label><br>
                        <input type="checkbox" id="other" value="Other" v-model="checkedIncidents[16]"><label for="other">Other</label><br>
                    <br>
                    
                    <span><u>Neighborhoods</u>:</span>
                    <br>
                            <input type="checkbox" id="1" value="Conway/Battlecreek/Highwood" v-model="checkedNeighborhoods[0]"><label for="1">Conway/Battlecreek/Highwood</label> <br>
                            <input type="checkbox" id="2" value="Greater East Side" v-model="checkedNeighborhoods[1]"><label for="2">Greater East Side</label><br>
                            <input type="checkbox" id="3" value="West Side" v-model="checkedNeighborhoods[2]"><label for="3">West Side</label><br>
                            <input type="checkbox" id="4" value="Dayton's Bluff" v-model="checkedNeighborhoods[3]"><label for="4">Dayton's Bluff</label><br>
                            <input type="checkbox" id="5" value="Payne/Phalen" v-model="checkedNeighborhoods[4]"><label for="5">Payne/Phalen</label><br>
                            <input type="checkbox" id="6" value="North End" v-model="checkedNeighborhoods[5]"><label for="6">North End</label><br>
                            <input type="checkbox" id="7" value="Thomas/Dale(Frogtown)" v-model="checkedNeighborhoods[6]"><label for="7">Thomas/Dale(Frogtown)</label><br>
                            <input type="checkbox" id="8" value="Summit/University" v-model="checkedNeighborhoods[7]"><label for="8">Summit/University</label><br>
                            <input type="checkbox" id="9" value="West Seventh" v-model="checkedNeighborhoods[8]"><label for="9">West Seventh</label><br>
                            <input type="checkbox" id="10" value="Como" v-model="checkedNeighborhoods[9]"><label for="10">Como</label><br>
                            <input type="checkbox" id="11" value="Hamline/Midway" v-model="checkedNeighborhoods[10]"><label for="11">Hamline/Midway</label><br>
                            <input type="checkbox" id="12" value="St. Anthony" v-model="checkedNeighborhoods[11]"><label for="12">St. Anthony</label><br>
                            <input type="checkbox" id="13" value="Union Park" v-model="checkedNeighborhoods[12]"><label for="13">Union Park</label><br>
                            <input type="checkbox" id="14" value="Macalester-Groveland" v-model="checkedNeighborhoods[13]"><label for="14">Macalester-Groveland</label><br>
                            <input type="checkbox" id="15" value="Highland" v-model="checkedNeighborhoods[14]"><label for="15">Highland</label><br>
                            <input type="checkbox" id="16" value="Summit Hill" v-model="checkedNeighborhoods[15]"><label for="16">Summit Hill</label><br>
                            <input type="checkbox" id="17" value="Capitol River" v-model="checkedNeighborhoods[16]"><label for="17">Capitol River</label><br>
                    <br>

                    <span><u>Date</u>:</span>
                    <br>
                        <!--<v-date-picker v-model="range" is-range />-->
                    <br>


                    <span><u>Max Incidents</u>:</span>
                    <br>
                        <input type="radio" id="10" value="limit_10" v-model="max"><label for="10">10</label>
                        <input type="radio" id="50" value="limit_50" v-model="max"><label for="50">50</label>
                        <input type="radio" id="100" value="limit_100" v-model="max"><label for="100">100</label>
                        <input type="radio" id="500" value="limit_500" v-model="max"><label for="500">500</label>

                    <button id="lookup" class="cell small-3 button" type="button" @click="setFilter">Apply Filters</button>

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
                            <tr v-for="item in incidents">
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
                        <input id="case_number" type="text" placeholder="Example: 11111111" v-model="new_incident.case_number"><label for="case_number"></label>
                        <br>

                        <span>Date</span><br>
                        <input id="date" type="text" placeholder="Example: 2022-05-31" v-model="new_incident.date"/><br><label for="date"></label>

                        <span>Time</span><br>
                        <input id="time" type="text" placeholder="Example: 12:03:43" v-model="new_incident.time"/><br><label for="time"></label>

                        <span>Code</span><br>
                        <input id="code" type="text" placeholder="Example: 110" v-model="new_incident.code"/><br>

                        <span>Incident</span><br>
                        <input id="incident" type="text" placeholder="Example: Murder, Non Negligent Manslaughter" v-model="new_incident.incident"/><br>

                        <span>Police Grid</span><br>
                        <input id="police_grid" type="text" placeholder="Example: 87" v-model="new_incident.police_grid"/><br>

                        <span>Neighborhood Number</span><br>
                        <input id="neighborhood_number" type="text" placeholder="Example: 7" v-model="new_incident.neighborhood_number"/>
                        <br>

                        <span>Block</span><br>
                        <input id="block" type="text" placeholder="Example: THOMAS AV & VICTORIA" v-model="new_incident.block"/>
                        <br>
                        <span>new incident has: {{ new_incident }}</span>

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
