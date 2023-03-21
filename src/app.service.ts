import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Fan } from './dsapi/fan.enum';
import { HumidifyMode } from './dsapi/humidifyMode.enum';
import { Humidity } from './dsapi/humidity.enum';
import { Humidity2 } from './dsapi/humidity2.enum';
import { CommonPropertyHierarchy, DgcStatusRequest, HumidiferEnabledFanConfig, HumidiferStateConfig, HumidifierEnabledModeConfig, HumidityConfig, ModePropertyHierarchy, PowerConfig, PowerPropertyHierarchy, PurifierOnlyModeConfig, PurifyOnlyFanConfig, RequestWrapper, StatePropertyHierarchy } from './dsapi/iface';
import { Mode } from './dsapi/mode.enum';
import { Mode2 } from './dsapi/mode2.enum';

const IP = '172.16.0.195';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly httpService: HttpService) { }

  async setMode(mode: Mode, humidity: Humidity) {
    const data = this.createSetModeRequestWrapper(mode, humidity).toJson();
    const debugData = JSON.stringify(data);
    this.logger.debug(`Sending request: ${debugData}`);

    const result = await firstValueFrom(
      this.httpService.post(`http://${IP}/dsiot/multireq`, data).pipe(
        catchError((error: AxiosError) => {
          if (error?.response) {
            this.logger.error(error.response.data);
          }
          throw 'An error happened!';
        }),
      ),
    );
    console.log(result.data);
  }

  private createSetModeRequestWrapper(
    mode: Mode,
    humidity: Humidity,
  ): RequestWrapper {
    const modePropertyHierarchy = new ModePropertyHierarchy()
    const statePropertyHierarchy = new StatePropertyHierarchy()

    const mode2 = this.toMode2(mode)
    const fan = this.toFan(mode)
    if (this.isHumidifierEnabled(mode, humidity)) {
      const modeConfig = new HumidifierEnabledModeConfig(mode2)
      modePropertyHierarchy.add(modeConfig)

      if (fan !== null) {
        const fanConfig = new HumidiferEnabledFanConfig(fan)
        modePropertyHierarchy.add(fanConfig)
      }

      const humidifyMode = this.toHumidifyMode(mode2)
      if (humidifyMode !== null) { // manual humidity mode
        const humidity2 = this.toHumidity2(humidity)
        const humidityConfig = new HumidityConfig(humidifyMode, humidity2)
        modePropertyHierarchy.add(humidityConfig)
      }

      const humidiferStateConfig = new HumidiferStateConfig(true)
      statePropertyHierarchy.add(humidiferStateConfig)
    } else {
      const modeConfig = new PurifierOnlyModeConfig(mode2)
      modePropertyHierarchy.add(modeConfig)

      if (fan !== null) {
        const fanConfig = new PurifyOnlyFanConfig(fan)
        modePropertyHierarchy.add(fanConfig)
      }

      const humidiferStateConfig = new HumidiferStateConfig(false)
      statePropertyHierarchy.add(humidiferStateConfig)
    }

    const powerPropertyHierarchy = new PowerPropertyHierarchy()
    const powerConfig = new PowerConfig(true)
    powerPropertyHierarchy.add(powerConfig)

    const commonPropertyHierarchy = new CommonPropertyHierarchy()
    commonPropertyHierarchy.add(modePropertyHierarchy)
    commonPropertyHierarchy.add(statePropertyHierarchy)
    commonPropertyHierarchy.add(powerPropertyHierarchy)

    const request = new DgcStatusRequest();
    request.add(commonPropertyHierarchy)

    const requestWrapper = new RequestWrapper()
    requestWrapper.add(request)

    return requestWrapper
  }

  private toHumidifyMode(mode2: Mode2): HumidifyMode | null {
    switch (mode2) {
      case Mode2.ECONO:
        return HumidifyMode.ECONO
      case Mode2.AUTOFAN:
        return HumidifyMode.AUTOFAN
      case Mode2.POLLEN:
        return HumidifyMode.POLLEN
      case Mode2.CIRCULATOR:
        return HumidifyMode.CIRCULATOR
      case Mode2.MANUAL:
        return HumidifyMode.MANUAL
    }
    return null
  }

  private toFan(mode: Mode): Fan | null {
    switch (mode) {
      case Mode.QUIET:
        return Fan.QUIET
      case Mode.LOW:
        return Fan.LOW
      case Mode.STANDARD:
        return Fan.STANDARD
      case Mode.TURBO:
        return Fan.TURBO
    }
    return null
  }

  private toMode2(mode: Mode): Mode2 {
    switch (mode) {
      case Mode.SMART:
        return Mode2.SMART
      case Mode.MOIST:
        return Mode2.MOIST
      case Mode.ECONO:
        return Mode2.ECONO
      case Mode.AUTOFAN:
        return Mode2.AUTOFAN
      case Mode.POLLEN:
        return Mode2.POLLEN
      case Mode.CIRCULATOR:
        return Mode2.CIRCULATOR
      case Mode.QUIET:
      case Mode.LOW:
      case Mode.STANDARD:
      case Mode.TURBO:
        return Mode2.MANUAL
    }
    throw new Error('not implemented');
  }

  private isHumidifierEnabled(mode: Mode, humidity: Humidity): boolean {
    return mode === Mode.MOIST || humidity !== Humidity.OFF
  }

  private isHumidifierManual(mode: Mode) {
    switch (mode) {
      case Mode.AUTOFAN:
      case Mode.ECONO:
      case Mode.POLLEN:
      case Mode.CIRCULATOR:
      case Mode.QUIET:
      case Mode.LOW:
      case Mode.STANDARD:
      case Mode.TURBO:
        return true
    }

    return false
  }

  private toHumidity2(humidity: Humidity): Humidity2 {
    switch (humidity) {
      case Humidity.LOW:
        return Humidity2.LOW
      case Humidity.STANDARD:
        return Humidity2.STANDARD
      case Humidity.HIGH:
        return Humidity2.HIGH
    }
    throw new Error('not implemented');
  }
}
