declare namespace acsv
{
    class Field
    {
        /**
         * Full Name.
         */
        fullName: string;
        /**
         * Name.
         */
        name: string;
        /**
         * Type.
         */
        type: string;
    }
    /**
     * 1. Copyright (c) 2022 amin2312
     * 2. Version 1.0.0
     * 3. MIT License
     *
     * ACsv is a easy, fast and powerful csv parse library.
     */
    class Table
    {
        /**
         * The raw content.
         */
        content: number;
        /**
         * Parsed csv table Head.
         */
        head: Array<Field>;
        /**
         * Parsed csv table Body.
         */
        body: Array<Array<any>>;
        /**
         * Merge a table.
         * <br/><b>Notice:</b> two tables' structure must be same.
         * @param b source table
         * @return THIS instance
         */
        merge(b: Table): Table;
        /**
         * Create index for the specified column.
         * <br>This function is only valid for "selectWhenE" and "limit" param is 1.
         * <br>It will improve performance.
         * @param colIndex column index
         */
        createIndexAt(colIndex: number): void;
        /**
         * Get column index by specified field name.
         * @param name As name mean
         * @return column index
         */
        getColIndexBy(name: String): number;
        /**
         * Fetch a row object when the column's value is equal to the id value
         * @param values the specified value
         * @param colIndex specified column index
         * @return selected row object
         */
        id(value: any, colIndex?: number): any;
        /**
         * Sort by selected rows.
         * @param colIndex the column index specified for sorting
         * @param sortType 0: asc, 1: desc
         * @return THIS instance (for Method Chaining), can call "to..." or "select..." function in next step.
         */
        sortBy(colIndex: number, sortType: number): Table;
        /**
         * Get current selector(it includes all selected results).
         * <br><b>Notice:</b> It be assigned after call "select..." function
         * @return current selector
         */
        getCurrentSelector(): Array<any>;
        /**
         * Fetch first selected result to a row and return it.
         * @return first selected row data
         */
        toFirstRow(): Array<any>;
        /**
         * Fetch last selected result to a row and return it.
         * @return last selected row data
         */
        toLastRow(): Array<any>;
        /**
         * Fetch all selected results to the rows and return it.
         * @return a array of row data
         */
        toRows(): Array<Array<any>>;
        /**
         * Fetch first selected result to a object and return it.
         * @return first selected row object
         */
        toFirstObj(): any;
        /**
         * Fetch last selected result to a object and return it.
         * @return last selected row object
         */
        toLastObj(): any;
        /**
         * Fetch all selected results to the objects and return it.
         * @return a array of row object
         */
        toObjs(): Array<any>;
        /**
         * Fetch all selected results to a new table.
         * @return a new table instance
         */
        toTable(): Table;
        /**
         * Select all rows.
         * @return THIS instance (for Method Chaining), can call "to..." or "select..." function in next step.
         */
        selectAll(): Table;
        /**
         * Select the first row.
         * @return THIS instance (for Method Chaining), can call "to..." or "select..." function in next step.
         */
        selectFirstRow(): Table;
        /**
         * Select the last row.
         * @return THIS instance (for Method Chaining), can call "to..." or "select..." function in next step.
         */
        selectLastRow(): Table
        /**
         * Selects the specified <b>rows</b> by indices.
         * @param rowIndices specified row's indices
         * @return THIS instance (for Method Chaining), can call "to..." or "select..." function in next step.
         */
        selectAt(rowIndices: Array<number>): Table
        /**
         * Select the rows when the column's value is equal to any value of array.
         * @param limit maximum length of every selected results (0 is infinite, if you only need 1 result, 1 is recommended, it will improve performance)
         * @param values the array of values
         * @param colIndex specified column index
         * @return THIS instance (for Method Chaining), can call "to..." or "select..." function in next step.
         */
        selectWhenIn(limit: number, values: Array<any>, colIndex?: number): Table
        /**
         * Select the rows when the column's value is equal to specified value.
         * @param limit maximum length of selected results (0 is infinite, if you only need 1 result, 1 is recommended, it will improve performance)
         * @param value the specified value
         * @param colIndex specified column index
         * @param extraSelector extra selector, use it to save selected result
         * @return THIS instance (for Method Chaining), can call "to..." or "select..." function in next step.
         */
        selectWhenE(limit: number, value: any, colIndex?: number): Table
        /**
         * Select the rows when the column's values are equal to specified values.
         * @param limit maximum length of selected results (0 is infinite, if you only need 1 result, 1 is recommended, it will improve performance)
         * @param value1 first specified value
         * @param value2 second specified value
         * @param colIndex2 second specified column index
         * @param colIndex1 first specified column index
         * @return THIS instance (for Method Chaining), can call "to..." or "select..." function in next step.
         */
        selectWhenE2(limit: number, value1: any, value2: any, colIndex2?: number, colIndex1?: number): Table
        /**
         * Select the rows when the column's values are equal to specified values.
         * @param limit maximum length of selected results (0 is infinite, if you only need 1 result, 1 is recommended, it will improve performance)
         * @param value1 first specified value
         * @param value2 second specified value
         * @param value3 third specified value
         * @param colIndex3 third specified column index
         * @param colIndex2 second specified column index
         * @param colIndex1 first specified column index
         * @return THIS instance (for Method Chaining), can call "to..." or "select..." function in next step.
         */
        selectWhenE3(limit: number, value1: any, value2: any, value3: any, colIndex3?: number, colIndex2?: number, colIndex1?: number): Table
        /**
         * Select the rows when the column's value is greater than specified value.
         * @param limit maximum length of selected results (0 is infinite, if you only need 1 result, 1 is recommended, it will improve performance)
         * @param withEqu whether include equation
         * @param value the specified value
         * @param colIndex specified column index
         * @return THIS instance (for Method Chaining), can call "to..." or "select..." function in next step.
         */
        selectWhenG(limit: number, withEqu: boolean, value: number, colIndex?: number): Table
        /**
         * Select the rows when the column's value is less than specified values.
         * @param limit maximum length of selected results (0 is infinite, if you only need 1 result, 1 is recommended, it will improve performance)
         * @param withEqu whether include equation
         * @param value the specified value
         * @param colIndex specified column index
         * @return THIS instance (for Method Chaining), can call "to..." or "select..." function in next step.
         */
        selectWhenL(limit: number, withEqu: boolean, value: number, colIndex?: number): Table
        /**
         * Select the rows when the column's value is greater than specified value <b>and</b> less than specified value.
         * @param limit maximum length of selected results (0 is infinite, if you only need 1 result, 1 is recommended, it will improve performance)
         * @param GWithEqu whether greater and equal
         * @param LWithEqu whether less and equal
         * @param GValue the specified greater value
         * @param LValue the specified less value
         * @param colIndex specified column index
         * @return THIS instance (for Method Chaining), can call "to..." or "select..." function in next step.
         */
        selectWhenGreaterAndLess(limit: number, GWithEqu: boolean, LWithEqu: boolean, GValue: number, LValue: number, colIndex?: number): Table
        /**
         * Select the rows when the column's value is less than specified value <b>or</b> greater than specified value.
         * @param limit maximum length of selected results (0 is infinite, if you only need 1 result, 1 is recommended, it will improve performance)
         * @param LWithEqu whether less and equal
         * @param GWithEqu whether greater and equal
         * @param LValue the specified less value
         * @param GValue the specified greater value
         * @param colIndex specified column index
         * @return THIS instance (for Method Chaining), can call "to..." or "select..." function in next step.
         */
        selectWhenLessOrGreater(limit: number, LWithEqu: boolean, GWithEqu: boolean, LValue: number, GValue: number, colIndex?: number): Table
        /**
         * Parse csv conent.
         * @param content As name mean
         * @param filedSeparator filed separator
         * @param filedDelimiter filed delimiter
         * @return a table instance
         */
        static Parse(content: String, filedSeparator?: String, filedDelimiter?: String): Table;
    }
}