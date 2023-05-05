export interface LocalRequest {
    power?: Power
    purify?: Purify
    humidify?: Humidify
}

export enum Power {
    ON,
    OFF
}

export enum Purify {
    SMART,
    AUTOFAN,
    ECONO,
    POLLEN,
    MOIST,
    CIRCULATOR,
    QUIET,
    LOW,
    STANDARD,
    TURBO
}

export enum Humidify {
    OFF,
    LOW,
    STANDARD,
    HIGH
}
