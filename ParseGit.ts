/*
 *   Copyright (c) 2022 Duart Snel

 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.

 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.

 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * The output directory to put the parsed files in.
 * > please don't use trailing slashes within the url. the program will do this for you.
 */
const OUTPUT_DIR = "./snapshots"

/**
 * Indicates if the program should ignore already existing files in the OUTPUT_DIR when the same commit was found
 */
const IGNORE_EXISTING_FILES = true

/**
 * The file extension of the output files generated within OUTPUT_DIR
 */
const FILE_EXTENSION = ".json"

type TGitLogCommits = {
    commit: string,
    author: {
      name: string,
      email: string,
      date: string
    }
}[]

// ensure the snapshots folder exists.
Deno.mkdirSync(OUTPUT_DIR, {recursive: true})


/**
 * Resolves true if a file exists; false otherwise
 */
async function fileExists(path: string) {
    return await Deno.stat(path).then(() => true).catch(() => false);
}

/**
 * Filters out commits that are not from the flat data tool-set
 */
function onlyFlatData(c: TGitLogCommits[number]){
    return c.author.email === "flat-data@users.noreply.github.com"
}

const RAW_OUT = new TextDecoder().decode(await Deno.run({
    cmd: ["git", "log", `--pretty=format:{%n  "commit": "%H",%n  "author": {%n    "name": "%aN",%n    "email": "%aE",%n    "date": "%aD"%n  }%n },`],
    stdout: 'piped'
}).output())

const commitHistory = (JSON.parse("["+RAW_OUT.substring(0, RAW_OUT.length - 1)+"]") as TGitLogCommits).filter(onlyFlatData)

/**
 * Writes a snapshot entry based on the commit information
 */
async function writeSnapshotFile(commit: TGitLogCommits[number]){
    const COMMIT_DATA = new TextDecoder().decode(await Deno.run({
        cmd: ["git", "cat-file", "-p", `${commit.commit}:data.json`],
        stdout: 'piped'
    }).output())

    Deno.writeTextFileSync(`${OUTPUT_DIR}/${commit.commit}${FILE_EXTENSION}`, `{"commit": "${commit.commit}", "data": ${COMMIT_DATA}}`)
}

for(const commit of commitHistory){
    if(!IGNORE_EXISTING_FILES || (IGNORE_EXISTING_FILES && !(await fileExists(`${OUTPUT_DIR}/${commit.commit}${FILE_EXTENSION}`)))){
       writeSnapshotFile(commit)
    }
}