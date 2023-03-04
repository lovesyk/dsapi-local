import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { Humidity } from './dsapi/humidity.enum';
import { DsapiPcInner, DsapiRequestWrapper } from './dsapi/iface';
import { Mode } from './dsapi/mode.enum';

const IP = '172.16.0.195';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly httpService: HttpService) { }

  async setMode(mode: Mode, humidity: Humidity) {
    const data = this.createSetModeRequestWrapper(mode, humidity);
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
  ): DsapiRequestWrapper {
    return {
      requests: [
        {
          op: 3,
          pc: {
            pch: [
              {
                pch: [
                  {
                    pch: [
                      ...this.toFanPc(mode),
                      this.toModePc(mode, humidity),
                      ...this.toHumidityPc(mode, humidity),
                    ],
                    pn: 'e_3007',
                  },
                  {
                    pch: [
                      {
                        pn: 'p_3F',
                        pv: this.toHumidifierState(mode, humidity),
                      },
                    ],
                    pn: 'e_3001',
                  },
                  {
                    pch: [
                      {
                        pn: 'p_01',
                        pv: '01',
                      },
                    ],
                    pn: 'e_A002',
                  },
                ],
                pn: 'e_1002',
              },
            ],
            pn: 'dgc_status',
          },
          to: '/dsiot/edge/adr_0100.dgc_status',
        },
      ],
    };
  }

  private toFanPc(mode: Mode): DsapiPcInner[] {
    return this.isFanMode(mode)
      ? [
        {
          pn: 'p_06',
          pv: this.toFanPv(mode),
        },
      ]
      : [];
  }

  toFanPv(mode: Mode): string {
    switch (mode) {
      case Mode.QUIET:
        return '00';
      case Mode.LOW:
        return '01';
      case Mode.STANDARD:
        return '02';
      case Mode.TURBO:
        return '04';
    }
    throw new Error('not implemented');
  }

  private isFanMode(mode: Mode): boolean {
    return (
      mode === Mode.QUIET ||
      mode == Mode.LOW ||
      mode == Mode.STANDARD ||
      mode == Mode.TURBO
    );
  }

  private toModePc(mode: Mode, humidity: Humidity): DsapiPcInner {
    return {
      pn: this.toModePn(mode, humidity),
      pv: this.toModePv(mode),
    };
  }

  private toModePn(mode: Mode, humidity: Humidity): string {
    switch (mode) {
      case Mode.SMART:
        return 'p_01';
      case Mode.MOIST:
        return 'p_03'
      case Mode.ECONO:
      case Mode.AUTOFAN:
      case Mode.POLLEN:
      case Mode.CIRCULATOR:
      case Mode.QUIET:
      case Mode.LOW:
      case Mode.STANDARD:
      case Mode.TURBO:
        return humidity === Humidity.OFF ? 'p_01' : 'p_03';
    }
    throw new Error('not implemented');
  }

  private toModePv(mode: Mode): string {
    switch (mode) {
      case Mode.SMART:
        return '0000';
      case Mode.MOIST:
        return '0500';
      case Mode.AUTOFAN:
        return '0200';
      case Mode.POLLEN:
        return '0400';
      case Mode.ECONO:
        return '0300';
      case Mode.CIRCULATOR:
        return '0600';
      case Mode.QUIET:
      case Mode.LOW:
      case Mode.STANDARD:
      case Mode.TURBO:
        return '0100';
    }
    throw new Error('not implemented');
  }

  private toHumidityPc(mode: Mode, humidity: Humidity): DsapiPcInner[] {
    return humidity === Humidity.OFF
      ? []
      : [
        {
          pn: this.toHumidityPn(mode),
          pv: this.toHumidityPv(humidity),
        },
      ];
  }

  private toHumidityPn(mode: Mode): string {
    switch (mode) {
      case Mode.AUTOFAN:
        return 'p_14';
      case Mode.ECONO:
        return 'p_15';
      case Mode.POLLEN:
        return 'p_16';
      case Mode.CIRCULATOR:
        return 'p_18';
      case Mode.QUIET:
      case Mode.LOW:
      case Mode.STANDARD:
      case Mode.TURBO:
        return 'p_13';
    }
    throw new Error('not implemented');
  }

  private toHumidityPv(humidity: Humidity) {
    switch (humidity) {
      case Humidity.LOW:
        return '01';
      case Humidity.STANDARD:
        return '02';
      case Humidity.HIGH:
        return '03';
    }
    throw new Error('not implemented');
  }

  private toHumidifierState(mode: Mode, humidity: Humidity): string {
    switch (mode) {
      case Mode.SMART:
        return '00';
      case Mode.MOIST:
        return '02';
      case Mode.AUTOFAN:
      case Mode.ECONO:
      case Mode.POLLEN:
      case Mode.CIRCULATOR:
      case Mode.QUIET:
      case Mode.LOW:
      case Mode.STANDARD:
      case Mode.TURBO:
        return humidity == Humidity.OFF ? '00' : '02';
    }
    throw new Error('not implemented');
  }
}
