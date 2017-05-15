var major = "";
var jsonData = {};

var drawJobChart = function () {
  d3.select("#job-chart").html("");
  
  var svg = d3.select("#job-chart"),
    margin = {top: 20, right: 80, bottom: 30, left: 80},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  var jobData = jsonData.jobs;
  
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);
  var color = d3.scaleOrdinal(d3.schemeCategory10);
  
  x.domain([0, d3.max(jobData, function (d) { return d.employee })]);
  y.domain([0, d3.max(jobData, function (d) { return d.salary })]);
  color.domain(jobData, function (d) { return d.name });
  
  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
  
  g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "0.71em")
    .attr("fill", "#000")
    .text("Pendapatan");
  
  g.selectAll("circle")
    .data(jobData)
    .enter().append("circle")
      .attr("cx", function (d) { return x(d.employee); })
      .attr("cy", function (d) { return y(d.salary) })
      .attr("r", 10)
      .attr("fill", function (d) { return color(d.name) });
  
  g.selectAll("text.job")
    .data(jobData)
    .enter().append("text")
      .attr("transform", function (d) {
        return "translate(" + (x(d.employee) + 12) + ", " + y(d.salary) + ")";
      })
      .attr("dy", "0.35em")
      .style("font", "11px sans-serif")
      .text(function (d) { return d.name });
};

var drawGenderChart = function () {
  d3.select("#gender-chart").html("");
  
  var svg = d3.select("#gender-chart");
  var sideMargin = 10;
  var topMargin = 15;
  var bottomMargin = 40;
  var centerMargin = 20;
  var graphWidth = (svg.attr("width") / 2) - sideMargin - centerMargin;
  var graphHeight = svg.attr("height") - topMargin - bottomMargin;
  
  console.log(graphWidth);
  
  var maleData, femaleData;
  _.each(jsonData.gender, function (genderData) {
    _.each(genderData, function (val, key) {
      if (key === "male") {
        maleData = val;
      } else if (key === "female") {
        femaleData = val;
      }
    });
  });
  
  var g = svg.append("g").attr("transform", "translate(" + sideMargin + "," + topMargin + ")");
  
  var x = d3.scaleLinear().range([0, graphWidth]);
  var y = d3.scaleBand().rangeRound([0, graphHeight]).padding(0.2);
  
  x.domain([0, d3.max(maleData, function (d) { return d.total })]);
  y.domain(maleData.map(function (d) { return d.year; }));
  
  g.selectAll("text.year")
    .data(maleData)
    .enter().append("text")
      .attr("transform", function (d) {
        return "translate(" + (graphWidth + centerMargin) + ", " + y(d.year) + ")";
      })
      .attr("text-anchor", "middle")
      .attr("dy", "1.3em")
      .text(function (d) { return d.year; });
  
  var gMale = g.append("g").attr("transform", "translate(" + (graphWidth + 2 * centerMargin) + ", 0)");
  
  gMale.selectAll("rect.male")
    .data(maleData)
    .enter().append("rect")
      .attr("transform", function (d) {
        return "translate(" + 0 + ", " + y(d.year) + ")";
      })
      .attr("height", function () { return y.bandwidth() })
      .attr("width", function (d) { return x(d.total) })
      .style("fill", "steelblue");
  
  g.selectAll("rect.female")
    .data(femaleData)
    .enter().append("rect")
      .attr("transform", function (d) {
        return "translate(" + (graphWidth - x(d.total)) + ", " + y(d.year) + ")";
      })
      .attr("height", function () { return y.bandwidth(); })
      .attr("width", function (d) { return x(d.total); })
      .style("fill", "#d9534f");
  
  var gLegend = g.append("g").attr("transform", "translate(0, " + graphHeight + ")");
  gLegend.append("circle")
    .attr("cx", 50)
    .attr("cy", 20)
    .attr("r", 5)
    .attr("fill", "#d9534f");
  gLegend.append("text")
    .attr("transform", "translate(60, 25)")
    .text("Wanita");
  
  gLegend.append("circle")
    .attr("cx", 220)
    .attr("cy", 20)
    .attr("r", 5)
    .attr("fill", "steelblue");
  gLegend.append("text")
    .attr("transform", "translate(230, 25)")
    .text("Pria");
};

var fillUniversityTable = function () {
  $("#university-table").html("");
  
  var tableRoot = d3.select("#university-table");
  
  var universityData = jsonData.university;
  
  var tr = tableRoot.selectAll("tr.univ")
    .data(universityData)
    .enter().append("tr");
  
  tr.append("td").html(function (d) { return d.name; });
  tr.append("td").html(function (d) { return d.location; });
  tr.append("td").html(function (d) { return d.kuota; });
  tr.append("td").html(function (d) { return d.graduate; });
};

var fillDescriptionMajor = function () {
  var description = jsonData.description;
  $("#description-major").html(description);
}

$(document).ready(function () {
  major = qs('major');
  
  d3.json("major.json", function (err, root) {
    if (err) throw err;
    
    _.each(root.major, function (majorObj) {
      _.each(majorObj, function (val, key) {
        if (key === major) {
          jsonData = val;
        }
      });
    });
    
    $(".major-title").html(major);
    drawJobChart();
    drawGenderChart();
    fillUniversityTable();
    fillDescriptionMajor();
  });
});

function qs(key) {
  key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
  var match = location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
  return match && decodeURIComponent(match[1].replace(/\+/g, " "));
};

