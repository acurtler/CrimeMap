@import "../node_modules/@syncfusion/ej2-base/styles/material.css";
@import "../node_modules/@syncfusion/ej2-inputs/styles/material.css";
@import "../node_modules/@syncfusion/ej2-vue-dropdowns/styles/material.css";
@import "../node_modules/@syncfusion/ej2-buttons/styles/material.css";
<script>
import $ from 'jquery'

/*import Vue from 'vue';
import { MultiSelectPlugin } from "@syncfusion/ej2-vue-dropdowns";
import { MultiSelect, CheckBoxSelection } from '@syncfusion/ej2-dropdowns';

MultiSelect.Inject(CheckBoxSelection);
Vue.use(MultiSelectPlugin);*/

export default {
    data() {
        return {
            view: 'map',
            limit: 1000,
            codes: [],
            neighborhoods: [],
            incidents: [],

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
            /*neighborhood_names: [
                    { Id: 'neighborhood1', Game: 'Badminton' },
                    { Id: 'neighborhood2', Game: 'Football' },
                    { Id: 'neighborhood3', Game: 'Tennis' },
                    { Id: 'neighborhood4', Game: 'Golf' },
                    { Id: 'neighborhood5', Game: 'Cricket' },
                    { Id: 'neighborhood6', Game: 'Handball' },
                    { Id: 'neighborhood7', Game: 'Karate' },
                    { Id: 'neighborhood8', Game: 'Fencing' },
                    { Id: 'neighborhood9', Game: 'Boxing' }
                ],
                fields : { text: 'Game', value: 'Id' }*/
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
                    this.leaflet.map = this.leaflet.map.panTo([this.leaflet.center.lat, this.leaflet.center.lon], 1);
              }).catch((error) => {
                    console.log(error);
              });
        },

        newIncident(event) {
            console.log(event);
            let case_number = document.getElementById('case_number');
            let date = document.getElementById('date');
            let time = document.getElementById('time');
            let code = document.getElementById('code');
            let incident = document.getElementById('incident');
            let police_grid = document.getElementById('police_grid');
            let neighborhood_number = document.getElementById('neighborhood_number');
            let block = document.getElementById('block');
            let url = "http://localhost:8000/new-incident?case_number=" + case_number + '&date_time=' + date + '\
                T' + time + '&code=' + code + '&incident=' + incident + '&police_grid=' + police_grid + '\
                &neighborhood_number=' + neighborhood_number + '&block=' + block;
            this.getJSON(url).then( (data) => {
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
        </div>
        <!--<div id="app">
            <div id='container' style="margin:15px auto 0; width:250px;">
            <br>
            <ejs-multiselect id='multiselect' :dataSource='neighborhood_names' placeholder="Select a Neighborhood" mode="CheckBox" :fields='fields'></ejs-multiselect>
            </div>
        </div>-->

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
                    <form @submit.prevent="submitForm" v-if="!formSubmitted">
                        <span>Case Number</span><br>
                        <input id="case_number" type="text" placeholder="Example: 11111111" /><br>

                        <span>Date</span><br>
                        <input id="date" type="email" placeholder="Example: 2022-05-31" /><br>

                        <span>Time</span><br>
                        <input id="time" type="email" placeholder="Example: 12:03:43" /><br>

                        <span>Code</span><br>
                        <input id="code" type="email" placeholder="Example: 110" /><br>

                        <span>Incident</span><br>
                        <input id="incident" type="email" placeholder="Example: Murder, Non Negligent Manslaughter" /><br>

                        <span>Police Grid</span><br>
                        <input id="police_grid" type="email" placeholder="Example: 87" /><br>

                        <span>Neighborhood Number</span><br>
                        <input id="neighborhood_number" type="email" placeholder="Example: 7" 
                        /><br>

                        <span>Block</span><br>
                        <input id="block" type="email" placeholder="Example: THOMAS AV & VICTORIA" /><br>

                        <button id="lookup" class="cell small-3 button" type="button" @click="newIncident">Submit</button>
                    </form>
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



</style>
