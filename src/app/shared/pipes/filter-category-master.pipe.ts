import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterCategoryMaster'
})
export class FilterCategoryMasterPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {

    searchText = searchText.toLowerCase();

    if (!items || !searchText) {
      return items;
    }
    
    return items.filter(item => {
      // Apply your filtering logic based on columnName and searchText
      // For example, filter by item[columnName] and searchText
      return item.list_name.toLowerCase().includes(searchText);
    });
   
  }
  

}
