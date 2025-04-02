import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
	name: 'zeroaddprefix'
})
export class ZeroAddPrefixPipe implements PipeTransform {

	transform(value: string): string {
		let val = +value
		if (val === 0) {

			return val.toLocaleString('en-US', {
				minimumIntegerDigits: 1,
				useGrouping: false
			});
		} else {
			return val.toLocaleString('en-US', {
				minimumIntegerDigits: 2,
				useGrouping: false
			});
		}
	}
}