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
  svg.append("text").attr("x",50).attr("y",50).text("Scene 1 under construction. Check again later.");
}

function drawScene2(svg, data) {
  svg.append("text").attr("x",50).attr("y",50).text("Scene 2 under construction. Check again later.");
}

function drawScene3(svg, data) {
  svg.append("text").attr("x",50).attr("y",50).text("Scene 3 under construction. Check again later.");
}
