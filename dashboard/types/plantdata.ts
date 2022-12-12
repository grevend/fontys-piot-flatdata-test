export interface PlantData {
    roomTemp: number
    roomHumidity: number
    timestamp: number
    light: {
        visible: number
        ultraviolet: number
        infrared: number
        isOn: boolean
    }
    hasWater: boolean
    isWatering: boolean
    plants: {
        name: string
        soilTemp: number
        soilMoisture: number
    }[]
}

export interface PlantDataCommit {
    commit: string
    timestamp: string
    data: PlantData
}

export interface PlantDataSnapshots {
    snapshots: PlantDataCommit[]
}
