// Copyright (c) 2024, kunhimohamed and contributors
// For license information, please see license.txt

{% include 'book_room/issuing/issuing_common.js' %}

extend_cscript(cur_frm.cscript, new book_room.issuing.IssueController({frm: cur_frm}));

frappe.ui.form.on("Issue Book", {
    refresh: function(frm){
        if(frm.doc.docstatus==1){
            if(frm.doc.total_qty>frm.doc.returned_qty){
                frm.add_custom_button(__('Return Book'), () => frm.trigger("make_return_book"), __('Create'));
            }
        }
    },
    make_return_book: function(frm) {
        frappe.model.open_mapped_doc({
			method: "book_room.book_room.doctype.issue_book.issue_book.make_return_book",
			frm: frm
		})
    }
})

