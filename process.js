const csv = require("csvtojson");
const _ = require("lodash");
const fs = require('fs');

// Ensure the rigth amount of arguments
if (process.argv.length < 6) {
    console.log("Usage: node process.js infile.csv outfile.json serviceId year")
    process.exit(1);
}

// Non workforce types
const typeList = [
    "type",
    "subType",
    "activity",
];

const NO_SKILL = "N";
const NO_TYPE = "none";
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
                        year: process.argv[5],
                        type: entryCsv.type.length ? entryCsv.type : NO_TYPE,
                        subType: entryCsv.subType.length ? entryCsv.subType : NO_TYPE,
                        activity: entryCsv.activity.length ? entryCsv.activity : NO_TYPE,
                    };

                    // Iterate over the types and filter the workforce types
                    _.map(entryCsv, (value, key) => {
                        // Add the workforce type
                        if (typeList.indexOf(key) < 0) {
                            jsonEntry.workforceType = key;
                            if (value.length)
                                jsonEntry.skill = value;
                            else jsonEntry.skill = NO_SKILL;
                        }
                    });
                    
                    const jsonStr = JSON.stringify(jsonEntry)+"\n";
                    fs.writeFileSync(process.argv[3], jsonStr, {flag: "a"}, (err) => {
                        if(err) {
                            console.log(err);
                            process.exit(1);
                        }
                    })
                })
                .on("done", (error) => {
                    console.log("Done processing.");
                    console.log("Saving to output file: "+process.argv[3]);
                });
            }
        });
    }
});