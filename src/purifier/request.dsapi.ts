export interface DsapiRequest {
    requests: [
        {
            op: number,
            pc: {
                pch: [
                    {
                        pch: Group[],
                        pn: string
                    }
                ],
                pn: string
            },
            to: string
        }
    ]
}

export interface Group {
    pch: Property[]
    pn: string
}

export interface Property {
    pn: string,
    pv: string
}
