import { Fan } from "./fan.enum";
import { HumidifierState } from "./humidifierState.enum";
import { HumidifyMode } from "./humidifyMode.enum";
import { HumidifyPropertyName } from "./humidifyPropertyName.enum";
import { Humidity2 } from "./humidity2.enum";
import { Mode2 } from "./mode2.enum";
import { Power } from "./power.enum";
import { PurifyPropertyName } from "./purifyPropertyName.enum";

export interface Rw {
  requests: R[]
}

export interface R {
  op: number
  pc: P
  to: string
}

export interface P {
  pn: string
}

export interface Pch extends P {
  pch: P[]
}

export interface Pc extends P {
  pv: string
}

export abstract class Request {
  protected abstract getOperationType(): number
  protected abstract getPropertyConfigHierarchy(): PropertyConfigHierarchy | PropertyConfig
  protected abstract getEndpoint(): string

  toJson(): R {
    return {
      op: this.getOperationType(),
      pc: this.getPropertyConfigHierarchy().toJson(),
      to: this.getEndpoint()
    }
  }
}

export abstract class PropertyConfigHierarchy {
  private propertyConfigs: (PropertyConfig | PropertyConfigHierarchy)[] = []

  protected abstract getPropertyName(): string

  add(propertyConfig: PropertyConfig | PropertyConfigHierarchy) {
    this.propertyConfigs.push(propertyConfig)
  }

  toJson(): Pch {
    return {
      pch: this.propertyConfigs.map(x => x.toJson()),
      pn: this.getPropertyName()
    }
  }
}

abstract class PropertyConfig {
  protected abstract getPropertyName(): string
  protected abstract getPropertyValue(): string

  toJson(): Pc {
    return {
      pn: this.getPropertyName(),
      pv: this.getPropertyValue()
    }
  }
}

export abstract class ModeConfig extends PropertyConfig {
  private readonly propertyValue: string

  constructor(mode: Mode2) {
    super()
    this.propertyValue = mode
  }

  protected getPropertyValue(): string {
    return this.propertyValue
  }
}

export class PurifierOnlyModeConfig extends ModeConfig {
  private static readonly PROPERTY_NAME = PurifyPropertyName.PURIFY_ONLY_MODE

  constructor(mode: Mode2) {
    super(mode)
  }

  protected getPropertyName(): string {
    return PurifierOnlyModeConfig.PROPERTY_NAME
  }
}

export class HumidifierEnabledModeConfig extends ModeConfig {
  private static readonly PROPERTY_NAME = PurifyPropertyName.HUMIDIFIER_ENABLED_MODE

  constructor(mode: Mode2) {
    super(mode)
  }

  protected getPropertyName(): string {
    return HumidifierEnabledModeConfig.PROPERTY_NAME
  }
}

export abstract class FanConfig extends PropertyConfig {
  private readonly propertyValue: string

  constructor(fan: Fan) {
    super()
    this.propertyValue = fan
  }

  protected getPropertyValue(): string {
    return this.propertyValue
  }
}

export class PurifyOnlyFanConfig extends FanConfig {
  private static readonly PROPERTY_NAME = PurifyPropertyName.PURIFY_ONLY_FAN_LEVEL

  constructor(fan: Fan) {
    super(fan)
  }

  protected getPropertyName(): string {
    return PurifyOnlyFanConfig.PROPERTY_NAME
  }
}

export class HumidiferEnabledFanConfig extends FanConfig {
  private static readonly PROPERTY_NAME = PurifyPropertyName.HUMIDIFIER_ENABLED_FAN_LEVEL

  constructor(fan: Fan) {
    super(fan)
  }

  protected getPropertyName(): string {
    return HumidiferEnabledFanConfig.PROPERTY_NAME
  }
}

export class HumidityConfig extends PropertyConfig {
  private readonly propertyKey: string
  private readonly propertyValue: string

  constructor(humidifyMode: HumidifyMode, humidity: Humidity2) {
    super()
    this.propertyKey = humidifyMode
    this.propertyValue = humidity
  }

  protected getPropertyName(): string {
    return this.propertyKey
  }

  protected getPropertyValue(): string {
    return this.propertyValue
  }
}

export class HumidiferStateConfig extends PropertyConfig {
  private static readonly PROPERTY_NAME = HumidifyPropertyName.STATE
  private readonly on: boolean

  constructor(on: boolean) {
    super()
    this.on = on
  }

  protected getPropertyName(): string {
    return HumidiferStateConfig.PROPERTY_NAME
  }

  protected getPropertyValue(): string {
    return this.on ? HumidifierState.ON : HumidifierState.OFF
  }
}

export class PowerConfig extends PropertyConfig {
  private static readonly PROPERTY_NAME = 'p_01'
  private readonly on: boolean

  constructor(on: boolean) {
    super()
    this.on = on
  }

  protected getPropertyName(): string {
    return PowerConfig.PROPERTY_NAME
  }

  protected getPropertyValue(): string {
    return this.on ? Power.ON : Power.OFF
  }
}

export class ModePropertyHierarchy extends PropertyConfigHierarchy {
  private static readonly PROPERTY_NAME = 'e_3007'

  protected getPropertyName(): string {
    return ModePropertyHierarchy.PROPERTY_NAME
  }
}

export class StatePropertyHierarchy extends PropertyConfigHierarchy {
  private static readonly PROPERTY_NAME = 'e_3001'

  protected getPropertyName(): string {
    return StatePropertyHierarchy.PROPERTY_NAME
  }
}

export class PowerPropertyHierarchy extends PropertyConfigHierarchy {
  private static readonly PROPERTY_NAME = 'e_A002'

  protected getPropertyName(): string {
    return PowerPropertyHierarchy.PROPERTY_NAME
  }
}

export class CommonPropertyHierarchy extends PropertyConfigHierarchy {
  private static readonly PROPERTY_NAME = 'e_1002'

  protected getPropertyName(): string {
    return CommonPropertyHierarchy.PROPERTY_NAME
  }
}

export class DgcStatusPropertyHierarchy extends PropertyConfigHierarchy {
  private static readonly PROPERTY_NAME = 'dgc_status'

  protected getPropertyName(): string {
    return DgcStatusPropertyHierarchy.PROPERTY_NAME
  }
}

export class DgcStatusRequest extends Request {
  private static readonly OPERATION_TYPE = 3
  private static readonly ENDPOINT = '/dsiot/edge/adr_0100.dgc_status'
  private readonly propertyConfigHierarchy = new DgcStatusPropertyHierarchy()

  add(propertyConfigHierarchy: PropertyConfigHierarchy) {
    this.propertyConfigHierarchy.add(propertyConfigHierarchy)
  }

  protected getOperationType(): number {
    return DgcStatusRequest.OPERATION_TYPE
  }

  protected getPropertyConfigHierarchy(): PropertyConfigHierarchy {
    return this.propertyConfigHierarchy
  }

  protected getEndpoint(): string {
    return DgcStatusRequest.ENDPOINT
  }
}

export class RequestWrapper {
  private readonly requests: Request[] = []

  add(request: Request) {
    this.requests.push(request)
  }

  toJson(): Rw {
    return {
      requests: this.requests.map(x => x.toJson())
    }
  }
}
