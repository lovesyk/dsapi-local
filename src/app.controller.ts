import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Put
} from '@nestjs/common';
import { AppService } from './app.service';
import { Humidity } from './dsapi/humidity.enum';
import { Mode } from './dsapi/mode.enum';
import { SetModeRequest } from './rest/setmode.request';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Put('mode')
  async setMode(@Body() setModeRequest: SetModeRequest) {
    const mode = this.toMode(setModeRequest.mode);
    if (mode === null) {
      throw new HttpException('Invalid mode', HttpStatus.BAD_REQUEST);
    }
    const humidity = this.toHumidity(mode, setModeRequest.humidity);
    if (humidity === null) {
      throw new HttpException('Invalid humidity', HttpStatus.BAD_REQUEST);
    }

    await this.appService.setMode(mode, humidity);
  }

  private toMode(mode?: string): Mode | null {
    if (mode) {
      switch (mode.toLowerCase()) {
        case 'smart':
          return Mode.SMART;
        case 'autofan':
          return Mode.AUTOFAN;
        case 'econo':
          return Mode.ECONO;
        case 'pollen':
          return Mode.POLLEN;
        case 'moist':
          return Mode.MOIST;
        case 'circulator':
          return Mode.CIRCULATOR;
        case 'quiet':
          return Mode.QUIET;
        case 'low':
          return Mode.LOW;
        case 'standard':
          return Mode.STANDARD;
        case 'turbo':
          return Mode.TURBO;
      }
    }

    return null;
  }

  private toHumidity(mode: Mode, humidity?: string): Humidity | null {
    if (mode === Mode.SMART || mode === Mode.MOIST) {
      return humidity ? null : Humidity.OFF;
    }

    if (humidity) {
      switch (humidity.toLowerCase()) {
        case 'off':
          return Humidity.OFF;
        case 'low':
          return Humidity.LOW;
        case 'standard':
          return Humidity.STANDARD;
        case 'high':
          return Humidity.HIGH;
      }
    }

    return null;
  }
}
