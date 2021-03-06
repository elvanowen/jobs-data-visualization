var major = "";
var jsonData = {};

var updateDescription = function () {
  $("#major-title").html(major);
  $("#description-major").html(jsonData.description);
};

var formatMoney = function (num) {
  return "Rp " + num.toFixed(2).replace(/./g, function(c, i, a) {
      return i && c !== "." && ((a.length - i) % 3 === 0) ? '.' + c : c;
    });
};

var formatNumber = function (num) {
  return num.toFixed(0).replace(/./g, function(c, i, a) {
    return i && c !== "." && ((a.length - i) % 3 === 0) ? '.' + c : c;
  });
};

var updateSummaryCard = function () {
  d3.json("data-salary.json", function (err, root) {
    if (err) throw err;
    
    var salaryData = root.averageAnnualSalaries["2016"];
    salaryData = _.sortBy(salaryData, 'salary').reverse();
    _.each(salaryData, function (data, index) {
      if (data.major === major) {
        $("#salary-amount").html(formatMoney(data.salary));
        $("#salary-rank").html(index + 1);
      }
    });
    
    var costData = root.averageCost["2016"];
    costData = _.sortBy(costData, "cost").reverse();
    _.each(costData, function (data, index){
      if (data.major === major) {
        $("#cost-amount").html(formatMoney(data.cost));
        $("#cost-rank").html(index + 1);
      }
    });
  
    var passionData = root.passions["2016"];
    passionData = _.sortBy(passionData, "total").reverse();
    _.each(passionData, function (data, index){
      if (data.major === major) {
        $("#passion-amount").html(formatNumber(data.total));
        $("#passion-rank").html(index + 1);
      }
    });
    
    console.log(salaryData);
  });
};

var drawJobChart = function (selectedYear) {
  d3.select("#job-chart").html("");
  
  var svg = d3.select("#job-chart"),
    margin = {top: 20, right: 100, bottom: 30, left: 100},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  var jobData = jsonData.jobs;
  
  var x = d3.scaleLinear().range([0, width]);
  var y = d3.scaleLinear().range([height, 0]);
  var color = d3.scaleOrdinal(d3.schemeCategory10);
  
  x.domain([0, d3.max(jobData, function (d) { return _.find(d.employee, { year: selectedYear }).total })]);
  y.domain([0, d3.max(jobData, function (d) { return _.find(d.salary, { year: selectedYear }).total })]);
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
  
  g.append("path")
    .attr("d", "M 0 " + height + " L " + width + " " + height)
    .attr("stroke", "#000");
  
  g.selectAll("circle")
    .data(jobData)
    .enter().append("circle")
      .attr("cx", function (d) { return x(_.find(d.employee, { year: selectedYear }).total); })
      .attr("cy", function (d) { return y(_.find(d.salary, { year: selectedYear }).total); })
      .attr("r", function (d) { return (_.find(d.workload, { year: selectedYear }).total); })
      .attr("fill", function (d) { return color(d.name) })
      .append("svg:title")
        .text(function (d) {
          return d.name + "\nGaji: " + formatMoney(_.find(d.salary, { year: selectedYear }).total) + "\nJumlah Lowongan Kerja: " + formatNumber(_.find(d.employee, { year: selectedYear }).total);
        });
  
  g.selectAll("text.job")
    .data(jobData)
    .enter().append("text")
      .attr("transform", function (d) {
        return "translate(" + (x(_.find(d.employee, { year: selectedYear }).total) + 12) + ", " + y(_.find(d.salary, { year: selectedYear }).total) + (_.find(d.workload, { year: selectedYear }).total) + ")";
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
  var bottomMargin = 50;
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
  
  gMale.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0, " + graphHeight + ")")
    .call(d3.axisBottom(x).ticks(4));
  
  var xFemale = d3.scaleLinear().range([graphWidth, 0]);
  xFemale.domain([0, d3.max(maleData, function (d) { return d.total })]);
  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0, " + graphHeight + ")")
    .call(d3.axisBottom(xFemale).ticks(4));
  
  g.append("path")
    .attr("d", "M 0 " + graphHeight + " L " + (2 * (graphWidth + centerMargin)) + " " + graphHeight)
    .attr("stroke", "#000");
  
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
    .attr("cy", 30)
    .attr("r", 5)
    .attr("fill", "#d9534f");
  gLegend.append("text")
    .attr("transform", "translate(60, 35)")
    .text("Wanita");
  
  gLegend.append("circle")
    .attr("cx", 220)
    .attr("cy", 30)
    .attr("r", 5)
    .attr("fill", "steelblue");
  gLegend.append("text")
    .attr("transform", "translate(230, 35)")
    .text("Pria");
};

var drawWordCloud = function () {
  var jobData = jsonData.opinion;
  
  // var color = d3.scaleOrdinal(d3.schemeCategory20);
  
  // var x = d3.scaleLinear().range([0, 30]);
  // x.domain([0, d3.max(jobData, function (d) { return d.total; })]);
  
  // var draw = function () {
  //   var svg = d3.select("#word-cloud")
  //     .append("g")
  //     .attr("transform", "translate(-50, -10)")
  //     .selectAll("text")
  //     .data(jobData)
  //     .enter().append("text")
  //     .style("font-size", function(d) { return x(d.size) + "px"; })
  //     .style("fill", function(d, i) { return color(i); })
  //     .attr("transform", function(d) {
  //       return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
  //     })
  //     .text(function(d) {
  //       console.log(d.name);
  //       return d.name; });
  // };
  
  // d3.layout.cloud().size([320, 250])
  //   .words(jobData)
  //   .rotate(0)
  //   .fontSize(function(d) { return d.total; })
  //   .on("end", draw)
  //   .start();

  $('#word-cloud').jQCloud(jobData, {
    autoResize: true,
    fontSize: {
      from: 0.8,
      to: 0.5
    }
  });
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
    // drawJobChart();
    drawGenderChart();
    drawWordCloud();
    updateDescription();
    fillUniversityTable();
    fillDescriptionMajor();
    updateSummaryCard();
  });
});

function qs(key) {
  key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
  var match = location.search.match(new RegExp("[?&]"+key+"=([^&]+)(&|$)"));
  return match && decodeURIComponent(match[1].replace(/\+/g, " "));
};

$(document).ready(function() {

  $('.dropdown-filter-year-job-chart').dropdown({
    onChange: function(value, text, $selectedItem) {
      var selectedYear = $('.dropdown-filter-year-job-chart').dropdown('get value');

      if (selectedYear) drawJobChart(Number(selectedYear));
    }
  });

  setTimeout(function() {
    $('.dropdown-filter-year-job-chart').dropdown('set selected', '2016');
  }, 0)

})