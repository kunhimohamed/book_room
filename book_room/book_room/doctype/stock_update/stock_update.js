// Copyright (c) 2024, kunhimohamed and contributors
// For license information, please see license.txt

frappe.ui.form.on('Stock Update', {
	setup: function(frm){

		frm.set_query("item_code", "stock_update_items", function(doc) {
			return {
				filters: {
					'is_stock_item': 1
				}
			}
		});

		frm.set_query("shelf", "stock_update_items", function(doc) {
			return {
				filters: {
					'is_group': 0
				}
			}
		});
	}
});
