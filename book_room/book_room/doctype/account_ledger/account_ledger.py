# Copyright (c) 2024, kunhimohamed and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class AccountLedger(Document):
	@staticmethod
	def make_gl_entries(account, party_type, party, debit_amount, credit_amount,
					  voucher_type, voucher_no, against_voucher_type=None, against_voucher_no=None, is_cancelled=None):
		if not is_cancelled:
			gl = frappe.new_doc("Account Ledger")
			gl.account = account
			gl.posting_date = frappe.utils.nowdate()
			gl.posting_time = frappe.utils.nowtime()
			gl.party_type = party_type
			gl.party = party
			gl.debit_amount = debit_amount
			gl.credit_amount = credit_amount
			gl.voucher_type = voucher_type
			gl.voucher_no = voucher_no
			gl.against_voucher_type = against_voucher_type
			gl.against_voucher_no = against_voucher_no
			gl.save(ignore_permissions = True)
		else:
			AccountLedger.delete_gl_entries(voucher_type, voucher_no)
	
	@staticmethod
	def delete_gl_entries(voucher_type, voucher_no):
		frappe.db.delete("Account Ledger", filters={"voucher_type":voucher_type, "voucher_no":voucher_no})
