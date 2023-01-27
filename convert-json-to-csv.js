const csvwriter = require("csv-writer");
const fs = require("fs");

const obj = JSON.parse(fs.readFileSync("results.json"));

const run = async () => {
  const createCsvWriter = csvwriter.createObjectCsvWriter;

  const csvWriter = createCsvWriter({
    // Output csv file name is geek_data
    path: "results.csv",
    // header: [
    //   // Title of the columns (column_names)
    //   { id: "id", title: "ID" },
    //   { id: "name", title: "NAME" },
    //   { id: "age", title: "AGE" },
    // ],
    header: Object.entries(obj[0]).map(([key, value]) => {
      return { id: key, title: key };
    }),
  });

  await csvWriter.writeRecords(obj);
};
run();
