import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {
  transform(countries: any, SearchText: string): any {
    if(!SearchText) {
      return countries;
    }
    return countries.filter((country) => {
      return country.name.toLowerCase().match(SearchText.toLowerCase()) || country.code.toLowerCase().match(SearchText.toLowerCase());
    });
  }

}