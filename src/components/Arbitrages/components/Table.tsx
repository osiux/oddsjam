import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnDef,
} from '@tanstack/react-table';
import { Table as MantineTable } from '@mantine/core';
import { useLocalStorage } from 'usehooks-ts';

export type TableProps<T> = {
  data: T[];
  columns: ColumnDef<T, any>[];
};

const Table = <T = any,>({ data = [], columns = [] }: TableProps<T>) => {
  const [sorting, setSorting] = useLocalStorage<SortingState>('sortingState', []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <MantineTable.ScrollContainer minWidth={500}>
      <MantineTable striped highlightOnHover withTableBorder>
        <MantineTable.Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <MantineTable.Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <MantineTable.Th key={header.id} colSpan={header.colSpan}>
                  {header.isPlaceholder ? null : (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                    <div
                      role="button"
                      tabIndex={0}
                      className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                      onClick={header.column.getToggleSortingHandler()}
                      title={
                        header.column.getCanSort()
                          ? header.column.getNextSortingOrder() === 'asc'
                            ? 'Sort ascending'
                            : header.column.getNextSortingOrder() === 'desc'
                              ? 'Sort descending'
                              : 'Clear sort'
                          : undefined
                      }
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </MantineTable.Th>
              ))}
            </MantineTable.Tr>
          ))}
        </MantineTable.Thead>
        <MantineTable.Tbody>
          {table.getRowModel().rows.map((row) => (
            <MantineTable.Tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <MantineTable.Td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </MantineTable.Td>
              ))}
            </MantineTable.Tr>
          ))}
        </MantineTable.Tbody>
      </MantineTable>
    </MantineTable.ScrollContainer>
  );
};

export { Table, createColumnHelper };
