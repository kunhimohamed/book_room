// Copyright (c) 2024, kunhimohamed and contributors
// For license information, please see license.txt

frappe.ui.form.on('Import From Frappe', {
	refresh: function(frm) {
		frm.disable_save();
		frm.trigger("setup_buttons");
	},
	setup_buttons: function (frm) {
		frm.clear_custom_buttons();
		frm.add_custom_button(__("Fetch"), () => {
			frm.page_number = 1;
			frm.trigger("fetch_from_frappe_api");
		}, __('Action'));
		frm.add_custom_button(__("Upload To The System"), () => frm.trigger("upload_to_system"), __('Action'));
	},
	fetch_from_frappe_api: function(frm) {

		// clear the table if it is not Next from button
		if(frm.page_number == 1){
			frm.clear_table("import_from_frappe_items");
			frm.toggle_display("section_break_tyolp", false);
			frm.toggle_display("import_from_frappe_items", false);
			frm.toggle_display("next", false);
		}

		frappe.call({
			method: "fetch_from_frappe",
			doc: frm.doc,
			freeze: false,
			args: {
				"page_number":frm.page_number
			},
			freeze_message: "Please wait",
			callback: function(r) {

				$.each(r.message.message || [], function(i, row) {
					let c = frm.add_child("import_from_frappe_items");
					c.title = row.title;
					c.authors = row.authors;
					c.average_rating = row.average_rating;
					c.isbn = row.isbn;
					c.frappe_book_id = row.bookID
				})
				if(r.message && r.message.message){
					frm.toggle_display("section_break_tyolp", true);
					frm.toggle_display("import_from_frappe_items", true);
					frm.toggle_display("next", true);
					refresh_field("import_from_frappe_items");
					$(".btn.btn-xs.btn-secondary.grid-add-row").hide();
					
					setTimeout(() => {
						if(frm.page_number == 2){
							frm.toggle_display("next", false);
						}
					}, 10);

				}
			},
			error: function(r) {}
		});
	},
	upload_to_system: function(frm) {
		let selected = frm.get_selected();
		if(selected){
			if(selected.import_from_frappe_items){
				frappe.db.get_single_value('Book Room Settings', 'minimum_number_of_books_import')
					.then(minimum_number_of_books_import => {

						if(selected.import_from_frappe_items.length<minimum_number_of_books_import){
							frappe.throw(`Minimum ${minimum_number_of_books_import} books required.`);
						}
						else{
							let select_array_length = 0;
							let select_array = [];

							$.each(selected.import_from_frappe_items || [], function(i, row_name) {
								var row = locals['Import From Frappe Items'][row_name]
								console.log(row);
								select_array.push({
									"title":row.title, 
									"isbn":row.isbn,
									"authors":row.authors,
									"average_rating":row.average_rating,
									"frappe_book_id":row.frappe_book_id
								})
								select_array_length += 1
							});

							if(select_array_length==selected.import_from_frappe_items.length){
								frappe.call({
									method: "import_frappe_books",
									doc: frm.doc,
									freeze: false,
									args: {
										"book_list":select_array
									},
									freeze_message: "Please wait",
									callback: function(r) {
										frappe.msgprint(__("Initiated the backgroud job for the import update system."));
										frm.clear_table("import_from_frappe_items");
										frm.toggle_display("section_break_tyolp", false);
										frm.toggle_display("import_from_frappe_items", false);
										frm.toggle_display("next", false);
									}
								});	
							}

							console.log(select_array_length);
							console.log(selected.import_from_frappe_items.length);



							// selected.import_from_frappe_items.forEach(row_name => {
							// 	var row = locals['Import From Frappe Items'][row_name]
							// 	console.log('SELECTED ROW ************************');
							// 	console.log(row);
							// 	select_array.push(row)
							// 	select_array_length += 1
								
							// });
							// if(selected.import_from_frappe_items.length == select_array_length){
							// 	frappe.call({
							// 		method: "import_frappe_books",
							// 		doc: frm.doc,
							// 		freeze: false,
							// 		args: {
							// 			"book_list":select_array
							// 		},
							// 		freeze_message: "Please wait",
							// 		callback: function(r) {
					
							// 		}
							// 	});	
							// }
							// frappe.call({
							// 	method: "import_frappe_books",
							// 	doc: frm.doc,
							// 	freeze: false,
							// 	args: {
							// 		"book_list":selected.import_from_frappe_items
							// 	},
							// 	freeze_message: "Please wait",
							// 	callback: function(r) {
				
							// 	}
							// });
							// selected.import_from_frappe_items.forEach(row_name => {
							// 	var row = locals['Import From Frappe Items'][row_name]
							// 	console.log('SELECTED ROW ************************');
							// 	console.log(row);
								
							// });
						}
					})
				// if(selected.import_from_frappe_items.length>)
			}
		}
	},
	next: function(frm){
		frm.page_number = 2;
		frm.trigger("fetch_from_frappe_api");
	}
});
