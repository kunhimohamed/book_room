app_name = "book_room"
app_title = "Book Room"
app_publisher = "kunhimohamed"
app_description = "Library"
app_email = "kunhimohamed6@gmail.com"
app_license = "MIT"

# Includes in <head>
# ------------------

fixtures = [
    {"dt": "Account"},
    {"dt": "Office"},
    {"dt": "Shelf"},
    {"dt": "Customer"},
    {"dt": "Book Room Settings"}
]

# include js, css files in header of desk.html
# app_include_css = "/assets/book_room/css/book_room.css"
# app_include_js = "/assets/book_room/js/book_room.js"
app_include_js = "book_room.bundle.js"

# include js, css files in header of web template
# web_include_css = "/assets/book_room/css/book_room.css"
# web_include_js = "/assets/book_room/js/book_room.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "book_room/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "book_room.utils.jinja_methods",
# 	"filters": "book_room.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "book_room.install.before_install"
# after_install = "book_room.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "book_room.uninstall.before_uninstall"
# after_uninstall = "book_room.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "book_room.utils.before_app_install"
# after_app_install = "book_room.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "book_room.utils.before_app_uninstall"
# after_app_uninstall = "book_room.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "book_room.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"book_room.tasks.all"
# 	],
# 	"daily": [
# 		"book_room.tasks.daily"
# 	],
# 	"hourly": [
# 		"book_room.tasks.hourly"
# 	],
# 	"weekly": [
# 		"book_room.tasks.weekly"
# 	],
# 	"monthly": [
# 		"book_room.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "book_room.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "book_room.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "book_room.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["book_room.utils.before_request"]
# after_request = ["book_room.utils.after_request"]

# Job Events
# ----------
# before_job = ["book_room.utils.before_job"]
# after_job = ["book_room.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"book_room.auth.validate"
# ]
