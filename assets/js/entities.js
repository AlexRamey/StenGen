// Constants
var ENTITIES_PER_ROW = 3;

// This function adds a row to the specified table
// It copies the format of the first row and clears
// the inputs
function addRow(tableID) {
	var table = document.getElementById(tableID);

	var rowCount = table.rows.length;
	var row = table.insertRow(rowCount);

	var colCount = table.rows[0].cells.length;

	for(var i=0; i<colCount; i++) {

		var newcell	= row.insertCell(i);

		newcell.innerHTML = setRowNum(table.rows[0].cells[i].innerHTML, rowCount);
		//alert(newcell.childNodes);
		switch(newcell.childNodes[0].type) {
			case "text":
					newcell.childNodes[0].value = "";
					break;
			case "checkbox":
					newcell.childNodes[0].checked = false;
					break;
			case "select-one":
					newcell.childNodes[0].selectedIndex = 0;
					break;
		}
	}
}

// This function assumes that each row's first cell contains
// a checkbox. It deletes each checked row. It will always
// leave one row.
function deleteRow(tableID) 
{
	var table = document.getElementById(tableID);
	var rowCount = table.rows.length;

	for(var i=0; i<rowCount; i++) {
		var row = table.rows[i];
		var chkbox = row.cells[0].childNodes[0];
		if(null != chkbox && true == chkbox.checked) {
			if(rowCount <= 1) {
				break;
			}
			table.deleteRow(i);
			rowCount--;
			i--;
		}
	}

	// Re-configure the row numbers
	var rowCount = table.rows.length;
	var colCount = table.rows[0].cells.length;
	for (var i=0; i<rowCount; i++)
	{
		for (var j=0; j<colCount; j++)
		{
			var cell = table.rows[i].cells[j];
			cell.innerHTML = setRowNum(cell.innerHTML, i);
		}
	}
}

// This function is used to add an Entity to the table.
// It fills the Entity table across and then down,
// with a maximum of ENTITIES_PER_ROW entities per row.
function addEntity(tableID)
{
	var table = document.getElementById(tableID);
	var rowCount = table.rows.length;

	if (rowCount === 0)
	{
		table.insertRow(0);
		rowCount++;
	}

	var colCount = table.rows[rowCount-1].cells.length;

	var insertionRowIndex = rowCount - 1;
	var insertionColIndex = colCount;

	if (colCount === ENTITIES_PER_ROW)
	{
		table.insertRow(rowCount);
		insertionRowIndex = rowCount;
		insertionColIndex = 0;
	}

	var insertionRow = table.rows[insertionRowIndex];

	var newcell	= insertionRow.insertCell(insertionColIndex);

	var entityHTML = getEntityHTML();
	entityHTML = setCellNum(entityHTML, insertionRowIndex*ENTITIES_PER_ROW + insertionColIndex);
	entityHTML = setRowNum(entityHTML, 0);
	newcell.innerHTML = entityHTML;
}

function deleteEntity(tableID, entityIdentifier)
{
	entityIdentifier = entityIdentifier.replace(/_|{|}/g, "");
	entityNum = parseInt(entityIdentifier);
	
	var targetRowIndex = Math.floor(entityNum / ENTITIES_PER_ROW);
	var targetColIndex = (entityNum % ENTITIES_PER_ROW);
	
	var table = document.getElementById(tableID);
	var rowCount = table.rows.length;
	var finalRowColCount = table.rows[rowCount-1].cells.length;

	// Case 1: Entity to be deleted is last in table
	if ((targetRowIndex == (rowCount - 1)) && (targetColIndex == (finalRowColCount - 1)))
	{
		table.rows[targetRowIndex].deleteCell(targetColIndex);
	}
	else
	{
		// Case 2: Entity to be deleted is not last in table.
		// Strategy, start at the entity to be deleted and continuously
		// copy the next cell into the current one until finished
		for (var i = targetRowIndex; i < rowCount; i++)
		{
			for (var j = targetColIndex; j < ENTITIES_PER_ROW; j++)
			{
				if ((i == (rowCount - 1)) && (j == (finalRowColCount - 1)))
				{
					// finished;
					table.rows[i].deleteCell(j);
					break;
				}

				var nextCell = ((j!=2) ? table.rows[i].cells[j+1] : table.rows[i+1].cells[0]);
				table.rows[i].cells[j].innerHTML = setCellNum(nextCell.innerHTML, i*ENTITIES_PER_ROW + j);
			}
		}
	}

	// Cleanup
	if (finalRowColCount == 1)
	{
		table.deleteRow(targetRowIndex);
	}
}

// CellNum refers to the Entity Id. It is used
// to draw distinction between seperate Entities.
function setCellNum(html, num)
{
	return html.replace(/_{.*?}_/g, "_{" + num + "}_");
}

// RowNum refers to the Row Id within a given Entity.
// It creates distinction between properties of an Entity.
function setRowNum(html, num)
{
	return html.replace(/_\[.*?\]_/g,"_[" + num + "]_");
}

// The HTML that represents an Entity
function getEntityHTML()
{
	return "<div class=\"Entity\">\
				<div class=\"EntityTitle\">\
					<input class=\"EntityTitleInput\" type=\"text\" name=\"entityName_{cellNum}_\" STYLE=\"color: black; font-family: Verdana; font-weight: bold; font-size: 12px; background-color: rgba(255, 255, 255, 0.0); border-width: 0px;\" size=\"16\" maxlength=\"100\" placeholder=\"Name\">\
				</div>\
				<TABLE id=\"EntityTable_{cellNum}_\" border=\"1\">\
					<col span=\"1\" class=\"skinny\">\
					<TR class=\"EntityRow\">\
						<TD><INPUT type=\"checkbox\"/></TD>\
						<TD><INPUT type=\"text\" name=\"propertyName_{cellNum}_[rowNum]_\" class=\"EntityPropertyNameInput\"/></TD>\
						<TD>\
							<SELECT name=\"propertyType_{cellNum}_[rowNum]_}_\" class=\"EntityTypeSelection\">\
								<OPTION value=\"int\">Int</OPTION>\
								<OPTION value=\"string\">String</OPTION>\
								<OPTION value=\"bool\">Bool</OPTION>\
								<OPTION value=\"number\">Number</OPTION>\
								<OPTION value=\"data\">Binary</OPTION>\
							</SELECT>\
						</TD>\
					</TR>\
				</TABLE>\
				<div class = \"EntityButtonHolder\">\
					<button type=\"button\" onclick=\"addRow('EntityTable_{cellNum}_');\">New Attribute</button>\
				</div>\
				<div class = \"EntityButtonHolder\">\
					<button type=\"button\" onclick=\"deleteRow('EntityTable_{cellNum}_');\">Remove Selected</button>\
				</div>\
				<div class = \"EntityButtonHolder\">\
					<button type=\"button\" onclick=\"deleteEntity('SchemaTable', '_{cellNum}_');\">Delete Entity</button>\
				</div>\
			</div>";
}
