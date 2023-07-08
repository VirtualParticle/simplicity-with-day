const CLEAR_DAY = 0;
const CLEAR_NIGHT = 1;
const WINDY = 2;
const COLD = 3;
const PARTLY_CLOUDY_DAY = 4;
const PARTLY_CLOUDY_NIGHT = 5;
const HAZE = 6;
const CLOUD = 7;
const RAIN = 8;
const SNOW = 9;
const HAIL = 10;
const CLOUDY = 11;
const STORM = 12;
const NA = 13;

const imageId = {
    0: STORM, //tornado
    1: STORM, //tropical storm
    2: STORM, //hurricane
    3: STORM, //severe thunderstorms
    4: STORM, //thunderstorms
    5: HAIL, //mixed rain and snow
    6: HAIL, //mixed rain and sleet
    7: HAIL, //mixed snow and sleet
    8: HAIL, //freezing drizzle
    9: RAIN, //drizzle
    10: HAIL, //freezing rain
    11: RAIN, //showers
    12: RAIN, //showers
    13: SNOW, //snow flurries
    14: SNOW, //light snow showers
    15: SNOW, //blowing snow
    16: SNOW, //snow
    17: HAIL, //hail
    18: HAIL, //sleet
    19: HAZE, //dust
    20: HAZE, //foggy
    21: HAZE, //haze
    22: HAZE, //smoky
    23: WINDY, //blustery
    24: WINDY, //windy
    25: COLD, //cold
    26: CLOUDY, //cloudy
    27: CLOUDY, //mostly cloudy (night)
    28: CLOUDY, //mostly cloudy (day)
    29: PARTLY_CLOUDY_NIGHT, //partly cloudy (night)
    30: PARTLY_CLOUDY_DAY, //partly cloudy (day)
    31: CLEAR_NIGHT, //clear (night)
    32: CLEAR_DAY, //sunny
    33: CLEAR_NIGHT, //fair (night)
    34: CLEAR_DAY, //fair (day)
    35: HAIL, //mixed rain and hail
    36: CLEAR_DAY, //hot
    37: STORM, //isolated thunderstorms
    38: STORM, //scattered thunderstorms
    39: STORM, //scattered thunderstorms
    40: STORM, //scattered showers
    41: SNOW, //heavy snow
    42: SNOW, //scattered snow showers
    43: SNOW, //heavy snow
    44: CLOUD, //partly cloudy
    45: STORM, //thundershowers
    46: SNOW, //snow showers
    47: STORM, //isolated thundershowers
    3200: NA, //not available
};

const imageMapping = {

    day: {
        skc: CLEAR_DAY,
        few: PARTLY_CLOUDY_DAY,
        sct: PARTLY_CLOUDY_DAY,
        bkn: CLOUDY,
        ovc: CLOUDY,
        wind_skc: CLEAR_DAY,
        wind_few: PARTLY_CLOUDY_DAY,
        wind_sct: PARTLY_CLOUDY_DAY,
        wind_bkn: CLOUDY,
        wind_ovc: CLOUDY,
        snow: SNOW,
        rain_snow: HAIL,
        rain_sleet: HAIL,
        snow_sleet: SNOW,
        fzra: HAIL,
        rain_fzra: HAIL,
        snow_fzra: SNOW,
        sleet: HAIL,
        rain: RAIN,
        rain_showers: RAIN,
        rain_showers_hi: RAIN,
        tsra: STORM,
        tsra_sct: STORM,
        tsra_hi: STORM,
        tornado: WINDY,
        hurricane: STORM,
        tropical_storm: STORM,
        dust: HAZE,
        smoke: HAZE,
        haze: HAZE,
        hot: CLEAR_DAY,
        cold: COLD,
        blizzard: SNOW,
        fog: HAZE
    },

    night: {
        skc: CLEAR_NIGHT,
        few: PARTLY_CLOUDY_NIGHT,
        sct: PARTLY_CLOUDY_NIGHT,
        bkn: CLOUDY,
        ovc: CLOUDY,
        wind_skc: CLEAR_NIGHT,
        wind_few: PARTLY_CLOUDY_NIGHT,
        wind_sct: PARTLY_CLOUDY_NIGHT,
        wind_bkn: CLOUDY,
        wind_ovc: CLOUDY,
        snow: SNOW,
        rain_snow: HAIL,
        rain_sleet: HAIL,
        snow_sleet: SNOW,
        fzra: HAIL,
        rain_fzra: HAIL,
        snow_fzra: SNOW,
        sleet: HAIL,
        rain: RAIN,
        rain_showers: RAIN,
        rain_showers_hi: RAIN,
        tsra: STORM,
        tsra_sct: STORM,
        tsra_hi: STORM,
        tornado: WINDY,
        hurricane: STORM,
        tropical_storm: STORM,
        dust: HAZE,
        smoke: HAZE,
        haze: HAZE,
        hot: CLEAR_DAY,
        cold: COLD,
        blizzard: SNOW,
        fog: HAZE
    }

};

//console.log('read options: ' + JSON.stringify(options));
var options = JSON.parse(localStorage.getItem('options')) || {
    "use_gps": "true",
    "location": "",
    "units": "fahrenheit",
    "invert_color": "false"
};

function getWeatherFromLatLong(latitude, longitude) {

    const req = new XMLHttpRequest();

    const url = "https://api.weather.gov/points/" + latitude + "%2C" + longitude + "/stations";

    req.onload = function (e) {

        if (req.readyState === 4) {
            if (req.status === 200) {
                const response = JSON.parse(req.responseText);
                if (response) {
                    getWeatherFromStationUrl(response.observationStations[0])
                }
            } else {
                test("LatLong");
                console.log("Error LatLong");
            }
        } else {
            test("LtLgSt");
        }
    };

    req.open("GET", url);
    req.send(null);


}

function test(temp) {
    Pebble.sendAppMessage({
        "icon": 7,
        "temperature": temp
    });
}

function getWeatherFromStationUrl(url) {

    const celsius = options["units"] === "celsius";

    const weatherUrl = url + "/observations/latest";
    const req = new XMLHttpRequest();

    req.onload = function (e) {

        if (req.readyState === 4) {
            if (req.status === 200) {
                const response = JSON.parse(req.responseText);
                if (response) {

                    var tempValue = response.properties.temperature.value;
                    const tempUnitCode = response.properties.temperature.unitCode.split("wmoUnit:")[1];
                    if (tempUnitCode === "degC" && !celsius) {
                        tempValue *= 1.8;
                        tempValue += 32;
                    } else if (tempUnitCode === "degF" && celsius) {
                        tempValue -= 32;
                        tempValue /= 1.8;
                    }

                    const iconInfo = response.properties.icon.split("/");
                    const icons = imageMapping[iconInfo[5]]; // Gets the correct icon set, either "day" or "night"
                    const iconName = iconInfo[6].split("?")[0]; // Gets the icon name. The '?' is to get rid of the PHP image size part e.g. "?size=medium"
                    const icon = icons[iconName];

                    Pebble.sendAppMessage({
                        "icon": icon,
                        "temperature": Math.round(tempValue) + (celsius ? "\u00B0C" : "\u00B0F"),
                        "invert_color": (options["invert_color"] === "true" ? 1 : 0)
                    });

                }
            } else {
                test("station");
                console.log("Error StationUrl");
            }
        }

    };

    req.open("GET", weatherUrl);
    req.send(null);

}

function getWeatherFromLocation(location_name) {

    const query = encodeURI("select woeid from geo.places(1) where text=\"" + location_name + "\"");
    const url = "http://query.yahooapis.com/v1/public/yql?q=" + query + "&format=json";
    const req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = function (e) {
        if (req.readyState === 4) {
            if (req.status === 200) {
                // console.log(req.responseText);
                const response = JSON.parse(req.responseText);
                if (response) {
                    const woeid = response.query.results.place.woeid;
                    getWeatherFromWoeid(woeid);
                }
            } else {
                console.log("Error Location");
            }
        }
    }
    req.send(null);
}

function getWeatherFromWoeid(woeid) {
    const celsius = options['units'] === 'celsius';
    const query = encodeURI("select item.condition from weather.forecast where woeid = " + woeid +
        " and u = " + (celsius ? "\"c\"" : "\"f\""));
    const url = "http://query.yahooapis.com/v1/public/yql?q=" + query + "&format=json";

    const req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = function (e) {
        if (req.readyState === 4) {
            if (req.status === 200) {
                const response = JSON.parse(req.responseText);
                if (response) {
                    const condition = response.query.results.channel.item.condition;
                    const temperature = condition.temp + (celsius ? "\u00B0C" : "\u00B0F");
                    const icon = imageId[condition.code];
                    // console.log("temp " + temperature);
                    // console.log("icon " + icon);
                    // console.log("condition " + condition.text);
                    Pebble.sendAppMessage({
                        "icon": icon,
                        "temperature": temperature,
                        "invert_color": (options["invert_color"] === "true" ? 1 : 0),
                    });
                }
            } else {
                console.log("Error WOEID");
            }
        }
    }
    req.send(null);
}

function updateWeather() {
    if (options['use_gps'] === "true") {
        window.navigator.geolocation.getCurrentPosition(locationSuccess,
            locationError,
            locationOptions);
    } else {
        getWeatherFromLocation(options["location"]);
    }
}

const locationOptions = {
    "timeout": 15000,
    "maximumAge": 60000,
    "enableHighAccuracy": false,
};

function locationSuccess(pos) {
    const coordinates = pos.coords;
    getWeatherFromLatLong(coordinates.latitude, coordinates.longitude);
}

function locationError(err) {
    console.warn('location error (' + err.code + '): ' + err.message);
    Pebble.sendAppMessage({
        "icon": 13,
        "temperature": "e:" + err.code
    });
}

Pebble.addEventListener('showConfiguration', function (e) {
    const uri = 'http://tallerthenyou.github.io/simplicity-with-day/configuration.html?' +
        'use_gps=' + encodeURIComponent(options['use_gps']) +
        '&location=' + encodeURIComponent(options['location']) +
        '&units=' + encodeURIComponent(options['units']) +
        '&invert_color=' + encodeURIComponent(options['invert_color']);
    //console.log('showing configuration at uri: ' + uri);

    Pebble.openURL(uri);
});

Pebble.addEventListener('webviewclosed', function (e) {
    if (e.response) {
        options = JSON.parse(decodeURIComponent(e.response));
        localStorage.setItem('options', JSON.stringify(options));
        //console.log('storing options: ' + JSON.stringify(options));
        updateWeather();
    } else {
        console.log('no options received');
    }
});

Pebble.addEventListener("ready", function (e) {
    //console.log("connect!" + e.ready);
    updateWeather();
    setInterval(function () {
        //console.log("timer fired");
        updateWeather();
    }, 1800000); // 30 minutes
    console.log(e.type);
});
