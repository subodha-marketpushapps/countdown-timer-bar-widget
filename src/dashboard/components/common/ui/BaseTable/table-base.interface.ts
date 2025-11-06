import { TableColumn } from "@wix/design-system";

export interface SortOption {
  fieldName: string;
  order: "desc" | "asc";
}

export interface TableConfig<T> {
  columnStructure: TableColumn[];
  customSortRules?: Record<string, CustomSortRule<T>>;
  tableData: T[];
  derivedTableElements: (data: T[], cellActions: FunctionList<T>) => T[];
}

export interface CustomSortRule<T> {
  compare(a: T, b: T): number | undefined;
}

export type FunctionList<T> = ((rowData: T) => void)[];
