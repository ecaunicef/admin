import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items:any[],key:any, searchValue:any): unknown {
    if([items.length,searchValue.length].includes(0))return items;


    if(key!=null){
      return items.filter(x=> x[key].toLowerCase().includes(searchValue.toLowerCase()) );
    }
    return items.filter(x=> x.toLowerCase().includes(searchValue.toLowerCase()) );
    
  }

}
