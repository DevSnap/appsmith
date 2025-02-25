import { uniq, without } from "lodash";
import { ColumnProperties } from "./Constants";

export const removeSpecialChars = (value: string, limit?: number) => {
  const separatorRegex = /\s/;
  return value
    .split(separatorRegex)
    .join("_")
    .slice(0, limit || 30);
};

export const getAllTableColumnKeys = (
  tableData: Array<Record<string, unknown>>,
) => {
  const columnKeys: string[] = [];
  for (let i = 0, tableRowCount = tableData.length; i < tableRowCount; i++) {
    const row = tableData[i];
    for (const key in row) {
      // Replace all special characters to _, limit key length to 200 characters.
      const sanitizedKey = removeSpecialChars(key, 200);
      if (!columnKeys.includes(sanitizedKey)) {
        columnKeys.push(sanitizedKey);
      }
    }
  }
  return columnKeys;
};

export const reorderColumns = (
  columns: Record<string, ColumnProperties>,
  columnOrder: string[],
) => {
  const newColumnsInOrder: Record<string, ColumnProperties> = {};
  uniq(columnOrder).forEach((id: string, index: number) => {
    if (columns[id]) newColumnsInOrder[id] = { ...columns[id], index };
  });
  const remaining = without(
    Object.keys(columns),
    ...Object.keys(newColumnsInOrder),
  );
  const len = Object.keys(newColumnsInOrder).length;
  if (remaining && remaining.length > 0) {
    remaining.forEach((id: string, index: number) => {
      newColumnsInOrder[id] = { ...columns[id], index: len + index };
    });
  }
  return newColumnsInOrder;
};
