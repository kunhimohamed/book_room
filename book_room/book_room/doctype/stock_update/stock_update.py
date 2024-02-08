# Copyright (c) 2024, kunhimohamed and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document
from book_room.book_room.doctype.stock_ledger.stock_ledger import StockLedger

class StockUpdate(Document):
	def on_submit(self):
		if self.stock_update_items:
			for each_item in self.stock_update_items:
				StockLedger.make_sl_entries(
					each_item.item_code, 
					each_item.shelf, 
					each_item.quantity,
					self.doctype,
					self.name,
					False
				)
	def on_cancel(self):
		if self.stock_update_items:
			for each_item in self.stock_update_items:
				StockLedger.make_sl_entries(
					each_item.item_code, 
					each_item.shelf, 
					-each_item.quantity,
					self.doctype,
					self.name,
					True
				)
