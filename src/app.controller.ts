import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Put
} from '@nestjs/common';
import { AppService } from './app.service';
import { SetModeRequest } from './rest/setmode.request';
import { Humidify, Purify } from './purifier/request.local';

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

  private toMode(mode?: string): Purify | null {
    if (mode) {
      switch (mode.toLowerCase()) {
        case 'smart':
          return Purify.SMART;
        case 'autofan':
          return Purify.AUTOFAN;
        case 'econo':
          return Purify.ECONO;
        case 'pollen':
          return Purify.POLLEN;
        case 'moist':
          return Purify.MOIST;
        case 'circulator':
          return Purify.CIRCULATOR;
        case 'quiet':
          return Purify.QUIET;
        case 'low':
          return Purify.LOW;
        case 'standard':
          return Purify.STANDARD;
        case 'turbo':
          return Purify.TURBO;
      }
    }

    return null;
  }

  private toHumidity(mode: Purify, humidity?: string): Humidify | null {
    if (mode === Purify.SMART || mode === Purify.MOIST) {
      return humidity ? null : Humidify.OFF;
    }

    if (humidity) {
      switch (humidity.toLowerCase()) {
        case 'off':
          return Humidify.OFF;
        case 'low':
          return Humidify.LOW;
        case 'standard':
          return Humidify.STANDARD;
        case 'high':
          return Humidify.HIGH;
      }
    }

    return null;
  }
}
