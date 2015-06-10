module.exports = (function() {

  var excelParser = require('excel-parser'),
      xlsx = require('node-xlsx'),
      Q = require('q'),
      ical = require('ical-generator');

  var _extractWorksheet = function(path) {
    var deferred = Q.defer();

    excelParser.worksheets({
      inFile: path
    }, function(err, worksheets) {
      worksheets.forEach(function(worksheet) {
        if (worksheet.name.match(/counter/i)) {
          deferred.resolve(worksheet);
        }
      });
    });

    return deferred.promise;
  };

  var _extractNameColumn = function(records) {
    var deferred = Q.defer();

    records[2].forEach(function(cell, index) {
      if (cell.match(/sebas/i)) {
        deferred.resolve(index);
      }
    });

    return deferred.promise;
  };

  var _extractTimes = function(records, columnIndex) {
    var deferred = Q.defer(), currentDate, parsedDates = [];

    records.forEach(function(row, index) {
      if (row[0] && row[1]) {
        currentDate = _excelDateValue(row[0]);
      }

      if (row[columnIndex] === 'X') {
        var times = row[3].split(' - '),
            startTime = times[0].replace('.', ':'),
            endTime = times[1] === 'close' ? '23:00' : times[1].replace('.', ':');

        var startTime = new Date(currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate() + ' ' + startTime),
            endTime = new Date(currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + currentDate.getDate() + ' ' + endTime);

        parsedDates.push({
          start: startTime,
          end: endTime,
          summary: 'Lombardo\'s',
          description: row[3]
        });
      }
    });

    deferred.resolve(parsedDates);

    return deferred.promise;
  };

  var _parse = function(path, worksheet) {
    var deferred = Q.defer();

    excelParser.parse({
      worksheet: worksheet,
      inFile: path,
      skipEmpty: false
    }, function(err, records) {
      deferred.resolve(records);
    });

    return deferred.promise;
  };

  var _excelDateValue = function(serial) {
    var utc_days  = Math.floor(serial - 25569);
    var utc_value = utc_days * 86400;
    var date_info = new Date(utc_value * 1000);

    var fractional_day = serial - Math.floor(serial) + 0.0000001;

    var total_seconds = Math.floor(86400 * fractional_day);

    var seconds = total_seconds % 60;

    total_seconds -= seconds;

    var hours = Math.floor(total_seconds / (60 * 60));
    var minutes = Math.floor(total_seconds / 60) % 60;

    return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
  };

  var ParseController = {

    parse: function(req, res) {
      var file = req.files['file'], _records;

      if (false) {
        _extractWorksheet(file.path)
          .then(function(result) {
            return _parse(file.path, result.id);
          })
          .then(function(records) {
            _records = records;
            return _extractNameColumn(records);
          })
          .then(function(index) {
            return _extractTimes(_records, index);
          })
          .catch(function() {
            console.log(arguments);
          });
      } else {
        var sheets = xlsx.parse(file.path), counterSheets = [];

        sheets.forEach(function(sheet) {
          if (sheet.name.match(/counter/i)) {
            counterSheets.push(sheet);
          }
        });

        counterSheets.forEach(function(counterSheet) {
          _extractNameColumn(counterSheet.data)
            .then(function(columnIndex) {
              return _extractTimes(counterSheet.data, columnIndex);
            })
            .then(function(parsedDates) {
              var cal = ical();

              cal.events(parsedDates);
              cal.serve(res);
            })
            .catch(function(e) {
              console.error(e);
            });
        });
      }
    }

  };

  return ParseController;

})();
