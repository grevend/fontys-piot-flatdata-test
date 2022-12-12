import { readdirSync, readFileSync } from "fs"
import { join } from "path"

export function getAllDataSnapshots() {
    return readdirSync('../snapshots').map(name => ({
        params: {
            id: name.replace(/\.json$/, '')
        }
    }))
}

export function getDataSnapshot(hash: string) {
    const fullPath = join('../snapshots', `${hash}.json`)
    const props = JSON.parse(readFileSync(fullPath, { encoding: 'utf8' }))
    return {
        id: hash, ...props
    }
}
