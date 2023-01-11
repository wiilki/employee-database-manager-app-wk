let col = require("colors");

let center = function (_string) {
  return process.stdout.columns / 2 - _string.length / 2;
};

let timer = function () {
  let d = new Date();
  let curr_hour = d.getHours();
  let curr_min = d.getMinutes();
  let curr_sec = d.getSeconds();
  if (curr_sec < 10) {
    curr_sec = "0" + curr_sec;
  }
  if (curr_min < 10) {
    curr_min = "0" + curr_min;
  }
  if (curr_hour < 10) {
    curr_hour = "0" + curr_hour;
  }
  return "Time Updated: " + curr_hour + ":" + curr_min + ":" + curr_sec;
};

exports.set = function (app_name, additional, rainbow) {
  try {
    if (!app_name) {
      app_name = "THE PROJECT";
    }
    if (!additional) {
      additional = "";
    }
    if (!rainbow) {
      rainbow = Math.floor(Math.random() * 2);
    }
    console.log();
    for (let i = 0; i < process.stdout.columns; i++) {
      process.stdout.write(col.cyan("="));
    }
    console.log();
    for (let d = 0; d < center(app_name); d++) {
      process.stdout.write(" ");
    }
    if (rainbow) {
      process.stdout.write(col.green(" - ") + col.rainbow(app_name) + col.green(" - ") + "\n");
    } else {
      process.stdout.write(col.green(" - ") + app_name + col.green(" - ") + "\n");
    }

    for (let k = 0; k < process.stdout.columns; k++) {
      process.stdout.write(col.blue("-"));
    }
    for (let f = 0; f < center("Running file: " + process.argv[1] + ""); f++) {
      process.stdout.write(" ");
    }
    process.stdout.write("Running file: " + col.yellow(process.argv[1]) + "\n ");
    console.log();
    for (let p = 0; p < center(timer()); p++) {
      process.stdout.write(" ");
    }
    process.stdout.write(col.blue(" » ") + timer() + col.blue(" « "));
    console.log();

    if (additional) {
      console.log();
      for (let z = 0; z < center(additional); z++) {
        process.stdout.write(" ");
      }
      process.stdout.write(col.green(additional));
      console.log();
    }

    for (let v = 0; v < process.stdout.columns; v++) {
      process.stdout.write(col.cyan("="));
    }
    console.log("\n \n");
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};
