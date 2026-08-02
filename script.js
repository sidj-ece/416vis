let currentScene = 1;
let globalData = [];

d3.csv("covid-vaccination-doses-per-capita.csv")
  .then(function(data) {
    globalData = data;
    globalData.forEach(d => {
      d.doses_per_hundred = +d["Cumulative COVID-19 vaccinations per 100 people"] || 0;
      d.date = new Date(d["Day"]);
      d.entity = d["Entity"];
    });
    updateVisualization();
  }).catch(function(error) {
    console.log("Error loading CSV file: ", error);
  });

function changeScene(sceneNumber) {
  currentScene = sceneNumber;
  updateVisualization();
}

function updateVisualization() {
  const svg = d3.select("svg");
  svg.html("");

  switch (currentScene) {
    case 1: drawScene1(svg, globalData); break;
    case 2: drawScene2(svg, globalData); break;
    case 3: drawScene3(svg, globalData); break;
    default: svg.append("text").attr("x",50).attr("y",50).text("How did we get here?");
  }
}

function drawScene1(svg, data) {
  d3.select("#scene-description").text("Vaccine rollouts began slowly in early 2021. Global data shown.");
  const filteredData = data.filter(d => d.entity === "World" && d.date >= new Date("2021-01-01") && d.date <= new Date("2021-06-30"));

  const margin = {top: 50, right: 50, bottom: 50, left: 50};
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime().domain(d3.extent(filteredData, d => d.date)).range([0, width]);
  const y = d3.scaleLinear().domain([0, d3.max(filteredData, d => d.doses_per_hundred) || 100]).range([height, 0]);

  g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
  g.append("g").call(d3.axisLeft(y));
  g.append("text").attr("transform", "rotate(-90)").attr("y", -45).attr("x", -height / 2)
     .attr("text-anchor", "middle").style("font-size", "12px").text("Doses per 100 People");

  const line = d3.line().x(d => x(d.date)).y(d => y(d.doses_per_hundred));
  g.append("path").datum(filteredData).attr("fill","none").attr("stroke","steelblue").attr("stroke-width",3).attr("d",line);

  const annotationData = [{
    note: {
      title: "Halfway point",
      label: "Average of doses-per-hundred value @ 2021-01-01 and 2026-06-30."
    },
    x: x(new Date("2021-05-18")),
    y: y(19.735668),
    dx: -70,
    dy: -30,
    subject: {
      radius: 4,
      radiusPadding: 2
    }
  }];

  const makeAnnotations = d3.annotation().type(d3.annotationCalloutCircle).annotations(annotationData);
  g.append("g").attr("class","annotation-group").call(makeAnnotations);
}

function drawScene2(svg, data) {
  d3.select("#scene-description").text("High-income countries were also highly-vaccinated, while low-income countries struggled to properly protect their citizens. Shown is data for high-income countries, upper-middle-income countries, lower-middle-income countries, and low-income countries.");
  const targets = [
    "High-income countries",
    "Low-income countries",
    "Lower-middle-income countries",
    "Upper-middle-income countries"
  ];
  const filteredData = data.filter(d => targets.includes(d.entity) && d.date >= new Date("2021-01-01") && d.date <= new Date("2024-06-30"));

  const margin = {top: 50, right: 50, bottom: 50, left: 50};
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime().domain(d3.extent(filteredData, d => d.date)).range([0, width]);
  const y = d3.scaleLinear().domain([0, d3.max(filteredData, d => d.doses_per_hundred) || 300]).range([height, 0]);
  const color = d3.scaleOrdinal().domain(targets).range(["#56B4E9","#0072B2","#E69F00","#CC79A7"]);

  g.append("g").attr("transform",`translate(0,${height})`).call(d3.axisBottom(x));
  g.append("g").call(d3.axisLeft(y));
  g.append("text").attr("transform", "rotate(-90)").attr("y", -45).attr("x", -height / 2)
     .attr("text-anchor", "middle").style("font-size", "12px").text("Doses per 100 People");

  const nestedData = d3.group(filteredData, d => d.entity);
  const line = d3.line().x(d => x(d.date)).y(d => y(d.doses_per_hundred));
  
  const countryGroup = g.selectAll(".line-group")
                          .data(nestedData)
                          .enter().append("g")
                          .attr("class", "line-group");

    countryGroup.append("path")
                .attr("fill", "none")
                .attr("stroke", d => color(d[0]))
                .attr("stroke-width", 2.5)
                .attr("d", d => line(d[1]));

  g.append("line")
     .attr("x1", 0)
     .attr("x2", width)
     .attr("y1", y(100))
     .attr("y2", y(100))
     .attr("stroke", "#999")
     .attr("stroke-dasharray", "4,4")
     .attr("stroke-width", 1.5);

    g.append("text")
     .attr("x", width - 5)
     .attr("y", y(100) - 5)
     .attr("text-anchor", "end")
     .style("font-size", "10px")
     .style("fill", "#666")
     .text("100 Doses per 100 People Threshold");

  const highIncomeData = nestedData.get("High-income countries") || [];
    const crossed100 = highIncomeData.find(d => d.doses_per_hundred >= 100);

    if (crossed100) {
        const annotationData = [
          {
            note: {
              title: "High-Income Milestone",
              label: `Reached 100 doses/ 100 people on ${crossed100.date.toISOString().split('T')[0]}`,
            },
            x: x(crossed100.date),
            y: y(crossed100.doses_per_hundred),
            dx: 0,
            dy: -100,
            subject: { radius: 4, radiusPadding: 2 }
          },
          {
            note: {
              title: "Low-Income Failure",
              label: "Low-income countries, as a whole, never broke 100 doses per 100 people."
            },
            x: x(new Date("2024-06-30")),
            y: y(45.8065),
            dx: -100,
            dy: -20,
            subject: { radius: 4, radiusPadding: 2 }
          }
        ];

        const makeAnnotations = d3.annotation()
          .type(d3.annotationCalloutCircle)
          .annotations(annotationData);

        g.append("g")
         .attr("class", "annotation-group")
         .call(makeAnnotations);
    }
}

function drawScene3(svg, data) {
  d3.select("#scene-description").text("Now you can explore freely and see the trends across countries for yourself.");
  d3.select("#scene3-controls").style("display", "block");
  
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime().domain([new Date("2021-01-01"),new Date("2024-06-30")]).range([0, width]);
  const y = d3.scaleLinear().domain([0, 420]).range([height, 0]);

  g.append("g").attr("transform",`translate(0,${height})`).call(d3.axisBottom(x));
  g.append("g").call(d3.axisLeft(y));
  g.append("text").attr("transform", "rotate(-90)").attr("y", -45).attr("x", -height / 2)
     .attr("text-anchor", "middle").style("font-size", "12px").text("Doses per 100 People");

  const worldData = data.filter(d => d.entity === "World" && d.date >= new Date("2021-01-01") && d.date <= new Date("2024-06-30"));
  const line = d3.line().x(d => x(d.date)).y(d => y(d.doses_per_hundred));
  
  g.append("path")
     .datum(worldData)
     .attr("fill", "none")
     .attr("stroke", "#aaaaaa")
     .attr("stroke-width", 2)
     .attr("stroke-dasharray", "4,4")
     .attr("d", line);

  g.append("text")
     .attr("x", width + 5)
     .attr("y", y(worldData[worldData.length - 1]?.doses_per_hundred || 150))
     .attr("alignment-baseline", "middle")
     .style("font-size", "11px")
     .style("fill", "#888")
     .text("Global Average");

  window.scene3Context = { g, data, x, y, line, width };
  plotUserCountry("United States");
}

function handleCountrySearch() {
    const inputVal = document.getElementById("country-input").value.trim();
    if (inputVal) {
        plotUserCountry(inputVal);
    }
}

function plotUserCountry(countryName) {
    const { g, data, x, y, line, width } = window.scene3Context;
    const errorMsg = document.getElementById("error-msg");
    errorMsg.innerText = "";

    // Find matches case-insensitively in the dataset
    const countryData = data.filter(d => d.entity.toLowerCase() === countryName.toLowerCase());

    if (countryData.length === 0) {
        errorMsg.innerText = `Country "${countryName}" not found. Try again.`;
        return;
    }

    g.selectAll(".user-country-path").remove();
    g.selectAll(".user-country-label").remove();

    g.append("path")
     .datum(countryData)
     .attr("class", "user-country-path")
     .attr("fill", "none")
     .attr("stroke", "#1f77b4")
     .attr("stroke-width", 3)
     .attr("d", line);

    const latestPoint = countryData[countryData.length - 1];
    g.append("text")
     .attr("class", "user-country-label")
     .attr("x", width + 5)
     .attr("y", y(latestPoint.doses_per_hundred))
     .attr("alignment-baseline", "middle")
     .style("font-size", "12px")
     .style("font-weight", "bold")
     .style("fill", "#1f77b4")
     .text(latestPoint.entity);
}
