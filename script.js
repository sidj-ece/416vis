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
  d3.select("#scene-description").text("Vaccine rollouts began slowly in early 2021.");
  const filteredData = data.filter(d => d.entity === "World" && d.date >= new Date("2021-01-01") && d.date <= new Date("2021-06-30"));

  const margin = {top: 10, right: 10, bottom: 10, left: 10};
  const width = +svg.attr("width") - margin.left - margin.right;
  const height = +svg.attr("height") - margin.top - margin.bottom;
  const g = svg.append("g").attr("transform", "translate(${margin.left},${margin.top})");
  console.log("Height: ", height);
  console.log("Width: ", width);

  const x = d3.scaleTime().domain(d3.extent(filteredData, d => d.date)).range([0, width]);
  const y = d3.scaleLinear().domain([0, d3.max(filteredData, d => d.doses_per_hundred) || 100]).range([height, 0]);

  g.append("g").call(d3.axisBottom(x));
  g.append("g").call(d3.axisLeft(y));

  const line = d3.line().x(d => x(d.date)).y(d => y(d.doses_per_hundred));
  g.append("path").datum(filteredData).attr("fill","none").attr("stroke","steelblue").attr("stroke-width",3).attr("d",line);
}

function drawScene2(svg, data) {
  svg.append("text").attr("x",50).attr("y",50).text("Scene 2 under construction. Check again later.");
}

function drawScene3(svg, data) {
  svg.append("text").attr("x",50).attr("y",50).text("Scene 3 under construction. Check again later.");
}
