# Copyright (c) 2024, kunhimohamed and contributors
# For license information, please see license.txt

import frappe
import requests
from frappe.model.document import Document

class ImportFromFrappe(Document):
	
	@frappe.whitelist()
	def fetch_from_frappe(self, page_number):

		params = {
			'page': page_number,
			'title':self.title,
			'authors':self.authors
		}
		response = requests.get('https://frappe.io/api/method/frappe-library', params=params)

		return response.json()
	
	@frappe.whitelist()
	def import_frappe_books(self, book_list):
		frappe.enqueue(update_system_import_books_frappe, book_list=book_list, queue="long")
		return True

def update_system_import_books_frappe(book_list):
	if book_list:
		for each_list in book_list:
			if not frappe.db.exists("Item", {"frappe_book_id":each_list.get('frappe_book_id')}):
				doc = frappe.new_doc("Item")
				doc.update(each_list)
				doc.insert(ignore_permissions=True)
	return True


