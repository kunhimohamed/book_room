// Copyright (c) 2024, kunhimohamed and contributors
// For license information, please see license.txt

{% include 'book_room/issuing/issuing_common.js' %}

extend_cscript(cur_frm.cscript, new book_room.issuing.IssueController({frm: cur_frm}));

frappe.ui.form.on("Issue Book", {
    setup(frm){
		frm.set_query("shelf", "issue_book_items", function(doc) {
			return {
				filters: {
					'is_group': 0
				}
			}
		});
	},
    refresh: function(frm){
        // to handle the amend and duplicate forms.
        if(frm.doc.__islocal){
            frm.set_value("outstanding_amount", frm.doc.grand_total);
        }

        if(frm.doc.docstatus==1){
            if(frm.doc.total_qty>frm.doc.returned_qty){
                frm.add_custom_button(__('Return Book'), () => frm.trigger("make_return_book"), __('Create'));
            }
            if(frm.doc.outstanding_amount>0){
                frm.add_custom_button(__('Record Payment'), () => frm.trigger("make_payment_record"), __('Create'));
            }
        }
    },
    make_return_book: function(frm) {
        frappe.model.open_mapped_doc({
			method: "book_room.book_room.doctype.issue_book.issue_book.make_return_book",
			frm: frm
		})
    },
    make_payment_record: function(frm) {
        frappe.model.open_mapped_doc({
			method: "book_room.book_room.doctype.issue_book.issue_book.make_payment_record",
			frm: frm
		})
    }
})

