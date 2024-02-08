# Copyright (c) 2024, kunhimohamed and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from book_room.book_room.doctype.stock_ledger.stock_ledger import StockLedger

class ReturnBook(Document):
	def on_submit(self):		
		if self.return_book_items:
			self.make_sl_entries(False)
			self.update_issue_book_return_qty()
	
	def on_cancel(self):
		if self.return_book_items:
			self.make_sl_entries(True)
			self.update_issue_book_return_qty(True)
			
	def make_sl_entries(self, is_cancelled=None):		
		for each_item in self.return_book_items:
			StockLedger.make_sl_entries(
				each_item.item, 
				each_item.shelf, 
				-each_item.qty if not is_cancelled else each_item.qty,
				self.doctype,
				self.name,
				False if not is_cancelled else True
			)
	
	def update_issue_book_return_qty(self, is_cancelled=None):
		if self.return_book_items:
			temp_dict = {}
			for each in self.return_book_items:
				if each.issue_book in temp_dict.keys():
					temp_dict[each.issue_book]["qty"] = temp_dict[each.issue_book]["qty"]+each.qty
				else:
					temp_dict[each.issue_book] = {"qty":each.qty}
			else:
				if temp_dict:
					for each_key in temp_dict:
						existing_return_qty = frappe.db.get_value("Issue Book", each_key, "returned_qty")
						if not is_cancelled:
							updated_qty = temp_dict[each_key]["qty"] + existing_return_qty
						else:
							updated_qty = existing_return_qty - temp_dict[each_key]["qty"]
						frappe.db.set_value("Issue Book", each_key, "returned_qty", updated_qty)
						frappe.db.commit()


