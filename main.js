let svg = d3
    .select(".container")
    .append("svg");

let countries;
let countriesData;
d3.csv("./racing-covid-graph/data.csv").then((d) => {
    cleanData(d);
});

function cleanData(data) {
    let continents = [
        "Asia",
        "Australia",
        "North America",
        "South America",
        "Antartica",
        "Africa",
        "Europe",
        "World",
        "High income",
        "European Union",
        "Upper middle income",
        "Lower middle income",
        "International",
    ];
    let tempCountries = [];
    data.map((item) => {
        let found = false;
        for (let i = 0; i < tempCountries.length; i++) {
            if (tempCountries[i] == item.location) {
                found = true;
                break;
            }
        }

        for (let i = 0; i < continents.length; i++) {
            if (continents[i] == item.location) {
                found = true;
                break;
            }
        }

        if (!found) tempCountries.push(item.location);
    });

    let finalData = [];
    for (let i = 0; i < tempCountries.length; i++) {
        let countryArray = [];
        for (let j = 0; j < data.length && countryArray.length <= 600; j++) {
            if (tempCountries[i] == data[j].location) {
                countryArray.push(parseInt(data[j].total_cases, 10));
            }
        }
        finalData.push(countryArray);
    }
    countries = tempCountries;
    countriesData = finalData;
};

function render(d, max) {
    d.sort((a, b) => {
        return b.value - a.value;
    });
    let x_scale = d3
        .scaleLinear()
        .domain([0, max])
        .range([0, window.innerWidth]);

    let y_scale = d3
        .scaleBand()
        .domain(d.map((d, i) => i))
        .range([0, 10000])
        .paddingInner(0.05);

    let color_scale = d3
        .scaleOrdinal(d3["schemeSet3"])
        .domain(d.map((item) => item.name));
    // DATA BINDING    
    let rects = svg.selectAll("rect").data(d, (d, i) => d.name);
    // EXIT SELECTION
    rects.exit().remove();
    // UPDATE SELECTION
    rects
        .attr("x", 0)
        .attr("height", y_scale.bandwidth())
        .attr("fill", function (d, i) {
            return color_scale(d.name);
        })
        .transition()
        .duration(250)
        .attr("width", function (d, i) {
            return x_scale(d.value);
        })
        .attr("y", function (d, i) {
            return y_scale(i);
        });
    // ENTER SELECTION
    rects
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("height", y_scale.bandwidth())
        .attr("fill", function (d, i) {
            return color_scale(d.name);
        })
        .transition()
        .duration(250)
        .attr("width", function (d, i) {
            return x_scale(d.value);
        })
        .attr("y", function (d, i) {
            return y_scale(i);
        });

    let texts = svg.selectAll("text").data(d, (d, i) => d.name);
    texts
        .attr("x", 0)
        .transition()
        .duration(250)
        .attr("y", function (d, i) {
            return y_scale(i) + y_scale.bandwidth() / 2;
        })
        .text((d, i) => `${d.name} 🦠 cases : ${Math.round(d.value)}`);

    texts
        .enter()
        .append("text")
        .attr("x", 0)
        .style("font-family", "Times New Roman")
        .style("font-weight", 600)
        .attr("y", function (d, i) {
            return y_scale(i) + y_scale.bandwidth() / 2;
        })
        .text((d, i) => `${d.name} 🦠 cases : ${Math.round(d.value)}`);
};

let idx = 0;
setInterval(() => {
    if (!countries && !countriesData) return;
    let data = [];
    for (let i = 0; i < countries.length; i++) {
        if (!countriesData[i][idx] || countriesData[i][idx].isNaN) continue;
        data.push({
            name: countries[i],
            value: countriesData[i][idx],
            color: ""
        });
    }
    idx++;
    let max = -1;
    for (let i = 0; i < data.length; i++) {
        if (max < data[i].value) max = data[i].value;
    }
    render(data, max);
}, 500);
