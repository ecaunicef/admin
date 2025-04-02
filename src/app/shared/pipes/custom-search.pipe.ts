import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customSearch'
})
export class CustomSearchPipe implements PipeTransform {

  transform(items: any[], key:string, searchText: string): any[] {
    // console.log(items)
    if (!items || !searchText) {
      return items;
    }
    
    searchText = searchText.toLowerCase();

    return items.map(item => {
      const itemCopy = { ...item };
      itemCopy.show = item[key].toLowerCase().includes(searchText);
      return itemCopy;
    });
  }

}
