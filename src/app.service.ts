import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import RequestMapper from './purifier/requestMapper';
import { Humidify, Power, Purify } from './purifier/request.local';
import { DsapiRequest } from './purifier/request.dsapi';

const IP = '172.16.0.195';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private readonly httpService: HttpService) { }

  async setMode(mode: Purify, humidity: Humidify) {
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
    mode: Purify,
    humidity: Humidify,
  ): DsapiRequest {
    const mapper = new RequestMapper({ power : Power.ON, purify: mode, humidify: humidity})
    return mapper.map()
  }
}
