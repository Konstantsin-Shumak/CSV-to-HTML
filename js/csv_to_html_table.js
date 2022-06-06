var CsvToHtmlTable = CsvToHtmlTable || {};

CsvToHtmlTable = {
    init: function (options) {
        options = options || {};
        var csv_path = options.csv_path || "";
        var el = options.element || "table-container";
        var csv_options = options.csv_options || {};
        var datatables_options = options.datatables_options || {};
        var custom_formatting = options.custom_formatting || [];
        var customTemplates = {};
        $.each(custom_formatting, function (i, v) {
            var colIdx = v[0];
            var func = v[1];
            customTemplates[colIdx] = func;
        });

        var $table = $("<table class='table table-striped table-condensed' id='" + el + "-table'></table>");
        var $containerElement = $("#" + el);
        $containerElement.empty().append($table);

        $.when($.get(csv_path)).then(
            function (data) {
                var csvData = $.csv.toArrays(data, csv_options);
                var $tableHead = $("<thead></thead>");
                var csvHeaderRow = csvData[0];
                var $tableHeadRow = $("<tr></tr>");
                for (var headerIdx = 0; headerIdx < 2; headerIdx++) {
                    $tableHeadRow.append($("<th></th>").text(csvHeaderRow[headerIdx]));
                }
                $tableHead.append($tableHeadRow);

                $table.append($tableHead);
                var $tableBody = $("<tbody></tbody>");
                var rowsInfo = [];

                for (var rowIdx = 1; rowIdx < csvData.length; rowIdx++) {
                    var $tableBodyRow = $(`<tr class="rows" id="table-row-${rowIdx}" data-open="close"></tr>`);
                    for (var colIdx = 0; colIdx < 2; colIdx++) {
                        var $tableBodyRowTd = $("<td></td>");
                        var cellTemplateFunc = customTemplates[colIdx];
                        if (cellTemplateFunc) {
                            $tableBodyRowTd.html(cellTemplateFunc(csvData[rowIdx][colIdx]));
                        } else {
                            $tableBodyRowTd.text(csvData[rowIdx][colIdx]);
                        }
                        $tableBodyRow.append($tableBodyRowTd);
                        $tableBody.append($tableBodyRow);

                    }
                    rowsInfo.push({ tableRow: $tableBodyRow, data: csvData[rowIdx][2] });
                }
                $table.append($tableBody);

                $table.DataTable(datatables_options);

                return rowsInfo;

            }).then((rowsInfo) => {
                rowsInfo.forEach(
                    rowInfo => rowInfo.tableRow.click((e) => {
                        if (rowInfo.tableRow[0].getAttribute("data-open") === "close") {
                            rowInfo.tableRow.after(`
                             <tr class="rows odd " role="row">
                                 <td colspan="2" class="sorting_1 save-block">
                                     <input type="text" value="${!rowInfo.data ? "" : rowInfo.data}" />
                                     <button id="saveButton">Save</button>
                                 </td>
                             </tr>
                             `);
                            rowInfo.tableRow[0].setAttribute("data-open", "open");
                        } else {
                            rowInfo.tableRow.next().remove();
                            rowInfo.tableRow[0].setAttribute("data-open", "close");
                        }
                    }));
                document.getElementById("saveButton").onclick = function () {
                    const fs = require('fs')

                    const content = 'this is what i want to write to file'

                    fs.writeFile('../data/test.csv', content, err => {
                        if (err) {
                            console.error(err)
                            return
                        }
                        //file written successfully
                    })
                }
            });
    }
};