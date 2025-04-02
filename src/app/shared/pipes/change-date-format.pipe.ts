import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'changeDateFormat'
})
export class ChangeDateFormatPipe implements PipeTransform {

  transform(value: any, fromFormat: string, toFormat: string): any {

    if (value && fromFormat && toFormat) {
      const parsedDate = moment(value, fromFormat);
      if (parsedDate.isValid()) {
        return parsedDate.format(toFormat);
      }
    }
    return value;
  }

}
