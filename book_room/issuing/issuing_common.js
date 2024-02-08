

frappe.provide("book_room.issuing");
book_room.issuing.IssueController = class IssueController extends frappe.ui.form.Controller {
	item(doc, cdt, cdn) {
		let re_doc = frappe.get_doc(cdt, cdn);
		frappe.db.get_value('Item', re_doc.item, 'rent_per_month')
        .then(r => {
            frappe.model.set_value(re_doc.doctype, re_doc.name, "rent_per_month", r.message.rent_per_month);
			this.calculate_amount(doc, cdt, cdn);
			this.frm.refresh_field("issue_book_items");
        })
	}
	months(doc, cdt, cdn){
		this.calculate_amount(doc, cdt, cdn);
	}
	qty(doc, cdt, cdn){
		this.calculate_amount(doc, cdt, cdn);
	}

	calculate_total_qty(doc){
		let total_qty = 0;
		$.each(doc.issue_book_items || [], function(i, row) {
			total_qty += row.qty;
		})
		this.frm.set_value("total_qty", total_qty);
		this.frm.refresh_field("total_qty");
	}

	calculate_grand_total(doc){
		let grand_total = 0;
		$.each(doc.issue_book_items || [], function(i, row) {
			grand_total += row.amount;
		})
		this.frm.set_value("grand_total", grand_total);
		this.frm.set_value("outstanding_amount", grand_total);
		this.frm.refresh_fields(["grand_total", "outstanding_amount"]);
	}

	calculate_amount(doc, cdt,cdn){
		let re_doc = frappe.get_doc(cdt, cdn);
		let total_amount = re_doc.months*re_doc.rent_per_month*re_doc.qty;
		frappe.model.set_value(re_doc.doctype, re_doc.name, "amount", total_amount||0);
		this.frm.refresh_field("issue_book_items");
		this.calculate_total_qty(doc);
		this.calculate_grand_total(doc);
	}
}