import { SortOption, CustomSortRule } from "./table-base.interface";

// Sort function logic extracted to make the code cleaner
const sortData = <T>(
  data: T[],
  sort: SortOption | undefined,
  customSortRules?: Record<string, CustomSortRule<T>>
): T[] => {
  if (!sort) return data;
  const { fieldName, order } = sort;

  return data.sort((a: T, b: T) => {
    const aValue = a[fieldName as keyof T] as unknown;
    const bValue = b[fieldName as keyof T] as unknown;

    // Handle custom sort rule
    if (customSortRules?.[fieldName]) {
      const comparisonResult = customSortRules[fieldName].compare(a, b);
      if (comparisonResult !== undefined)
        return order === "asc" ? comparisonResult : -comparisonResult;
    }

    // Handle nullish values (null or undefined)
    if (aValue == null || bValue == null) {
      return aValue == null ? 1 : -1;
    }

    let comparisonResult = 0;

    // Handle default sorting logic for common types
    switch (typeof aValue) {
      case "string":
        comparisonResult = (aValue as string).localeCompare(bValue as string);
        break;
        case "number":
        comparisonResult = (aValue as number) - (bValue as number);
        break;
      case "boolean":
        comparisonResult = aValue === bValue ? 0 : aValue ? 1 : -1;
        break;
      case "object":
        if (aValue instanceof Date && bValue instanceof Date) {
          comparisonResult =
            (aValue as Date).getTime() - (bValue as Date).getTime();
        }
        break;
      default:
        // Unknown or unsupported types are considered equal
        comparisonResult = 0;
    }

    return order === "asc" ? comparisonResult : -comparisonResult;
  });
};

export default sortData;
