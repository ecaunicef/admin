import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {

  transform(value: any, args: string): any {
    // console.log(value, args,'serice');
    
    if(!value) return []
    if(!args) return value
    args = args.toLowerCase();

    return value.filter((item:any)=>{
      return item.toLowerCase().includes(args);
    })

    // return null;
  }

}
