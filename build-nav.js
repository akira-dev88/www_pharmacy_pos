const fs = require("fs");
const path = require("path");

const LESSONS_DIR = "./lessons";

function cleanTitle(str) {

    return str
        .replace(/^\d+-/, "")
        .split("-")
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(" ");
}

function extractOrder(str) {

    const match = str.match(/^(\d+)-/);

    return match
        ? match[1]
        : "999";
}

const navigation = [];

const folders = fs
    .readdirSync(LESSONS_DIR)
    .filter(folder => {

        const folderPath =
            path.join(LESSONS_DIR, folder);

        return fs
            .statSync(folderPath)
            .isDirectory();
    })
    .sort();

for (const folder of folders) {

    const folderPath =
        path.join(LESSONS_DIR, folder);

    const folderOrder =
        extractOrder(folder);

    const lessons = fs
        .readdirSync(folderPath)
        .filter(file =>
            file.endsWith(".html")
        )
        .sort()
        .map(file => ({

            title: cleanTitle(
                file.replace(".html", "")
            ),

            order: extractOrder(file),

            file:
                `lessons/${folder}/${file}`
        }));

    navigation.push({

        title: cleanTitle(folder),

        order: folderOrder,

        lessons
    });
}

const output =
`const navigation = ${JSON.stringify(
    navigation,
    null,
    4
)};`;

fs.writeFileSync(
    "navigation.js",
    output
);

console.log(
    "navigation.js generated"
);