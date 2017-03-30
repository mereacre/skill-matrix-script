const csv = require("csvtojson");
const _ = require("lodash");
const fs = require('fs');

// Ensure the rigth amount of arguments
if (process.argv.length < 5) {
    console.log("Usage: node process.js infile.csv outfile.json serviceId")
    process.exit(1);
}

// Non workforce types
const typeList = [
    "conditionType",
    "condition",
    "function",
];

const NO_SKILL = "N";
const NO_TYPE = "none";
const currentTimestamp = Date.now();

fs.open(process.argv[3], "w", (err, fd) => {
    if (err) {
        console.log(err);
        process.exit(1);
    } else {
        fs.close(fd, (err) => {
            if(err) {
                console.log(err);
                process.exit(1);
            } else {
                csv()
                    .fromFile(process.argv[2])
                    .on('json', (entryCsv) => {
                    
                    const jsonEntry = {
                        serviceId: process.argv[4],
                        date: currentTimestamp,
                        conditionType: entryCsv.conditionType.length ? entryCsv.conditionType : NO_TYPE,
                        condition: entryCsv.condition.length ? entryCsv.condition : NO_TYPE,
                        function: entryCsv.function.length ? entryCsv.function : NO_TYPE,
                    };

                    // Iterate over the types and filter the workforce types
                    _.map(entryCsv, (value, key) => {
                        // Add the workforce type
                        if (typeList.indexOf(key) < 0) {
                            jsonEntry.workforceType = key;
                            if (value.length)
                                jsonEntry.competent = value;
                            else jsonEntry.competent = NO_SKILL;

                            const jsonStr = JSON.stringify(jsonEntry)+"\n";
                            fs.writeFileSync(process.argv[3], jsonStr, {flag: "a"}, (err) => {
                                if(err) {
                                    console.log(err);
                                    process.exit(1);
                                }
                            });
                        }
                    });
                })
                .on("done", (error) => {
                    console.log("Done processing.");
                    console.log("Saving to output file: "+process.argv[3]);
                });
            }
        });
    }
});