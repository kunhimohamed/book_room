# Copyright (c) 2024, kunhimohamed and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc
from book_room.book_room.helper.helper import check_item_availablity, check_outstanding_amount_reach
from book_room.book_room.doctype.account_ledger.account_ledger import AccountLedger
from book_room.book_room.doctype.stock_ledger.stock_ledger import StockLedger

class IssueBook(Document):
	def on_submit(self):
		# check credit limit
		check_outstanding_amount_reach(self.customer, self.office, self.grand_total)
		
		if self.issue_book_items:
			# check item availbility
			check_item_availablity(self.issue_book_items)
			self.make_sl_entries(False)
		
		self.make_gl_entries(False)
	
	def on_cancel(self):
		self.make_sl_entries(True)
		self.make_gl_entries(True)
	
	def make_gl_entries(self, is_cancelled=None):
		
		receivable_account, selling_account = frappe.db.get_value("Office",
				self.office, ["default_recievable_account", "default_selling_account"])

		AccountLedger.make_gl_entries(receivable_account, "Customer", self.customer, self.grand_total, 0.0,
					  self.doctype, self.name, is_cancelled)
		AccountLedger.make_gl_entries(selling_account, "Customer", self.customer, 0.0, self.grand_total,
					  self.doctype, self.name, is_cancelled)
	
	def make_sl_entries(self, is_cancelled=None):
		
		for each_item in self.issue_book_items:
			StockLedger.make_sl_entries(
				each_item.item, 
				each_item.shelf, 
				-each_item.qty if not is_cancelled else each_item.qty,
				self.doctype,
				self.name,
				False if not is_cancelled else True
			)
		

@frappe.whitelist()
def make_return_book(source_name, target_doc=None, ignore_permissions=True):

	doclist = get_mapped_doc(
		"Issue Book",
		source_name,
		{
			"Issue Book": {
				"doctype": "Return Book",
				"validation": {"docstatus": ["=", 1]},
				"field_no_map": ["naming_series"]
			},
			"Issue Book Items": {
				"doctype": "Return Book Items",
				"field_map": {
					"parent": "issue_book",
					"months": "months",
					"qty": "qty",
					"amount":"amount",
					"shelf":"shelf"
				}
			}
		},
		target_doc,
		ignore_permissions=ignore_permissions,
	)

	return doclist
		
