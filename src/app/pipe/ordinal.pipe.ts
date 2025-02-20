import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "ordinal",
  pure: false
})
export class OrdinalPipe implements PipeTransform {
  transform(value: number): string {
    const str = String(value);
    const lastDigit = str[str.length - 1];

    switch (lastDigit) {
      case "1":
        return `${str}st`;
      case "2":
        return `${str}nd`;
      case "3":
        return `${str}rd`;
      default:
        return `${str}th`;
    }
  }
}