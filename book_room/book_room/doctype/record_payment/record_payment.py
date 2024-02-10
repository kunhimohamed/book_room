# Copyright (c) 2024, kunhimohamed and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from book_room.book_room.doctype.account_ledger.account_ledger import AccountLedger

class RecordPayment(Document):
	def validate(self):
		"""
		RecordPayment validate check the against invoice has the outstanding amount
		"""
		self.check_the_issue_book_has_outstanding_amount(True, False)

	def on_submit(self):
		"""
		RecordPayment create gl entries and update outstanding amount of invoice
		"""
		self.check_the_issue_book_has_outstanding_amount(False, False)
		self.make_gl_entries(False)
	
	def on_cancel(self):
		"""
		RecordPayment update gl entries and update outstanding amount of invoice
		"""
		self.check_the_issue_book_has_outstanding_amount(False, True)
		self.make_gl_entries(True)

	def make_gl_entries(self, is_cancelled=None):
		"""
		make gl entries
		"""		
		if self.record_payment_references:
			receivable_account, default_bank_account = frappe.db.get_value("Office",
				self.office, ["default_recievable_account", "default_bank_account"])
			
			for each in self.record_payment_references:
				AccountLedger.make_gl_entries(receivable_account, "Customer", self.customer, 0.0, each.paid_amount,
								self.doctype, self.name, each.voucher_type, each.voucher_no, is_cancelled)
				AccountLedger.make_gl_entries(default_bank_account, "Customer", self.customer, each.paid_amount, 0.0,
								self.doctype, self.name, each.voucher_type, each.voucher_no, is_cancelled)
	
	def check_the_issue_book_has_outstanding_amount(self, is_for_checking=None, is_cancelled=None):
		"""
		check outstanding and update outstanding amount
		"""
		if self.record_payment_references:
			temp_dict = {}
			for each in self.record_payment_references:
				if each.voucher_no in temp_dict.keys():
					temp_dict[each.voucher_no]["paid_amount"] = temp_dict[each.voucher_no]["paid_amount"]+each.paid_amount
				else:
					temp_dict[each.voucher_no] = {"paid_amount":each.paid_amount, "doctype":each.voucher_type}
			else:
				if temp_dict:
					for each_key in temp_dict:
						existing_outstanding_amount = frappe.db.get_value(temp_dict[each_key]["doctype"], each_key, ["outstanding_amount"])
						if is_for_checking:
							if existing_outstanding_amount <= 0:
								frappe.throw("The Issue Book has no outstanding amount")
						else:
							if not is_cancelled:
								updated_outstanding_amount = existing_outstanding_amount - temp_dict[each.voucher_no]["paid_amount"]
							else:
								updated_outstanding_amount = existing_outstanding_amount + temp_dict[each.voucher_no]["paid_amount"]

							frappe.db.set_value(temp_dict[each_key]["doctype"], each_key, "outstanding_amount", updated_outstanding_amount)
							frappe.db.commit()
