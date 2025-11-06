import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Box,
  InfoIcon,
  TableToolbar,
  Table,
  Card,
  TableColumn,
  Page,
  SkeletonGroup,
  SkeletonLine,
  Search,
} from "@wix/design-system";
import { TableState, TableStateProps } from "./TableState";
import { EmptyTableTitle } from "./TableSkeleton";

import { SortOption, TableConfig, FunctionList } from "./table-base.interface";
import _ from "lodash";
import sortData from "./table-sort";

const BaseTable = <T,>({
  isTableReadyToRender,
  tableData,
  cardTitle = "Table Card Title",
  titleTooltip = "Table Card Tooltip",
  tableStateContent = {
    loadingState: {
      title: "Loading...",
    },
    errorState: {
      title: "Unable to load the table",
      subtitle: "There was a technical issue. Please try again later.",
      intercomMessage:
        "I am experiencing a data loading issue with the table. Can you assist?",
      intercomButtonLabel: "Contact Support",
    },
    emptyState: {
      title: "No data available",
      subtitle: "Data will appear here once available.",
    },
    noSearchResultsState: {
      title: "No search results",
      subtitle:
        "No items match your search criteria. Try to search by another keyword",
    },
  },
  tableConfig = {
    columnStructure: [],
    tableData: [],
    derivedTableElements: () => [],
  },
  error,
  cellActions = [],
  enableSearchBar = false,
  containerType = "page",
  hideOverflow = true,
  selectionToolbarAction,
  showSelection,
  hideBulkSelectionCheckbox,
  onSelectionChange,
  selectionDisabled,
}: {
  isTableReadyToRender: boolean;
  tableData: T[];
  cardTitle: string;
  titleTooltip: string;
  error: string | null;
  tableStateContent: {
    loadingState: TableStateProps;
    errorState: TableStateProps;
    emptyState: TableStateProps;
    noSearchResultsState?: TableStateProps;
  };
  tableConfig: TableConfig<T>;
  cellActions?: FunctionList<T>;
  selectionToolbarAction?: React.ReactNode;
  enableSearchBar?: boolean;
  containerType?: "page" | "modal";
  hideOverflow?: boolean;
  showSelection?: boolean;
  hideBulkSelectionCheckbox?: boolean;
  onSelectionChange?: (tableRows: T[]) => void;
  selectionDisabled?: (rowData: T) => boolean;
}) => {
  // console.log(`🧩 BaseTable [${cardTitle}]`);

  const [sort, setSort] = useState<SortOption | undefined>();
  const [columns, setColumns] = useState<TableColumn[]>(
    tableConfig.columnStructure
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const previousSelectedRawIds = useRef<string[]>([]);

  useEffect(() => {
    const index = getFirstSortableColumn();
    if (index !== -1) {
      handleInitialSort(tableConfig.columnStructure[index], index);
    }

    setColumns(tableConfig.columnStructure);
  }, [tableConfig.columnStructure]);

  const markedTableData = useMemo(() => {
    return tableData.map((data, index) => {
      return {
        ...data,
        rowId: index,
      };
    });
  }, [tableData]);

  const tableRecords = useMemo(
    () => tableConfig.derivedTableElements(markedTableData, cellActions),
    [markedTableData, cellActions, tableConfig.columnStructure]
  );

  const filteredData = useMemo(() => {
    if (!searchTerm) {
      return sortData(tableRecords, sort, tableConfig.customSortRules);
    }

    const modifiedData = tableRecords.filter((row) =>
      Object.values(row as Record<string, unknown>).some((value) =>
        String(value).toUpperCase().includes(searchTerm.toUpperCase())
      )
    );

    return sortData(modifiedData, sort, tableConfig.customSortRules);
  }, [tableRecords, sort, tableConfig.customSortRules, searchTerm]);

  const handleSort = (colData: TableColumn, colNum: number) => {
    const newOrder = colData.sortDescending ? "asc" : "desc";
    const sortOption: SortOption = {
      fieldName: String(colData.key), // Ensure fieldName is string
      order: newOrder,
    };
    if (sort?.fieldName === sortOption.fieldName && sort?.order === newOrder) {
      return;
    }
    setSort(sortOption);
    setColumns((prevColumns) =>
      prevColumns.map((column) => {
        if (sortOption.fieldName === column.key) {
          return { ...column, sortDescending: newOrder !== "asc" };
        }
        return { ...column, sortDescending: undefined };
      })
    );
  };

  const handleInitialSort = (colData: TableColumn, colNum: number) => {
    const order = colData.sortDescending ? "desc" : "asc";
    const sortOption: SortOption = {
      fieldName: String(colData.key),
      order: order,
    };
    setSort(sortOption);
  };

  const getFirstSortableColumn = () => {
    return columns.findIndex(
      (col) => col.sortable && col.sortDescending !== undefined
    );
  };

  const noData = tableRecords.length === 0;

  const _clearSearch = () => {
    setSearchTerm("");
  };

  const _renderSearch = (expandable: boolean = false) => {
    return (
      <Search
        size="small"
        expandable={expandable}
        onChange={(e) => {
          setSearchTerm(e.target.value);
        }}
        value={searchTerm}
        onClear={_clearSearch}
      />
    );
  };

  useEffect(() => {
    if (!onSelectionChange || !showSelection) return;
    const selectedRawIds = selectedIds
      .map(
        (id) =>
          // @ts-ignore
          filteredData.find((_, index) => index === id)?.rowId
      )
      .filter((rawId, index) => {
        if (rawId === undefined) {
          setSelectedIds((prev) => prev.filter((_, i) => i !== index));
          return false;
        }
        return true;
      });

    const oldRawIds = previousSelectedRawIds.current;

    if (!_.isEqual(selectedRawIds, oldRawIds)) {
      previousSelectedRawIds.current = [...selectedRawIds];
      onSelectionChange(selectedIds.map((id) => filteredData[id] as T));
    }
  }, [selectedIds, filteredData, onSelectionChange, columns]);

  useEffect(() => {
    if (!isTableReadyToRender) {
      setSelectedIds([]);
    }
  }, [isTableReadyToRender]);

  return (
    <Table
      data={filteredData}
      columns={columns}
      rowVerticalPadding="medium"
      onSortClick={handleSort}
      onSelectionChanged={(e) => {
        if (Array.isArray(e)) setSelectedIds(e.map((id) => Number(id)));
      }}
      width="100%"
      rowClass="table-row"
      showSelection={showSelection}
      hideBulkSelectionCheckbox={hideBulkSelectionCheckbox}
      selectedIds={selectedIds}
      selectionDisabled={selectionDisabled}
    >
      <Page.Sticky
        className={
          containerType == "modal" ? "table-sticky-header-for-modal" : undefined
        }
      >
        <Card className="half-card-borders">
          <TableToolbar>
            <TableToolbar.ItemGroup position="start">
              <TableToolbar.Item>
                <TableToolbar.Title>
                  {isTableReadyToRender && (
                    <Box align="center" verticalAlign="middle" gap={0.5}>
                      {cardTitle}
                      <InfoIcon size="medium" content={titleTooltip} />
                    </Box>
                  )}
                  {!isTableReadyToRender && (
                    <SkeletonGroup>
                      <SkeletonLine width="180px" />
                    </SkeletonGroup>
                  )}
                </TableToolbar.Title>
              </TableToolbar.Item>
            </TableToolbar.ItemGroup>
            {isTableReadyToRender && (
              <TableToolbar.ItemGroup position="end">
                {showSelection &&
                  selectionToolbarAction &&
                  selectionToolbarAction}
                {enableSearchBar && (
                  <TableToolbar.Item>{_renderSearch()}</TableToolbar.Item>
                )}
              </TableToolbar.ItemGroup>
            )}
          </TableToolbar>
          {isTableReadyToRender && !noData && !error && <Table.Titlebar />}
          {!isTableReadyToRender && <EmptyTableTitle />}
        </Card>
      </Page.Sticky>
      <Card hideOverflow={hideOverflow} className="table-wrapper-card">
        {!isTableReadyToRender && !error && (
          <TableState stateType="loading" {...tableStateContent.loadingState} />
        )}
        {isTableReadyToRender && error && (
          <TableState stateType="error" {...tableStateContent.errorState} />
        )}
        {isTableReadyToRender && !error && noData && (
          <TableState stateType="empty" {...tableStateContent.emptyState} />
        )}
        {isTableReadyToRender &&
          !error &&
          searchTerm &&
          !filteredData.length && (
            <TableState
              stateType="noSearchResults"
              {...tableStateContent.noSearchResultsState}
              innerActionFunction={_clearSearch}
            />
          )}
        {isTableReadyToRender && !error && !noData && (
          <Table.Content titleBarVisible={false} />
        )}
      </Card>
    </Table>
  );
};

export default BaseTable;
