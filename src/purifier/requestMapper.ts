import { DsapiRequest, Group, Property } from "./request.dsapi";
import { Humidify, LocalRequest, Power, Purify } from "./request.local";

export default class RequestMapper {

    private localRequest: LocalRequest;
    private dsapiRequest: DsapiRequest;

    constructor(localRequest: LocalRequest) {
        this.localRequest = localRequest
        this.setDsapiRequest()
    }

    private setDsapiRequest() {
        this.dsapiRequest = {
            requests: [
                {
                    op: 3,
                    pc: {
                        pch: [
                            {
                                pch: [],
                                pn: "e_1002"
                            }
                        ],
                        pn: "dgc_status"
                    },
                    to: "/dsiot/edge/adr_0100.dgc_status"
                }
            ]
        }
    }

    map(): DsapiRequest {
        this.mapPurify();
        this.mapFan();
        this.mapHumidify();
        this.mapPower();

        return this.dsapiRequest
    }

    private mapPower() {
        const power = this.localRequest.power
        if (power !== undefined) {
            this.setProperty("e_A002", "p_01", this.toPowerStatePropertyValue(power))
        }
    }

    private toPowerStatePropertyValue(power: Power): string {
        switch (power) {
            case Power.ON:
                return "01"
            case Power.OFF:
                return "00"
        }
        throw new Error('not implemented');
    }

    private mapPurify() {
        const purify = this.localRequest.purify
        const humidify = this.localRequest.humidify
        if (purify !== undefined && humidify !== undefined) {
            this.setProperty("e_3007", this.toPurifyModePropertyName(humidify), this.toPurifyModePropertyValue(purify))
        }
    }

    private toPurifyModePropertyName(humidify: Humidify): string {
        return humidify === Humidify.OFF ? "p_01" : "p_03"
    }

    private toPurifyModePropertyValue(purify: Purify): string {
        switch (purify) {
            case Purify.SMART:
                return '0000';
            case Purify.MOIST:
                return '0500';
            case Purify.AUTOFAN:
                return '0200';
            case Purify.POLLEN:
                return '0400';
            case Purify.ECONO:
                return '0300';
            case Purify.CIRCULATOR:
                return '0600';
            case Purify.QUIET:
            case Purify.LOW:
            case Purify.STANDARD:
            case Purify.TURBO:
                return '0100';
        }
        throw new Error('not implemented');
    }

    private mapFan() {
        const purify = this.localRequest.purify
        const humidify = this.localRequest.humidify
        if (purify !== undefined && humidify !== undefined && this.isFan(purify)) {
            this.setProperty("e_3007", this.toFanLevelPropertyName(humidify), this.toFanLevelPropertyValue(purify))
        }
    }

    private isFan(purify: Purify): boolean {
        switch (purify) {
            case Purify.QUIET:
            case Purify.LOW:
            case Purify.STANDARD:
            case Purify.TURBO:
                return true;
        }
        return false;
    }

    private toFanLevelPropertyName(humidify: Humidify): string {
        return humidify === Humidify.OFF ? "p_04" : "p_06"
    }

    private toFanLevelPropertyValue(purify: Purify): string {
        switch (purify) {
            case Purify.QUIET:
                return '00';
            case Purify.LOW:
                return '01';
            case Purify.STANDARD:
                return '02';
            case Purify.TURBO:
                return '04';
        }
        throw new Error('not implemented');
    }

    private mapHumidify() {
        const purify = this.localRequest.purify
        const humidify = this.localRequest.humidify
        if (purify !== undefined && humidify !== undefined) {
            this.setProperty("e_3001", "p_3F", this.toHumidifyStatePropertyValue(humidify))
            if (humidify !== Humidify.OFF) {
                this.setProperty("e_3007", this.toHumidifyLevelPropertyName(purify), this.toHumidifyLevelPropertyValue(humidify))
            }
        }
    }

    private toHumidifyStatePropertyValue(humidify: Humidify): string {
        switch (humidify) {
            case Humidify.OFF:
                return '00';
        }
        return '02'
    }

    private toHumidifyLevelPropertyName(purify: Purify): string {
        switch (purify) {
            case Purify.AUTOFAN:
                return 'p_14';
            case Purify.ECONO:
                return 'p_15';
            case Purify.POLLEN:
                return 'p_16';
            case Purify.CIRCULATOR:
                return 'p_18';
            case Purify.QUIET:
            case Purify.LOW:
            case Purify.STANDARD:
            case Purify.TURBO:
                return 'p_13';
        }
        throw new Error('not implemented');
    }

    private toHumidifyLevelPropertyValue(humidify: Humidify): string {
        switch (humidify) {
            case Humidify.LOW:
                return '01';
            case Humidify.STANDARD:
                return '02';
            case Humidify.HIGH:
                return '03';
        }
        throw new Error('not implemented');
    }

    private setProperty(groupName: string, propertyName: string, propertyValue: string) {
        const group = this.getOrCreateGroup(groupName)
        this.getOrCreateProperty(group, propertyName, propertyValue)
    }

    private getOrCreateGroup(name: string): Group {
        const groupList = this.getGroupList()
        let group = groupList.find(group => group.pn === name)
        if (group === undefined) {
            group = { pch: [], pn: name }
            groupList.push(group)
        }
        return group
    }

    private getGroupList() {
        return this.dsapiRequest.requests[0].pc.pch[0].pch
    }

    private getOrCreateProperty(group: Group, name: string, value: string): Property {
        const propertyList = group.pch
        let property = propertyList.find(parameter => parameter.pn === name)
        if (property === undefined) {
            property = { pn: name, pv: value }
            propertyList.push(property)
        }
        return property
    }
}

