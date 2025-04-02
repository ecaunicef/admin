import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'recursiveSearch'
})
export class RecursiveSearchPipe implements PipeTransform {

  transform(items: any[], searchText: string): any[] {
    if (!items || !searchText ) {
      return items;
    }

    searchText = searchText.toLowerCase();

    return this.filterItems(items, searchText);
  }

  private filterItems(items: any[], searchText: string): any[] {
    return items.filter(item => this.itemMatchesSearch(item, searchText));
  }

  private itemMatchesSearch(item: any, searchText: string): boolean {
    return item.name.toLowerCase().includes(searchText);    
  }

}
