
import frappe

def check_item_availablity(item_list):
    for each_row in item_list:
        available_qty = frappe.get_value("Store", {"item":each_row.item, "shelf":each_row.shelf}, ["available_qty"])
        
        if each_row.qty>(available_qty if available_qty else 0.0):
            frappe.throw("The Item with this {qty} not available in the Shelf".format(qty=each_row.qty))

def check_credit_limit(customer, office, grand_total):
    receivable_account, customer_credit_limit = frappe.db.get_value("Office",
				office, ["default_recievable_account", "customer_credit_limit"])

    outstanding_amount = frappe.db.get_value("Account Ledger",
        {
            "party_type": "Customer",
            "party":customer, 
            "account":receivable_account
        },["sum(debit_amount-credit_amount) as total_outstanding"])
    
    upcoming_outstanding_amount = (outstanding_amount if outstanding_amount else 0.0) + grand_total

    if upcoming_outstanding_amount>customer_credit_limit:
        frappe.throw("The customer will cross the outstanding limit")