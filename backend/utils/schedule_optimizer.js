const { exec } = require("child_process");

const optimizeSchedule = (employees, shifts, requirements) => {
  return new Promise((resolve, reject) => {
    const command = `python3 ./backend/utils/schedule_optimizer.py ${JSON.stringify(
      employees
    )} ${JSON.stringify(shifts)} ${JSON.stringify(requirements)}`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(stdout));
      }
    });
  });
};

module.exports = { optimizeSchedule };
