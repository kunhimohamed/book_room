// Copyright (c) 2024, kunhimohamed and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Customer Outstanding"] = {
	"filters": [
		{
			fieldname:"customer",
			label: __("Customer"),
			fieldtype: "Link",
			options: "Customer"
		}
	]
};
