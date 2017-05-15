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

var updateMajorActive = function (majors) {
  majorActiveArray = [];

  if (window.majorActive) {
    _.each(MAJOR_LIST, function (major) {
      majorActive[major] = false;
    });

    _.each(majors, function (major) {
      majorActive[major] = true;
      majorActiveArray.push(major);
    });
  }
};

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function setActiveTab() {
  var activeMajor = getParameterByName('major', window.location.href);

  if (activeMajor) {
    $('.menu-main .item').removeClass('active');
    $('.menu-main .item.dynamic-item:contains(' + activeMajor + ')').addClass('active');
  }
}

$(document).ready(function() {
  $('.dropdown-menu').dropdown();

  $('.dropdown-filter-majors').dropdown({
    maxSelections: 5,
    onChange: function(value, text, $selectedItem) {
      var values = value.split(',');
      Cookies.set('selectedMajors', value);

      window.updateMajorActive && updateMajorActive(values);
      window.drawSalaryChart && drawSalaryChart();
      window.drawCostChart && drawCostChart();
      window.drawPassionChart && drawPassionChart();

      $('.item.dynamic-item').remove();
      for (var i=0;i<values.length;i++) {
        $('<a class="item dynamic-item" href="major.html?major=' + capitalizeFirstLetter(values[i]) + '">' + capitalizeFirstLetter(values[i]) + '</a>').insertBefore($('.menu-main .right.menu'));
      }
    }
  });

  var selectedMajors = Cookies.get('selectedMajors');

  if (!selectedMajors) {
    // Default selected majors
    $('.dropdown-filter-majors').dropdown('set selected', 'komputer');
    $('.dropdown-filter-majors').dropdown('set selected', 'kedokteran');
    $('.dropdown-filter-majors').dropdown('set selected', 'bisnis');
  } else {
    var selectedMajorsArr = selectedMajors.split(',');

    for (var i=0;i<selectedMajorsArr.length;i++) {
      $('.dropdown-filter-majors').dropdown('set selected', selectedMajorsArr[i]);
    }
  }

  setActiveTab();
})