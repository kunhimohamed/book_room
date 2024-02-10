# Copyright (c) 2024, kunhimohamed and contributors
# For license information, please see license.txt

import frappe
from frappe import qb
from frappe.query_builder.functions import Sum


def execute(filters=None):
	columns = get_columns(filters)
	data = get_data(filters)
	return columns, data

def get_columns(filters=None):
	columns = [
		{
			"label": frappe._("Customer"),
			"fieldtype": "Link",
			"fieldname": "customer",
			"options": "Customer",
			"width": 150,
		},
		{
			"label": frappe._("Ourstanding Amount"),
			"fieldtype": "Currency",
			"fieldname": "outstanding_amount",
			"width": 150,
		}
	]

	return columns

def get_data(filters=None):
	ale = frappe.qb.DocType("Account Ledger")
	outstanding_vouchers = (
		qb.from_(ale)
		.select(
			ale.account, 
			ale.party.as_("customer"),
			Sum(ale.debit_amount-ale.credit_amount).as_("outstanding_amount"),
		)
		.where((ale.account == "Trade Receivable"))
		.where((ale.party==(filters.customer if filters.customer else ale.party)))
		.groupby(ale.party)
		.having(Sum(ale.debit_amount-ale.credit_amount) > 0)
	)
	
	return outstanding_vouchers.run(as_dict=True)