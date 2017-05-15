var majorActive = {};
var majorActiveArray = [];

var MAJOR_LIST = [
  "komputer",
  "bisnis",
  "kedokteran",
  "psikologi",
  "ekonomi",
  "seni",
  "fisika",
  "astronomi",
  "elektrik",
  "matematika",
  "geografi",
  "farmasi",
  "biologi",
  "arsitek",
  "sipil",
  "mesin",
  "pertambangan",
  "metalurgi",
  "penerbangan",
  "geologi",
  "pertanian"
];

var capitalizeFirstLetter = function (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

var formatMoney = function (num) {
  return "Rp " + num.toFixed(2).replace(/./g, function(c, i, a) {
    return i && c !== "." && ((a.length - i) % 3 === 0) ? '.' + c : c;
  });
};

var drawSalaryChart = function () {
  d3.select("#salary-chart").html("");
  d3.select("#color-legend").html("");

  var svg = d3.select("#salary-chart"),
    margin = {top: 30, right: 20, bottom: 30, left: 60},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var parseTime = d3.timeParse("%Y");

  var x = d3.scaleTime().rangeRound([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

  var line = d3.line()
    .x(function (d) {
      return x(parseTime(d.year));
    })
    .y(function (d) {
      return y(d.value);
    });

  d3.json("data-salary.json", function (err, root) {
    if (err) throw err;

    console.log(root);
    var data = _.map(majorActiveArray, function (major) {
      major = capitalizeFirstLetter(major);
      var ret = {};
      ret.id = major;
      ret.salaries = _.map(root.averageAnnualSalaries, function (val, key) {
        var obj = {};
        obj.year = key;
        for (var i = 0; i < val.length; i++) {
          if (val[i].major === major) {
            obj.value = val[i].salary;
          }
        }

        return obj;
      });

      return ret;
    });

    console.log(data);
    x.domain([parseTime("2011"), parseTime("2016")]);

    y.domain([
      d3.min(data, function (c) {
        return d3.min(c.salaries, function (d) {
          return d.value;
        });
      }),
      Math.max(20000000, d3.max(data, function (c) {
        return d3.max(c.salaries, function (d) {
          return d.value;
        });
      }))
    ]);

    z.domain(data.map(function (c) {
      return c.id;
    }));

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y)
        .tickValues([5000000, 10000000, 15000000, 20000000]))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Pendapatan");
  
    var dashPoint = [5000000, 10000000, 15000000, 20000000];
    var dashLine = g.selectAll(".dash")
      .data(dashPoint)
      .enter().append("g")
        .attr("transform", function(d) {return "translate(0, " + y(d) + ")";})
        .append("path")
        .attr("d", "M 0 0 L " + width + " 0")
        .attr("stroke", "#DDD");
    
    g.append("path")
      .attr("d", "M 0 " + height + " L " + width + " " + height)
      .attr("stroke", "#000");

    var major = g.selectAll(".city")
      .data(data)
      .enter().append("g")
      .attr("class", "city");
    
    var circle = g.selectAll(".circle-g")
      .data(data)
      .enter().append("g");
    
    circle.selectAll("circle.point-circle")
      .data(function (d) {
        return d.salaries })
      .enter().append("circle")
        .attr("cx", function (d) { return x(parseTime(d.year)) })
        .attr("cy", function (d) { return y(d.value) })
        .attr("r", 6)
        .attr("fill", function (d, i, j) {
          return z(j[i].parentNode.__data__.id);
        })
        .append("svg:title")
        .text(function (d, i, j) {
          return j[i].parentNode.parentNode.__data__.id + " (" + d.year + "): " + formatMoney(d.value);
        });

    major.append("path")
      .attr("class", "line")
      .attr("d", function (d) {
        return line(d.salaries);
      })
      .style("stroke", function (d) {
        return z(d.id);
      });

    major.append("text")
      .datum(function (d) {
        return {id: d.id, value: d.salaries[d.salaries.length - 1]};
      })
      .attr("transform", function (d) {
        return "translate(" + x(d.value.year) + "," + y(d.value.value) + ")";
      })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function (d) {
        return d.id;
      });
  });

  d3.select("#color-legend").html("");
  var legend = d3.select("#color-legend")
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
    .selectAll("g")
    .data(_.map(majorActiveArray, function (t) {return capitalizeFirstLetter(t)}))
      .enter().append("g")
      .attr("transform", function(d, i) {
        var column = i % 10;
        var row = Math.floor(i / 10);
        return "translate(" + (width / 10) * column + "," + row * 30 + ")";
      });

  legend.append("circle")
    .attr("cx", 32)
    .attr("cy", 9)
    .attr("r", 8)
    .attr("fill", z);

  legend.append("text")
    .attr("x", 45)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .text(function(d) { return d; });

};

var drawCostChart = function () {
  d3.select("#cost-chart").html("");

  var svg = d3.select("#cost-chart"),
    margin = {top: 30, right: 20, bottom: 30, left: 70},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var parseTime = d3.timeParse("%Y");

  var x = d3.scaleTime().rangeRound([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

  var line = d3.line()
    .x(function (d) {
      return x(parseTime(d.year));
    })
    .y(function (d) {
      return y(d.value);
    });

  d3.json("data-salary.json", function (err, root) {
    if (err) throw err;

    console.log(root);
    var data = _.map(majorActiveArray, function (major) {
      major = capitalizeFirstLetter(major);
      var ret = {};
      ret.id = major;
      ret.salaries = _.map(root.averageCost, function (val, key) {
        var obj = {};
        obj.year = key;
        for (var i = 0; i < val.length; i++) {
          if (val[i].major === major) {
            obj.value = val[i].cost;
          }
        }

        return obj;
      });

      return ret;
    });

    console.log(data);
    x.domain([parseTime("2011"), parseTime("2016")]);

    y.domain([
      0,
      Math.max(200000000, d3.max(data, function (c) {
        return d3.max(c.salaries, function (d) {
          return d.value;
        });
      }))
    ]);

    z.domain(data.map(function (c) {
      return c.id;
    }));

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y)
        .tickValues([50000000, 100000000, 150000000, 200000000]))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Biaya");
  
    var dashPoint = [50000000, 100000000, 150000000, 200000000];
    var dashLine = g.selectAll(".dash")
      .data(dashPoint)
      .enter().append("g")
      .attr("transform", function(d) {return "translate(0, " + y(d) + ")";})
      .append("path")
      .attr("d", "M 0 0 L " + width + " 0")
      .attr("stroke", "#DDD");
  
    g.append("path")
      .attr("d", "M 0 " + height + " L " + width + " " + height)
      .attr("stroke", "#000");

    var major = g.selectAll(".city")
      .data(data)
      .enter().append("g")
      .attr("class", "city");

    major.append("path")
      .attr("class", "line")
      .attr("d", function (d) {
        return line(d.salaries);
      })
      .style("stroke", function (d) {
        return z(d.id);
      });

    major.append("text")
      .datum(function (d) {
        return {id: d.id, value: d.salaries[d.salaries.length - 1]};
      })
      .attr("transform", function (d) {
        return "translate(" + x(d.value.year) + "," + y(d.value.value) + ")";
      })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function (d) {
        return d.id;
      });
  });

};

var drawPassionChart = function () {
  d3.select("#passion-chart").html("");

  var svg = d3.select("#passion-chart"),
    margin = {top: 30, right: 20, bottom: 30, left: 60},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var parseTime = d3.timeParse("%Y");

  var x = d3.scaleTime().rangeRound([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

  var line = d3.line()
    .x(function (d) {
      return x(parseTime(d.year));
    })
    .y(function (d) {
      return y(d.value);
    });

  d3.json("data-salary.json", function (err, root) {
    if (err) throw err;

    console.log(root);
    var data = _.map(majorActiveArray, function (major) {
      major = capitalizeFirstLetter(major);
      var ret = {};
      ret.id = major;
      ret.salaries = _.map(root.passions, function (val, key) {
        var obj = {};
        obj.year = key;
        for (var i = 0; i < val.length; i++) {
          if (val[i].major === major) {
            obj.value = val[i].total;
          }
        }

        return obj;
      });

      return ret;
    });

    console.log(data);
    x.domain([parseTime("2011"), parseTime("2016")]);
  
  
    var point = [];
    var maxValue = d3.max(data, function (c) {
      return d3.max(c.salaries, function (d) {
        return d.value;
      });
    });
    var divider;
    if (maxValue > 28000) {
      divider = 7000;
    } else {
      divider = 5000;
    }
    for (var i = 1; i <= Math.floor(maxValue / divider); i++) {
      point.push(i * divider);
    }
    y.domain([
      0,
      d3.max(data, function (c) {
        return d3.max(c.salaries, function (d) {
          return d.value;
        });
      })
    ]);

    z.domain(data.map(function (c) {
      return c.id;
    }));

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y)
        .tickValues(point))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Indeks Minat");
    var dashLine = g.selectAll(".dash")
      .data(point)
      .enter().append("g")
      .attr("transform", function(d) {return "translate(0, " + y(d) + ")";})
      .append("path")
      .attr("d", "M 0 0 L " + width + " 0")
      .attr("stroke", "#DDD");
  
    g.append("path")
      .attr("d", "M 0 " + height + " L " + width + " " + height)
      .attr("stroke", "#000");

    var major = g.selectAll(".city")
      .data(data)
      .enter().append("g")
      .attr("class", "city");

    major.append("path")
      .attr("class", "line")
      .attr("d", function (d) {
        return line(d.salaries);
      })
      .style("stroke", function (d) {
        return z(d.id);
      });

    major.append("text")
      .datum(function (d) {
        return {id: d.id, value: d.salaries[d.salaries.length - 1]};
      })
      .attr("transform", function (d) {
        return "translate(" + x(d.value.year) + "," + y(d.value.value) + ")";
      })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function (d) {
        return d.id;
      });
  });

};

var updateMajorActive = function () {
  majorActiveArray = [];

  _.each(MAJOR_LIST, function (major) {
    if ($("#check-" + major).is(":checked")) {
      majorActive[major] = true;
      majorActiveArray.push(major);
    } else {
      majorActive[major] = false;
    }
  });
};

$(document).ready(function () {
  $("input.major-filter").change(function () {
    updateMajorActive();
    drawSalaryChart();
    drawCostChart();
    drawPassionChart();
  });

  drawSalaryChart();
  drawCostChart();
  drawPassionChart();
});
