# Copyright (c) 2024, kunhimohamed and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class StockLedger(Document):

	@staticmethod
	def make_sl_entries(item_code, shelf, qty_change, voucher_type, voucher_no, is_cancelled):
		if is_cancelled:
			StockLedger.delete_ledgers(voucher_type, voucher_no)
		else:
			sl = frappe.new_doc("Stock Ledger")
			sl.posting_date=frappe.utils.nowdate()
			sl.posting_time=frappe.utils.nowtime()
			sl.item = item_code
			sl.shelf = shelf
			sl.qty_change = qty_change
			sl.voucher_type = voucher_type
			sl.voucher_no = voucher_no
			sl.save(ignore_permissions = True)
		StockLedger.update_store(item_code, shelf, qty_change)

	@staticmethod
	def delete_ledgers(voucher_type, voucher_no):
		frappe.db.delete("Stock Ledger", filters={"voucher_type":voucher_type, "voucher_no":voucher_no})
	
	@staticmethod
	def update_store(item_code, shelf, qty_change):
		store_record = frappe.db.exists("Store", {"item":item_code, "shelf":shelf})
		if store_record:
			required_record = frappe.get_doc("Store", store_record)
			required_record.available_qty += qty_change
			required_record.save(ignore_permissions=True)
		else:
			required_record = frappe.new_doc("Store")
			required_record.item = item_code
			required_record.shelf = shelf
			required_record.actual_qty = qty_change
			required_record.available_qty = qty_change
			required_record.save(ignore_permissions=True)

