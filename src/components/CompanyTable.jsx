import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function CompanyTable({
  data,
  columns,
  filename,
  selectedYear,
  editingRow,
}) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "descending",
  });

  const sortedData = [...data].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "ascending" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Function to format numbers with ₹ and % symbols for display
  const formatDisplayValue = (key, value) => {
    if (key === "profitPercentage") return `${value}%`;
    if (key === "month") return value;
    return `₹${value.toLocaleString()}`;
  };

  // Function to clean data for CSV export
  const cleanCSVValue = (key, value) => {
    if (typeof value === "number") return value; // Keep numbers as is
    if (key === "profitPercentage") return value.toString().replace("%", ""); // Remove %
    return value.toString().replace(/₹|,/g, ""); // Remove ₹ and commas
  };

  // Function to download CSV
  const downloadCSV = () => {
    const csvRows = [];

    // Add column headers
    const headers = columns.map((col) => `"${col.label}"`).join(",");
    csvRows.push(headers);

    // Add data rows (Removing ₹, %, and commas)
    sortedData.forEach((row) => {
      const rowData = columns
        .map((col) => {
          let value = cleanCSVValue(col.key, row[col.key]);
          return `"${value}"`; // Wrap values in double quotes
        })
        .join(",");
      csvRows.push(rowData);
    });

    // Convert array to CSV format
    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    // Create download link and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <div className=" underline font-bold font-ubuntu text-lg">
          Financial Data for {selectedYear} - {selectedYear + 1}
        </div>
        <Button
          onClick={downloadCSV}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Download
        </Button>
      </div>
      <Table className="w-full border-collapse">
        <TableHeader>
          <TableRow className="border-b border-gray-300">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className="cursor-pointer hover:bg-gray-100 transition-colors border-r border-gray-300 last:border-r-0 px-4 py-2 text-left"
                onClick={() => requestSort(column.key)}
              >
                {column.label}
                {sortConfig.key === column.key && (
                  <span>
                    {sortConfig.direction === "ascending" ? " ▲" : " ▼"}
                  </span>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((row, index) => {
            const isTotalRow = Object.values(row).some(
              (value) => typeof value === "string" && value.includes("Total")
            );

            return (
              <TableRow
                key={index}
                className={`border-b border-gray-200 ${
                  isTotalRow ? "bg-green-100 font-bold" : ""
                }`}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={`border-r border-gray-200 last:border-r-0 px-4 py-2 ${column.color}`}
                  >
                    {formatDisplayValue(column.key, row[column.key])}
                  </TableCell>
                ))}
                {editingRow && <TableCell className="px-4 py-2">
                  {!row.month.includes("Total") && (
                    <Button
                      className="bg-green-400 hover:bg-green-300 text-white px-3 py-1 rounded"
                      onClick={() => {
                        editingRow(row);
                        console.log(row);
                      }}
                    >
                      Edit
                    </Button>
                  )}
                </TableCell>}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
