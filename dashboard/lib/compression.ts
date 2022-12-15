import type { PlantData, PlantDataCommit } from "../types/plantdata"

function transformLight({ visible, ultraviolet, infrared, isOn }: PlantData["light"]) {
    return [visible, ultraviolet, infrared, isOn]
}

function transformPlants(plants: PlantData["plants"]) {
    return plants.map(({ name, soilTemp, soilMoisture }) => [name, soilTemp, soilMoisture])
}

function transformPlantData({ roomTemp, roomHumidity, timestamp, light, hasWater, isWatering, plants }: PlantData) {
    return [roomTemp, roomHumidity, timestamp, transformLight(light), hasWater, isWatering, transformPlants(plants)]
}

export function transformCommit({ commit, timestamp, data }: PlantDataCommit) {
    return [commit, timestamp || null, transformPlantData(data)]
}
