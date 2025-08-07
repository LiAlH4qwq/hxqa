import * as fs from "fs"
import * as process from "process"
import * as hxqac from "src/hxqac"

type Main = (argv: string[]) => void

const main: Main = (argv) => {
    const args = argv.slice(2)
    if (args.length !== 2) {
        console.error("Usage: hxqac <input.hxqa> <output.jsonl>")
        return
    }
    const hxqa = fs.readFileSync(args[0], "utf-8")
    const jsonl = hxqac.hxqac(hxqa).out()
    if (typeof jsonl === "string") fs.writeFileSync(args[1], jsonl, "utf-8")
    else console.error(JSON.stringify(jsonl, undefined, "  "))
}

main(process.argv)