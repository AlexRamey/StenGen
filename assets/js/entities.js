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

	row.className = "EntityRow";
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
			if ((cell.childNodes[0].type == "text") || (cell.childNodes[0].type == "select-one"))
			{
				cell.childNodes[0].name = setRowNum(cell.childNodes[0].name , i);
			}
			else if ((cell.childNodes.length > 1) && (cell.childNodes[1].type == "select-one"))
			{
				cell.childNodes[1].name = setRowNum(cell.childNodes[1].name , i);
			}
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
		var row = table.insertRow(0);
		row.className = "SchemaRow";
		rowCount++;
	}

	var colCount = table.rows[rowCount-1].cells.length;

	var insertionRowIndex = rowCount - 1;
	var insertionColIndex = colCount;

	if (colCount === ENTITIES_PER_ROW)
	{
		var row = table.insertRow(rowCount);
		row.className = "SchemaRow";
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

// This function deletes an entity from the table, and updates
// all entity cell_nums and values accordingly.
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
			var j = ((i == targetRowIndex) ? (targetColIndex) : (0));
			for (j; j < ENTITIES_PER_ROW; j++)
			{
				if ((i == (rowCount - 1)) && (j == (finalRowColCount - 1)))
				{
					// finished;
					table.rows[i].deleteCell(j);
					break;
				}
				
				var nextCell = ((j!=2) ? table.rows[i].cells[j+1] : table.rows[i+1].cells[0]);
				var curCell = table.rows[i].cells[j];
				curCell.innerHTML = setCellNum(nextCell.innerHTML, i*ENTITIES_PER_ROW + j);
				recursiveCopy(curCell, nextCell);
			}
		}
	}

	// Cleanup
	if (finalRowColCount == 1)
	{
		table.deleteRow(rowCount - 1);
	}
}

// Performs a recursive copy. This is helpful for copying all
// input values from one Entity to another. InnerHTML of the
// entity cell in the schema table doesn't include these values.
function recursiveCopy(toChild, fromChild)
{
	// base case
	if ((fromChild.children.length == 0) || (fromChild.type == "select-one"))
	{
		switch(fromChild.type) {
			case "text":
					toChild.value = fromChild.value;
					break;
			case "checkbox":
					toChild.checked = fromChild.checked;
					break;
			case "select-one":
					toChild.selectedIndex = fromChild.selectedIndex;
					break;
			}
	}
	else
	{
		// recursive case
		for (var i=0; i<fromChild.children.length; i++)
		{
			recursiveCopy(toChild.children[i], fromChild.children[i]);
		}
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
					<input class=\"EntityTitleInput\" type=\"text\" name=\"entityName_{cellNum}_\" STYLE=\"color: black; font-family: Verdana; font-weight: bold; font-size: 12px; background-color: rgba(255, 255, 255, 0.0); border-width: 0px;\" size=\"16\" maxlength=\"100\" placeholder=\"Enter Name\">\
				</div>\
				<TABLE id=\"EntityTable_{cellNum}_\" border=\"1\" class=\".table\" STYLE=\"width: 100%;\">\
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
					<button type=\"button\" onclick=\"addRow('EntityTable_{cellNum}_');\">Add Row</button>\
				</div>\
				<div class = \"EntityButtonHolder\">\
					<button type=\"button\" onclick=\"deleteRow('EntityTable_{cellNum}_');\">Delete Rows</button>\
				</div>\
				<div class = \"EntityButtonHolder\">\
					<button type=\"button\" onclick=\"deleteEntity('SchemaTable', '_{cellNum}_');\">Remove</button>\
				</div>\
			</div>";
}
