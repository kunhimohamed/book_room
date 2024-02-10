(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));

  // frappe/public/js/frappe/form/script_manager.js
  var require_script_manager = __commonJS({
    "frappe/public/js/frappe/form/script_manager.js"(exports, module) {
      frappe.provide("frappe.ui.form.handlers");
      window.extend_cscript = (cscript, controller_object) => {
        $.extend(cscript, controller_object);
        if (cscript && controller_object) {
          cscript.__proto__ = controller_object.__proto__;
        }
        return cscript;
      };
      frappe.ui.form.get_event_handler_list = function(doctype2, fieldname) {
        if (!frappe.ui.form.handlers[doctype2]) {
          frappe.ui.form.handlers[doctype2] = {};
        }
        if (!frappe.ui.form.handlers[doctype2][fieldname]) {
          frappe.ui.form.handlers[doctype2][fieldname] = [];
        }
        return frappe.ui.form.handlers[doctype2][fieldname];
      };
      frappe.ui.form.on = frappe.ui.form.on_change = function(doctype2, fieldname, handler) {
        var add_handler = function(fieldname2, handler2) {
          var handler_list = frappe.ui.form.get_event_handler_list(doctype2, fieldname2);
          let _handler = (...args) => {
            try {
              return handler2(...args);
            } catch (error) {
              console.error(handler2);
              throw error;
            }
          };
          handler_list.push(_handler);
          if (cur_frm && cur_frm.doctype === doctype2) {
            cur_frm.events[fieldname2] = _handler;
          }
        };
        if (!handler && $.isPlainObject(fieldname)) {
          for (var key in fieldname) {
            var fn = fieldname[key];
            if (typeof fn === "function") {
              add_handler(key, fn);
            }
          }
        } else {
          add_handler(fieldname, handler);
        }
      };
      frappe.ui.form.off = function(doctype2, fieldname, handler) {
        var handler_list = frappe.ui.form.get_event_handler_list(doctype2, fieldname);
        if (handler_list.length) {
          frappe.ui.form.handlers[doctype2][fieldname] = [];
        }
        if (cur_frm && cur_frm.doctype === doctype2 && cur_frm.events[fieldname]) {
          delete cur_frm.events[fieldname];
        }
        if (cur_frm && cur_frm.cscript && cur_frm.cscript[fieldname]) {
          delete cur_frm.cscript[fieldname];
        }
      };
      frappe.ui.form.trigger = function(doctype2, fieldname) {
        cur_frm.script_manager.trigger(fieldname, doctype2);
      };
      frappe.ui.form.ScriptManager = class ScriptManager {
        constructor(opts) {
          $.extend(this, opts);
        }
        make(ControllerClass) {
          this.frm.cscript = extend_cscript(this.frm.cscript, new ControllerClass({ frm: this.frm }));
        }
        trigger(event_name, doctype2, name) {
          let me2 = this;
          doctype2 = doctype2 || this.frm.doctype;
          name = name || this.frm.docname;
          let tasks = [];
          let handlers = this.get_handlers(event_name, doctype2);
          this.frm.selected_doc = frappe.get_doc(doctype2, name);
          let runner = (_function, is_old_style) => {
            let _promise = null;
            if (is_old_style) {
              _promise = me2.frm.cscript[_function](me2.frm.doc, doctype2, name);
            } else {
              _promise = _function(me2.frm, doctype2, name);
            }
            if (_promise && _promise.then) {
              return _promise;
            } else {
              return frappe.after_server_call();
            }
          };
          handlers.new_style.forEach((_function) => {
            if (event_name === "setup") {
              runner(_function, false);
            } else {
              tasks.push(() => runner(_function, false));
            }
          });
          handlers.old_style.forEach((_function) => {
            if (event_name === "setup") {
              runner(_function, true);
            } else {
              tasks.push(() => runner(_function, true));
            }
          });
          return frappe.run_serially(tasks);
        }
        has_handlers(event_name, doctype2) {
          let handlers = this.get_handlers(event_name, doctype2);
          return handlers && (handlers.old_style.length || handlers.new_style.length);
        }
        get_handlers(event_name, doctype2) {
          let me2 = this;
          let handlers = {
            old_style: [],
            new_style: []
          };
          if (frappe.ui.form.handlers[doctype2] && frappe.ui.form.handlers[doctype2][event_name]) {
            $.each(frappe.ui.form.handlers[doctype2][event_name], function(i, fn) {
              handlers.new_style.push(fn);
            });
          }
          if (this.frm.cscript[event_name]) {
            handlers.old_style.push(event_name);
          }
          if (this.frm.cscript["custom_" + event_name]) {
            handlers.old_style.push("custom_" + event_name);
          }
          return handlers;
        }
        setup() {
          var _a;
          const doctype = this.frm.meta;
          const me = this;
          let client_script = doctype.__js;
          if ((_a = this.frm.doctype_layout) == null ? void 0 : _a.client_script) {
            client_script += `
${this.frm.doctype_layout.client_script}`;
          }
          if (client_script) {
            eval(client_script);
          }
          if (!this.frm.doctype_layout && doctype.__custom_js) {
            try {
              eval(doctype.__custom_js);
            } catch (e) {
              frappe.msgprint({
                title: __("Error in Client Script"),
                indicator: "orange",
                message: '<pre class="small"><code>' + e.stack + "</code></pre>"
              });
            }
          }
          function setup_add_fetch(df) {
            let is_read_only_field = [
              "Data",
              "Read Only",
              "Text",
              "Small Text",
              "Currency",
              "Check",
              "Text Editor",
              "Attach Image",
              "Code",
              "Link",
              "Float",
              "Int",
              "Date",
              "Select",
              "Duration"
            ].includes(df.fieldtype) || df.read_only == 1 || df.is_virtual == 1;
            if (is_read_only_field && df.fetch_from && df.fetch_from.indexOf(".") != -1) {
              var parts = df.fetch_from.split(".");
              me.frm.add_fetch(parts[0], parts[1], df.fieldname, df.parent);
            }
          }
          $.each(this.frm.fields, function(i, field) {
            setup_add_fetch(field.df);
            if (frappe.model.table_fields.includes(field.df.fieldtype)) {
              $.each(frappe.meta.get_docfields(field.df.options, me.frm.docname), function(i2, df) {
                setup_add_fetch(df);
              });
            }
          });
          doctype.__css && frappe.dom.set_style(doctype.__css);
          this.trigger("setup");
        }
        log_error(caller, e) {
          frappe.show_alert({ message: __("Error in Client Script."), indicator: "error" });
          console.group && console.group();
          console.log("----- error in client script -----");
          console.log("method: " + caller);
          console.log(e);
          console.log("error message: " + e.message);
          console.trace && console.trace();
          console.log("----- end of error message -----");
          console.group && console.groupEnd();
        }
        copy_from_first_row(parentfield, current_row, fieldnames) {
          var data = this.frm.doc[parentfield];
          if (data.length === 1 || data[0] === current_row)
            return;
          if (typeof fieldnames === "string") {
            fieldnames = [fieldnames];
          }
          $.each(fieldnames, function(i, fieldname) {
            frappe.model.set_value(current_row.doctype, current_row.name, fieldname, data[0][fieldname]);
          });
        }
      };
    }
  });

  // frappe-html:/home/kunhi/Projects/library_system/frappe-bench/apps/book_room/book_room/public/js/frappe/ui/page.html
  frappe.templates["page"] = `<div class="page-head flex">
	<div class="container">
		<div class="row flex align-center page-head-content justify-between">
			<div class="col-md-4 col-sm-6 col-xs-8 page-title">
				<!-- <div class="title-image hide hidden-md hidden-lg"></div> -->
				<!-- title -->
				<span class="sidebar-toggle-btn" style="display: none;">
					<svg class="icon icon-md sidebar-toggle-placeholder">
						<use href="#icon-menu"></use>
					</svg>
					<span class="sidebar-toggle-icon">
						<svg class="icon icon-md">
							<use href="#icon-sidebar-collapse">
							</use>
						</svg>
					</span>
				</span>
				<div class="flex fill-width title-area">
					<div>
						<div class="flex">
							<h3 class="ellipsis title-text"></h3>
							<span class="indicator-pill whitespace-nowrap"></span>
						</div>
						<div class="ellipsis sub-heading hide text-muted"></div>
					</div>
					<button class="btn btn-default more-button hide">
						<svg class="icon icon-sm">
							<use href="#icon-dot-horizontal">
							</use>
						</svg>
					</button>
				</div>
			</div>
			<div class="flex col page-actions justify-content-end">
				<!-- buttons -->
				<div class="custom-actions hide hidden-xs hidden-md"></div>
				<div class="standard-actions flex">
					<span class="page-icon-group hide hidden-xs hidden-sm"></span>
					<div class="menu-btn-group hide">
						<button type="button" class="btn btn-default icon-btn" data-toggle="dropdown" aria-expanded="false">
							<span>
								<span class="menu-btn-group-label">
									<svg class="icon icon-sm">
										<use href="#icon-dot-horizontal">
										</use>
									</svg>
								</span>
							</span>
						</button>
						<ul class="dropdown-menu dropdown-menu-right" role="menu"></ul>
					</div>
					<button class="btn btn-secondary btn-default btn-sm hide"></button>
					<div class="actions-btn-group hide">
						<button type="button" class="btn btn-primary btn-sm" data-toggle="dropdown" aria-expanded="false">
							<span>
								<span class="hidden-xs actions-btn-group-label">{%= __("Actions") %}</span>
								<svg class="icon icon-xs">
									<use href="#icon-select">
									</use>
								</svg>
							</span>
						</button>
						<ul class="dropdown-menu dropdown-menu-right" role="menu">
						</ul>
					</div>
					<button class="btn btn-primary btn-sm hide primary-action"></button>
				</div>
			</div>
		</div>
	</div>
</div>
<div class="container page-body">
	<div class="page-toolbar hide">
		<div class="container">
		</div>
	</div>
	<div class="page-wrapper">
		<div class="page-content">
			<div class="workflow-button-area btn-group pull-right hide"></div>
			<div class="clearfix"></div>
		</div>
	</div>
</div>
`;

  // ../book_room/book_room/public/js/frappe/ui/page.js
  frappe.ui.make_app_page = function(opts) {
    opts.parent.page = new frappe.ui.Page(opts);
    return opts.parent.page;
  };
  frappe.ui.pages = {};
  frappe.ui.Page = class Page {
    constructor(opts) {
      $.extend(this, opts);
      this.set_document_title = true;
      this.buttons = {};
      this.fields_dict = {};
      this.views = {};
      this.make();
      frappe.ui.pages[frappe.get_route_str()] = this;
    }
    make() {
      this.wrapper = $(this.parent);
      this.add_main_section();
      this.setup_scroll_handler();
      this.setup_sidebar_toggle();
    }
    setup_scroll_handler() {
      let last_scroll = 0;
      $(window).scroll(frappe.utils.throttle(() => {
        $(".page-head").toggleClass("drop-shadow", !!document.documentElement.scrollTop);
        let current_scroll = document.documentElement.scrollTop;
        if (current_scroll > 0 && last_scroll <= current_scroll) {
          $(".page-head").css("top", "-15px");
        } else {
          $(".page-head").css("top", "var(--navbar-height)");
        }
        last_scroll = current_scroll;
      }, 500));
    }
    get_empty_state(title, message, primary_action) {
      let $empty_state = $(`<div class="page-card-container">
			<div class="page-card">
				<div class="page-card-head">
					<span class="indicator blue">
						${title}</span>
				</div>
				<p>${message}</p>
				<div>
					<button class="btn btn-primary btn-sm">${primary_action}</button>
				</div>
			</div>
		</div>`);
      return $empty_state;
    }
    load_lib(callback) {
      frappe.require(this.required_libs, callback);
    }
    add_main_section() {
      $(frappe.render_template("page", {})).appendTo(this.wrapper);
      if (this.single_column) {
        this.add_view("main", '<div class="row layout-main">					<div class="col-md-12 layout-main-section-wrapper">						<div class="layout-main-section"></div>						<div class="layout-footer hide"></div>					</div>				</div>');
      } else {
        this.add_view("main", `
				<div class="row layout-main">
					<div class="col-lg-2 layout-side-section" style="display:none"></div>
					<div class="col layout-main-section-wrapper">
						<div class="layout-main-section"></div>
						<div class="layout-footer hide"></div>
					</div>
				</div>
			`);
      }
      this.setup_page();
    }
    setup_page() {
      this.$title_area = this.wrapper.find(".title-area");
      this.$sub_title_area = this.wrapper.find("h6");
      if (this.title)
        this.set_title(this.title);
      if (this.icon)
        this.get_main_icon(this.icon);
      this.body = this.main = this.wrapper.find(".layout-main-section");
      this.container = this.wrapper.find(".page-body");
      this.footer = this.wrapper.find(".layout-footer");
      this.indicator = this.wrapper.find(".indicator-pill");
      this.page_actions = this.wrapper.find(".page-actions");
      this.btn_primary = this.page_actions.find(".primary-action");
      this.btn_secondary = this.page_actions.find(".btn-secondary");
      this.menu = this.page_actions.find(".menu-btn-group .dropdown-menu");
      this.menu_btn_group = this.page_actions.find(".menu-btn-group");
      this.actions = this.page_actions.find(".actions-btn-group .dropdown-menu");
      this.actions_btn_group = this.page_actions.find(".actions-btn-group");
      this.standard_actions = this.page_actions.find(".standard-actions");
      this.custom_actions = this.page_actions.find(".custom-actions");
      this.page_form = $('<div class="page-form row hide"></div>').prependTo(this.main);
      this.inner_toolbar = this.custom_actions;
      this.icon_group = this.page_actions.find(".page-icon-group");
      if (this.make_page) {
        this.make_page();
      }
      this.card_layout && this.main.addClass("frappe-card");
      let menu_btn = this.menu_btn_group.find("button");
      menu_btn.attr("title", __("Menu")).tooltip({ delay: { show: 600, hide: 100 } });
      frappe.ui.keys.get_shortcut_group(this.page_actions[0]).add(menu_btn, menu_btn.find(".menu-btn-group-label"));
      let action_btn = this.actions_btn_group.find("button");
      frappe.ui.keys.get_shortcut_group(this.page_actions[0]).add(action_btn, action_btn.find(".actions-btn-group-label"));
    }
    setup_sidebar_toggle() {
      let sidebar_toggle = $(".page-head").find(".sidebar-toggle-btn");
      let sidebar_wrapper = this.wrapper.find(".layout-side-section");
      if (this.disable_sidebar_toggle || !sidebar_wrapper.length) {
        sidebar_toggle.last().remove();
      } else {
        sidebar_toggle.attr("title", __("Toggle Sidebar")).tooltip({
          delay: { show: 600, hide: 100 },
          trigger: "hover"
        });
        sidebar_toggle.click(() => {
          if (frappe.utils.is_xs() || frappe.utils.is_sm()) {
            this.setup_overlay_sidebar();
          } else {
            sidebar_wrapper.toggle();
          }
          $(document.body).trigger("toggleSidebar");
          this.update_sidebar_icon();
        });
      }
    }
    setup_overlay_sidebar() {
      this.sidebar.find(".close-sidebar").remove();
      let overlay_sidebar = this.sidebar.find(".overlay-sidebar").addClass("opened");
      $('<div class="close-sidebar">').hide().appendTo(this.sidebar).fadeIn();
      let scroll_container = $("html").css("overflow-y", "hidden");
      this.sidebar.find(".close-sidebar").on("click", (e) => this.close_sidebar(e));
      this.sidebar.on("click", "button:not(.dropdown-toggle)", (e) => this.close_sidebar(e));
      this.close_sidebar = () => {
        scroll_container.css("overflow-y", "");
        this.sidebar.find("div.close-sidebar").fadeOut(() => {
          overlay_sidebar.removeClass("opened").find(".dropdown-toggle").removeClass("text-muted");
        });
      };
    }
    update_sidebar_icon() {
      let sidebar_toggle = $(".page-head").find(".sidebar-toggle-btn");
      let sidebar_toggle_icon = sidebar_toggle.find(".sidebar-toggle-icon");
      let sidebar_wrapper = this.wrapper.find(".layout-side-section");
      let is_sidebar_visible = $(sidebar_wrapper).is(":visible");
      sidebar_toggle_icon.html(frappe.utils.icon(is_sidebar_visible ? "sidebar-collapse" : "sidebar-expand", "md"));
    }
    set_indicator(label, color) {
      this.clear_indicator().removeClass("hide").html(`<span>${label}</span>`).addClass(color);
    }
    add_action_icon(icon, click, css_class = "", tooltip_label) {
      const button = $(`
			<button class="text-muted btn btn-default ${css_class} icon-btn">
				${frappe.utils.icon(icon)}
			</button>
		`);
      button.appendTo(this.icon_group.removeClass("hide"));
      button.click(click);
      button.attr("title", __(tooltip_label || frappe.unscrub(icon))).tooltip({ delay: { show: 600, hide: 100 }, trigger: "hover" });
      return button;
    }
    clear_indicator() {
      return this.indicator.removeClass().addClass("indicator-pill whitespace-nowrap hide");
    }
    get_icon_label(icon, label) {
      let icon_name = icon;
      let size = "xs";
      if (typeof icon === "object") {
        icon_name = icon.icon;
        size = icon.size || "xs";
      }
      return `${icon ? frappe.utils.icon(icon_name, size) : ""} <span class="hidden-xs"> ${__(label)} </span>`;
    }
    set_action(btn, opts) {
      let me2 = this;
      if (opts.icon) {
        opts.label = this.get_icon_label(opts.icon, opts.label);
      }
      this.clear_action_of(btn);
      btn.removeClass("hide").prop("disabled", false).html(opts.label).on("click", function() {
        let response = opts.click.apply(this, [btn]);
        me2.btn_disable_enable(btn, response);
      });
      if (opts.working_label) {
        btn.attr("data-working-label", opts.working_label);
      }
      let text_span = btn.find("span");
      frappe.ui.keys.get_shortcut_group(this).add(btn, text_span.length ? text_span : btn);
    }
    set_primary_action(label, click, icon, working_label) {
      this.set_action(this.btn_primary, {
        label,
        click,
        icon,
        working_label
      });
      return this.btn_primary;
    }
    set_secondary_action(label, click, icon, working_label) {
      this.set_action(this.btn_secondary, {
        label,
        click,
        icon,
        working_label
      });
      return this.btn_secondary;
    }
    clear_action_of(btn) {
      btn.addClass("hide").unbind("click").removeAttr("data-working-label");
    }
    clear_primary_action() {
      this.clear_action_of(this.btn_primary);
    }
    clear_secondary_action() {
      this.clear_action_of(this.btn_secondary);
    }
    clear_actions() {
      this.clear_primary_action();
      this.clear_secondary_action();
    }
    clear_custom_actions() {
      this.custom_actions.addClass("hide").empty();
    }
    clear_icons() {
      this.icon_group.addClass("hide").empty();
    }
    add_menu_item(label, click, standard, shortcut, show_parent) {
      return this.add_dropdown_item({
        label,
        click,
        standard,
        parent: this.menu,
        shortcut,
        show_parent
      });
    }
    add_custom_menu_item(parent, label, click, standard, shortcut, icon = null) {
      return this.add_dropdown_item({
        label,
        click,
        standard,
        parent,
        shortcut,
        icon
      });
    }
    clear_menu() {
      this.clear_btn_group(this.menu);
    }
    show_menu() {
      this.menu_btn_group.removeClass("hide");
    }
    hide_menu() {
      this.menu_btn_group.addClass("hide");
    }
    show_icon_group() {
      this.icon_group.removeClass("hide");
    }
    hide_icon_group() {
      this.icon_group.addClass("hide");
    }
    show_actions_menu() {
      this.actions_btn_group.removeClass("hide");
    }
    hide_actions_menu() {
      this.actions_btn_group.addClass("hide");
    }
    add_action_item(label, click, standard) {
      return this.add_dropdown_item({
        label,
        click,
        standard,
        parent: this.actions
      });
    }
    add_actions_menu_item(label, click, standard, shortcut) {
      return this.add_dropdown_item({
        label,
        click,
        standard,
        shortcut,
        parent: this.actions,
        show_parent: false
      });
    }
    clear_actions_menu() {
      this.clear_btn_group(this.actions);
    }
    add_dropdown_item({
      label,
      click,
      standard,
      parent,
      shortcut,
      show_parent = true,
      icon = null
    }) {
      if (show_parent) {
        parent.parent().removeClass("hide hidden-xl");
      }
      let $link = this.is_in_group_button_dropdown(parent, "li > a.grey-link > span", label);
      if ($link)
        return $link;
      let $li;
      let $icon = ``;
      if (icon) {
        $icon = `<span class="menu-item-icon">${frappe.utils.icon(icon)}</span>`;
      }
      if (shortcut) {
        let shortcut_obj = this.prepare_shortcut_obj(shortcut, click, label);
        $li = $(`
				<li>
					<a class="grey-link dropdown-item" href="#" onClick="return false;">
						${$icon}
						<span class="menu-item-label">${label}</span>
						<kbd class="pull-right">
							<span>${shortcut_obj.shortcut_label}</span>
						</kbd>
					</a>
				</li>
			`);
        frappe.ui.keys.add_shortcut(shortcut_obj);
      } else {
        $li = $(`
				<li>
					<a class="grey-link dropdown-item" href="#" onClick="return false;">
						${$icon}
						<span class="menu-item-label">${label}</span>
					</a>
				</li>
			`);
      }
      $link = $li.find("a").on("click", (e) => {
        if (e.ctrlKey || e.metaKey) {
          frappe.open_in_new_tab = true;
        }
        return click();
      });
      if (standard) {
        $li.appendTo(parent);
      } else {
        this.divider = parent.find(".dropdown-divider");
        if (!this.divider.length) {
          this.divider = $('<li class="dropdown-divider user-action"></li>').prependTo(parent);
        }
        $li.addClass("user-action").insertBefore(this.divider);
      }
      frappe.ui.keys.get_shortcut_group(parent.get(0)).add($link, $link.find(".menu-item-label"));
      return $link;
    }
    prepare_shortcut_obj(shortcut, click, label) {
      let shortcut_obj;
      if (typeof shortcut === "string") {
        shortcut_obj = { shortcut };
      } else {
        shortcut_obj = shortcut;
      }
      if (frappe.utils.is_mac()) {
        shortcut_obj.shortcut_label = shortcut_obj.shortcut.replace("Ctrl", "\u2318");
      } else {
        shortcut_obj.shortcut_label = shortcut_obj.shortcut;
      }
      shortcut_obj.shortcut = shortcut_obj.shortcut.toLowerCase();
      if (!shortcut_obj.action) {
        shortcut_obj.action = click;
      }
      if (!shortcut_obj.description) {
        shortcut_obj.description = label;
      }
      shortcut_obj.page = this;
      return shortcut_obj;
    }
    is_in_group_button_dropdown(parent, selector, label) {
      if (!selector)
        selector = "li";
      if (!label || !parent)
        return false;
      const item_selector = `${selector}[data-label="${encodeURIComponent(label)}"]`;
      const existing_items = $(parent).find(item_selector);
      return (existing_items == null ? void 0 : existing_items.length) > 0 && existing_items;
    }
    clear_btn_group(parent) {
      parent.empty();
      parent.parent().addClass("hide");
    }
    add_divider() {
      return $('<li class="dropdown-divider"></li>').appendTo(this.menu);
    }
    get_or_add_inner_group_button(label) {
      var $group = this.inner_toolbar.find(`.inner-group-button[data-label="${encodeURIComponent(label)}"]`);
      if (!$group.length) {
        $group = $(`<div class="inner-group-button" data-label="${encodeURIComponent(label)}">
					<button type="button" class="btn btn-default ellipsis" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
						${label}
						${frappe.utils.icon("select", "xs")}
					</button>
					<div role="menu" class="dropdown-menu"></div>
				</div>`).appendTo(this.inner_toolbar);
      }
      return $group;
    }
    get_inner_group_button(label) {
      return this.inner_toolbar.find(`.inner-group-button[data-label="${encodeURIComponent(label)}"]`);
    }
    set_inner_btn_group_as_primary(label) {
      this.get_or_add_inner_group_button(label).find("button").removeClass("btn-default").addClass("btn-primary");
    }
    btn_disable_enable(btn, response) {
      if (response && response.then) {
        btn.prop("disabled", true);
        response.then(() => {
          btn.prop("disabled", false);
        });
      } else if (response && response.always) {
        btn.prop("disabled", true);
        response.always(() => {
          btn.prop("disabled", false);
        });
      }
    }
    add_inner_button(label, action, group, type = "default") {
      var me2 = this;
      let _action = function() {
        let btn = $(this);
        let response = action();
        me2.btn_disable_enable(btn, response);
      };
      let menu_item_label = group ? `${group} > ${label}` : label;
      let menu_item = this.add_menu_item(menu_item_label, _action, false, false, false);
      menu_item.parent().addClass("hidden-xl");
      if (this.menu_btn_group.hasClass("hide")) {
        this.menu_btn_group.removeClass("hide").addClass("hidden-xl");
      }
      if (group) {
        var $group = this.get_or_add_inner_group_button(group);
        $(this.inner_toolbar).removeClass("hide");
        if (!this.is_in_group_button_dropdown($group.find(".dropdown-menu"), "a", label)) {
          return $(`<a class="dropdown-item" href="#" onclick="return false;" data-label="${encodeURIComponent(label)}">${label}</a>`).on("click", _action).appendTo($group.find(".dropdown-menu"));
        }
      } else {
        let button = this.inner_toolbar.find(`button[data-label="${encodeURIComponent(label)}"]`);
        if (button.length == 0) {
          button = $(`<button data-label="${encodeURIComponent(label)}" class="btn btn-${type} ellipsis">
					${__(label)}
				</button>`);
          button.on("click", _action);
          button.appendTo(this.inner_toolbar.removeClass("hide"));
        }
        return button;
      }
    }
    remove_inner_button(label, group) {
      if (typeof label === "string") {
        label = [label];
      }
      label = label.map((l) => __(l));
      if (group) {
        var $group = this.get_inner_group_button(__(group));
        if ($group.length) {
          $group.find(`.dropdown-item[data-label="${encodeURIComponent(label)}"]`).remove();
        }
        if ($group.find(".dropdown-item").length === 0)
          $group.remove();
      } else {
        this.inner_toolbar.find(`button[data-label="${encodeURIComponent(label)}"]`).remove();
      }
    }
    change_inner_button_type(label, group, type) {
      let btn;
      if (group) {
        var $group = this.get_inner_group_button(__(group));
        if ($group.length) {
          btn = $group.find(`.dropdown-item[data-label="${encodeURIComponent(label)}"]`);
        }
      } else {
        btn = this.inner_toolbar.find(`button[data-label="${encodeURIComponent(label)}"]`);
      }
      if (btn) {
        btn.removeClass().addClass(`btn btn-${type} ellipsis`);
      }
    }
    add_inner_message(message) {
      let $message = $(`<span class='inner-page-message text-muted small'>${message}</div>`);
      this.inner_toolbar.find(".inner-page-message").remove();
      this.inner_toolbar.removeClass("hide").prepend($message);
      return $message;
    }
    clear_inner_toolbar() {
      this.inner_toolbar.empty().addClass("hide");
    }
    add_sidebar_item(label, action, insert_after, prepend) {
      var parent = this.sidebar.find(".sidebar-menu.standard-actions");
      var li = $("<li>");
      var link = $("<a>").html(label).on("click", action).appendTo(li);
      if (insert_after) {
        li.insertAfter(parent.find(insert_after));
      } else {
        if (prepend) {
          li.prependTo(parent);
        } else {
          li.appendTo(parent);
        }
      }
      return link;
    }
    clear_user_actions() {
      this.menu.find(".user-action").remove();
    }
    get_title_area() {
      return this.$title_area;
    }
    set_title(title, icon = null, strip = true, tab_title = "") {
      if (!title)
        title = "";
      if (strip) {
        title = strip_html(title);
      }
      this.title = title;
      frappe.utils.set_title(tab_title || title);
      if (icon) {
        title = `${frappe.utils.icon(icon)} ${title}`;
      }
      let title_wrapper = this.$title_area.find(".title-text");
      title_wrapper.html(title);
      title_wrapper.attr("title", this.title);
    }
    set_title_sub(txt) {
      this.$sub_title_area.html(txt).toggleClass("hide", !!!txt);
    }
    get_main_icon(icon) {
      return this.$title_area.find(".title-icon").html('<i class="' + icon + ' fa-fw"></i> ').toggle(true);
    }
    add_help_button(txt) {
    }
    add_button(label, click, opts) {
      if (!opts)
        opts = {};
      let button = $(`<button
			class="btn ${opts.btn_class || "btn-default"} ${opts.btn_size || "btn-sm"} ellipsis">
				${opts.icon ? frappe.utils.icon(opts.icon) : ""}
				${label}
		</button>`);
      let menu_item = this.add_menu_item(label, click, false);
      menu_item.parent().addClass("hidden-xl");
      button.appendTo(this.custom_actions);
      button.on("click", click);
      this.custom_actions.removeClass("hide");
      return button;
    }
    add_custom_button_group(label, icon, parent) {
      let dropdown_label = `<span class="hidden-xs">
			<span class="custom-btn-group-label">${__(label)}</span>
			${frappe.utils.icon("select", "xs")}
		</span>`;
      if (icon) {
        dropdown_label = `<span class="hidden-xs">
				${frappe.utils.icon(icon)}
				<span class="custom-btn-group-label">${__(label)}</span>
				${frappe.utils.icon("select", "xs")}
			</span>
			<span class="visible-xs">
				${frappe.utils.icon(icon)}
			</span>`;
      }
      let custom_btn_group = $(`
			<div class="custom-btn-group">
				<button type="button" class="btn btn-default btn-sm ellipsis" data-toggle="dropdown" aria-expanded="false">
					${dropdown_label}
				</button>
				<ul class="dropdown-menu" role="menu"></ul>
			</div>
		`);
      if (!parent)
        parent = this.custom_actions;
      parent.removeClass("hide").append(custom_btn_group);
      return custom_btn_group.find(".dropdown-menu");
    }
    add_dropdown_button(parent, label, click, icon) {
      frappe.ui.toolbar.add_dropdown_button(parent, label, click, icon);
    }
    add_label(label) {
      this.show_form();
      return $("<label class='col-md-1 page-only-label'>" + label + " </label>").appendTo(this.page_form);
    }
    add_select(label, options) {
      var field = this.add_field({ label, fieldtype: "Select" });
      return field.$wrapper.find("select").empty().add_options(options);
    }
    add_data(label) {
      var field = this.add_field({ label, fieldtype: "Data" });
      return field.$wrapper.find("input").attr("placeholder", label);
    }
    add_date(label, date) {
      var field = this.add_field({ label, fieldtype: "Date", default: date });
      return field.$wrapper.find("input").attr("placeholder", label);
    }
    add_check(label) {
      return $("<div class='checkbox'><label><input type='checkbox'>" + label + "</label></div>").appendTo(this.page_form).find("input");
    }
    add_break() {
      this.page_form.append('<div class="clearfix invisible-xs"></div>');
    }
    add_field(df, parent) {
      this.show_form();
      if (!df.placeholder) {
        df.placeholder = df.label;
      }
      df.input_class = "input-xs";
      var f = frappe.ui.form.make_control({
        df,
        parent: parent || this.page_form,
        only_input: df.fieldtype == "Check" ? false : true
      });
      f.refresh();
      $(f.wrapper).addClass("col-md-2").attr("title", __(df.label)).tooltip({
        delay: { show: 600, hide: 100 },
        trigger: "hover"
      });
      if (df.fieldtype == "HTML") {
        return;
      }
      if (!f.$input)
        f.make_input();
      f.$input.attr("placeholder", __(df.label));
      if (df.fieldtype === "Check") {
        $(f.wrapper).find(":first-child").removeClass("col-md-offset-4 col-md-8");
      }
      if (df.fieldtype == "Button") {
        $(f.wrapper).find(".page-control-label").html("&nbsp;");
        f.$input.addClass("btn-xs").css({ width: "100%", "margin-top": "-1px" });
      }
      if (df["default"])
        f.set_input(df["default"]);
      this.fields_dict[df.fieldname || df.label] = f;
      return f;
    }
    clear_fields() {
      this.page_form.empty();
    }
    show_form() {
      this.page_form.removeClass("hide");
    }
    hide_form() {
      this.page_form.addClass("hide");
    }
    get_form_values() {
      var values = {};
      for (let fieldname in this.fields_dict) {
        let field = this.fields_dict[fieldname];
        values[fieldname] = field.get_value();
      }
      return values;
    }
    add_view(name, html) {
      let element = html;
      if (typeof html === "string") {
        element = $(html);
      }
      this.views[name] = element.appendTo($(this.wrapper).find(".page-content"));
      if (!this.current_view) {
        this.current_view = this.views[name];
      } else {
        this.views[name].toggle(false);
      }
      return this.views[name];
    }
    set_view(name) {
      if (this.current_view_name === name)
        return;
      this.current_view && this.current_view.toggle(false);
      this.current_view = this.views[name];
      this.previous_view_name = this.current_view_name;
      this.current_view_name = name;
      this.views[name].toggle(true);
      this.wrapper.trigger("view-change");
    }
  };

  // frappe/public/js/frappe/form/quick_entry.js
  frappe.provide("frappe.ui.form");
  frappe.quick_edit = function(doctype2, name) {
    frappe.db.get_doc(doctype2, name).then((doc) => {
      frappe.ui.form.make_quick_entry(doctype2, null, null, doc);
    });
  };
  frappe.ui.form.make_quick_entry = (doctype2, after_insert, init_callback, doc, force) => {
    var trimmed_doctype = doctype2.replace(/ /g, "");
    var controller_name = "QuickEntryForm";
    if (frappe.ui.form[trimmed_doctype + "QuickEntryForm"]) {
      controller_name = trimmed_doctype + "QuickEntryForm";
    }
    frappe.quick_entry = new frappe.ui.form[controller_name](doctype2, after_insert, init_callback, doc, force);
    return frappe.quick_entry.setup();
  };
  frappe.ui.form.QuickEntryForm = class QuickEntryForm {
    constructor(doctype2, after_insert, init_callback, doc, force) {
      this.doctype = doctype2;
      this.after_insert = after_insert;
      this.init_callback = init_callback;
      this.doc = doc;
      this.force = force ? force : false;
    }
    setup() {
      return new Promise((resolve) => {
        frappe.model.with_doctype(this.doctype, () => {
          this.check_quick_entry_doc();
          this.set_meta_and_mandatory_fields();
          if (this.is_quick_entry() || this.force) {
            this.render_dialog();
            resolve(this);
          } else {
            frappe.quick_entry = null;
            frappe.set_route("Form", this.doctype, this.doc.name).then(() => resolve(this));
            if (this.init_callback) {
              this.init_callback(this.doc);
            }
          }
        });
      });
    }
    set_meta_and_mandatory_fields() {
      this.meta = frappe.get_meta(this.doctype);
      let fields = this.meta.fields;
      this.mandatory = fields.filter((df) => {
        return (df.reqd || df.bold || df.allow_in_quick_entry) && !df.read_only && !df.is_virtual;
      });
    }
    check_quick_entry_doc() {
      if (!this.doc) {
        this.doc = frappe.model.get_new_doc(this.doctype, null, null, true);
      }
    }
    is_quick_entry() {
      if (this.meta.quick_entry != 1) {
        return false;
      }
      this.validate_for_prompt_autoname();
      if (this.has_child_table() || !this.mandatory.length) {
        return false;
      }
      return true;
    }
    too_many_mandatory_fields() {
      if (this.mandatory.length > 7) {
        return true;
      }
      return false;
    }
    has_child_table() {
      if ($.map(this.mandatory, function(d) {
        return d.fieldtype === "Table" ? d : null;
      }).length) {
        return true;
      }
      return false;
    }
    validate_for_prompt_autoname() {
      if (this.meta.autoname && this.meta.autoname.toLowerCase() === "prompt") {
        this.mandatory = [
          {
            fieldname: "__newname",
            label: __("{0} Name", [__(this.meta.name)]),
            reqd: 1,
            fieldtype: "Data"
          }
        ].concat(this.mandatory);
      }
    }
    render_dialog() {
      var me2 = this;
      this.dialog = new frappe.ui.Dialog({
        title: __("New {0}", [__(this.doctype)]),
        fields: this.mandatory,
        doc: this.doc
      });
      this.register_primary_action();
      !this.force && this.render_edit_in_full_page_link();
      this.dialog.wrapper.keydown(function(e) {
        if ((e.ctrlKey || e.metaKey) && e.which == 13) {
          if (!frappe.request.ajax_count) {
            me2.dialog.get_primary_btn().trigger("click");
            e.preventDefault();
            return false;
          }
        }
      });
      this.dialog.onhide = () => frappe.quick_entry = null;
      this.dialog.show();
      this.dialog.refresh_dependency();
      this.set_defaults();
      if (this.init_callback) {
        this.init_callback(this.dialog);
      }
    }
    register_primary_action() {
      var me2 = this;
      this.dialog.set_primary_action(__("Save"), function() {
        if (me2.dialog.working) {
          return;
        }
        var data = me2.dialog.get_values();
        if (data) {
          me2.dialog.working = true;
          me2.dialog.set_message(__("Saving..."));
          me2.insert().then(() => {
            me2.dialog.clear_message();
          });
        }
      });
    }
    insert() {
      let me2 = this;
      return new Promise((resolve) => {
        me2.update_doc();
        frappe.call({
          method: "frappe.client.save",
          args: {
            doc: me2.dialog.doc
          },
          callback: function(r) {
            if (frappe.model.is_submittable(me2.doctype)) {
              frappe.run_serially([
                () => me2.dialog.working = true,
                () => {
                  me2.dialog.set_primary_action(__("Submit"), function() {
                    me2.submit(r.message);
                  });
                }
              ]);
            } else {
              me2.dialog.hide();
              frappe.model.clear_doc(me2.dialog.doc.doctype, me2.dialog.doc.name);
              me2.dialog.doc = r.message;
              if (frappe._from_link) {
                frappe.ui.form.update_calling_link(me2.dialog.doc);
              } else {
                if (me2.after_insert) {
                  me2.after_insert(me2.dialog.doc);
                } else {
                  me2.open_form_if_not_list();
                }
              }
            }
          },
          error: function() {
            if (!me2.skip_redirect_on_error) {
              me2.open_doc(true);
            }
          },
          always: function() {
            me2.dialog.working = false;
            resolve(me2.dialog.doc);
          },
          freeze: true
        });
      });
    }
    submit(doc) {
      var me2 = this;
      frappe.call({
        method: "frappe.client.submit",
        args: {
          doc
        },
        callback: function(r) {
          me2.dialog.hide();
          frappe.model.clear_doc(me2.dialog.doc.doctype, me2.dialog.doc.name);
          me2.dialog.doc = r.message;
          if (frappe._from_link) {
            frappe.ui.form.update_calling_link(me2.dialog.doc);
          } else {
            if (me2.after_insert) {
              me2.after_insert(me2.dialog.doc);
            } else {
              me2.open_form_if_not_list();
            }
          }
          cur_frm && cur_frm.reload_doc();
        }
      });
    }
    open_form_if_not_list() {
      let route = frappe.get_route();
      let doc = this.dialog.doc;
      if (route && !(route[0] === "List" && route[1] === doc.doctype)) {
        frappe.run_serially([() => frappe.set_route("Form", doc.doctype, doc.name)]);
      }
    }
    update_doc() {
      var me2 = this;
      var data = this.dialog.get_values(true);
      $.each(data, function(key, value) {
        if (!is_null(value)) {
          me2.dialog.doc[key] = value;
        }
      });
      return this.dialog.doc;
    }
    open_doc(set_hooks) {
      this.dialog.hide();
      this.update_doc();
      if (set_hooks && this.after_insert) {
        frappe.route_options = frappe.route_options || {};
        frappe.route_options.after_save = (frm) => {
          this.after_insert(frm);
        };
      }
      frappe.set_route("Form", this.doctype, this.doc.name);
    }
    render_edit_in_full_page_link() {
      var me2 = this;
      this.dialog.add_custom_action(__("Edit Full Form"), () => me2.open_doc(true));
    }
    set_defaults() {
      var me2 = this;
      $.each(this.dialog.fields_dict, function(fieldname, field) {
        field.doctype = me2.doc.doctype;
        field.docname = me2.doc.name;
        if (!is_null(me2.doc[fieldname])) {
          field.set_input(me2.doc[fieldname]);
        }
      });
    }
  };

  // frappe/public/js/frappe/form/linked_with.js
  frappe.ui.form.LinkedWith = class LinkedWith {
    constructor(opts) {
      $.extend(this, opts);
    }
    show() {
      if (!this.dialog)
        this.make_dialog();
      $(this.dialog.body).html(`<div class="text-muted text-center" style="padding: 30px 0px">
				${__("Loading")}...
			</div>`);
      this.dialog.show();
    }
    make_dialog() {
      this.dialog = new frappe.ui.Dialog({
        title: __("Linked With")
      });
      this.dialog.on_page_show = () => {
        frappe.xcall("frappe.desk.form.linked_with.get", {
          doctype: this.frm.doctype,
          docname: this.frm.docname
        }).then((r) => {
          this.frm.__linked_docs = r;
        }).then(() => this.make_html());
      };
    }
    make_html() {
      let html = "";
      const linked_docs = this.frm.__linked_docs;
      const linked_doctypes = Object.keys(linked_docs);
      if (linked_doctypes.length === 0) {
        html = __("Not Linked to any record");
      } else {
        html = linked_doctypes.map((doctype2) => {
          const docs = linked_docs[doctype2];
          return `
					<div class="list-item-table margin-bottom">
						${this.make_doc_head(doctype2)}
						${docs.map((doc) => this.make_doc_row(doc, doctype2)).join("")}
					</div>
				`;
        }).join("");
      }
      $(this.dialog.body).html(html);
    }
    make_doc_head(heading) {
      return `
			<header class="level list-row list-row-head text-muted small">
				<div>${__(heading)}</div>
			</header>
		`;
    }
    make_doc_row(doc, doctype2) {
      return `<div class="list-row-container">
			<div class="level list-row small">
				<div class="level-left bold">
					<a href="/app/${frappe.router.slug(doctype2)}/${doc.name}">${doc.name}</a>
				</div>
			</div>
		</div>`;
    }
  };

  // frappe/public/js/frappe/form/form_viewers.js
  frappe.ui.form.FormViewers = class FormViewers {
    constructor({ frm, parent }) {
      this.frm = frm;
      this.parent = parent;
      this.parent.tooltip({ title: __("Currently Viewing") });
    }
    refresh() {
      let users = this.frm.get_docinfo()["viewers"];
      if (!users || !users.current || !users.current.length) {
        this.parent.empty();
        return;
      }
      let currently_viewing = users.current.filter((user) => user != frappe.session.user);
      let avatar_group = frappe.avatar_group(currently_viewing, 5, {
        align: "left",
        overlap: true
      });
      this.parent.empty().append(avatar_group);
    }
  };
  frappe.ui.form.FormViewers.set_users = function(data, type) {
    const doctype2 = data.doctype;
    const docname = data.docname;
    const docinfo = frappe.model.get_docinfo(doctype2, docname);
    const past_users = (docinfo && docinfo[type] || {}).past || [];
    const users = data.users || [];
    const new_users = users.filter((user) => !past_users.includes(user));
    if (new_users.length === 0)
      return;
    const set_and_refresh = () => {
      const info = {
        past: past_users.concat(new_users),
        new: new_users,
        current: users
      };
      frappe.model.set_docinfo(doctype2, docname, type, info);
      if (cur_frm && cur_frm.doc && cur_frm.doc.doctype === doctype2 && cur_frm.doc.name == docname && cur_frm.viewers) {
        cur_frm.viewers.refresh(true, type);
      }
    };
    let unknown_users = [];
    for (let user of users) {
      if (!frappe.boot.user_info[user])
        unknown_users.push(user);
    }
    if (unknown_users.length === 0) {
      set_and_refresh();
    } else {
      frappe.xcall("frappe.desk.form.load.get_user_info_for_viewers", { users: unknown_users }).then((data2) => {
        Object.assign(frappe.boot.user_info, data2);
        set_and_refresh();
      });
    }
  };

  // frappe/public/js/frappe/form/toolbar.js
  frappe.ui.form.Toolbar = class Toolbar {
    constructor(opts) {
      $.extend(this, opts);
      this.refresh();
      this.add_update_button_on_dirty();
      this.setup_editable_title();
    }
    refresh() {
      this.make_menu();
      this.make_viewers();
      this.set_title();
      this.page.clear_user_actions();
      this.show_title_as_dirty();
      this.set_primary_action();
      if (this.frm.meta.hide_toolbar) {
        this.page.hide_menu();
      } else {
        if (this.frm.doc.__islocal) {
          this.page.hide_menu();
          this.print_icon && this.print_icon.addClass("hide");
        } else {
          this.page.show_menu();
          this.print_icon && this.print_icon.removeClass("hide");
        }
      }
    }
    set_title() {
      if (this.frm.is_new()) {
        var title = __("New {0}", [__(this.frm.meta.name)]);
      } else if (this.frm.meta.title_field) {
        let title_field = (this.frm.doc[this.frm.meta.title_field] || "").toString().trim();
        var title = strip_html(title_field || this.frm.docname);
        if (this.frm.doc.__islocal || title === this.frm.docname || this.frm.meta.autoname === "hash") {
          this.page.set_title_sub("");
        } else {
          this.page.set_title_sub(this.frm.docname);
          this.page.$sub_title_area.css("cursor", "copy");
          this.page.$sub_title_area.on("click", (event) => {
            event.stopImmediatePropagation();
            frappe.utils.copy_to_clipboard(this.frm.docname);
          });
        }
      } else {
        var title = this.frm.docname;
      }
      var me2 = this;
      title = __(title);
      this.page.set_title(title);
      if (this.frm.meta.title_field) {
        frappe.utils.set_title(title + " - " + this.frm.docname);
      }
      this.page.$title_area.toggleClass("editable-title", !!(this.is_title_editable() || this.can_rename()));
      this.set_indicator();
    }
    is_title_editable() {
      let title_field = this.frm.meta.title_field;
      let doc_field = this.frm.get_docfield(title_field);
      if (title_field && this.frm.perm[0].write && !this.frm.doc.__islocal && doc_field.fieldtype === "Data" && !doc_field.read_only) {
        return true;
      } else {
        return false;
      }
    }
    can_rename() {
      return this.frm.perm[0].write && this.frm.meta.allow_rename && !this.frm.doc.__islocal;
    }
    show_unchanged_document_alert() {
      frappe.show_alert({
        indicator: "info",
        message: __("Unchanged")
      });
    }
    rename_document_title(input_name, input_title, merge = false) {
      let confirm_message = null;
      const docname = this.frm.doc.name;
      const title_field = this.frm.meta.title_field || "";
      const doctype2 = this.frm.doctype;
      let queue;
      if (this.frm.__rename_queue) {
        queue = this.frm.__rename_queue;
      }
      if (input_name) {
        const warning = __("This cannot be undone");
        const message = __("Are you sure you want to merge {0} with {1}?", [
          docname.bold(),
          input_name.bold()
        ]);
        confirm_message = `${message}<br><b>${warning}<b>`;
      }
      let rename_document = () => {
        return frappe.xcall("frappe.model.rename_doc.update_document_title", {
          doctype: doctype2,
          docname,
          name: input_name,
          title: input_title,
          enqueue: true,
          merge,
          freeze: true,
          freeze_message: __("Updating related fields..."),
          queue
        }).then((new_docname) => {
          const reload_form = (input_name2) => {
            $(document).trigger("rename", [doctype2, docname, input_name2]);
            if (locals[doctype2] && locals[doctype2][docname])
              delete locals[doctype2][docname];
            this.frm.reload_doc();
          };
          if (input_name && new_docname == docname) {
            frappe.socketio.doc_subscribe(doctype2, input_name);
            frappe.realtime.on("doc_update", (data) => {
              if (data.doctype == doctype2 && data.name == input_name) {
                reload_form(input_name);
                frappe.show_alert({
                  message: __("Document renamed from {0} to {1}", [
                    docname.bold(),
                    input_name.bold()
                  ]),
                  indicator: "success"
                });
              }
            });
            frappe.show_alert(__("Document renaming from {0} to {1} has been queued", [
              docname.bold(),
              input_name.bold()
            ]));
          }
          if (input_name && (new_docname || input_name) != docname) {
            reload_form(new_docname || input_name);
          }
        });
      };
      return new Promise((resolve, reject) => {
        if (input_title === this.frm.doc[title_field] && input_name === docname) {
          this.show_unchanged_document_alert();
          resolve();
        } else if (merge) {
          frappe.confirm(confirm_message, () => {
            rename_document().then(resolve).catch(reject);
          }, reject);
        } else {
          rename_document().then(resolve).catch(reject);
        }
      });
    }
    setup_editable_title() {
      let me2 = this;
      this.page.$title_area.find(".title-text").on("click", () => {
        let fields = [];
        let docname = me2.frm.doc.name;
        let title_field = me2.frm.meta.title_field || "";
        if (me2.is_title_editable()) {
          let title_field_label = me2.frm.get_docfield(title_field).label;
          fields.push({
            label: __("New {0}", [__(title_field_label)]),
            fieldname: "title",
            fieldtype: "Data",
            reqd: 1,
            default: me2.frm.doc[title_field]
          });
        }
        if (me2.can_rename()) {
          let label = __("New Name");
          if (me2.frm.meta.autoname && me2.frm.meta.autoname.startsWith("field:")) {
            let fieldname = me2.frm.meta.autoname.split(":")[1];
            label = __("New {0}", [me2.frm.get_docfield(fieldname).label]);
          }
          fields.push(...[
            {
              label,
              fieldname: "name",
              fieldtype: "Data",
              reqd: 1,
              default: docname
            },
            {
              label: __("Merge with existing"),
              fieldname: "merge",
              fieldtype: "Check",
              default: 0
            }
          ]);
        }
        if (fields.length > 0) {
          let d = new frappe.ui.Dialog({
            title: __("Rename"),
            fields
          });
          d.show();
          d.set_primary_action(__("Rename"), (values) => {
            d.disable_primary_action();
            d.hide();
            this.rename_document_title(values.name, values.title, values.merge).then(() => {
              d.hide();
            }).catch(() => {
              d.enable_primary_action();
            });
          });
        }
      });
    }
    get_dropdown_menu(label) {
      return this.page.add_dropdown(label);
    }
    set_indicator() {
      var indicator = frappe.get_indicator(this.frm.doc);
      if (this.frm.save_disabled && indicator && [__("Saved"), __("Not Saved")].includes(indicator[0])) {
        return;
      }
      if (indicator) {
        this.page.set_indicator(indicator[0], indicator[1]);
      } else {
        this.page.clear_indicator();
      }
    }
    make_menu() {
      this.page.clear_icons();
      this.page.clear_menu();
      if (frappe.boot.desk_settings.form_sidebar) {
        this.make_navigation();
        this.make_menu_items();
      }
    }
    make_viewers() {
      if (this.frm.viewers) {
        return;
      }
      this.frm.viewers = new frappe.ui.form.FormViewers({
        frm: this.frm,
        parent: $('<div class="form-viewers d-flex"></div>').prependTo(this.frm.page.page_actions)
      });
    }
    make_navigation() {
      if (!this.frm.is_new() && !this.frm.meta.issingle) {
        this.page.add_action_icon("left", () => {
          this.frm.navigate_records(1);
        }, "prev-doc", __("Previous Document"));
        this.page.add_action_icon("right", () => {
          this.frm.navigate_records(0);
        }, "next-doc", __("Next Document"));
      }
    }
    make_menu_items() {
      const me2 = this;
      const p = this.frm.perm[0];
      const docstatus = cint(this.frm.doc.docstatus);
      const is_submittable = frappe.model.is_submittable(this.frm.doc.doctype);
      const print_settings = frappe.model.get_doc(":Print Settings", "Print Settings");
      const allow_print_for_draft = cint(print_settings.allow_print_for_draft);
      const allow_print_for_cancelled = cint(print_settings.allow_print_for_cancelled);
      if (!is_submittable || docstatus == 1 || allow_print_for_cancelled && docstatus == 2 || allow_print_for_draft && docstatus == 0) {
        if (frappe.model.can_print(null, me2.frm) && !this.frm.meta.issingle) {
          this.page.add_menu_item(__("Print"), function() {
            me2.frm.print_doc();
          }, true);
          this.print_icon = this.page.add_action_icon("printer", function() {
            me2.frm.print_doc();
          }, "", __("Print"));
        }
      }
      if (frappe.model.can_email(null, me2.frm) && me2.frm.doc.docstatus < 2) {
        this.page.add_menu_item(__("Email"), function() {
          me2.frm.email_doc();
        }, true, {
          shortcut: "Ctrl+E",
          condition: () => !this.frm.is_new()
        });
      }
      this.page.add_menu_item(__("Jump to field"), function() {
        me2.show_jump_to_field_dialog();
      }, true, "Ctrl+J");
      if (!me2.frm.meta.issingle) {
        this.page.add_menu_item(__("Links"), function() {
          me2.show_linked_with();
        }, true);
      }
      if (in_list(frappe.boot.user.can_create, me2.frm.doctype) && !me2.frm.meta.allow_copy) {
        this.page.add_menu_item(__("Duplicate"), function() {
          me2.frm.copy_doc();
        }, true);
      }
      this.page.add_menu_item(__("Copy to Clipboard"), function() {
        frappe.utils.copy_to_clipboard(JSON.stringify(me2.frm.doc));
      }, true);
      if (this.can_rename()) {
        this.page.add_menu_item(__("Rename"), function() {
          me2.frm.rename_doc();
        }, true);
      }
      this.page.add_menu_item(__("Reload"), function() {
        me2.frm.reload_doc();
      }, true);
      if (cint(me2.frm.doc.docstatus) != 1 && !me2.frm.doc.__islocal && frappe.model.can_delete(me2.frm.doctype)) {
        this.page.add_menu_item(__("Delete"), function() {
          me2.frm.savetrash();
        }, true, {
          shortcut: "Shift+Ctrl+D",
          condition: () => !this.frm.is_new()
        });
      }
      this.make_customize_buttons();
      if (this.can_repeat()) {
        this.page.add_menu_item(__("Repeat"), function() {
          frappe.utils.new_auto_repeat_prompt(me2.frm);
        }, true);
      }
      if (p[CREATE] && !this.frm.meta.issingle && !this.frm.meta.in_create) {
        this.page.add_menu_item(__("New {0}", [__(me2.frm.doctype)]), function() {
          frappe.new_doc(me2.frm.doctype, true);
        }, true, {
          shortcut: "Ctrl+B",
          condition: () => !this.frm.is_new()
        });
      }
      if (this.frm.doc.amended_from && frappe.model.get_value("DocType", this.frm.doc.doctype, "track_changes")) {
        this.page.add_menu_item(__("View Audit Trail"), function() {
          frappe.set_route("audit-trail");
        }, true);
      }
    }
    make_customize_buttons() {
      let is_doctype_form = this.frm.doctype === "DocType";
      if (frappe.model.can_create("Custom Field") && frappe.model.can_create("Property Setter")) {
        let doctype2 = is_doctype_form ? this.frm.docname : this.frm.doctype;
        let is_doctype_custom = is_doctype_form ? this.frm.doc.custom : false;
        if (doctype2 != "DocType" && !is_doctype_custom && this.frm.meta.issingle === 0) {
          this.page.add_menu_item(__("Customize"), () => {
            if (this.frm.meta && this.frm.meta.custom) {
              frappe.set_route("Form", "DocType", doctype2);
            } else {
              frappe.set_route("Form", "Customize Form", {
                doc_type: doctype2
              });
            }
          }, true);
        }
      }
      if (frappe.model.can_create("DocType")) {
        if (frappe.boot.developer_mode === 1 && !is_doctype_form) {
          this.page.add_menu_item(__("Edit DocType"), () => {
            frappe.set_route("Form", "DocType", this.frm.doctype);
          }, true);
        }
      }
    }
    can_repeat() {
      return this.frm.meta.allow_auto_repeat && !this.frm.is_new() && !this.frm.doc.auto_repeat;
    }
    can_save() {
      return this.get_docstatus() === 0;
    }
    can_submit() {
      return this.get_docstatus() === 0 && !this.frm.doc.__islocal && !this.frm.doc.__unsaved && this.frm.perm[0].submit && !this.has_workflow();
    }
    can_update() {
      return this.get_docstatus() === 1 && !this.frm.doc.__islocal && this.frm.perm[0].submit && this.frm.doc.__unsaved;
    }
    can_cancel() {
      return this.get_docstatus() === 1 && this.frm.perm[0].cancel && !this.read_only;
    }
    can_amend() {
      return this.get_docstatus() === 2 && this.frm.perm[0].amend && !this.read_only;
    }
    has_workflow() {
      if (this._has_workflow === void 0)
        this._has_workflow = frappe.get_list("Workflow", {
          document_type: this.frm.doctype
        }).length;
      return this._has_workflow;
    }
    get_docstatus() {
      return cint(this.frm.doc.docstatus);
    }
    show_linked_with() {
      if (!this.frm.linked_with) {
        this.frm.linked_with = new frappe.ui.form.LinkedWith({
          frm: this.frm
        });
      }
      this.frm.linked_with.show();
    }
    set_primary_action(dirty) {
      if (!dirty) {
        this.page.clear_user_actions();
      }
      var status = this.get_action_status();
      if (status) {
        if (status !== this.current_status && status === "Amend") {
          let doc = this.frm.doc;
          frappe.xcall("frappe.client.is_document_amended", {
            doctype: doc.doctype,
            docname: doc.name
          }).then((is_amended) => {
            if (is_amended) {
              this.page.clear_actions();
              return;
            }
            this.set_page_actions(status);
          });
        } else {
          this.set_page_actions(status);
        }
      } else {
        this.page.clear_actions();
        this.current_status = null;
      }
    }
    get_action_status() {
      var status = null;
      if (this.frm.page.current_view_name === "print" || this.frm.hidden) {
        status = "Edit";
      } else if (this.can_submit()) {
        status = "Submit";
      } else if (this.can_save()) {
        if (!this.frm.save_disabled) {
          if (this.has_workflow() ? this.frm.doc.__unsaved : true) {
            status = "Save";
          }
        }
      } else if (this.can_update()) {
        status = "Update";
      } else if (this.can_cancel()) {
        status = "Cancel";
      } else if (this.can_amend()) {
        status = "Amend";
      }
      return status;
    }
    set_page_actions(status) {
      var me2 = this;
      this.page.clear_actions();
      if (status !== "Edit") {
        var perm_to_check = this.frm.action_perm_type_map[status];
        if (!this.frm.perm[0][perm_to_check]) {
          return;
        }
      }
      if (status === "Edit") {
        this.page.set_primary_action(__("Edit"), function() {
          me2.frm.page.set_view("main");
        }, "edit");
      } else if (status === "Cancel") {
        let add_cancel_button = () => {
          this.page.set_secondary_action(__(status), function() {
            me2.frm.savecancel(this);
          });
        };
        if (this.has_workflow()) {
          frappe.xcall("frappe.model.workflow.can_cancel_document", {
            doctype: this.frm.doc.doctype
          }).then((can_cancel) => {
            if (can_cancel) {
              add_cancel_button();
            }
          });
        } else {
          add_cancel_button();
        }
      } else {
        var click = {
          Save: function() {
            return me2.frm.save("Save", null, this);
          },
          Submit: function() {
            return me2.frm.savesubmit(this);
          },
          Update: function() {
            return me2.frm.save("Update", null, this);
          },
          Amend: function() {
            return me2.frm.amend_doc();
          }
        }[status];
        var icon = {
          Update: "edit"
        }[status];
        this.page.set_primary_action(__(status), click, icon);
      }
      this.current_status = status;
    }
    add_update_button_on_dirty() {
      var me2 = this;
      $(this.frm.wrapper).on("dirty", function() {
        me2.show_title_as_dirty();
        me2.frm.page.clear_actions_menu();
        if (!me2.frm.save_disabled) {
          me2.set_primary_action(true);
        }
      });
    }
    show_title_as_dirty() {
      if (this.frm.save_disabled && !this.frm.set_dirty)
        return;
      if (this.frm.is_dirty()) {
        this.page.set_indicator(__("Not Saved"), "orange");
      }
      $(this.frm.wrapper).attr("data-state", this.frm.is_dirty() ? "dirty" : "clean");
    }
    show_jump_to_field_dialog() {
      let visible_fields_filter = (f) => !["Section Break", "Column Break", "Tab Break"].includes(f.df.fieldtype) && !f.df.hidden && f.disp_status !== "None";
      let fields = this.frm.fields.filter(visible_fields_filter).map((f) => ({ label: __(f.df.label), value: f.df.fieldname }));
      let dialog = new frappe.ui.Dialog({
        title: __("Jump to field"),
        fields: [
          {
            fieldtype: "Autocomplete",
            fieldname: "fieldname",
            label: __("Select Field"),
            options: fields,
            reqd: 1
          }
        ],
        primary_action_label: __("Go"),
        primary_action: ({ fieldname }) => {
          dialog.hide();
          this.frm.scroll_to_field(fieldname);
        },
        animate: false
      });
      dialog.show();
    }
  };

  // frappe/public/js/frappe/form/section.js
  var Section = class {
    constructor(parent, df, card_layout, layout) {
      this.layout = layout;
      this.card_layout = card_layout;
      this.parent = parent;
      this.df = df || {};
      this.fields_list = [];
      this.fields_dict = {};
      this.make();
      if (this.df.label && this.df.collapsible && localStorage.getItem(df.css_class + "-closed")) {
        this.collapse();
      }
      this.row = {
        wrapper: this.wrapper
      };
      this.refresh();
    }
    make() {
      let make_card = this.card_layout;
      this.wrapper = $(`<div class="row
				${this.df.is_dashboard_section ? "form-dashboard-section" : "form-section"}
				${make_card ? "card-section" : ""}">
			`).appendTo(this.parent);
      this.layout && this.layout.sections.push(this);
      if (this.df) {
        if (this.df.label) {
          this.make_head();
        }
        if (this.df.description) {
          this.description_wrapper = $(`<div class="col-sm-12 form-section-description">
						${__(this.df.description)}
					</div>`);
          this.wrapper.append(this.description_wrapper);
        }
        if (this.df.css_class) {
          this.wrapper.addClass(this.df.css_class);
        }
        if (this.df.hide_border) {
          this.wrapper.toggleClass("hide-border", true);
        }
      }
      this.body = $('<div class="section-body">').appendTo(this.wrapper);
      if (this.df.body_html) {
        this.body.append(this.df.body_html);
      }
    }
    make_head() {
      this.head = $(`
			<div class="section-head">
				${__(this.df.label)}
				<span class="ml-2 collapse-indicator mb-1"></span>
			</div>
		`);
      this.head.appendTo(this.wrapper);
      this.indicator = this.head.find(".collapse-indicator");
      this.indicator.hide();
      if (this.df.collapsible) {
        this.head.addClass("collapsible");
        this.collapse_link = this.head.on("click", () => {
          this.collapse();
        });
        this.set_icon();
        this.indicator.show();
      }
    }
    replace_field(fieldname, fieldobj) {
      var _a;
      if ((_a = this.fields_dict[fieldname]) == null ? void 0 : _a.df) {
        const olfldobj = this.fields_dict[fieldname];
        const idx = this.fields_list.findIndex((e) => e == olfldobj);
        this.fields_list.splice(idx, 1, fieldobj);
        this.fields_dict[fieldname] = fieldobj;
        fieldobj.section = this;
      }
    }
    refresh(hide) {
      if (!this.df)
        return;
      hide = hide || this.df.hidden || this.df.hidden_due_to_dependency;
      this.wrapper.toggleClass("hide-control", !!hide);
    }
    collapse(hide) {
      if (!(this.head && this.body)) {
        return;
      }
      if (hide === void 0) {
        hide = !this.body.hasClass("hide");
      }
      this.body.toggleClass("hide", hide);
      this.head && this.head.toggleClass("collapsed", hide);
      this.set_icon(hide);
      this.fields_list.forEach((f) => f.on_section_collapse && f.on_section_collapse(hide));
      if (this.df.css_class)
        localStorage.setItem(this.df.css_class + "-closed", hide ? "1" : "");
    }
    set_icon(hide) {
      let indicator_icon = hide ? "down" : "up-line";
      this.indicator && this.indicator.html(frappe.utils.icon(indicator_icon, "sm", "mb-1"));
    }
    is_collapsed() {
      return this.body.hasClass("hide");
    }
    has_missing_mandatory() {
      let missing_mandatory = false;
      for (let j = 0, l = this.fields_list.length; j < l; j++) {
        const section_df = this.fields_list[j].df;
        if (section_df.reqd && this.layout.doc[section_df.fieldname] == null) {
          missing_mandatory = true;
          break;
        }
      }
      return missing_mandatory;
    }
    hide() {
      this.on_section_toggle(false);
    }
    show() {
      this.on_section_toggle(true);
    }
    on_section_toggle(show) {
      this.wrapper.toggleClass("hide-control", !show);
    }
  };

  // frappe/public/js/frappe/form/dashboard.js
  frappe.ui.form.Dashboard = class FormDashboard {
    constructor(parent, frm) {
      this.parent = parent;
      this.frm = frm;
      this.setup_dashboard_sections();
    }
    setup_dashboard_sections() {
      this.progress_area = this.make_section({
        css_class: "progress-area",
        hidden: 1,
        collapsible: 1,
        is_dashboard_section: 1
      });
      this.heatmap_area = this.make_section({
        label: __("Activity"),
        css_class: "form-heatmap",
        hidden: 1,
        collapsible: 1,
        is_dashboard_section: 1,
        body_html: `
				<div id="heatmap-${frappe.model.scrub(this.frm.doctype)}" class="heatmap"></div>
				<div class="text-muted small heatmap-message hidden"></div>
			`
      });
      this.chart_area = this.make_section({
        label: __("Graph"),
        css_class: "form-graph",
        hidden: 1,
        collapsible: 1,
        is_dashboard_section: 1
      });
      this.stats_area_row = $(`<div class="row"></div>`);
      this.stats_area = this.make_section({
        label: __("Stats"),
        css_class: "form-stats",
        hidden: 1,
        collapsible: 1,
        is_dashboard_section: 1,
        body_html: this.stats_area_row
      });
      this.transactions_area = $(`<div class="transactions"></div>`);
      this.links_area = this.make_section({
        label: __("Connections"),
        css_class: "form-links",
        hidden: 1,
        collapsible: 1,
        is_dashboard_section: 1,
        body_html: this.transactions_area
      });
    }
    make_section(df) {
      return new Section(this.parent, df);
    }
    reset() {
      this.progress_area.body.empty();
      this.progress_area.hide();
      this.heatmap_area.hide();
      this.chart_area.hide();
      this.links_area.body.find(".count, .open-notification").addClass("hidden");
      this.links_area.hide();
      this.stats_area_row.empty();
      this.stats_area.hide();
      this.parent.find(".custom").remove();
    }
    add_section(body_html, label = null, css_class = "custom", hidden = false) {
      let options = {
        label,
        css_class,
        hidden,
        body_html,
        make_card: true,
        collapsible: 1,
        is_dashboard_section: 1
      };
      return new Section(this.parent, options).body;
    }
    add_progress(title, percent, message) {
      let progress_chart = this.make_progress_chart(title);
      if (!$.isArray(percent)) {
        percent = this.format_percent(title, percent);
      }
      let progress = $('<div class="progress"></div>').appendTo(progress_chart);
      $.each(percent, function(i, opts) {
        $(`<div class="progress-bar ${opts.progress_class}" style="width: ${opts.width}" title="${opts.title}"></div>`).appendTo(progress);
      });
      if (!message)
        message = "";
      $(`<p class="progress-message text-muted small">${message}</p>`).appendTo(progress_chart);
      this.show();
      return progress_chart;
    }
    show_progress(title, percent, message) {
      this._progress_map = this._progress_map || {};
      let progress_chart = this._progress_map[title];
      if (!progress_chart || progress_chart.parent().length == 0) {
        progress_chart = this.add_progress(title, percent, message);
        this._progress_map[title] = progress_chart;
      }
      if (!$.isArray(percent)) {
        percent = this.format_percent(title, percent);
      }
      progress_chart.find(".progress-bar").each((i, progress_bar) => {
        const { progress_class, width } = percent[i];
        $(progress_bar).css("width", width).removeClass("progress-bar-danger progress-bar-success").addClass(progress_class);
      });
      if (!message)
        message = "";
      progress_chart.find(".progress-message").text(message);
    }
    hide_progress(title) {
      if (title) {
        this._progress_map[title].remove();
        delete this._progress_map[title];
      } else {
        this._progress_map = {};
        this.progress_area.hide();
      }
    }
    format_percent(title, percent) {
      const percentage = cint(percent);
      const width = percentage < 0 ? 100 : percentage;
      const progress_class = percentage < 0 ? "progress-bar-danger" : "progress-bar-success";
      return [
        {
          title,
          width: width + "%",
          progress_class
        }
      ];
    }
    make_progress_chart(title) {
      this.progress_area.show();
      let progress_chart = $('<div class="progress-chart" title="' + (title || "") + '"></div>').appendTo(this.progress_area.body);
      return progress_chart;
    }
    refresh() {
      this.reset();
      if (this.frm.doc.__islocal || !frappe.boot.desk_settings.dashboard) {
        return;
      }
      if (!this.data) {
        this.init_data();
      }
      let show = false;
      if (this.data && ((this.data.transactions || []).length || (this.data.reports || []).length)) {
        if (this.data.docstatus && this.frm.doc.docstatus !== this.data.docstatus) {
          return;
        }
        this.render_links();
        show = true;
      }
      this._fetched_counts = false;
      if (this.data.heatmap) {
        this.render_heatmap();
        show = true;
      }
      if (this.data.graph) {
        this.setup_graph();
      }
      if (show) {
        this.show();
      }
    }
    after_refresh() {
      this.links_area.body.find(".btn-new").each((i, el) => {
        if (this.frm.can_create($(el).attr("data-doctype"))) {
          $(el).removeClass("hidden");
        }
      });
      this.observe_link_render();
    }
    observe_link_render() {
      let me2 = this;
      let element = this.links_area.wrapper[0];
      new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio > 0) {
            me2.set_open_count();
            observer.disconnect();
          }
        });
      }).observe(element);
    }
    init_data() {
      this.data = this.frm.meta.__dashboard || {};
      if (!this.data.transactions)
        this.data.transactions = [];
      if (!this.data.internal_links)
        this.data.internal_links = {};
      if (!this.data.internal_and_external_links)
        this.data.internal_and_external_links = {};
      this.filter_permissions();
    }
    add_transactions(opts) {
      let group_added = [];
      if (!Array.isArray(opts))
        opts = [opts];
      if (!this.data) {
        this.init_data();
      }
      if (this.data && (this.data.transactions || []).length) {
        this.data.transactions.map((group) => {
          opts.map((d) => {
            if (d.label == group.label) {
              group_added.push(d.label);
              group.items.push(...d.items);
            }
          });
        });
        opts.map((d) => {
          if (!group_added.includes(d.label)) {
            this.data.transactions.push(d);
          }
        });
        this.filter_permissions();
      }
    }
    filter_permissions() {
      let transactions = [];
      (this.data.transactions || []).forEach(function(group) {
        let items = [];
        group.items.forEach(function(doctype2) {
          if (frappe.model.can_read(doctype2)) {
            items.push(doctype2);
          }
        });
        if (items.length) {
          group.items = items;
          transactions.push(group);
        }
      });
      this.data.transactions = transactions;
    }
    render_links() {
      let me2 = this;
      this.links_area.show();
      this.links_area.body.find(".btn-new").addClass("hidden");
      if (this.data_rendered) {
        return;
      }
      this.data.frm = this.frm;
      let transactions_area_body = this.transactions_area;
      $(frappe.render_template("form_links", this.data)).appendTo(transactions_area_body);
      this.render_report_links();
      transactions_area_body.find(".badge-link").on("click", function() {
        me2.open_document_list($(this).closest(".document-link"));
      });
      transactions_area_body.find(".open-notification").on("click", function() {
        me2.open_document_list($(this).parent(), true);
      });
      transactions_area_body.find(".btn-new").on("click", function() {
        me2.frm.make_new($(this).attr("data-doctype"));
      });
      this.data_rendered = true;
    }
    render_report_links() {
      let parent = this.transactions_area;
      if (this.data.reports && this.data.reports.length) {
        $(frappe.render_template("report_links", this.data)).appendTo(parent);
        parent.find(".report-link").on("click", (e) => {
          this.open_report($(e.target).parent());
        });
      }
    }
    open_report($link) {
      let report = $link.attr("data-report");
      let fieldname = this.data.non_standard_fieldnames ? this.data.non_standard_fieldnames[report] || this.data.fieldname : this.data.fieldname;
      frappe.provide("frappe.route_options");
      frappe.route_options[fieldname] = this.frm.doc.name;
      frappe.set_route("query-report", report);
    }
    open_document_list($link, show_open) {
      let doctype2 = $link.attr("data-doctype"), names = $link.attr("data-names") || [];
      if (this.internal_links_found && this.internal_links_found.find((d) => d.doctype === doctype2)) {
        if (names.length) {
          frappe.route_options = { name: ["in", names] };
        } else {
          return false;
        }
      } else if (this.data.fieldname) {
        frappe.route_options = this.get_document_filter(doctype2);
        if (show_open && frappe.ui.notifications) {
          frappe.ui.notifications.show_open_count_list(doctype2);
        }
      }
      frappe.set_route("List", doctype2, "List");
    }
    get_document_filter(doctype2) {
      let filter = {};
      let fieldname = this.data.non_standard_fieldnames ? this.data.non_standard_fieldnames[doctype2] || this.data.fieldname : this.data.fieldname;
      if (this.data.dynamic_links && this.data.dynamic_links[fieldname]) {
        let dynamic_fieldname = this.data.dynamic_links[fieldname][1];
        filter[dynamic_fieldname] = this.data.dynamic_links[fieldname][0];
      }
      filter[fieldname] = this.frm.doc.name;
      return filter;
    }
    set_open_count() {
      if (!this.data || !this.data.transactions || !this.data.fieldname || this.frm.is_new() || this._fetched_counts) {
        return;
      }
      let items = [], me2 = this;
      this.data.transactions.forEach(function(group) {
        group.items.forEach(function(item) {
          items.push(item);
        });
      });
      let method = this.data.method || "frappe.desk.notifications.get_open_count";
      frappe.call({
        type: "GET",
        method,
        args: {
          doctype: this.frm.doctype,
          name: this.frm.docname,
          items
        },
        callback: function(r) {
          if (r.message.timeline_data) {
            me2.update_heatmap(r.message.timeline_data);
          }
          me2.update_badges(r.message.count);
          me2.frm.dashboard_data = r.message;
          me2._fetched_counts = true;
          me2.frm.trigger("dashboard_update");
        }
      });
    }
    update_badges(count) {
      let me2 = this;
      this.internal_links_found = count.internal_links_found;
      $.each(count.internal_links_found, function(i, d) {
        me2.frm.dashboard.set_badge_count_for_internal_link(d.doctype, cint(d.open_count), cint(d.count), d.names);
      });
      $.each(count.external_links_found, function(i, d) {
        me2.frm.dashboard.set_badge_count_for_external_link(d.doctype, cint(d.open_count), cint(d.count));
      });
    }
    set_badge_count_for_external_link(doctype2, open_count, count) {
      let $link = $(this.transactions_area).find('.document-link[data-doctype="' + doctype2 + '"]');
      this.set_badge_count_common(open_count, count, $link);
    }
    set_badge_count_for_internal_link(doctype2, open_count, count, names) {
      let $link = $(this.transactions_area).find('.document-link[data-doctype="' + doctype2 + '"]');
      this.set_badge_count_common(open_count, count, $link);
      if (names && names.length) {
        $link.attr("data-names", names ? names.join(",") : "");
      } else {
        $link.find("a").attr("disabled", true);
      }
    }
    set_badge_count_common(open_count, count, $link) {
      if (open_count) {
        $link.find(".open-notification").removeClass("hidden").html(open_count > 99 ? "99+" : open_count);
      }
      if (count) {
        $link.find(".count").removeClass("hidden").text(count > 99 ? "99+" : count);
      }
    }
    update_heatmap(data) {
      if (this.heatmap) {
        this.heatmap.update({ dataPoints: data });
      }
    }
    render_heatmap() {
      this.heatmap = new frappe.Chart("#heatmap-" + frappe.model.scrub(this.frm.doctype), {
        type: "heatmap",
        start: new Date(moment().subtract(1, "year").toDate()),
        count_label: "interactions",
        discreteDomains: 1,
        radius: 3,
        data: {}
      });
      this.heatmap_area.show();
      this.heatmap_area.body.find("svg").css({ margin: "auto" });
      let heatmap_message = this.heatmap_area.body.find(".heatmap-message");
      if (this.data.heatmap_message) {
        heatmap_message.removeClass("hidden").html(this.data.heatmap_message);
      } else {
        heatmap_message.addClass("hidden");
      }
    }
    add_indicator(label, color) {
      this.show();
      this.stats_area.show();
      let indicators = this.stats_area_row.find(".indicator-column");
      let n_indicators = indicators.length + 1;
      let colspan;
      if (n_indicators > 4) {
        colspan = 3;
      } else {
        colspan = 12 / n_indicators;
      }
      if (indicators.length) {
        indicators.removeClass().addClass("col-sm-" + colspan).addClass("indicator-column");
      }
      let indicator = $('<div class="col-sm-' + colspan + ' indicator-column"><span class="indicator ' + color + '">' + label + "</span></div>").appendTo(this.stats_area_row);
      return indicator;
    }
    setup_graph() {
      let me2 = this;
      let method = this.data.graph_method;
      let args = {
        doctype: this.frm.doctype,
        docname: this.frm.doc.name
      };
      $.extend(args, this.data.graph_method_args);
      frappe.call({
        type: "GET",
        method,
        args,
        callback: function(r) {
          if (r.message) {
            me2.render_graph(r.message);
            me2.show();
          } else {
            me2.hide();
          }
        }
      });
    }
    render_graph(args) {
      this.chart_area.show();
      this.chart_area.body.empty();
      $.extend(args, {
        type: args.type || "line",
        colors: args.colors || ["green"],
        truncateLegends: 1,
        axisOptions: {
          shortenYAxisNumbers: 1,
          numberFormatter: frappe.utils.format_chart_axis_number
        }
      });
      this.show();
      this.chart = new frappe.Chart(".form-graph", args);
      if (!this.chart) {
        this.hide();
      }
    }
    show() {
      this.toggle_visibility(true);
    }
    hide() {
      this.toggle_visibility(false);
    }
    toggle_visibility(show) {
      this.parent.toggleClass("visible-section", show);
      this.parent.toggleClass("empty-section", !show);
    }
    set_headline(html, color) {
      this.frm.layout.show_message(html, color);
    }
    clear_headline() {
      this.frm.layout.show_message();
    }
    add_comment(text, alert_class, permanent) {
      this.set_headline_alert(text, alert_class);
      if (!permanent) {
        setTimeout(() => {
          this.clear_headline();
        }, 1e4);
      }
    }
    clear_comment() {
      this.clear_headline();
    }
    set_headline_alert(text, color) {
      if (text) {
        this.set_headline(`<div>${text}</div>`, color);
      } else {
        this.clear_headline();
      }
    }
  };

  // frappe/public/js/frappe/form/workflow.js
  frappe.ui.form.States = class FormStates {
    constructor(opts) {
      $.extend(this, opts);
      this.state_fieldname = frappe.workflow.get_state_fieldname(this.frm.doctype);
      if (!this.state_fieldname)
        return;
      this.update_fields = frappe.workflow.get_update_fields(this.frm.doctype);
      var me2 = this;
      $(this.frm.wrapper).bind("render_complete", function() {
        me2.refresh();
      });
    }
    setup_help() {
      var me2 = this;
      this.frm.page.add_action_item(__("Help"), function() {
        frappe.workflow.setup(me2.frm.doctype);
        var state = me2.get_state();
        var d = new frappe.ui.Dialog({
          title: "Workflow: " + frappe.workflow.workflows[me2.frm.doctype].name
        });
        frappe.workflow.get_transitions(me2.frm.doc).then((transitions) => {
          const next_actions = $.map(transitions, (d2) => `${d2.action.bold()} ${__("by Role")} ${d2.allowed}`).join(", ") || __("None: End of Workflow").bold();
          const document_editable_by = frappe.workflow.get_document_state_roles(me2.frm.doctype, state).map((role) => role.bold()).join(", ");
          $(d.body).html(`
					<p>${__("Current status")}: ${state.bold()}</p>
					<p>${__("Document is only editable by users with role")}: ${document_editable_by}</p>
					<p>${__("Next actions")}: ${next_actions}</p>
					<p>${__("{0}: Other permission rules may also apply", [__("Note").bold()])}</p>
				`).css({ padding: "15px" });
          d.show();
        });
      }, true);
    }
    refresh() {
      if (this.frm.doc.__islocal) {
        this.set_default_state();
        return;
      }
      const state = this.get_state();
      if (state) {
        this.show_actions(state);
      }
    }
    show_actions() {
      var added = false;
      var me2 = this;
      if (this.frm.doc.__unsaved === 1) {
        return;
      }
      function has_approval_access(transition) {
        let approval_access = false;
        const user = frappe.session.user;
        if (user === "Administrator" || transition.allow_self_approval || user !== me2.frm.doc.owner) {
          approval_access = true;
        }
        return approval_access;
      }
      frappe.workflow.get_transitions(this.frm.doc).then((transitions) => {
        this.frm.page.clear_actions_menu();
        transitions.forEach((d) => {
          if (frappe.user_roles.includes(d.allowed) && has_approval_access(d)) {
            added = true;
            me2.frm.page.add_action_item(__(d.action), function() {
              frappe.dom.freeze();
              me2.frm.selected_workflow_action = d.action;
              me2.frm.script_manager.trigger("before_workflow_action").then(() => {
                frappe.xcall("frappe.model.workflow.apply_workflow", {
                  doc: me2.frm.doc,
                  action: d.action
                }).then((doc) => {
                  frappe.model.sync(doc);
                  me2.frm.refresh();
                  me2.frm.selected_workflow_action = null;
                  me2.frm.script_manager.trigger("after_workflow_action");
                }).finally(() => {
                  frappe.dom.unfreeze();
                });
              });
            });
          }
        });
        this.setup_btn(added);
      });
    }
    setup_btn(action_added) {
      if (action_added) {
        this.frm.page.btn_primary.addClass("hide");
        this.frm.page.btn_secondary.addClass("hide");
        this.frm.toolbar.current_status = "";
        this.setup_help();
      }
    }
    set_default_state() {
      var default_state = frappe.workflow.get_default_state(this.frm.doctype, this.frm.doc.docstatus);
      if (default_state) {
        this.frm.set_value(this.state_fieldname, default_state);
      }
    }
    get_state() {
      if (!this.frm.doc[this.state_fieldname]) {
        this.set_default_state();
      }
      return this.frm.doc[this.state_fieldname];
    }
  };

  // frappe/public/js/frappe/form/save.js
  frappe.ui.form.save = function(frm, action, callback, btn) {
    $(btn).prop("disabled", true);
    const working_label = {
      Save: __("Saving", null, "Freeze message while saving a document"),
      Submit: __("Submitting", null, "Freeze message while submitting a document"),
      Update: __("Updating", null, "Freeze message while updating a document"),
      Amend: __("Amending", null, "Freeze message while amending a document"),
      Cancel: __("Cancelling", null, "Freeze message while cancelling a document")
    }[toTitle(action)];
    var freeze_message = working_label ? __(working_label) : "";
    var save = function() {
      remove_empty_rows();
      $(frm.wrapper).addClass("validated-form");
      if ((action !== "Save" || frm.is_dirty()) && check_mandatory()) {
        _call({
          method: "frappe.desk.form.save.savedocs",
          args: { doc: frm.doc, action },
          callback: function(r) {
            $(document).trigger("save", [frm.doc]);
            callback(r);
          },
          error: function(r) {
            callback(r);
          },
          btn,
          freeze_message
        });
      } else {
        !frm.is_dirty() && frappe.show_alert({ message: __("No changes in document"), indicator: "orange" });
        $(btn).prop("disabled", false);
      }
    };
    var remove_empty_rows = function() {
      const docs = frappe.model.get_all_docs(frm.doc);
      const tables = docs.filter((d) => {
        return frappe.model.is_table(d.doctype);
      });
      let modified_table_fields = [];
      tables.map((doc) => {
        const cells = frappe.meta.docfield_list[doc.doctype] || [];
        const in_list_view_cells = cells.filter((df) => {
          return cint(df.in_list_view) === 1;
        });
        const is_empty_row = function(cells2) {
          for (let i = 0; i < cells2.length; i++) {
            if (locals[doc.doctype][doc.name] && locals[doc.doctype][doc.name][cells2[i].fieldname]) {
              return false;
            }
          }
          return true;
        };
        if (is_empty_row(in_list_view_cells)) {
          frappe.model.clear_doc(doc.doctype, doc.name);
          modified_table_fields.push(doc.parentfield);
        }
      });
      modified_table_fields.forEach((field) => {
        frm.refresh_field(field);
      });
    };
    var cancel = function() {
      var args = {
        doctype: frm.doc.doctype,
        name: frm.doc.name
      };
      var workflow_state_fieldname = frappe.workflow.get_state_fieldname(frm.doctype);
      if (workflow_state_fieldname) {
        $.extend(args, {
          workflow_state_fieldname,
          workflow_state: frm.doc[workflow_state_fieldname]
        });
      }
      _call({
        method: "frappe.desk.form.save.cancel",
        args,
        callback: function(r) {
          $(document).trigger("save", [frm.doc]);
          callback(r);
        },
        btn,
        freeze_message
      });
    };
    var check_mandatory = function() {
      var has_errors = false;
      frm.scroll_set = false;
      if (frm.doc.docstatus == 2)
        return true;
      $.each(frappe.model.get_all_docs(frm.doc), function(i, doc) {
        var error_fields = [];
        var folded = false;
        $.each(frappe.meta.docfield_list[doc.doctype] || [], function(i2, docfield) {
          if (docfield.fieldname) {
            const df = frappe.meta.get_docfield(doc.doctype, docfield.fieldname, doc.name);
            if (df.fieldtype === "Fold") {
              folded = frm.layout.folded;
            }
            if (is_docfield_mandatory(doc, df) && !frappe.model.has_value(doc.doctype, doc.name, df.fieldname)) {
              has_errors = true;
              error_fields[error_fields.length] = __(df.label);
              if (!frm.scroll_set) {
                scroll_to(doc.parentfield || df.fieldname);
              }
              if (folded) {
                frm.layout.unfold();
                folded = false;
              }
            }
          }
        });
        if (frm.is_new() && frm.meta.autoname === "Prompt" && !frm.doc.__newname) {
          has_errors = true;
          error_fields = [__("Name"), ...error_fields];
        }
        if (error_fields.length) {
          let meta = frappe.get_meta(doc.doctype);
          if (meta.istable) {
            const table_field = frappe.meta.docfield_map[doc.parenttype][doc.parentfield];
            const table_label = __(table_field.label || frappe.unscrub(table_field.fieldname)).bold();
            var message = __("Mandatory fields required in table {0}, Row {1}", [
              table_label,
              doc.idx
            ]);
          } else {
            var message = __("Mandatory fields required in {0}", [__(doc.doctype)]);
          }
          message = message + "<br><br><ul><li>" + error_fields.join("</li><li>") + "</ul>";
          frappe.msgprint({
            message,
            indicator: "red",
            title: __("Missing Fields")
          });
          frm.refresh();
        }
      });
      return !has_errors;
    };
    let is_docfield_mandatory = function(doc, df) {
      if (df.reqd)
        return true;
      if (!df.mandatory_depends_on || !doc)
        return;
      let out = null;
      let expression = df.mandatory_depends_on;
      let parent = frappe.get_meta(df.parent);
      if (typeof expression === "boolean") {
        out = expression;
      } else if (typeof expression === "function") {
        out = expression(doc);
      } else if (expression.substr(0, 5) == "eval:") {
        try {
          out = frappe.utils.eval(expression.substr(5), { doc, parent });
          if (parent && parent.istable && expression.includes("is_submittable")) {
            out = true;
          }
        } catch (e) {
          frappe.throw(__('Invalid "mandatory_depends_on" expression'));
        }
      } else {
        var value = doc[expression];
        if ($.isArray(value)) {
          out = !!value.length;
        } else {
          out = !!value;
        }
      }
      return out;
    };
    const scroll_to = (fieldname) => {
      frm.scroll_to_field(fieldname);
      frm.scroll_set = true;
    };
    var _call = function(opts) {
      if (frappe.ui.form.is_saving) {
        console.log("Already saving. Please wait a few moments.");
        throw "saving";
      }
      if (frm.is_new()) {
        frappe.ui.form.remove_old_form_route();
      }
      frappe.ui.form.is_saving = true;
      return frappe.call({
        freeze: true,
        method: opts.method,
        args: opts.args,
        btn: opts.btn,
        callback: function(r) {
          opts.callback && opts.callback(r);
        },
        error: opts.error,
        always: function(r) {
          $(btn).prop("disabled", false);
          frappe.ui.form.is_saving = false;
          if (r) {
            var doc = r.docs && r.docs[0];
            if (doc) {
              frappe.ui.form.update_calling_link(doc);
            }
          }
        }
      });
    };
    if (action === "cancel") {
      cancel();
    } else {
      save();
    }
  };
  frappe.ui.form.remove_old_form_route = () => {
    let current_route = frappe.get_route().join("/");
    frappe.route_history = frappe.route_history.filter((route) => route.join("/") !== current_route);
  };
  frappe.ui.form.update_calling_link = (newdoc) => {
    if (!frappe._from_link)
      return;
    var doc = frappe.get_doc(frappe._from_link.doctype, frappe._from_link.docname);
    let is_valid_doctype = () => {
      if (frappe._from_link.df.fieldtype === "Link") {
        return newdoc.doctype === frappe._from_link.df.options;
      } else {
        return newdoc.doctype === doc[frappe._from_link.df.options];
      }
    };
    if (is_valid_doctype()) {
      frappe.model.with_doctype(newdoc.doctype, () => {
        let meta = frappe.get_meta(newdoc.doctype);
        if (doc && doc.parentfield) {
          $.each(frappe._from_link.frm.fields_dict[doc.parentfield].grid.grid_rows, function(index, field) {
            if (field.doc && field.doc.name === frappe._from_link.docname) {
              if (meta.title_field && meta.show_title_field_in_link) {
                frappe.utils.add_link_title(newdoc.doctype, newdoc.name, newdoc[meta.title_field]);
              }
              frappe._from_link.set_value(newdoc.name);
            }
          });
        } else {
          if (meta.title_field && meta.show_title_field_in_link) {
            frappe.utils.add_link_title(newdoc.doctype, newdoc.name, newdoc[meta.title_field]);
          }
          frappe._from_link.set_value(newdoc.name);
        }
        frappe._from_link.refresh();
        if (frappe._from_link.frm) {
          frappe.set_route("Form", frappe._from_link.frm.doctype, frappe._from_link.frm.docname).then(() => {
            frappe.utils.scroll_to(frappe._from_link_scrollY);
          });
        }
        frappe._from_link = null;
      });
    }
  };

  // frappe/public/js/frappe/form/print_utils.js
  frappe.ui.get_print_settings = function(pdf, callback, letter_head, pick_columns) {
    var print_settings = locals[":Print Settings"]["Print Settings"];
    var default_letter_head = locals[":Company"] && frappe.defaults.get_default("company") ? locals[":Company"][frappe.defaults.get_default("company")]["default_letter_head"] : "";
    var columns = [
      {
        fieldtype: "Check",
        fieldname: "with_letter_head",
        label: __("With Letter head")
      },
      {
        fieldtype: "Select",
        fieldname: "letter_head",
        label: __("Letter Head"),
        depends_on: "with_letter_head",
        options: Object.keys(frappe.boot.letter_heads),
        default: letter_head || default_letter_head
      },
      {
        fieldtype: "Select",
        fieldname: "orientation",
        label: __("Orientation"),
        options: [
          { value: "Landscape", label: __("Landscape") },
          { value: "Portrait", label: __("Portrait") }
        ],
        default: "Landscape"
      }
    ];
    if (pick_columns) {
      columns.push({
        label: __("Pick Columns"),
        fieldtype: "Check",
        fieldname: "pick_columns"
      }, {
        label: __("Select Columns"),
        fieldtype: "MultiCheck",
        fieldname: "columns",
        depends_on: "pick_columns",
        columns: 2,
        select_all: true,
        options: pick_columns.map((df) => ({
          label: __(df.label),
          value: df.fieldname
        }))
      });
    }
    return frappe.prompt(columns, function(data) {
      data = $.extend(print_settings, data);
      if (!data.with_letter_head) {
        data.letter_head = null;
      }
      if (data.letter_head) {
        data.letter_head = frappe.boot.letter_heads[print_settings.letter_head];
      }
      callback(data);
    }, __("Print Settings"));
  };
  frappe.ui.form.qz_connect = function() {
    return new Promise(function(resolve, reject) {
      frappe.ui.form.qz_init().then(() => {
        if (qz.websocket.isActive()) {
          resolve();
        } else {
          frappe.show_alert({
            message: __("Attempting Connection to QZ Tray..."),
            indicator: "blue"
          });
          qz.websocket.connect().then(() => {
            frappe.show_alert({
              message: __("Connected to QZ Tray!"),
              indicator: "green"
            });
            resolve();
          }, function retry(err) {
            if (err.message === "Unable to establish connection with QZ") {
              frappe.show_alert({
                message: __("Attempting to launch QZ Tray..."),
                indicator: "blue"
              }, 14);
              window.location.assign("qz:launch");
              qz.websocket.connect({
                retries: 3,
                delay: 1
              }).then(() => {
                frappe.show_alert({
                  message: __("Connected to QZ Tray!"),
                  indicator: "green"
                });
                resolve();
              }, () => {
                frappe.throw(__('Error connecting to QZ Tray Application...<br><br> You need to have QZ Tray application installed and running, to use the Raw Print feature.<br><br><a target="_blank" href="https://qz.io/download/">Click here to Download and install QZ Tray</a>.<br> <a target="_blank" href="https://erpnext.com/docs/user/manual/en/setting-up/print/raw-printing">Click here to learn more about Raw Printing</a>.'));
                reject();
              });
            } else {
              frappe.show_alert({
                message: "QZ Tray " + err.toString(),
                indicator: "red"
              }, 14);
              reject();
            }
          });
        }
      });
    });
  };
  frappe.ui.form.qz_init = function() {
    return new Promise((resolve) => {
      if (typeof qz === "object" && typeof qz.version === "string") {
        resolve();
      } else {
        let qz_required_assets = [
          "/assets/frappe/node_modules/js-sha256/build/sha256.min.js",
          "/assets/frappe/node_modules/qz-tray/qz-tray.js"
        ];
        frappe.require(qz_required_assets, () => {
          qz.api.setPromiseType(function promise(resolver) {
            return new Promise(resolver);
          });
          qz.api.setSha256Type(function(data) {
            return sha256(data);
          });
          resolve();
        });
      }
    });
  };
  frappe.ui.form.qz_get_printer_list = function() {
    return frappe.ui.form.qz_connect().then(function() {
      return qz.printers.find();
    }).then((data) => {
      return data;
    }).catch((err) => {
      frappe.ui.form.qz_fail(err);
    });
  };
  frappe.ui.form.qz_success = function() {
    frappe.show_alert({
      message: __("Print Sent to the printer!"),
      indicator: "green"
    });
  };
  frappe.ui.form.qz_fail = function(e) {
    frappe.show_alert({
      message: __("QZ Tray Failed: ") + e.toString(),
      indicator: "red"
    }, 20);
  };

  // frappe/public/js/frappe/form/success_action.js
  frappe.provide("frappe.ui.form");
  frappe.provide("frappe.success_action");
  frappe.ui.form.SuccessAction = class SuccessAction {
    constructor(form) {
      this.form = form;
      this.load_setting();
    }
    load_setting() {
      this.setting = frappe.boot.success_action.find((setting) => setting.ref_doctype === this.form.doctype);
    }
    show() {
      if (!this.setting)
        return;
      if (this.form.doc.docstatus === 0 && !this.is_first_creation())
        return;
      this.prepare_dom();
      this.show_alert();
    }
    prepare_dom() {
      this.container = $(document.body).find(".success-container");
      if (!this.container.length) {
        this.container = $('<div class="success-container">').appendTo(document.body);
      }
    }
    show_alert() {
      frappe.db.get_list(this.form.doctype, { limit: 2 }).then((result) => {
        const count = result.length;
        const setting = this.setting;
        let message = count === 1 ? setting.first_success_message : setting.message;
        const $buttons = this.get_actions().map((action) => {
          const $btn = $(`<button class="next-action"><span>${__(action.label)}</span></button>`);
          $btn.click(() => action.action(this.form));
          return $btn;
        });
        const next_action_container = $(`<div class="next-action-container"></div>`);
        next_action_container.append($buttons);
        const html = next_action_container;
        frappe.show_alert({
          message,
          body: html,
          indicator: "green"
        }, setting.action_timeout || 7);
      });
    }
    get_actions() {
      const actions = [];
      const checked_actions = this.setting.next_actions.split("\n");
      checked_actions.forEach((action) => {
        if (typeof action === "string" && this.default_actions[action]) {
          actions.push(this.default_actions[action]);
        } else if (typeof action === "object") {
          actions.push(action);
        }
      });
      return actions;
    }
    get default_actions() {
      return {
        new: {
          label: __("New"),
          action: (frm) => frappe.new_doc(frm.doctype)
        },
        print: {
          label: __("Print"),
          action: (frm) => frm.print_doc()
        },
        email: {
          label: __("Email"),
          action: (frm) => frm.email_doc()
        },
        list: {
          label: __("View All"),
          action: (frm) => {
            frappe.set_route("List", frm.doctype);
          }
        }
      };
    }
    is_first_creation() {
      let { modified, creation } = this.form.doc;
      modified = modified.split(".")[0];
      creation = creation.split(".")[0];
      return modified === creation;
    }
  };

  // ../book_room/book_room/public/js/frappe/form/form.js
  var import_script_manager = __toESM(require_script_manager());

  // frappe/public/js/frappe/form/script_helpers.js
  window.refresh_many = function(flist, dn, table_field) {
    for (var i in flist) {
      if (table_field)
        refresh_field(flist[i], dn, table_field);
      else
        refresh_field(flist[i]);
    }
  };
  window.refresh_field = function(n, docname, table_field) {
    if (typeof n == typeof [])
      refresh_many(n, docname, table_field);
    if (n && typeof n === "string" && table_field) {
      var grid = cur_frm.fields_dict[table_field].grid, field = frappe.utils.filter_dict(grid.docfields, { fieldname: n }), grid_row = grid.grid_rows_by_docname[docname];
      if (field && field.length) {
        field = field[0];
        var meta = frappe.meta.get_docfield(field.parent, field.fieldname, docname);
        $.extend(field, meta);
        if (grid_row) {
          grid_row.refresh_field(n);
        } else {
          grid.refresh();
        }
      }
    } else if (cur_frm) {
      cur_frm.refresh_field(n);
    }
  };
  window.set_field_options = function(n, txt) {
    cur_frm.set_df_property(n, "options", txt);
  };
  window.toggle_field = function(n, hidden) {
    var df = frappe.meta.get_docfield(cur_frm.doctype, n, cur_frm.docname);
    if (df) {
      df.hidden = hidden;
      refresh_field(n);
    } else {
      console.log((hidden ? "hide_field" : "unhide_field") + " cannot find field " + n);
    }
  };
  window.hide_field = function(n) {
    if (cur_frm) {
      if (n.substr)
        toggle_field(n, 1);
      else {
        for (var i in n)
          toggle_field(n[i], 1);
      }
    }
  };
  window.unhide_field = function(n) {
    if (cur_frm) {
      if (n.substr)
        toggle_field(n, 0);
      else {
        for (var i in n)
          toggle_field(n[i], 0);
      }
    }
  };

  // frappe/public/js/frappe/form/sidebar/assign_to.js
  frappe.ui.form.AssignTo = class AssignTo {
    constructor(opts) {
      $.extend(this, opts);
      this.btn = this.parent.find(".add-assignment-btn").on("click", () => this.add());
      this.btn_wrapper = this.btn.parent();
      this.refresh();
    }
    refresh() {
      if (this.frm.doc.__islocal) {
        this.parent.toggle(false);
        return;
      }
      this.parent.toggle(true);
      this.render(this.frm.get_docinfo().assignments);
    }
    render(assignments) {
      this.frm.get_docinfo().assignments = assignments;
      let assignments_wrapper = this.parent.find(".assignments");
      assignments_wrapper.empty();
      let assigned_users = assignments.map((d) => d.owner);
      if (!assigned_users.length) {
        assignments_wrapper.hide();
        return;
      }
      let avatar_group = frappe.avatar_group(assigned_users, 5, {
        align: "left",
        overlap: true
      });
      assignments_wrapper.show();
      assignments_wrapper.append(avatar_group);
      avatar_group.click(() => {
        new frappe.ui.form.AssignmentDialog({
          assignments: assigned_users,
          frm: this.frm
        });
      });
    }
    add() {
      var me2 = this;
      if (this.frm.is_new()) {
        frappe.throw(__("Please save the document before assignment"));
        return;
      }
      if (!me2.assign_to) {
        me2.assign_to = new frappe.ui.form.AssignToDialog({
          method: "frappe.desk.form.assign_to.add",
          doctype: me2.frm.doctype,
          docname: me2.frm.docname,
          frm: me2.frm,
          callback: function(r) {
            me2.render(r.message);
          }
        });
      }
      me2.assign_to.dialog.clear();
      me2.assign_to.dialog.show();
    }
    remove(owner) {
      if (this.frm.is_new()) {
        frappe.throw(__("Please save the document before removing assignment"));
        return;
      }
      return frappe.xcall("frappe.desk.form.assign_to.remove", {
        doctype: this.frm.doctype,
        name: this.frm.docname,
        assign_to: owner
      }).then((assignments) => {
        this.render(assignments);
      });
    }
  };
  frappe.ui.form.AssignToDialog = class AssignToDialog {
    constructor(opts) {
      $.extend(this, opts);
      this.make();
      this.set_description_from_doc();
    }
    make() {
      let me2 = this;
      me2.dialog = new frappe.ui.Dialog({
        title: __("Add to ToDo"),
        fields: me2.get_fields(),
        primary_action_label: __("Add"),
        primary_action: function() {
          let args = me2.dialog.get_values();
          if (args && args.assign_to) {
            me2.dialog.set_message("Assigning...");
            frappe.call({
              method: me2.method,
              args: $.extend(args, {
                doctype: me2.doctype,
                name: me2.docname,
                assign_to: args.assign_to,
                bulk_assign: me2.bulk_assign || false,
                re_assign: me2.re_assign || false
              }),
              btn: me2.dialog.get_primary_btn(),
              callback: function(r) {
                if (!r.exc) {
                  if (me2.callback) {
                    me2.callback(r);
                  }
                  me2.dialog && me2.dialog.hide();
                } else {
                  me2.dialog.clear_message();
                }
              }
            });
          }
        }
      });
    }
    assign_to_me() {
      let me2 = this;
      let assign_to = [];
      if (me2.dialog.get_value("assign_to_me")) {
        assign_to.push(frappe.session.user);
      }
      me2.dialog.set_value("assign_to", assign_to);
    }
    set_description_from_doc() {
      let me2 = this;
      if (me2.frm && me2.frm.meta.title_field) {
        me2.dialog.set_value("description", me2.frm.doc[me2.frm.meta.title_field]);
      }
    }
    get_fields() {
      let me2 = this;
      return [
        {
          label: __("Assign to me"),
          fieldtype: "Check",
          fieldname: "assign_to_me",
          default: 0,
          onchange: () => me2.assign_to_me()
        },
        {
          fieldtype: "MultiSelectPills",
          fieldname: "assign_to",
          label: __("Assign To"),
          reqd: true,
          get_data: function(txt) {
            return frappe.db.get_link_options("User", txt, {
              user_type: "System User",
              enabled: 1
            });
          }
        },
        {
          fieldtype: "Section Break"
        },
        {
          label: __("Complete By"),
          fieldtype: "Date",
          fieldname: "date"
        },
        {
          fieldtype: "Column Break"
        },
        {
          label: __("Priority"),
          fieldtype: "Select",
          fieldname: "priority",
          options: [
            {
              value: "Low",
              label: __("Low")
            },
            {
              value: "Medium",
              label: __("Medium")
            },
            {
              value: "High",
              label: __("High")
            }
          ],
          default: ["Low", "Medium", "High"].includes(me2.frm && me2.frm.doc.priority ? me2.frm.doc.priority : "Medium")
        },
        {
          fieldtype: "Section Break"
        },
        {
          label: __("Comment"),
          fieldtype: "Small Text",
          fieldname: "description"
        }
      ];
    }
  };
  frappe.ui.form.AssignmentDialog = class {
    constructor(opts) {
      this.frm = opts.frm;
      this.assignments = opts.assignments;
      this.make();
    }
    make() {
      this.dialog = new frappe.ui.Dialog({
        title: __("Assignments"),
        size: "small",
        no_focus: true,
        fields: [
          {
            label: __("Assign a user"),
            fieldname: "user",
            fieldtype: "Link",
            options: "User",
            change: () => {
              let value = this.dialog.get_value("user");
              if (value && !this.assigning) {
                this.assigning = true;
                this.dialog.set_df_property("user", "read_only", 1);
                this.dialog.set_df_property("user", "description", __("Assigning..."));
                this.add_assignment(value).then(() => {
                  this.dialog.set_value("user", null);
                }).finally(() => {
                  this.dialog.set_df_property("user", "description", null);
                  this.dialog.set_df_property("user", "read_only", 0);
                  this.assigning = false;
                });
              }
            }
          },
          {
            fieldtype: "HTML",
            fieldname: "assignment_list"
          }
        ]
      });
      this.assignment_list = $(this.dialog.get_field("assignment_list").wrapper);
      this.assignment_list.removeClass("frappe-control");
      this.assignments.forEach((assignment) => {
        this.update_assignment(assignment);
      });
      this.dialog.show();
    }
    render(assignments) {
      this.frm && this.frm.assign_to.render(assignments);
    }
    add_assignment(assignment) {
      return frappe.xcall("frappe.desk.form.assign_to.add", {
        doctype: this.frm.doctype,
        name: this.frm.docname,
        assign_to: [assignment]
      }).then((assignments) => {
        this.update_assignment(assignment);
        this.render(assignments);
      });
    }
    remove_assignment(assignment) {
      return frappe.xcall("frappe.desk.form.assign_to.remove", {
        doctype: this.frm.doctype,
        name: this.frm.docname,
        assign_to: assignment
      });
    }
    close_assignment(assignment) {
      return frappe.xcall("frappe.desk.form.assign_to.close", {
        doctype: this.frm.doctype,
        name: this.frm.docname,
        assign_to: assignment
      });
    }
    update_assignment(assignment) {
      const in_the_list = this.assignment_list.find(`[data-user="${assignment}"]`).length;
      if (!in_the_list) {
        this.assignment_list.append(this.get_assignment_row(assignment));
      }
    }
    get_assignment_row(assignment) {
      const row = $(`
			<div class="dialog-assignment-row" data-user="${assignment}">
				<div class="assignee">
					${frappe.avatar(assignment)}
					${frappe.user.full_name(assignment)}
				</div>
				<div class="btn-group btn-group-sm" role="group" aria-label="Actions">
				</div>
			</div>
		`);
      const btn_group = row.find(".btn-group");
      if (assignment === frappe.session.user) {
        btn_group.append(`
				<button type="button" class="btn btn-default complete-btn" title="${__("Done")}">
					${frappe.utils.icon("tick", "xs")}
				</button>
			`);
        btn_group.find(".complete-btn").click(() => {
          this.close_assignment(assignment).then((assignments) => {
            row.remove();
            this.render(assignments);
          });
        });
      }
      if (assignment === frappe.session.user || this.frm.perm[0].write) {
        btn_group.append(`
				<button type="button" class="btn btn-default remove-btn" title="${__("Cancel")}">
				${frappe.utils.icon("close")}
				</button>
			`);
        btn_group.find(".remove-btn").click(() => {
          this.remove_assignment(assignment).then((assignments) => {
            row.remove();
            this.render(assignments);
          });
        });
      }
      return row;
    }
  };

  // frappe/public/js/frappe/form/sidebar/attachments.js
  frappe.ui.form.Attachments = class Attachments {
    constructor(opts) {
      $.extend(this, opts);
      this.attachments_page_length = 10;
      this.show_all_attachments = false;
      this.make();
    }
    make() {
      var me2 = this;
      this.parent.find(".add-attachment-btn").click(function() {
        me2.new_attachment();
      });
      this.parent.find(".explore-btn").click(() => {
        frappe.open_in_new_tab = true;
        frappe.set_route("List", "File", {
          attached_to_doctype: this.frm.doctype,
          attached_to_name: this.frm.docname
        });
      });
      this.add_attachment_wrapper = this.parent.find(".attachments-actions");
      this.attachments_label = this.parent.find(".attachments-label");
    }
    max_reached(raise_exception = false) {
      const attachment_count = Object.keys(this.get_attachments()).length;
      const attachment_limit = this.frm.meta.max_attachments;
      if (attachment_limit && attachment_count >= attachment_limit) {
        if (raise_exception) {
          frappe.throw({
            title: __("Attachment Limit Reached"),
            message: __("Maximum attachment limit of {0} has been reached.", [
              cstr(attachment_limit).bold()
            ])
          });
        }
        return true;
      }
      return false;
    }
    refresh() {
      if (this.frm.doc.__islocal) {
        this.parent.toggle(false);
        return;
      }
      this.parent.toggle(true);
      this.parent.find(".attachment-row").remove();
      var max_reached = this.max_reached();
      this.add_attachment_wrapper.toggle(!max_reached);
      this.setup_expanded_explore_button(max_reached);
      var attachments = this.get_attachments();
      this.render_attachments(attachments);
      this.setup_show_all_button(attachments);
    }
    setup_expanded_explore_button(max_reached) {
      if (!max_reached) {
        this.parent.find(".explore-full-btn").addClass("hidden");
        return;
      }
      this.parent.find(".explore-full-btn").removeClass("hidden");
      this.parent.find(".explore-full-btn").click(() => {
        frappe.set_route("List", "File", {
          attached_to_doctype: this.frm.doctype,
          attached_to_name: this.frm.docname
        });
      });
    }
    setup_show_all_button(attachments) {
      let is_slicable = attachments.length > this.attachments_page_length;
      let show = !this.show_all_attachments && is_slicable;
      let show_all_btn = this.parent.find(".show-all-btn");
      if (!show) {
        show_all_btn.addClass("hidden");
        return;
      }
      show_all_btn.removeClass("hidden");
      show_all_btn.click(() => {
        show_all_btn.addClass("hidden");
        this.show_all_attachments = true;
        this.refresh();
      });
    }
    get_attachments() {
      return this.frm.get_docinfo().attachments || [];
    }
    render_attachments(attachments) {
      var me2 = this;
      let attachments_to_render = attachments;
      let is_slicable = attachments.length > this.attachments_page_length;
      if (!this.show_all_attachments && is_slicable) {
        let start = attachments.length - this.attachments_page_length;
        attachments_to_render = attachments.slice(start, attachments.length);
      }
      if (attachments_to_render.length) {
        let exists = {};
        let unique_attachments = attachments_to_render.filter((attachment) => {
          return Object.prototype.hasOwnProperty.call(exists, attachment.file_name) ? false : exists[attachment.file_name] = true;
        });
        unique_attachments.forEach((attachment) => {
          me2.add_attachment(attachment);
        });
      }
      if (!attachments.length) {
        this.attachments_label.removeClass("has-attachments");
        this.parent.find(".explore-btn").toggle(false);
      }
    }
    add_attachment(attachment) {
      var file_name = attachment.file_name;
      var file_url = this.get_file_url(attachment);
      var fileid = attachment.name;
      if (!file_name) {
        file_name = file_url;
      }
      var me2 = this;
      let file_label = `
			<a href="${file_url}" target="_blank" title="${frappe.utils.escape_html(file_name)}"
				class="ellipsis" style="max-width: calc(100% - 43px);"
			>
				<span>${file_name}</span>
			</a>`;
      let remove_action = null;
      if (frappe.model.can_write(this.frm.doctype, this.frm.name)) {
        remove_action = function(target_id) {
          frappe.confirm(__("Are you sure you want to delete the attachment?"), function() {
            let target_attachment = me2.get_attachments().find((attachment2) => attachment2.name === target_id);
            let to_be_removed = me2.get_attachments().filter((attachment2) => attachment2.file_name === target_attachment.file_name);
            to_be_removed.forEach((attachment2) => me2.remove_attachment(attachment2.name));
          });
          return false;
        };
      }
      const icon = `<a href="/app/file/${fileid}">
				${frappe.utils.icon(attachment.is_private ? "lock" : "unlock", "sm ml-0")}
			</a>`;
      $(`<li class="attachment-row">`).append(frappe.get_data_pill(file_label, fileid, remove_action, icon)).insertAfter(this.add_attachment_wrapper);
      this.parent.find(".explore-btn").toggle(true);
    }
    get_file_url(attachment) {
      var file_url = attachment.file_url;
      if (!file_url) {
        if (attachment.file_name.indexOf("files/") === 0) {
          file_url = "/" + attachment.file_name;
        } else {
          file_url = "/files/" + attachment.file_name;
        }
      }
      return encodeURI(file_url).replace(/#/g, "%23");
    }
    get_file_id_from_file_url(file_url) {
      var fid;
      $.each(this.get_attachments(), function(i, attachment) {
        if (attachment.file_url === file_url) {
          fid = attachment.name;
          return false;
        }
      });
      return fid;
    }
    remove_attachment_by_filename(filename, callback) {
      this.remove_attachment(this.get_file_id_from_file_url(filename), callback);
    }
    remove_attachment(fileid, callback) {
      if (!fileid) {
        if (callback)
          callback();
        return;
      }
      var me2 = this;
      return frappe.call({
        method: "frappe.desk.form.utils.remove_attach",
        type: "DELETE",
        args: {
          fid: fileid,
          dt: me2.frm.doctype,
          dn: me2.frm.docname
        },
        callback: function(r, rt) {
          if (r.exc) {
            if (!r._server_messages)
              frappe.msgprint(__("There were errors"));
            return;
          }
          me2.remove_fileid(fileid);
          me2.frm.sidebar.reload_docinfo();
          if (callback)
            callback();
        }
      });
    }
    new_attachment(fieldname) {
      if (this.dialog) {
        this.dialog.$wrapper.remove();
      }
      const restrictions = {};
      if (this.frm.meta.max_attachments) {
        restrictions.max_number_of_files = this.frm.meta.max_attachments - this.frm.attachments.get_attachments().length;
      }
      new frappe.ui.FileUploader({
        doctype: this.frm.doctype,
        docname: this.frm.docname,
        frm: this.frm,
        folder: "Home/Attachments",
        on_success: (file_doc) => {
          this.attachment_uploaded(file_doc);
        },
        restrictions,
        make_attachments_public: this.frm.meta.make_attachments_public
      });
    }
    get_args() {
      return {
        from_form: 1,
        doctype: this.frm.doctype,
        docname: this.frm.docname
      };
    }
    attachment_uploaded(attachment) {
      this.dialog && this.dialog.hide();
      this.update_attachment(attachment);
      this.frm.sidebar.reload_docinfo();
      if (this.fieldname) {
        this.frm.set_value(this.fieldname, attachment.file_url);
      }
    }
    update_attachment(attachment) {
      if (attachment.name) {
        this.add_to_attachments(attachment);
        this.refresh();
      }
    }
    add_to_attachments(attachment) {
      var form_attachments = this.get_attachments();
      for (var i in form_attachments) {
        if (form_attachments[i]["name"] === attachment.name)
          return;
      }
      form_attachments.push(attachment);
    }
    remove_fileid(fileid) {
      var attachments = this.get_attachments();
      var new_attachments = [];
      $.each(attachments, function(i, attachment) {
        if (attachment.name != fileid) {
          new_attachments.push(attachment);
        }
      });
      this.frm.get_docinfo().attachments = new_attachments;
      this.refresh();
    }
  };

  // frappe/public/js/frappe/form/sidebar/share.js
  frappe.ui.form.Share = class Share {
    constructor(opts) {
      $.extend(this, opts);
      this.shares = this.parent.find(".shares");
    }
    refresh() {
      this.render_sidebar();
    }
    render_sidebar() {
      const shared = this.shared || this.frm.get_docinfo().shared;
      const shared_users = shared.filter(Boolean).map((s) => s.user);
      if (this.frm.is_new()) {
        this.parent.find(".share-doc-btn").hide();
      }
      this.parent.find(".share-doc-btn").off("click").on("click", () => {
        this.frm.share_doc();
      });
      this.shares.empty();
      if (!shared_users.length) {
        this.shares.hide();
        return;
      }
      this.shares.show();
      this.shares.append(frappe.avatar_group(shared_users, 5, { align: "left", overlap: true }));
    }
    show() {
      var me2 = this;
      var d = new frappe.ui.Dialog({
        title: __("Share {0} with", [this.frm.doc.name])
      });
      this.dialog = d;
      this.dirty = false;
      $(d.body).html('<p class="text-muted">' + __("Loading...") + "</p>");
      frappe.call({
        method: "frappe.share.get_users",
        args: {
          doctype: this.frm.doctype,
          name: this.frm.doc.name
        },
        callback: function(r) {
          me2.render_shared(r.message || []);
        }
      });
      d.onhide = function() {
        if (me2.dirty)
          me2.frm.sidebar.reload_docinfo();
      };
      d.show();
    }
    render_shared(shared) {
      if (shared)
        this.shared = shared;
      var d = this.dialog;
      $(d.body).empty();
      var everyone = {};
      $.each(this.shared, function(i, s) {
        if (s && s.everyone) {
          everyone = s;
        }
      });
      $(frappe.render_template("set_sharing", {
        frm: this.frm,
        shared: this.shared,
        everyone
      })).appendTo(d.body);
      if (frappe.model.can_share(null, this.frm)) {
        this.make_user_input();
        this.add_share_button();
        this.set_edit_share_events();
      } else {
        $(d.body).find(".edit-share").prop("disabled", true);
      }
    }
    make_user_input() {
      this.dialog.share_with = frappe.ui.form.make_control({
        parent: $(this.dialog.body).find(".input-wrapper-add-share"),
        df: {
          fieldtype: "Link",
          label: __("Share With"),
          fieldname: "share_with",
          options: "User",
          filters: {
            user_type: "System User",
            name: ["!=", frappe.session.user]
          }
        },
        only_input: true,
        render_input: true
      });
    }
    add_share_button() {
      var me2 = this, d = this.dialog;
      $(d.body).find(".btn-add-share").on("click", function() {
        var user = d.share_with.get_value();
        if (!user) {
          return;
        }
        frappe.call({
          method: "frappe.share.add",
          args: {
            doctype: me2.frm.doctype,
            name: me2.frm.doc.name,
            user,
            read: $(d.body).find(".add-share-read").prop("checked") ? 1 : 0,
            write: $(d.body).find(".add-share-write").prop("checked") ? 1 : 0,
            submit: $(d.body).find(".add-share-submit").prop("checked") ? 1 : 0,
            share: $(d.body).find(".add-share-share").prop("checked") ? 1 : 0,
            notify: 1
          },
          btn: this,
          callback: function(r) {
            $.each(me2.shared, function(i, s) {
              if (s && s.user === r.message.user) {
                delete me2.shared[i];
              }
            });
            me2.dirty = true;
            me2.shared.push(r.message);
            me2.render_shared();
            me2.frm.shared.refresh();
          }
        });
      });
    }
    set_edit_share_events() {
      var me2 = this, d = this.dialog;
      $(d.body).find(".edit-share").on("click", function() {
        var user = $(this).parents(".shared-user:first").attr("data-user") || "", value = $(this).prop("checked") ? 1 : 0, property = $(this).attr("name"), everyone = cint($(this).parents(".shared-user:first").attr("data-everyone"));
        frappe.call({
          method: "frappe.share.set_permission",
          args: {
            doctype: me2.frm.doctype,
            name: me2.frm.doc.name,
            user,
            permission_to: property,
            value,
            everyone
          },
          callback: function(r) {
            var found = null;
            $.each(me2.shared, function(i, s) {
              if (s && (s.user === user || everyone && s.everyone === 1)) {
                if (!r.message) {
                  delete me2.shared[i];
                } else {
                  me2.shared[i] = $.extend(s, r.message);
                }
                found = true;
                return false;
              }
            });
            if (!found) {
              me2.shared.push(r.message);
            }
            me2.dirty = true;
            me2.render_shared();
            me2.frm.shared.refresh();
          }
        });
      });
    }
  };

  // frappe/public/js/frappe/form/sidebar/review.js
  frappe.ui.form.Review = class Review {
    constructor({ parent, frm }) {
      this.parent = parent;
      this.frm = frm;
      this.points = frappe.boot.points;
      this.reviews = this.parent.find(".reviews");
      this.setup_add_review_button();
      this.update_reviewers();
    }
    update_points() {
      return frappe.xcall("frappe.social.doctype.energy_point_log.energy_point_log.get_energy_points", {
        user: frappe.session.user
      }).then((data) => {
        frappe.boot.points = data;
        this.points = data;
      });
    }
    setup_add_review_button() {
      const review_button = this.reviews.find(".add-review-btn");
      if (!this.points.review_points) {
        review_button.click(false);
        review_button.popover({
          trigger: "hover",
          content: () => {
            return `<div class="text-medium">
						${__("You do not have enough review points")}
					</div>`;
          },
          html: true
        });
      } else {
        review_button.click(() => this.show_review_dialog());
      }
    }
    show_review_dialog() {
      const user_options = this.frm.get_involved_users();
      const review_dialog = new frappe.ui.Dialog({
        title: __("Add Review"),
        fields: [
          {
            fieldname: "to_user",
            fieldtype: "Autocomplete",
            label: __("To User"),
            reqd: 1,
            options: user_options,
            ignore_validation: 1,
            description: __("Only users involved in the document are listed")
          },
          {
            fieldname: "review_type",
            fieldtype: "Select",
            label: __("Action"),
            options: [
              {
                label: __("Appreciate"),
                value: "Appreciation"
              },
              {
                label: __("Criticize"),
                value: "Criticism"
              }
            ],
            default: "Appreciation"
          },
          {
            fieldname: "points",
            fieldtype: "Int",
            label: __("Points"),
            reqd: 1,
            description: __("Currently you have {0} review points", [
              this.points.review_points
            ])
          },
          {
            fieldtype: "Small Text",
            fieldname: "reason",
            reqd: 1,
            label: __("Reason")
          }
        ],
        primary_action: (values) => {
          review_dialog.disable_primary_action();
          if (values.points > this.points.review_points) {
            return frappe.msgprint(__("You do not have enough points"));
          }
          frappe.xcall("frappe.social.doctype.energy_point_log.energy_point_log.review", {
            doc: {
              doctype: this.frm.doc.doctype,
              name: this.frm.doc.name
            },
            to_user: values.to_user,
            points: values.points,
            review_type: values.review_type,
            reason: values.reason
          }).then((review) => {
            review_dialog.hide();
            review_dialog.clear();
            this.frm.get_docinfo().energy_point_logs.unshift(review);
            this.frm.timeline.refresh();
            this.update_reviewers();
            this.update_points();
          }).finally(() => {
            review_dialog.enable_primary_action();
          });
        },
        primary_action_label: __("Submit")
      });
      review_dialog.show();
    }
    update_reviewers() {
      const review_logs = this.frm.get_docinfo().energy_point_logs.filter((log) => ["Appreciation", "Criticism"].includes(log.type));
      this.reviews.find(".review").remove();
      review_logs.forEach((log) => {
        let review_pill = $(`
				<div class="review ${log.points < 0 ? "criticism" : "appreciation"} cursor-pointer">
					${frappe.avatar(log.owner)}
					<span class="review-points">
						${log.points > 0 ? "+" : ""}${log.points}
					</span>
				</div>
			`);
        this.reviews.prepend(review_pill);
        this.setup_detail_popover(review_pill, log);
      });
    }
    setup_detail_popover(el, data) {
      let subject = "";
      let fullname = frappe.user.full_name(data.user);
      let timestamp = `<span class="text-muted">${frappe.datetime.comment_when(data.creation)}</span>`;
      let message_parts = [Math.abs(data.points), fullname, timestamp];
      if (data.type === "Appreciation") {
        if (data.points == 1) {
          subject = __("{0} appreciation point for {1}", message_parts);
        } else {
          subject = __("{0} appreciation points for {1}", message_parts);
        }
      } else {
        if (data.points == -1) {
          subject = __("{0} criticism point for {1}", message_parts);
        } else {
          subject = __("{0} criticism points for {1}", message_parts);
        }
      }
      el.popover({
        animation: true,
        trigger: "hover",
        delay: 500,
        placement: "top",
        template: `
				<div class="review-popover popover" role="tooltip">
					<div class="arrow"></div>
					<h3 class="popover-header"></h3>
					<div class="popover-body">
					</div>
				</div>'
			`,
        content: () => {
          return `
					<div class="text-medium">
						<div class="body">
							<div>${data.reason}</div>
						</div>

						<div class="subject">
							${frappe.utils.icon("review")}
							${subject}

							<p class="mt-1">
								<!-- ${frappe.avatar("shivam@example.com", "avatar-xs")} -->
								<span>${frappe.user.full_name(data.owner)}</span> - ${timestamp}
							</p>
						</div>
					</div>
				`;
        },
        html: true,
        container: "body"
      });
      return el;
    }
  };

  // frappe/public/js/frappe/form/sidebar/document_follow.js
  frappe.provide("frappe.ui.form");
  frappe.ui.form.DocumentFollow = class DocumentFollow {
    constructor(opts) {
      $.extend(this, opts);
      if (!frappe.boot.user.document_follow_notify) {
        this.hide_follow_section();
        return;
      }
      this.follow_document_link = this.parent.find(".follow-document-link");
      this.unfollow_document_link = this.parent.find(".unfollow-document-link");
      this.follow_span = this.parent.find(".anchor-document-follow > span");
      this.followed_by = this.parent.find(".followed-by");
      this.followed_by_label = this.parent.find(".followed-by-label");
    }
    refresh() {
      this.set_followers();
      this.render_sidebar();
    }
    render_sidebar() {
      const docinfo = this.frm.get_docinfo();
      const document_follow_enabled = frappe.boot.user.document_follow_notify;
      const document_can_be_followed = frappe.get_meta(this.frm.doctype).track_changes;
      if (frappe.session.user === "Administrator" || !document_follow_enabled || !document_can_be_followed) {
        this.hide_follow_section();
        return;
      }
      this.bind_events();
      const is_followed = docinfo && docinfo.is_document_followed;
      if (is_followed > 0) {
        this.unfollow_document_link.removeClass("hidden");
        this.follow_document_link.addClass("hidden");
      } else {
        this.followed_by_label.addClass("hidden");
        this.followed_by.addClass("hidden");
        this.unfollow_document_link.addClass("hidden");
        this.follow_document_link.removeClass("hidden");
      }
    }
    bind_events() {
      this.follow_document_link.on("click", () => {
        this.follow_document_link.addClass("text-muted disable-click");
        frappe.call({
          method: "frappe.desk.form.document_follow.follow_document",
          args: {
            doctype: this.frm.doctype,
            doc_name: this.frm.doc.name,
            user: frappe.session.user,
            force: true
          },
          callback: (r) => {
            if (r.message) {
              this.follow_action();
            }
          }
        });
      });
      this.unfollow_document_link.on("click", () => {
        this.unfollow_document_link.addClass("text-muted disable-click");
        frappe.call({
          method: "frappe.desk.form.document_follow.unfollow_document",
          args: {
            doctype: this.frm.doctype,
            doc_name: this.frm.doc.name,
            user: frappe.session.user
          },
          callback: (r) => {
            if (r.message) {
              this.unfollow_action();
            }
          }
        });
      });
    }
    hide_follow_section() {
      this.parent.hide();
    }
    set_followers() {
      this.followed_by.removeClass("hidden");
      this.followed_by_label.removeClass("hidden");
      this.followed_by.empty();
      this.get_followed_user().then((user) => {
        $(user).appendTo(this.followed_by);
      });
    }
    get_followed_user() {
      var html = "";
      return new Promise((resolve) => {
        frappe.call({
          method: "frappe.desk.form.document_follow.get_follow_users",
          args: {
            doctype: this.frm.doctype,
            doc_name: this.frm.doc.name
          }
        }).then((r) => {
          this.count_others = 0;
          for (var d in r.message) {
            this.count_others++;
            if (this.count_others < 4) {
              html += frappe.avatar(r.message[d].user, "avatar-small");
            }
            if (this.count_others === 0) {
              this.followed_by.addClass("hidden");
            }
          }
          resolve(html);
        });
      });
    }
    follow_action() {
      frappe.show_alert({
        message: __("You are now following this document. You will receive daily updates via email. You can change this in User Settings."),
        indicator: "orange"
      });
      this.follow_document_link.removeClass("text-muted disable-click");
      this.follow_document_link.addClass("hidden");
      this.unfollow_document_link.removeClass("hidden");
      this.set_followers();
    }
    unfollow_action() {
      frappe.show_alert({
        message: __("You unfollowed this document"),
        indicator: "red"
      });
      this.unfollow_document_link.removeClass("text-muted disable-click");
      this.unfollow_document_link.addClass("hidden");
      this.follow_document_link.removeClass("hidden");
      this.followed_by.addClass("hidden");
      this.followed_by_label.addClass("hidden");
    }
  };

  // frappe/public/js/frappe/form/sidebar/user_image.js
  frappe.ui.form.set_user_image = function(frm) {
    var image_section = frm.sidebar.image_section;
    var image_field = frm.meta.image_field;
    var image = frm.doc[image_field];
    var title_image = frm.page.$title_area.find(".title-image");
    var image_actions = frm.sidebar.image_wrapper.find(".sidebar-image-actions");
    image_section.toggleClass("hide", image_field ? false : true);
    title_image.toggleClass("hide", image_field ? false : true);
    if (!image_field) {
      return;
    }
    if (image) {
      image = window.cordova && image.indexOf("http") === -1 ? frappe.base_url + image : image;
      image_section.find(".sidebar-image").attr("src", image).removeClass("hide");
      image_section.find(".sidebar-standard-image").addClass("hide");
      title_image.css("background-image", `url("${image}")`).html("");
      image_actions.find(".sidebar-image-change, .sidebar-image-remove").show();
    } else {
      image_section.find(".sidebar-image").attr("src", null).addClass("hide");
      var title = frm.get_title();
      image_section.find(".sidebar-standard-image").removeClass("hide").find(".standard-image").html(frappe.get_abbr(title));
      title_image.css("background-image", "").html(frappe.get_abbr(title));
      image_actions.find(".sidebar-image-change").show();
      image_actions.find(".sidebar-image-remove").hide();
    }
  };
  frappe.ui.form.setup_user_image_event = function(frm) {
    if (frm.meta.image_field) {
      frappe.ui.form.on(frm.doctype, frm.meta.image_field, function(frm2) {
        frappe.ui.form.set_user_image(frm2);
      });
    }
    if (frm.meta.image_field && !frm.fields_dict[frm.meta.image_field].df.read_only) {
      frm.sidebar.image_wrapper.on("click", ":not(.sidebar-image-actions)", (e) => {
        let $target = $(e.currentTarget);
        if ($target.is("a.dropdown-toggle, .dropdown")) {
          return;
        }
        let dropdown = frm.sidebar.image_wrapper.find(".sidebar-image-actions .dropdown");
        dropdown.toggleClass("open");
        e.stopPropagation();
      });
    }
    frm.sidebar.image_wrapper.on("click", ".sidebar-image-change, .sidebar-image-remove", function(e) {
      var _a, _b;
      let $target = $(e.currentTarget);
      var field = frm.get_field(frm.meta.image_field);
      if ($target.is(".sidebar-image-change")) {
        if (!field.$input) {
          field.make_input();
        }
        field.$input.trigger("attach_doc_image");
        (_b = (_a = frm.page).close_sidebar) == null ? void 0 : _b.call(_a);
      } else {
        frm.attachments.remove_attachment_by_filename(frm.doc[frm.meta.image_field], function() {
          field.set_value("").then(() => frm.save());
        });
      }
    });
  };

  // frappe/public/js/frappe/form/sidebar/form_sidebar_users.js
  frappe.ui.form.SidebarUsers = class {
    constructor(opts) {
      $.extend(this, opts);
    }
    get_users(type) {
      let docinfo = this.frm.get_docinfo();
      return docinfo ? docinfo[type] || null : null;
    }
    refresh(data_updated, type) {
      this.parent = type == "viewers" ? this.$wrapper.find(".form-viewers") : this.$wrapper.find(".form-typers");
      this.parent.empty();
      const users = this.get_users(type);
      users && this.show_in_sidebar(users, type, data_updated);
    }
    show_in_sidebar(users, type, show_alert) {
      let sidebar_users = [];
      let new_users = [];
      let current_users = [];
      const message = type == "viewers" ? "viewing this document" : "composing an email";
      users.current.forEach((username) => {
        if (username === frappe.session.user) {
          return;
        }
        var user_info = frappe.user_info(username);
        sidebar_users.push({
          image: user_info.image,
          fullname: user_info.fullname,
          abbr: user_info.abbr,
          color: user_info.color,
          title: __("{0} is currently {1}", [user_info.fullname, message])
        });
        if (users.new.indexOf(username) !== -1) {
          new_users.push(user_info.fullname);
        }
        current_users.push(user_info.fullname);
      });
      if (sidebar_users.length) {
        this.parent.parent().removeClass("hidden");
        this.parent.append(frappe.render_template("users_in_sidebar", { users: sidebar_users }));
      } else {
        this.parent.parent().addClass("hidden");
      }
      const alert_users = type == "viewers" ? new_users : current_users;
      show_alert && this.show_alert(alert_users, message);
    }
    show_alert(users, message) {
      if (users.length) {
        if (users.length === 1) {
          frappe.show_alert(__("{0} is currently {1}", [users[0], message]));
        } else {
          frappe.show_alert(__("{0} are currently {1}", [frappe.utils.comma_and(users), message]));
        }
      }
    }
  };

  // frappe/public/js/frappe/form/sidebar/form_sidebar.js
  frappe.ui.form.Sidebar = class {
    constructor(opts) {
      $.extend(this, opts);
    }
    make() {
      var sidebar_content = frappe.render_template("form_sidebar", {
        doctype: this.frm.doctype,
        frm: this.frm
      });
      this.sidebar = $('<div class="form-sidebar overlay-sidebar hidden-xs hidden-sm"></div>').html(sidebar_content).appendTo(this.page.sidebar.empty());
      this.comments = this.sidebar.find(".form-sidebar-stats .comments");
      this.user_actions = this.sidebar.find(".user-actions");
      this.image_section = this.sidebar.find(".sidebar-image-section");
      this.image_wrapper = this.image_section.find(".sidebar-image-wrapper");
      this.make_assignments();
      this.make_attachments();
      this.make_review();
      this.make_shared();
      this.make_tags();
      this.make_like();
      this.make_follow();
      this.bind_events();
      this.setup_keyboard_shortcuts();
      this.show_auto_repeat_status();
      frappe.ui.form.setup_user_image_event(this.frm);
      this.refresh();
    }
    bind_events() {
      var me2 = this;
      this.comments.on("click", function() {
        frappe.utils.scroll_to(me2.frm.footer.wrapper.find(".comment-box"), true);
      });
      this.like_icon.on("click", function() {
        frappe.ui.toggle_like(me2.like_wrapper, me2.frm.doctype, me2.frm.doc.name, function() {
          me2.refresh_like();
        });
      });
    }
    setup_keyboard_shortcuts() {
      let assignment_link = this.sidebar.find(".add-assignment");
      frappe.ui.keys.get_shortcut_group(this.page).add(assignment_link);
    }
    refresh() {
      if (this.frm.doc.__islocal) {
        this.sidebar.toggle(false);
        this.page.sidebar.addClass("hide-sidebar");
      } else {
        this.page.sidebar.removeClass("hide-sidebar");
        this.sidebar.toggle(true);
        this.frm.assign_to.refresh();
        this.frm.attachments.refresh();
        this.frm.shared.refresh();
        this.frm.tags && this.frm.tags.refresh(this.frm.get_docinfo().tags);
        if (this.frm.doc.route && cint(frappe.boot.website_tracking_enabled)) {
          let route = this.frm.doc.route;
          frappe.utils.get_page_view_count(route).then((res) => {
            this.sidebar.find(".pageview-count").html(__("{0} Page Views", [String(res.message).bold()]));
          });
        }
        this.sidebar.find(".modified-by").html(__("{0} edited this {1}", [
          frappe.user.full_name(this.frm.doc.modified_by).bold(),
          "<br>" + comment_when(this.frm.doc.modified)
        ], "For example, 'Jon Doe edited this 5 minutes ago'."));
        this.sidebar.find(".created-by").html(__("{0} created this {1}", [
          frappe.user.full_name(this.frm.doc.owner).bold(),
          "<br>" + comment_when(this.frm.doc.creation)
        ], "For example, 'Jon Doe created this 5 minutes ago'."));
        this.refresh_like();
        this.refresh_follow();
        this.refresh_comments_count();
        frappe.ui.form.set_user_image(this.frm);
      }
    }
    show_auto_repeat_status() {
      if (this.frm.meta.allow_auto_repeat && this.frm.doc.auto_repeat) {
        const me2 = this;
        frappe.call({
          method: "frappe.client.get_value",
          args: {
            doctype: "Auto Repeat",
            filters: {
              name: this.frm.doc.auto_repeat
            },
            fieldname: ["frequency"]
          },
          callback: function(res) {
            me2.sidebar.find(".auto-repeat-status").html(__("Repeats {0}", [__(res.message.frequency)]));
            me2.sidebar.find(".auto-repeat-status").on("click", function() {
              frappe.set_route("Form", "Auto Repeat", me2.frm.doc.auto_repeat);
            });
          }
        });
      }
    }
    make_tags() {
      if (this.frm.meta.issingle) {
        this.sidebar.find(".form-tags").toggle(false);
        return;
      }
      let tags_parent = this.sidebar.find(".form-tags");
      this.frm.tags = new frappe.ui.TagEditor({
        parent: tags_parent,
        add_button: tags_parent.find(".add-tags-btn"),
        frm: this.frm,
        on_change: function(user_tags) {
          this.frm.tags && this.frm.tags.refresh(user_tags);
        }
      });
    }
    make_attachments() {
      var me2 = this;
      this.frm.attachments = new frappe.ui.form.Attachments({
        parent: me2.sidebar.find(".form-attachments"),
        frm: me2.frm
      });
    }
    make_assignments() {
      this.frm.assign_to = new frappe.ui.form.AssignTo({
        parent: this.sidebar.find(".form-assignments"),
        frm: this.frm
      });
    }
    make_shared() {
      this.frm.shared = new frappe.ui.form.Share({
        frm: this.frm,
        parent: this.sidebar.find(".form-shared")
      });
    }
    add_user_action(label, click) {
      return $("<a>").html(label).appendTo($('<li class="user-action-row">').appendTo(this.user_actions.removeClass("hidden"))).on("click", click);
    }
    clear_user_actions() {
      this.user_actions.addClass("hidden");
      this.user_actions.find(".user-action-row").remove();
    }
    make_like() {
      this.like_wrapper = this.sidebar.find(".liked-by");
      this.like_icon = this.sidebar.find(".liked-by .like-icon");
      this.like_count = this.sidebar.find(".liked-by .like-count");
      frappe.ui.setup_like_popover(this.sidebar.find(".form-stats-likes"), ".like-icon");
    }
    make_follow() {
      this.follow_button = this.sidebar.find(".form-sidebar-stats .form-follow");
      this.follow_button.on("click", () => {
        let is_followed = this.frm.get_docinfo().is_document_followed;
        frappe.call("frappe.desk.form.document_follow.update_follow", {
          doctype: this.frm.doctype,
          doc_name: this.frm.doc.name,
          following: !is_followed
        }).then(() => {
          frappe.model.set_docinfo(this.frm.doctype, this.frm.doc.name, "is_document_followed", !is_followed);
          this.refresh_follow(!is_followed);
        });
      });
    }
    refresh_follow(follow) {
      if (follow == null) {
        follow = this.frm.get_docinfo().is_document_followed;
      }
      this.follow_button.text(follow ? __("Unfollow") : __("Follow"));
    }
    refresh_like() {
      if (!this.like_icon) {
        return;
      }
      this.like_wrapper.attr("data-liked-by", this.frm.doc._liked_by);
      const liked = frappe.ui.is_liked(this.frm.doc);
      this.like_wrapper.toggleClass("not-liked", !liked).toggleClass("liked", liked).attr("data-doctype", this.frm.doctype).attr("data-name", this.frm.doc.name);
      this.like_count && this.like_count.text(JSON.parse(this.frm.doc._liked_by || "[]").length);
    }
    refresh_comments_count() {
      let count = (this.frm.get_docinfo().comments || []).length;
      this.comments.find(".comments-count").html(count);
    }
    refresh_image() {
    }
    make_review() {
      const review_wrapper = this.sidebar.find(".form-reviews");
      if (frappe.boot.energy_points_enabled && !this.frm.is_new()) {
        this.frm.reviews = new frappe.ui.form.Review({
          parent: review_wrapper,
          frm: this.frm
        });
      } else {
        review_wrapper.remove();
      }
    }
    reload_docinfo(callback) {
      frappe.call({
        method: "frappe.desk.form.load.get_docinfo",
        args: {
          doctype: this.frm.doctype,
          name: this.frm.docname
        },
        callback: (r) => {
          if (callback)
            callback(r.docinfo);
          this.frm.timeline && this.frm.timeline.refresh();
          this.frm.assign_to.refresh();
          this.frm.attachments.refresh();
        }
      });
    }
  };

  // frappe/public/js/frappe/form/footer/base_timeline.js
  var BaseTimeline = class {
    constructor(opts) {
      Object.assign(this, opts);
      this.make();
    }
    make() {
      this.timeline_wrapper = $(`<div class="new-timeline">`);
      this.wrapper = this.timeline_wrapper;
      this.timeline_items_wrapper = $(`<div class="timeline-items">`);
      this.timeline_actions_wrapper = $(`
			<div class="timeline-items timeline-actions">
				<div class="timeline-item">
					<div class="timeline-dot"></div>
					<div class="timeline-content action-buttons"></div>
				</div>
			</div>
		`);
      this.timeline_wrapper.append(this.timeline_actions_wrapper);
      this.timeline_actions_wrapper.hide();
      this.timeline_wrapper.append(this.timeline_items_wrapper);
      this.parent.replaceWith(this.timeline_wrapper);
      this.timeline_items = [];
    }
    refresh() {
      this.render_timeline_items();
    }
    add_action_button(label, action, icon = null, btn_class = null) {
      let icon_element = icon ? frappe.utils.icon(icon, "xs") : null;
      this.timeline_actions_wrapper.show();
      let action_btn = $(`<button class="btn btn-xs ${btn_class || "btn-default"} action-btn">
			${icon_element}
			${label}
		</button>`);
      action_btn.click(action);
      this.timeline_actions_wrapper.find(".action-buttons").append(action_btn);
      return action_btn;
    }
    render_timeline_items() {
      this.timeline_items_wrapper.empty();
      this.timeline_items = [];
      this.doc_info = this.frm && this.frm.get_docinfo() || {};
      let response = this.prepare_timeline_contents();
      if (response instanceof Promise) {
        response.then(() => {
          this.timeline_items.sort((item1, item2) => new Date(item2.creation) - new Date(item1.creation));
          this.timeline_items.forEach(this.add_timeline_item.bind(this));
        });
      } else {
        this.timeline_items.sort((item1, item2) => new Date(item2.creation) - new Date(item1.creation));
        this.timeline_items.forEach(this.add_timeline_item.bind(this));
      }
    }
    prepare_timeline_contents() {
    }
    add_timeline_item(item, append_at_the_end = false) {
      let timeline_item = this.get_timeline_item(item);
      if (append_at_the_end) {
        this.timeline_items_wrapper.append(timeline_item);
      } else {
        this.timeline_items_wrapper.prepend(timeline_item);
      }
      return timeline_item;
    }
    add_timeline_items(items, append_at_the_end = false) {
      items.forEach((item) => this.add_timeline_item(item, append_at_the_end));
    }
    add_timeline_items_based_on_creation(items) {
      items.forEach((item) => {
        this.timeline_items_wrapper.find(".timeline-item").each((i, el) => {
          let creation = $(el).attr("data-timestamp");
          if (creation && new Date(creation) < new Date(item.creation)) {
            $(el).before(this.get_timeline_item(item));
            return false;
          }
        });
      });
    }
    get_timeline_item(item) {
      const timeline_item = $(`<div class="timeline-item">`);
      if (item.name == "load-more") {
        timeline_item.append(`<div class="timeline-load-more">
					<button class="btn btn-default btn-sm btn-load-more">
						<span>${item.content}</span>
					</button>
				</div>`);
        timeline_item.find(".btn-load-more").on("click", async () => {
          let more_items = await this.get_more_communication_timeline_contents();
          timeline_item.remove();
          this.add_timeline_items_based_on_creation(more_items);
        });
        return timeline_item;
      }
      timeline_item.attr({
        "data-doctype": item.doctype,
        "data-name": item.name,
        "data-timestamp": item.creation
      });
      if (item.icon) {
        timeline_item.append(`
				<div class="timeline-badge" title='${item.title || frappe.utils.to_title_case(item.icon)}'>
					${frappe.utils.icon(item.icon, item.icon_size || "md")}
				</div>
			`);
      } else if (item.timeline_badge) {
        timeline_item.append(item.timeline_badge);
      } else {
        timeline_item.append(`<div class="timeline-dot">`);
      }
      timeline_item.append(`<div class="timeline-content ${item.is_card ? "frappe-card" : ""}">`);
      let timeline_content = timeline_item.find(".timeline-content");
      timeline_content.append(item.content);
      if (!item.hide_timestamp && !item.is_card) {
        timeline_content.append(`<span> - ${comment_when(item.creation)}</span>`);
      }
      if (item.id) {
        timeline_content.attr("id", item.id);
      }
      return timeline_item;
    }
  };
  var base_timeline_default = BaseTimeline;

  // frappe/public/js/frappe/form/footer/version_timeline_content_builder.js
  function get_version_timeline_content(version_doc, frm) {
    if (!version_doc.data)
      return [];
    const data = JSON.parse(version_doc.data);
    if (data.comment) {
      return [get_version_comment(version_doc, data.comment)];
    }
    let out = [];
    let updater_reference_link = null;
    let updater_reference = data.updater_reference;
    if (!$.isEmptyObject(updater_reference)) {
      let label = updater_reference.label || __("via {0}", [updater_reference.doctype]);
      let { doctype: doctype2, docname } = updater_reference;
      if (doctype2 && docname) {
        updater_reference_link = frappe.utils.get_form_link(doctype2, docname, true, label);
      } else {
        updater_reference_link = label;
      }
    }
    if (data.changed && data.changed.length) {
      var parts = [];
      data.changed.every(function(p) {
        if (p[0] === "docstatus") {
          if (p[2] === 1) {
            let message = updater_reference_link ? __("{0} submitted this document {1}", [
              get_user_link(version_doc),
              updater_reference_link
            ]) : __("{0} submitted this document", [get_user_link(version_doc)]);
            out.push(get_version_comment(version_doc, message));
          } else if (p[2] === 2) {
            let message = updater_reference_link ? __("{0} cancelled this document {1}", [
              get_user_link(version_doc),
              updater_reference_link
            ]) : __("{0} cancelled this document", [get_user_link(version_doc)]);
            out.push(get_version_comment(version_doc, message));
          }
        } else {
          const df = frappe.meta.get_docfield(frm.doctype, p[0], frm.docname);
          if (df && !df.hidden) {
            const field_display_status = frappe.perm.get_field_display_status(df, null, frm.perm);
            if (field_display_status === "Read" || field_display_status === "Write") {
              parts.push(__("{0} from {1} to {2}", [
                __(df.label),
                format_content_for_timeline(p[1]),
                format_content_for_timeline(p[2])
              ]));
            }
          }
        }
        return parts.length < 3;
      });
      if (parts.length) {
        let message;
        if (updater_reference_link) {
          message = __("{0} changed value of {1} {2}", [
            get_user_link(version_doc),
            parts.join(", "),
            updater_reference_link
          ]);
        } else {
          message = __("{0} changed value of {1}", [
            get_user_link(version_doc),
            parts.join(", ")
          ]);
        }
        out.push(get_version_comment(version_doc, message));
      }
    }
    if (data.row_changed && data.row_changed.length) {
      let parts2 = [];
      data.row_changed.every(function(row) {
        row[3].every(function(p) {
          var df = frm.fields_dict[row[0]] && frappe.meta.get_docfield(frm.fields_dict[row[0]].grid.doctype, p[0], frm.docname);
          if (df && !df.hidden) {
            var field_display_status = frappe.perm.get_field_display_status(df, null, frm.perm);
            if (field_display_status === "Read" || field_display_status === "Write") {
              parts2.push(__("{0} from {1} to {2} in row #{3}", [
                frappe.meta.get_label(frm.fields_dict[row[0]].grid.doctype, p[0]),
                format_content_for_timeline(p[1]),
                format_content_for_timeline(p[2]),
                row[1]
              ]));
            }
          }
          return parts2.length < 3;
        });
        return parts2.length < 3;
      });
      if (parts2.length) {
        let message;
        if (updater_reference_link) {
          message = __("{0} changed values for {1} {2}", [
            get_user_link(version_doc),
            parts2.join(", "),
            updater_reference_link
          ]);
        } else {
          message = __("{0} changed values for {1}", [
            get_user_link(version_doc),
            parts2.join(", ")
          ]);
        }
        out.push(get_version_comment(version_doc, message));
      }
    }
    ["added", "removed"].forEach(function(key) {
      if (data[key] && data[key].length) {
        let parts2 = (data[key] || []).map(function(p) {
          var df = frappe.meta.get_docfield(frm.doctype, p[0], frm.docname);
          if (df && !df.hidden) {
            var field_display_status = frappe.perm.get_field_display_status(df, null, frm.perm);
            if (field_display_status === "Read" || field_display_status === "Write") {
              return __(frappe.meta.get_label(frm.doctype, p[0]));
            }
          }
        });
        parts2 = parts2.filter(function(p) {
          return p;
        });
        if (parts2.length) {
          let message = "";
          if (key === "added") {
            message = __("added rows for {0}", [parts2.join(", ")]);
          } else if (key === "removed") {
            message = __("removed rows for {0}", [parts2.join(", ")]);
          }
          let version_comment = get_version_comment(version_doc, message);
          let user_link = get_user_link(version_doc);
          out.push(`${user_link} ${version_comment}`);
        }
      }
    });
    return out;
  }
  function get_version_comment(version_doc, text) {
    if (text.includes("<a")) {
      let version_comment = "";
      let unlinked_content = "";
      try {
        text += "</>";
        Array.from($(text)).forEach((element) => {
          if ($(element).is("a")) {
            version_comment += unlinked_content ? frappe.utils.get_form_link("Version", version_doc.name, true, unlinked_content) : "";
            unlinked_content = "";
            version_comment += element.outerHTML;
          } else {
            unlinked_content += element.outerHTML || element.textContent;
          }
        });
        if (unlinked_content) {
          version_comment += frappe.utils.get_form_link("Version", version_doc.name, true, unlinked_content);
        }
        return version_comment;
      } catch (e) {
      }
    }
    return frappe.utils.get_form_link("Version", version_doc.name, true, text);
  }
  function format_content_for_timeline(content) {
    content = frappe.ellipsis(content, 40) || '""';
    content = frappe.utils.escape_html(content);
    return content.bold();
  }
  function get_user_link(doc) {
    const user = doc.owner;
    const user_display_text = (frappe.user_info(user).fullname || "").bold();
    return frappe.utils.get_form_link("User", user, true, user_display_text);
  }

  // frappe/public/js/frappe/form/footer/form_timeline.js
  var FormTimeline = class extends base_timeline_default {
    make() {
      super.make();
      this.setup_timeline_actions();
      this.render_timeline_items();
      this.setup_activity_toggle();
    }
    refresh() {
      super.refresh();
      this.frm.trigger("timeline_refresh");
      this.setup_document_email_link();
    }
    setup_timeline_actions() {
      this.add_action_button(__("New Email"), () => this.compose_mail(), "mail", "btn-secondary-dark");
      this.setup_new_event_button();
    }
    setup_new_event_button() {
      if (this.frm.meta.allow_events_in_timeline) {
        let create_event = () => {
          const args = {
            doc: this.frm.doc,
            frm: this.frm,
            recipients: this.get_recipient(),
            txt: frappe.markdown(this.frm.comment_box.get_value())
          };
          return new frappe.views.InteractionComposer(args);
        };
        this.add_action_button(__("New Event"), create_event, "calendar");
      }
    }
    setup_activity_toggle() {
      let doc_info = this.doc_info || this.frm.get_docinfo();
      let has_communications = () => {
        let communications = doc_info.communications;
        let comments = doc_info.comments;
        return (communications || []).length || (comments || []).length;
      };
      let me2 = this;
      if (has_communications()) {
        this.timeline_wrapper.prepend(`
				<div class="timeline-item activity-toggle">
					<div class="timeline-dot"></div>
					<div class="timeline-content flex align-center">
						<h4>${__("Activity")}</h4>
						<nav class="nav nav-pills flex-row">
							<a class="flex-sm-fill text-sm-center nav-link" data-only-communication="true">${__("Communication")}</a>
							<a class="flex-sm-fill text-sm-center nav-link active">${__("All")}</a>
						</nav>
					</div>
				</div>
			`).find("a").on("click", function(e) {
          e.preventDefault();
          me2.only_communication = $(this).data().onlyCommunication;
          me2.render_timeline_items();
          $(this).tab("show");
        });
      }
    }
    setup_document_email_link() {
      let doc_info = this.doc_info || this.frm.get_docinfo();
      this.document_email_link_wrapper && this.document_email_link_wrapper.remove();
      if (doc_info.document_email) {
        const link = `<a class="document-email-link">${doc_info.document_email}</a>`;
        const message = __("Add to this activity by mailing to {0}", [link.bold()]);
        this.document_email_link_wrapper = $(`
				<div class="timeline-item">
					<div class="timeline-dot"></div>
					<div class="timeline-content">
						<span>${message}</span>
					</div>
				</div>
			`);
        this.timeline_actions_wrapper.append(this.document_email_link_wrapper);
        this.document_email_link_wrapper.find(".document-email-link").on("click", (e) => {
          let text = $(e.target).text();
          frappe.utils.copy_to_clipboard(text);
        });
      }
    }
    render_timeline_items() {
      super.render_timeline_items();
      this.set_document_info();
      frappe.utils.bind_actions_with_object(this.timeline_items_wrapper, this);
    }
    set_document_info() {
      const creation = comment_when(this.frm.doc.creation);
      let creation_message = frappe.utils.is_current_user(this.frm.doc.owner) ? __("You created this {0}", [creation], "Form timeline") : __("{0} created this {1}", [this.get_user_link(this.frm.doc.owner), creation], "Form timeline");
      const modified = comment_when(this.frm.doc.modified);
      let modified_message = frappe.utils.is_current_user(this.frm.doc.modified_by) ? __("You edited this {0}", [modified], "Form timeline") : __("{0} edited this {1}", [this.get_user_link(this.frm.doc.modified_by), modified], "Form timeline");
      if (this.frm.doc.route && cint(frappe.boot.website_tracking_enabled)) {
        let route = this.frm.doc.route;
        frappe.utils.get_page_view_count(route).then((res) => {
          let page_view_count_message = __("{0} Page views", [res.message], "Form timeline");
          this.add_timeline_item({
            content: `${creation_message} \u2022 ${modified_message} \u2022 	${page_view_count_message}`,
            hide_timestamp: true
          }, true);
        });
      } else {
        this.add_timeline_item({
          content: `${creation_message} \u2022 ${modified_message}`,
          hide_timestamp: true
        }, true);
      }
    }
    prepare_timeline_contents() {
      this.timeline_items.push(...this.get_communication_timeline_contents());
      this.timeline_items.push(...this.get_comment_timeline_contents());
      if (!this.only_communication) {
        this.timeline_items.push(...this.get_view_timeline_contents());
        this.timeline_items.push(...this.get_energy_point_timeline_contents());
        this.timeline_items.push(...this.get_version_timeline_contents());
        this.timeline_items.push(...this.get_share_timeline_contents());
        this.timeline_items.push(...this.get_workflow_timeline_contents());
        this.timeline_items.push(...this.get_like_timeline_contents());
        this.timeline_items.push(...this.get_custom_timeline_contents());
        this.timeline_items.push(...this.get_assignment_timeline_contents());
        this.timeline_items.push(...this.get_attachment_timeline_contents());
        this.timeline_items.push(...this.get_info_timeline_contents());
        this.timeline_items.push(...this.get_milestone_timeline_contents());
      }
    }
    get_user_link(user) {
      const user_display_text = (frappe.user_info(user).fullname || "").bold();
      return frappe.utils.get_form_link("User", user, true, user_display_text);
    }
    get_view_timeline_contents() {
      let view_timeline_contents = [];
      (this.doc_info.views || []).forEach((view) => {
        const view_time = comment_when(view.creation);
        let view_message = frappe.utils.is_current_user(view.owner) ? __("You viewed this {0}", [view_time], "Form timeline") : __("{0} viewed this {1}", [this.get_user_link(view.owner), view_time], "Form timeline");
        view_timeline_contents.push({
          creation: view.creation,
          content: view_message,
          hide_timestamp: true
        });
      });
      return view_timeline_contents;
    }
    get_communication_timeline_contents(more_communications, more_automated_messages) {
      let email_communications = this.get_email_communication_timeline_contents(more_communications);
      let automated_messages = this.get_auto_messages_timeline_contents(more_automated_messages);
      let all_communications = email_communications.concat(automated_messages);
      if (all_communications.length > 20) {
        all_communications.pop();
        if (more_communications || more_automated_messages) {
          all_communications.forEach((message) => {
            if (message.communication_type == "Automated Message") {
              this.doc_info.automated_messages.push(message);
            } else {
              this.doc_info.communications.push(message);
            }
          });
        }
        let last_communication_time = all_communications[all_communications.length - 1].creation;
        let load_more_button = {
          creation: last_communication_time,
          content: __("Load More Communications", null, "Form timeline"),
          name: "load-more"
        };
        all_communications.push(load_more_button);
      }
      return all_communications;
    }
    get_email_communication_timeline_contents(more_items) {
      let communication_timeline_contents = [];
      let icon_set = {
        Email: "mail",
        Phone: "call",
        Meeting: "calendar",
        Other: "dot-horizontal"
      };
      let items = more_items ? more_items : this.doc_info.communications || [];
      items.forEach((communication) => {
        let medium = communication.communication_medium;
        communication_timeline_contents.push({
          icon: icon_set[medium],
          icon_size: "sm",
          creation: communication.creation,
          is_card: true,
          content: this.get_communication_timeline_content(communication),
          doctype: "Communication",
          id: `communication-${communication.name}`,
          name: communication.name
        });
      });
      return communication_timeline_contents;
    }
    async get_more_communication_timeline_contents() {
      let more_items = [];
      let start = this.doc_info.communications.length + this.doc_info.automated_messages.length - 1;
      let response = await frappe.call({
        method: "frappe.desk.form.load.get_communications",
        args: {
          doctype: this.doc_info.doctype,
          name: this.doc_info.name,
          start,
          limit: 21
        }
      });
      if (response.message) {
        let email_communications = [];
        let automated_messages = [];
        response.message.forEach((message) => {
          if (message.communication_type == "Automated Message") {
            automated_messages.push(message);
          } else {
            email_communications.push(message);
          }
        });
        more_items = this.get_communication_timeline_contents(email_communications, automated_messages);
      }
      return more_items;
    }
    get_communication_timeline_content(doc, allow_reply = true) {
      doc._url = frappe.utils.get_form_link("Communication", doc.name);
      this.set_communication_doc_status(doc);
      if (doc.attachments && typeof doc.attachments === "string") {
        doc.attachments = JSON.parse(doc.attachments);
      }
      doc.owner = doc.sender;
      doc.user_full_name = doc.sender_full_name;
      doc.content = frappe.dom.remove_script_and_style(doc.content);
      let communication_content = $(frappe.render_template("timeline_message_box", { doc }));
      if (allow_reply) {
        this.setup_reply(communication_content, doc);
      }
      return communication_content;
    }
    set_communication_doc_status(doc) {
      let indicator_color = "red";
      if (in_list(["Sent", "Clicked"], doc.delivery_status)) {
        indicator_color = "green";
      } else if (doc.delivery_status === "Sending") {
        indicator_color = "orange";
      } else if (in_list(["Opened", "Read"], doc.delivery_status)) {
        indicator_color = "blue";
      } else if (doc.delivery_status == "Error") {
        indicator_color = "red";
      }
      doc._doc_status = doc.delivery_status;
      doc._doc_status_indicator = indicator_color;
    }
    get_auto_messages_timeline_contents(more_items) {
      let auto_messages_timeline_contents = [];
      let items = more_items ? more_items : this.doc_info.automated_messages || [];
      items.forEach((message) => {
        auto_messages_timeline_contents.push({
          icon: "notification",
          icon_size: "sm",
          creation: message.creation,
          is_card: true,
          content: this.get_communication_timeline_content(message, false),
          doctype: "Communication",
          name: message.name
        });
      });
      return auto_messages_timeline_contents;
    }
    get_comment_timeline_contents() {
      let comment_timeline_contents = [];
      (this.doc_info.comments || []).forEach((comment) => {
        comment_timeline_contents.push(this.get_comment_timeline_item(comment));
      });
      return comment_timeline_contents;
    }
    get_comment_timeline_item(comment) {
      return {
        icon: "small-message",
        creation: comment.creation,
        is_card: true,
        doctype: "Comment",
        id: `comment-${comment.name}`,
        name: comment.name,
        content: this.get_comment_timeline_content(comment)
      };
    }
    get_comment_timeline_content(doc) {
      doc.content = frappe.dom.remove_script_and_style(doc.content);
      const comment_content = $(frappe.render_template("timeline_message_box", { doc }));
      this.setup_comment_actions(comment_content, doc);
      return comment_content;
    }
    get_version_timeline_contents() {
      let version_timeline_contents = [];
      (this.doc_info.versions || []).forEach((version) => {
        const contents = get_version_timeline_content(version, this.frm);
        contents.forEach((content) => {
          version_timeline_contents.push({
            creation: version.creation,
            content
          });
        });
      });
      return version_timeline_contents;
    }
    get_share_timeline_contents() {
      let share_timeline_contents = [];
      (this.doc_info.share_logs || []).forEach((share_log) => {
        share_timeline_contents.push({
          creation: share_log.creation,
          content: share_log.content
        });
      });
      return share_timeline_contents;
    }
    get_assignment_timeline_contents() {
      let assignment_timeline_contents = [];
      (this.doc_info.assignment_logs || []).forEach((assignment_log) => {
        assignment_timeline_contents.push({
          creation: assignment_log.creation,
          content: assignment_log.content
        });
      });
      return assignment_timeline_contents;
    }
    get_info_timeline_contents() {
      let info_timeline_contents = [];
      (this.doc_info.info_logs || []).forEach((info_log) => {
        info_timeline_contents.push({
          creation: info_log.creation,
          content: `${this.get_user_link(info_log.owner)} ${info_log.content}`
        });
      });
      return info_timeline_contents;
    }
    get_attachment_timeline_contents() {
      let attachment_timeline_contents = [];
      (this.doc_info.attachment_logs || []).forEach((attachment_log) => {
        let is_file_upload = attachment_log.comment_type == "Attachment";
        attachment_timeline_contents.push({
          icon: is_file_upload ? "upload" : "delete",
          icon_size: "sm",
          creation: attachment_log.creation,
          content: `${this.get_user_link(attachment_log.owner)} ${attachment_log.content}`
        });
      });
      return attachment_timeline_contents;
    }
    get_milestone_timeline_contents() {
      let milestone_timeline_contents = [];
      (this.doc_info.milestones || []).forEach((milestone_log) => {
        milestone_timeline_contents.push({
          icon: "milestone",
          creation: milestone_log.creation,
          content: __("{0} changed {1} to {2}", [
            this.get_user_link(milestone_log.owner),
            frappe.meta.get_label(this.frm.doctype, milestone_log.track_field),
            milestone_log.value.bold()
          ])
        });
      });
      return milestone_timeline_contents;
    }
    get_like_timeline_contents() {
      let like_timeline_contents = [];
      (this.doc_info.like_logs || []).forEach((like_log) => {
        like_timeline_contents.push({
          icon: "heart",
          icon_size: "sm",
          creation: like_log.creation,
          content: __("{0} Liked", [this.get_user_link(like_log.owner)]),
          title: "Like"
        });
      });
      return like_timeline_contents;
    }
    get_workflow_timeline_contents() {
      let workflow_timeline_contents = [];
      (this.doc_info.workflow_logs || []).forEach((workflow_log) => {
        workflow_timeline_contents.push({
          icon: "branch",
          icon_size: "sm",
          creation: workflow_log.creation,
          content: `${this.get_user_link(workflow_log.owner)} ${__(workflow_log.content)}`,
          title: "Workflow"
        });
      });
      return workflow_timeline_contents;
    }
    get_custom_timeline_contents() {
      let custom_timeline_contents = [];
      (this.doc_info.additional_timeline_content || []).forEach((custom_item) => {
        custom_timeline_contents.push({
          icon: custom_item.icon,
          icon_size: "sm",
          is_card: custom_item.is_card,
          creation: custom_item.creation,
          content: custom_item.content || frappe.render_template(custom_item.template, custom_item.template_data)
        });
      });
      return custom_timeline_contents;
    }
    get_energy_point_timeline_contents() {
      let energy_point_timeline_contents = [];
      (this.doc_info.energy_point_logs || []).forEach((log) => {
        let timeline_badge = `
			<div class="timeline-badge ${log.points > 0 ? "appreciation" : "criticism"} bold">
				${log.points}
			</div>`;
        energy_point_timeline_contents.push({
          timeline_badge,
          creation: log.creation,
          content: frappe.energy_points.format_form_log(log)
        });
      });
      return energy_point_timeline_contents;
    }
    setup_reply(communication_box, communication_doc) {
      let actions = communication_box.find(".custom-actions");
      let reply = $(`<a class="action-btn reply">${frappe.utils.icon("reply", "md")}</a>`).click(() => {
        this.compose_mail(communication_doc);
      });
      let reply_all = $(`<a class="action-btn reply-all">${frappe.utils.icon("reply-all", "md")}</a>`).click(() => {
        this.compose_mail(communication_doc, true);
      });
      actions.append(reply);
      actions.append(reply_all);
    }
    compose_mail(communication_doc = null, reply_all = false) {
      const args = {
        doc: this.frm.doc,
        frm: this.frm,
        recipients: communication_doc && communication_doc.sender != frappe.session.user_email ? communication_doc.sender : this.get_recipient(),
        is_a_reply: Boolean(communication_doc),
        title: communication_doc ? __("Reply") : null,
        last_email: communication_doc,
        subject: communication_doc && communication_doc.subject,
        reply_all
      };
      const email_accounts = frappe.boot.email_accounts.filter((account) => {
        return !["All Accounts", "Sent", "Spam", "Trash"].includes(account.email_account) && account.enable_outgoing;
      }).map((e) => e.email_id);
      if (communication_doc && args.is_a_reply) {
        args.cc = "";
        if (email_accounts.includes(frappe.session.user_email) && communication_doc.sender != frappe.session.user_email) {
          const recipients = communication_doc.recipients.split(",").map((r) => r.trim());
          args.cc = recipients.filter((r) => r != frappe.session.user_email).join(", ") + ", ";
        }
        if (reply_all) {
          args.cc += communication_doc.cc;
          args.bcc = communication_doc.bcc;
        }
      }
      if (this.frm.doctype === "Communication") {
        args.message = "";
        args.last_email = this.frm.doc;
        args.recipients = this.frm.doc.sender;
        args.subject = __("Re: {0}", [this.frm.doc.subject]);
      } else {
        const comment_value = frappe.markdown(this.frm.comment_box.get_value());
        args.message = strip_html(comment_value) ? comment_value : "";
      }
      new frappe.views.CommunicationComposer(args);
    }
    get_recipient() {
      if (this.frm.email_field) {
        return this.frm.doc[this.frm.email_field];
      } else {
        return this.frm.doc.email_id || this.frm.doc.email || "";
      }
    }
    setup_comment_actions(comment_wrapper, doc) {
      let edit_wrapper = $(`<div class="comment-edit-box">`).hide();
      let edit_box = this.make_editable(edit_wrapper);
      let content_wrapper = comment_wrapper.find(".content");
      let more_actions_wrapper = comment_wrapper.find(".more-actions");
      if (frappe.model.can_delete("Comment") && (frappe.session.user == doc.owner || frappe.user.has_role("System Manager"))) {
        const delete_option = $(`
				<li>
					<a class="dropdown-item">
						${__("Delete")}
					</a>
				</li>
			`).click(() => this.delete_comment(doc.name));
        more_actions_wrapper.find(".dropdown-menu").append(delete_option);
      }
      let dismiss_button = $(`
			<button class="btn btn-link action-btn">
				${__("Dismiss")}
			</button>
		`).click(() => edit_button.toggle_edit_mode());
      dismiss_button.hide();
      edit_box.set_value(doc.content);
      edit_box.on_submit = (value) => {
        content_wrapper.empty();
        content_wrapper.append(value);
        edit_button.prop("disabled", true);
        edit_box.quill.enable(false);
        doc.content = value;
        this.update_comment(doc.name, value).then(edit_button.toggle_edit_mode).finally(() => {
          edit_button.prop("disabled", false);
          edit_box.quill.enable(true);
        });
      };
      content_wrapper.after(edit_wrapper);
      let edit_button = $();
      let current_user = frappe.session.user;
      if (["Administrator", doc.owner].includes(current_user)) {
        edit_button = $(`<button class="btn btn-link action-btn">${__("Edit")}</a>`).click(() => {
          edit_button.edit_mode ? edit_box.submit() : edit_button.toggle_edit_mode();
        });
      }
      edit_button.toggle_edit_mode = () => {
        edit_button.edit_mode = !edit_button.edit_mode;
        edit_button.text(edit_button.edit_mode ? __("Save") : __("Edit"));
        more_actions_wrapper.toggle(!edit_button.edit_mode);
        dismiss_button.toggle(edit_button.edit_mode);
        edit_wrapper.toggle(edit_button.edit_mode);
        content_wrapper.toggle(!edit_button.edit_mode);
      };
      let actions_wrapper = comment_wrapper.find(".custom-actions");
      actions_wrapper.append(edit_button);
      actions_wrapper.append(dismiss_button);
    }
    make_editable(container) {
      return frappe.ui.form.make_control({
        parent: container,
        df: {
          fieldtype: "Comment",
          fieldname: "comment",
          label: "Comment"
        },
        enable_mentions: true,
        render_input: true,
        only_input: true,
        no_wrapper: true
      });
    }
    update_comment(name, content) {
      return frappe.xcall("frappe.desk.form.utils.update_comment", { name, content }).then(() => {
        frappe.utils.play_sound("click");
      });
    }
    get_last_email(from_recipient) {
      const communications = this.frm.get_docinfo().communications || [];
      const recipient = this.get_recipient();
      const filtered_records = communications.filter((record) => record.communication_type === "Communication" && record.communication_medium === "Email" && (!from_recipient || record.sender === recipient)).sort((a, b) => b.creation - a.creation);
      return filtered_records[0] || null;
    }
    delete_comment(comment_name) {
      frappe.confirm(__("Delete comment?"), () => {
        return frappe.xcall("frappe.client.delete", {
          doctype: "Comment",
          name: comment_name
        }).then(() => {
          frappe.utils.play_sound("delete");
        });
      });
    }
    copy_link(ev) {
      let doc_link = frappe.urllib.get_full_url(frappe.utils.get_form_link(this.frm.doctype, this.frm.docname));
      let element_id = $(ev.currentTarget).closest(".timeline-content").attr("id");
      frappe.utils.copy_to_clipboard(`${doc_link}#${element_id}`);
    }
  };
  var form_timeline_default = FormTimeline;

  // frappe/public/js/frappe/form/footer/footer.js
  frappe.ui.form.Footer = class FormFooter {
    constructor(opts) {
      $.extend(this, opts);
      this.make();
      this.make_comment_box();
      this.make_timeline();
      $(this.frm.wrapper).on("render_complete", () => {
        this.refresh();
      });
    }
    make() {
      this.wrapper = $(frappe.render_template("form_footer", {})).appendTo(this.parent);
      this.wrapper.find(".btn-save").click(() => {
        this.frm.save("Save", null, this);
      });
    }
    make_comment_box() {
      this.frm.comment_box = frappe.ui.form.make_control({
        parent: this.wrapper.find(".comment-box"),
        render_input: true,
        only_input: true,
        enable_mentions: true,
        df: {
          fieldtype: "Comment",
          fieldname: "comment"
        },
        on_submit: (comment) => {
          if (strip_html(comment).trim() != "" || comment.includes("img")) {
            this.frm.comment_box.disable();
            frappe.xcall("frappe.desk.form.utils.add_comment", {
              reference_doctype: this.frm.doctype,
              reference_name: this.frm.docname,
              content: comment,
              comment_email: frappe.session.user,
              comment_by: frappe.session.user_fullname
            }).then((comment2) => {
              let comment_item = this.frm.timeline.get_comment_timeline_item(comment2);
              this.frm.comment_box.set_value("");
              frappe.utils.play_sound("click");
              this.frm.timeline.add_timeline_item(comment_item);
              this.frm.sidebar.refresh_comments_count && this.frm.sidebar.refresh_comments_count();
            }).finally(() => {
              this.frm.comment_box.enable();
            });
          }
        }
      });
    }
    make_timeline() {
      this.frm.timeline = new form_timeline_default({
        parent: this.wrapper.find(".timeline"),
        frm: this.frm
      });
    }
    refresh() {
      if (this.frm.doc.__islocal) {
        this.parent.addClass("hide");
      } else {
        this.parent.removeClass("hide");
        this.frm.timeline.refresh();
      }
    }
  };

  // frappe/public/js/frappe/form/form_tour.js
  frappe.ui.form.FormTour = class FormTour {
    constructor({ frm }) {
      this.frm = frm;
      this.driver_steps = [];
    }
    init_driver() {
      this.driver = new frappe.Driver({
        className: "frappe-driver",
        allowClose: false,
        padding: 10,
        overlayClickNext: true,
        keyboardControl: true,
        nextBtnText: "Next",
        prevBtnText: "Previous",
        opacity: 0.25,
        onHighlighted: (step) => {
          if (step.options.is_save_step) {
            $(step.options.element).one("click", () => this.driver.reset());
            this.driver.overlay.refresh();
          }
          const $input = $(step.node).find("input").get(0);
          if ($input)
            frappe.utils.sleep(200).then(() => $input.focus());
        }
      });
      frappe.router.on("change", () => this.driver.reset());
      this.frm.layout.sections.forEach((section) => section.collapse(false));
    }
    async init({ tour_name, on_finish }) {
      if (tour_name) {
        this.tour = await frappe.db.get_doc("Form Tour", tour_name);
      } else {
        const doctype_tour_exists = await frappe.db.exists("Form Tour", this.frm.doctype);
        if (doctype_tour_exists) {
          this.tour = await frappe.db.get_doc("Form Tour", this.frm.doctype);
        } else {
          this.tour = { steps: frappe.tour[this.frm.doctype] };
        }
      }
      if (on_finish)
        this.on_finish = on_finish;
      this.init_driver();
      if (this.tour.include_name_field)
        this.include_name_field();
      this.build_steps();
      this.update_driver_steps();
    }
    include_name_field() {
      const name_step = {
        description: __("Enter a name for this {0}", [this.frm.doctype]),
        fieldname: "__newname",
        title: __("Document Name"),
        position: "right",
        is_table_field: 0
      };
      this.tour.steps.unshift(name_step);
    }
    build_steps() {
      this.driver_steps = [];
      this.tour.steps.forEach((step) => {
        const on_next = () => {
          var _a;
          if (!this.is_next_condition_satisfied(step)) {
            this.driver.preventMove();
          }
          if (!this.driver.hasNextStep()) {
            this.on_finish && this.on_finish();
          }
          let field = (_a = this.get_next_step()) == null ? void 0 : _a.options.element.fieldobj;
          if ((field == null ? void 0 : field.tab) && !field.tab.is_active()) {
            field.tab.set_active();
            this.driver.reset(true);
            frappe.utils.sleep(200).then(() => {
              this.start(step.idx);
              this.driver.overlay.refresh();
            });
          }
        };
        const on_prev = () => {
          var _a;
          if (!this.driver.hasPreviousStep())
            return;
          let field = (_a = this.driver.steps[this.driver.currentStep - 1]) == null ? void 0 : _a.options.element.fieldobj;
          if ((field == null ? void 0 : field.tab) && !field.tab.is_active()) {
            field.tab.set_active();
            this.driver.reset(true);
            frappe.utils.sleep(200).then(() => {
              this.start(step.idx - 2);
              this.driver.overlay.refresh();
            });
          }
        };
        const driver_step = this.get_step(step, on_next, on_prev);
        this.driver_steps.push(driver_step);
        if (step.fieldtype == "Table")
          this.handle_table_step(step);
        if (step.is_table_field)
          this.handle_child_table_step(step);
        if (step.fieldtype == "Attach Image")
          this.handle_attach_image_steps(step);
      });
      if (this.tour.save_on_complete && this.frm.is_dirty()) {
        this.add_step_to_save();
      }
    }
    is_next_condition_satisfied(step) {
      const form = step.is_table_field ? this.frm.cur_grid.grid_form : this.frm;
      return form.layout.evaluate_depends_on_value(step.next_step_condition || true);
    }
    get_step(step_info, on_next, on_prev) {
      const { name, fieldname, title, description, position, is_table_field } = step_info;
      let element = `.frappe-control[data-fieldname='${fieldname}']`;
      const field = this.frm.get_field(fieldname);
      if (field) {
        element = field.wrapper[0] ? field.wrapper[0] : field.wrapper;
      }
      if (is_table_field) {
        element = `.grid-row-open .frappe-control[data-fieldname='${fieldname}']`;
      }
      return {
        element,
        name,
        popover: { title, description, position: frappe.router.slug(position || "Bottom") },
        onNext: on_next,
        onPrevious: on_prev
      };
    }
    update_driver_steps(steps = []) {
      if (steps.length == 0) {
        steps = this.driver_steps;
      }
      this.driver.defineSteps(steps);
    }
    start(idx = 0) {
      if (this.driver_steps.length == 0) {
        return;
      }
      this.driver.start(idx);
    }
    get_next_step() {
      if (this.driver.isActivated & this.driver.hasNextStep()) {
        const current_step = this.driver.currentStep;
        return this.driver.steps[current_step + 1];
      }
      return;
    }
    handle_table_step(step_info) {
      const is_last_step = step_info.idx == this.tour.steps.length;
      if (!is_last_step) {
        const curr_step = step_info;
        const next_step = this.tour.steps[curr_step.idx];
        const is_next_field_in_curr_table = next_step.parent_fieldname == curr_step.fieldname;
        if (!is_next_field_in_curr_table)
          return;
        const rows = this.frm.doc[curr_step.fieldname];
        const table_has_rows = rows && rows.length > 0;
        if (table_has_rows) {
          const curr_driver_step = this.driver_steps.find((s) => s.name == curr_step.name);
          curr_driver_step.onNext = () => {
            if (this.is_next_condition_satisfied(curr_step)) {
              this.expand_row_and_proceed(curr_step, curr_step.idx);
            } else {
              this.driver.preventMove();
            }
          };
          this.update_driver_steps();
        } else {
          this.add_new_row_step(curr_step);
        }
      }
    }
    add_new_row_step(step) {
      const $add_row = `.frappe-control[data-fieldname='${step.fieldname}'] .grid-add-row`;
      const add_row_step = {
        element: $add_row,
        popover: { title: __("Add a Row"), description: "" },
        onNext: () => {
          if (!cur_frm.cur_grid) {
            this.driver.preventMove();
          }
        }
      };
      this.driver_steps.push(add_row_step);
      $($add_row).one("click", () => {
        this.expand_row_and_proceed(step, step.idx + 1);
      });
    }
    expand_row_and_proceed(step, start_from) {
      this.open_first_row_of(step.fieldname);
      this.update_driver_steps();
      frappe.utils.sleep(300).then(() => this.driver.start(start_from));
    }
    open_first_row_of(fieldname) {
      this.frm.fields_dict[fieldname].grid.grid_rows[0].toggle_view();
      const $close_row = ".grid-row-open .grid-collapse-row";
      $($close_row).one("click", () => {
        const next_step = this.get_next_step();
        const next_element = next_step.options.is_save_step ? null : next_step.node;
        frappe.utils.scroll_to(next_element, true, 150, null, () => {
          this.driver.moveNext();
          frappe.flags.disable_auto_scroll = false;
        });
        frappe.flags.disable_auto_scroll = true;
      });
    }
    handle_child_table_step(step_info) {
      const is_last_step = step_info.idx == this.tour.steps.length;
      if (!is_last_step) {
        const curr_step = step_info;
        const next_step = this.tour.steps[curr_step.idx];
        const field = this.frm.get_field(next_step.fieldname);
        if (!field)
          return;
        this.add_collapse_row_step();
      } else if (this.tour.save_on_complete) {
        this.add_collapse_row_step();
      }
    }
    add_collapse_row_step() {
      const $close_row = ".grid-row-open .grid-collapse-row";
      const close_row_step = {
        element: $close_row,
        popover: { title: __("Collapse"), description: "", position: "left" },
        onNext: () => {
          if (cur_frm.cur_grid) {
            this.driver.preventMove();
          }
        }
      };
      this.driver_steps.push(close_row_step);
    }
    add_step_to_save() {
      const page_id = `[id="page-${this.frm.doctype}"]`;
      const $save_btn = `${page_id} .standard-actions .primary-action`;
      const save_step = {
        element: $save_btn,
        is_save_step: true,
        allowClose: false,
        overlayClickNext: false,
        popover: {
          title: __("Save the document."),
          description: "",
          position: "left",
          showButtons: false
        },
        onNext: () => {
          this.frm.save();
        }
      };
      this.driver_steps.push(save_step);
      frappe.ui.form.on(this.frm.doctype, "after_save", () => this.on_finish && this.on_finish());
    }
    handle_attach_image_steps() {
      $(".btn-attach").one("click", () => {
        setTimeout(() => {
          const modal_element = $(".file-uploader").closest(".modal-content");
          const attach_dialog_step = {
            element: modal_element[0],
            allowClose: false,
            overlayClickNext: false,
            popover: {
              title: __("Select an Image"),
              description: "",
              position: "left",
              doneBtnText: __("Next")
            }
          };
          this.driver_steps.splice(this.driver.currentStep + 1, 0, attach_dialog_step);
          this.update_driver_steps();
          this.driver.moveNext();
          this.driver.overlay.refresh();
          modal_element.closest(".modal").on("hidden.bs.modal", () => {
            this.driver.moveNext();
          });
        }, 500);
      });
    }
  };

  // frappe/public/js/frappe/form/undo_manager.js
  var UndoManager = class {
    constructor({ frm }) {
      this.frm = frm;
      this.undo_stack = [];
      this.redo_stack = [];
    }
    record_change({ fieldname, old_value, new_value, doctype: doctype2, docname, is_child }) {
      if (old_value == new_value) {
        return;
      }
      this.undo_stack.push({
        fieldname,
        old_value,
        new_value,
        doctype: doctype2,
        docname,
        is_child
      });
    }
    erase_history() {
      this.undo_stack = [];
      this.redo_stack = [];
    }
    undo() {
      const change = this.undo_stack.pop();
      if (change) {
        this._apply_change(change);
        this._push_reverse_entry(change, this.redo_stack);
      } else {
        this._show_alert(__("Nothing left to undo"));
      }
    }
    redo() {
      const change = this.redo_stack.pop();
      if (change) {
        this._apply_change(change);
        this._push_reverse_entry(change, this.undo_stack);
      } else {
        this._show_alert(__("Nothing left to redo"));
      }
    }
    _push_reverse_entry(change, stack) {
      stack.push(__spreadProps(__spreadValues({}, change), {
        new_value: change.old_value,
        old_value: change.new_value
      }));
    }
    _apply_change(change) {
      if (change.is_child) {
        frappe.model.set_value(change.doctype, change.docname, change.fieldname, change.old_value);
      } else {
        this.frm.set_value(change.fieldname, change.old_value);
        this.frm.scroll_to_field(change.fieldname, false);
      }
    }
    _show_alert(msg) {
      frappe.show_alert(msg, 3);
    }
  };

  // ../book_room/book_room/public/js/frappe/form/form.js
  frappe.provide("frappe.ui.form");
  frappe.provide("frappe.model.docinfo");
  frappe.ui.form.Controller = class FormController {
    constructor(opts) {
      $.extend(this, opts);
    }
  };
  frappe.ui.form.Form = class FrappeForm {
    constructor(doctype2, parent, in_form, doctype_layout_name) {
      this.docname = "";
      this.doctype = doctype2;
      this.doctype_layout_name = doctype_layout_name;
      this.in_form = in_form ? true : false;
      this.hidden = false;
      this.refresh_if_stale_for = 120;
      this.opendocs = {};
      this.custom_buttons = {};
      this.sections = [];
      this.grids = [];
      this.cscript = new frappe.ui.form.Controller({ frm: this });
      this.events = {};
      this.fetch_dict = {};
      this.parent = parent;
      this.doctype_layout = frappe.get_doc("DocType Layout", doctype_layout_name);
      this.undo_manager = new UndoManager({ frm: this });
      this.setup_meta(doctype2);
      this.debounced_reload_doc = frappe.utils.debounce(this.reload_doc.bind(this), 1e3);
      this.beforeUnloadListener = (event) => {
        event.preventDefault();
        return event.returnValue = "There are unsaved changes, are you sure you want to exit?";
      };
    }
    setup_meta() {
      this.meta = frappe.get_doc("DocType", this.doctype);
      if (this.meta.istable) {
        this.meta.in_dialog = 1;
      }
      this.perm = frappe.perm.get_perm(this.doctype);
      this.action_perm_type_map = {
        Create: "create",
        Save: "write",
        Submit: "submit",
        Update: "submit",
        Cancel: "cancel",
        Amend: "amend",
        Delete: "delete"
      };
    }
    setup() {
      this.fields = [];
      this.fields_dict = {};
      this.state_fieldname = frappe.workflow.get_state_fieldname(this.doctype);
      this.wrapper = this.parent;
      this.$wrapper = $(this.wrapper);
      frappe.ui.make_app_page({
        parent: this.wrapper,
        single_column: this.meta.hide_toolbar
      });
      this.page = this.wrapper.page;
      this.layout_main = this.page.main.get(0);
      this.$wrapper.on("hide", () => {
        this.script_manager.trigger("on_hide");
      });
      this.toolbar = new frappe.ui.form.Toolbar({
        frm: this,
        page: this.page
      });
      this.add_form_keyboard_shortcuts();
      this.setup_std_layout();
      this.script_manager = new frappe.ui.form.ScriptManager({
        frm: this
      });
      this.script_manager.setup();
      this.watch_model_updates();
      if (!this.meta.hide_toolbar && frappe.boot.desk_settings.timeline) {
        this.footer = new frappe.ui.form.Footer({
          frm: this,
          parent: $("<div>").appendTo(this.page.main.parent())
        });
        $("body").attr("data-sidebar", 1);
      }
      this.setup_file_drop();
      this.setup_doctype_actions();
      this.setup_notify_on_rename();
      this.setup_done = true;
    }
    add_form_keyboard_shortcuts() {
      frappe.ui.keys.add_shortcut({
        shortcut: "shift+ctrl+>",
        action: () => this.navigate_records(0),
        page: this.page,
        description: __("Go to next record"),
        ignore_inputs: true,
        condition: () => !this.is_new()
      });
      frappe.ui.keys.add_shortcut({
        shortcut: "shift+ctrl+<",
        action: () => this.navigate_records(1),
        page: this.page,
        description: __("Go to previous record"),
        ignore_inputs: true,
        condition: () => !this.is_new()
      });
      frappe.ui.keys.add_shortcut({
        shortcut: "ctrl+z",
        action: () => this.undo_manager.undo(),
        page: this.page,
        description: __("Undo last action")
      });
      frappe.ui.keys.add_shortcut({
        shortcut: "shift+ctrl+z",
        action: () => this.undo_manager.redo(),
        page: this.page,
        description: __("Redo last action")
      });
      frappe.ui.keys.add_shortcut({
        shortcut: "ctrl+y",
        action: () => this.undo_manager.redo(),
        page: this.page,
        description: __("Redo last action")
      });
      let grid_shortcut_keys = [
        {
          shortcut: "Up Arrow",
          description: __("Move cursor to above row")
        },
        {
          shortcut: "Down Arrow",
          description: __("Move cursor to below row")
        },
        {
          shortcut: "tab",
          description: __("Move cursor to next column")
        },
        {
          shortcut: "shift+tab",
          description: __("Move cursor to previous column")
        },
        {
          shortcut: "Ctrl+up",
          description: __("Add a row above the current row")
        },
        {
          shortcut: "Ctrl+down",
          description: __("Add a row below the current row")
        },
        {
          shortcut: "Ctrl+shift+up",
          description: __("Add a row at the top")
        },
        {
          shortcut: "Ctrl+shift+down",
          description: __("Add a row at the bottom")
        },
        {
          shortcut: "shift+alt+down",
          description: __("Duplicate current row")
        }
      ];
      grid_shortcut_keys.forEach((row) => {
        frappe.ui.keys.add_shortcut({
          shortcut: row.shortcut,
          page: this.page,
          description: __(row.description),
          ignore_inputs: true,
          condition: () => !this.is_new()
        });
      });
    }
    setup_std_layout() {
      this.form_wrapper = $("<div></div>").appendTo(this.layout_main);
      this.body = $('<div class="std-form-layout"></div>').appendTo(this.form_wrapper);
      this.meta.section_style = "Simple";
      this.layout = new frappe.ui.form.Layout({
        parent: this.body,
        doctype: this.doctype,
        doctype_layout: this.doctype_layout,
        frm: this,
        with_dashboard: true,
        card_layout: true
      });
      this.layout.make();
      this.fields_dict = this.layout.fields_dict;
      this.fields = this.layout.fields_list;
      let dashboard_parent = $('<div class="form-dashboard">');
      let dashboard_added = false;
      if (this.layout.tabs.length) {
        this.layout.tabs.every((tab) => {
          if (tab.df.show_dashboard) {
            tab.wrapper.prepend(dashboard_parent);
            dashboard_added = true;
            return false;
          }
          return true;
        });
        if (!dashboard_added) {
          this.layout.tabs[0].wrapper.prepend(dashboard_parent);
        }
      } else {
        this.layout.wrapper.find(".form-page").prepend(dashboard_parent);
      }
      this.dashboard = new frappe.ui.form.Dashboard(dashboard_parent, this);
      this.tour = new frappe.ui.form.FormTour({
        frm: this
      });
      this.states = new frappe.ui.form.States({
        frm: this
      });
    }
    watch_model_updates() {
      var me2 = this;
      frappe.model.on(me2.doctype, "*", function(fieldname, value, doc, skip_dirty_trigger = false) {
        if (doc.name == me2.docname) {
          if (!skip_dirty_trigger) {
            me2.dirty();
          }
          let field = me2.fields_dict[fieldname];
          field && field.refresh(fieldname);
          field && ["Link", "Dynamic Link"].includes(field.df.fieldtype) && field.validate && field.validate(value);
          me2.layout.refresh_dependency();
          me2.layout.refresh_sections();
          return me2.script_manager.trigger(fieldname, doc.doctype, doc.name);
        }
      });
      var table_fields = frappe.get_children("DocType", me2.doctype, "fields", {
        fieldtype: ["in", frappe.model.table_fields]
      });
      $.each(table_fields, function(i, df) {
        frappe.model.on(df.options, "*", function(fieldname, value, doc) {
          if (doc.parent == me2.docname && doc.parentfield === df.fieldname) {
            me2.dirty();
            me2.fields_dict[df.fieldname].grid.set_value(fieldname, value, doc);
            return me2.script_manager.trigger(fieldname, doc.doctype, doc.name);
          }
        });
      });
    }
    setup_notify_on_rename() {
      $(document).on("rename", (ev, dt, old_name, new_name) => {
        if (dt == this.doctype)
          this.rename_notify(dt, old_name, new_name);
      });
    }
    setup_file_drop() {
      var me2 = this;
      this.$wrapper.on("dragenter dragover", false).on("drop", function(e) {
        var dataTransfer = e.originalEvent.dataTransfer;
        if (!(dataTransfer && dataTransfer.files && dataTransfer.files.length > 0)) {
          return;
        }
        e.stopPropagation();
        e.preventDefault();
        if (me2.doc.__islocal) {
          frappe.msgprint(__("Please save before attaching."));
          throw "attach error";
        }
        new frappe.ui.FileUploader({
          doctype: me2.doctype,
          docname: me2.docname,
          frm: me2,
          files: dataTransfer.files,
          folder: "Home/Attachments",
          on_success(file_doc) {
            me2.attachments.attachment_uploaded(file_doc);
          }
        });
      });
    }
    setup_image_autocompletions_in_markdown() {
      this.fields.map((field) => {
        if (field.df.fieldtype === "Markdown Editor") {
          this.set_df_property(field.df.fieldname, "autocompletions", () => {
            let attachments = this.attachments.get_attachments();
            return attachments.filter((file) => frappe.utils.is_image_file(file.file_url)).map((file) => {
              return {
                caption: "image: " + file.file_name,
                value: `![](${file.file_url})`,
                meta: "image"
              };
            });
          });
        }
      });
    }
    refresh(docname) {
      var switched = docname ? true : false;
      removeEventListener("beforeunload", this.beforeUnloadListener, { capture: true });
      if (docname) {
        this.switch_doc(docname);
      }
      cur_frm = this;
      this.undo_manager.erase_history();
      if (this.docname) {
        this.save_disabled = false;
        this.doc = frappe.get_doc(this.doctype, this.docname);
        this.fetch_permissions();
        if (!this.has_read_permission()) {
          frappe.show_not_permitted(__(this.doctype) + " " + __(cstr(this.docname)));
          return;
        }
        this.grids.forEach((table) => {
          table.grid.refresh();
        });
        this.read_only = frappe.workflow.is_read_only(this.doctype, this.docname);
        if (this.read_only) {
          this.set_read_only(true);
          frappe.show_alert(__("This form is not editable due to a Workflow."));
        }
        if (!this.opendocs[this.docname]) {
          this.check_doctype_conflict(this.docname);
        } else {
          if (this.check_reload()) {
            return;
          }
        }
        if (!this.setup_done) {
          this.setup();
        }
        this.trigger_onload(switched);
        if (switched) {
          if (this.show_print_first && this.doc.docstatus === 1) {
            this.print_doc();
          }
        }
        this.$wrapper.removeClass("validated-form").toggleClass("editable-form", this.doc.docstatus === 0).toggleClass("submitted-form", this.doc.docstatus === 1).toggleClass("cancelled-form", this.doc.docstatus === 2);
        this.show_conflict_message();
        if (frappe.boot.read_only) {
          this.disable_form();
        }
      }
    }
    setup_doctype_actions() {
      if (this.meta.actions) {
        for (let action of this.meta.actions) {
          frappe.ui.form.on(this.doctype, "refresh", () => {
            if (!this.is_new()) {
              if (!action.hidden) {
                this.add_custom_button(action.label, () => {
                  this.execute_action(action);
                }, action.group);
              }
            }
          });
        }
      }
    }
    execute_action(action) {
      if (typeof action === "string") {
        for (let _action of this.meta.actions) {
          if (_action.label === action) {
            action = _action;
            break;
          }
        }
        if (typeof action === "string") {
          frappe.throw(`Action ${action} not found`);
        }
      }
      if (action.action_type === "Server Action") {
        return frappe.xcall(action.action, { doc: this.doc }).then((doc) => {
          if (doc.doctype) {
            frappe.model.sync(doc);
            this.refresh();
          }
          frappe.msgprint({
            message: __("{} Complete", [action.label]),
            alert: true
          });
        });
      } else if (action.action_type === "Route") {
        return frappe.set_route(action.action);
      }
    }
    switch_doc(docname) {
      this.grids.forEach((grid_obj) => {
        grid_obj.grid.visible_columns = null;
        grid_obj.grid.grid_pagination.go_to_page(1, true);
      });
      frappe.ui.form.close_grid_form();
      this.viewers && this.viewers.parent.empty();
      this.docname = docname;
      this.setup_docinfo_change_listener();
    }
    check_reload() {
      if (this.doc && !this.doc.__unsaved && this.doc.__last_sync_on && new Date() - this.doc.__last_sync_on > this.refresh_if_stale_for * 1e3) {
        this.debounced_reload_doc();
        return true;
      }
    }
    trigger_onload(switched) {
      this.cscript.is_onload = false;
      if (!this.opendocs[this.docname]) {
        var me2 = this;
        this.cscript.is_onload = true;
        this.initialize_new_doc();
        $(document).trigger("form-load", [this]);
        $(this.page.wrapper).on("hide", function() {
          $(document).trigger("form-unload", [me2]);
        });
      } else {
        this.render_form(switched);
        if (this.doc.localname) {
          delete this.doc.localname;
          $(document).trigger("form-rename", [this]);
        }
      }
    }
    initialize_new_doc() {
      var me2 = this;
      this.script_manager.trigger("before_load", this.doctype, this.docname).then(() => {
        me2.script_manager.trigger("onload");
        me2.opendocs[me2.docname] = true;
        me2.render_form();
        frappe.after_ajax(function() {
          me2.trigger_link_fields();
        });
        frappe.breadcrumbs.add(me2.meta.module, me2.doctype);
      });
      if (this.meta.track_seen) {
        $('.list-id[data-name="' + me2.docname + '"]').addClass("seen");
      }
    }
    render_form(switched) {
      if (!this.meta.istable) {
        this.layout.doc = this.doc;
        this.layout.attach_doc_and_docfields();
        this.layout.show_message();
        frappe.run_serially([
          () => this.refresh_header(switched),
          () => $(document).trigger("form-refresh", [this]),
          () => this.refresh_fields(),
          () => this.script_manager.trigger("refresh"),
          () => {
            if (this.cscript.is_onload) {
              this.onload_post_render();
              return this.script_manager.trigger("onload_post_render");
            }
          },
          () => this.cscript.is_onload && this.is_new() && this.focus_on_first_input(),
          () => this.run_after_load_hook(),
          () => this.dashboard.after_refresh()
        ]);
      } else {
        this.refresh_header(switched);
      }
      this.$wrapper.trigger("render_complete");
      frappe.after_ajax(() => {
        $(document).ready(() => {
          this.scroll_to_element();
        });
      });
    }
    onload_post_render() {
      this.setup_image_autocompletions_in_markdown();
    }
    focus_on_first_input() {
      let first = this.form_wrapper.find(".form-layout :input:visible:first");
      if (!in_list(["Date", "Datetime"], first.attr("data-fieldtype"))) {
        first.focus();
      }
    }
    run_after_load_hook() {
      if (frappe.route_hooks.after_load) {
        let route_callback = frappe.route_hooks.after_load;
        delete frappe.route_hooks.after_load;
        route_callback(this);
      }
    }
    refresh_fields() {
      this.layout.refresh(this.doc);
      this.layout.primary_button = this.$wrapper.find(".btn-primary");
      this.cleanup_refresh(this);
    }
    cleanup_refresh() {
      if (this.fields_dict["amended_from"]) {
        if (this.doc.amended_from) {
          unhide_field("amended_from");
          if (this.fields_dict["amendment_date"])
            unhide_field("amendment_date");
        } else {
          hide_field("amended_from");
          if (this.fields_dict["amendment_date"])
            hide_field("amendment_date");
        }
      }
      if (this.fields_dict["trash_reason"]) {
        if (this.doc.trash_reason && this.doc.docstatus == 2) {
          unhide_field("trash_reason");
        } else {
          hide_field("trash_reason");
        }
      }
      if (this.meta.autoname && this.meta.autoname.substr(0, 6) == "field:" && !this.doc.__islocal) {
        var fn = this.meta.autoname.substr(6);
        if (this.doc[fn]) {
          this.toggle_display(fn, false);
        }
      }
      if (this.meta.autoname == "naming_series:" && !this.doc.__islocal) {
        this.toggle_display("naming_series", false);
      }
    }
    refresh_header(switched) {
      if (!this.meta.in_dialog || this.in_form) {
        frappe.utils.set_title(this.meta.issingle ? this.doctype : this.docname);
      }
      if (this.toolbar) {
        if (switched) {
          this.toolbar.current_status = void 0;
        }
        this.toolbar.refresh();
      }
      this.dashboard.refresh();
      frappe.breadcrumbs.update();
      this.show_submit_message();
      this.clear_custom_buttons();
      this.show_web_link();
    }
    save_or_update() {
      if (this.save_disabled)
        return;
      if (this.doc.docstatus === 0) {
        this.save();
      } else if (this.doc.docstatus === 1 && this.doc.__unsaved) {
        this.save("Update");
      }
    }
    save(save_action, callback, btn, on_error) {
      let me2 = this;
      return new Promise((resolve, reject) => {
        btn && $(btn).prop("disabled", true);
        frappe.ui.form.close_grid_form();
        me2.validate_and_save(save_action, callback, btn, on_error, resolve, reject);
      }).then(() => {
        me2.show_success_action();
      }).catch((e) => {
        console.error(e);
      });
    }
    validate_and_save(save_action, callback, btn, on_error, resolve, reject) {
      var me2 = this;
      if (!save_action)
        save_action = "Save";
      this.validate_form_action(save_action, resolve);
      var after_save = function(r) {
        history.replaceState(null, null, " ");
        if (!r.exc) {
          if (["Save", "Update", "Amend"].indexOf(save_action) !== -1) {
            frappe.utils.play_sound("click");
          }
          me2.script_manager.trigger("after_save");
          if (frappe.route_hooks.after_save) {
            let route_callback = frappe.route_hooks.after_save;
            delete frappe.route_hooks.after_save;
            route_callback(me2);
          }
          if (me2.comment_box) {
            me2.comment_box.submit();
          }
          me2.refresh();
        } else {
          if (on_error) {
            on_error();
            reject();
          }
        }
        callback && callback(r);
        resolve();
      };
      var fail = (e) => {
        if (e) {
          console.error(e);
        }
        btn && $(btn).prop("disabled", false);
        if (on_error) {
          on_error();
          reject();
        }
      };
      if (save_action != "Update") {
        frappe.validated = true;
        frappe.run_serially([
          () => this.script_manager.trigger("validate"),
          () => this.script_manager.trigger("before_save"),
          () => {
            if (!frappe.validated) {
              fail();
              return;
            }
            frappe.ui.form.save(me2, save_action, after_save, btn);
          }
        ]).catch(fail);
      } else {
        frappe.ui.form.save(me2, save_action, after_save, btn);
      }
    }
    savesubmit(btn, callback, on_error) {
      var me2 = this;
      return new Promise((resolve) => {
        this.validate_form_action("Submit");
        frappe.confirm(__("Permanently Submit {0}?", [this.docname]), function() {
          frappe.validated = true;
          me2.script_manager.trigger("before_submit").then(function() {
            if (!frappe.validated) {
              return me2.handle_save_fail(btn, on_error);
            }
            me2.save("Submit", function(r) {
              if (r.exc) {
                me2.handle_save_fail(btn, on_error);
              } else {
                frappe.utils.play_sound("submit");
                callback && callback();
                me2.script_manager.trigger("on_submit").then(() => resolve(me2)).then(() => {
                  if (frappe.route_hooks.after_submit) {
                    let route_callback = frappe.route_hooks.after_submit;
                    delete frappe.route_hooks.after_submit;
                    route_callback(me2);
                  }
                });
              }
            }, btn, () => me2.handle_save_fail(btn, on_error), resolve);
          });
        }, () => me2.handle_save_fail(btn, on_error));
      });
    }
    savecancel(btn, callback, on_error) {
      const me2 = this;
      this.validate_form_action("Cancel");
      me2.ignore_doctypes_on_cancel_all = me2.ignore_doctypes_on_cancel_all || [];
      frappe.call({
        method: "frappe.desk.form.linked_with.get_submitted_linked_docs",
        args: {
          doctype: me2.doc.doctype,
          name: me2.doc.name
        },
        freeze: true
      }).then((r) => {
        if (!r.exc) {
          let doctypes_to_cancel = (r.message.docs || []).map((value) => {
            return value.doctype;
          }).filter((value) => {
            return !me2.ignore_doctypes_on_cancel_all.includes(value);
          });
          if (doctypes_to_cancel.length) {
            return me2._cancel_all(r, btn, callback, on_error);
          }
        }
        return me2._cancel(btn, callback, on_error, false);
      });
    }
    _cancel_all(r, btn, callback, on_error) {
      const me2 = this;
      let links_text = "";
      let links = r.message.docs;
      const doctypes = Array.from(new Set(links.map((link) => link.doctype)));
      me2.ignore_doctypes_on_cancel_all = me2.ignore_doctypes_on_cancel_all || [];
      for (let doctype2 of doctypes) {
        if (!me2.ignore_doctypes_on_cancel_all.includes(doctype2)) {
          let docnames = links.filter((link) => link.doctype == doctype2).map((link) => frappe.utils.get_form_link(link.doctype, link.name, true)).join(", ");
          links_text += `<li><strong>${__(doctype2)}</strong>: ${docnames}</li>`;
        }
      }
      links_text = `<ul>${links_text}</ul>`;
      let confirm_message = __("{0} {1} is linked with the following submitted documents: {2}", [
        __(me2.doc.doctype).bold(),
        me2.doc.name,
        links_text
      ]);
      let can_cancel = links.every((link) => frappe.model.can_cancel(link.doctype));
      if (can_cancel) {
        confirm_message += __("Do you want to cancel all linked documents?");
      } else {
        confirm_message += __("You do not have permissions to cancel all linked documents.");
      }
      let d = new frappe.ui.Dialog({
        title: __("Cancel All Documents"),
        fields: [
          {
            fieldtype: "HTML",
            options: `<p class="frappe-confirm-message">${confirm_message}</p>`
          }
        ]
      }, () => me2.handle_save_fail(btn, on_error));
      if (can_cancel) {
        d.set_primary_action(__("Cancel All"), () => {
          d.hide();
          frappe.call({
            method: "frappe.desk.form.linked_with.cancel_all_linked_docs",
            args: {
              docs: links,
              ignore_doctypes_on_cancel_all: me2.ignore_doctypes_on_cancel_all || []
            },
            freeze: true,
            callback: (resp) => {
              if (!resp.exc) {
                me2.reload_doc();
                me2._cancel(btn, callback, on_error, true);
              }
            }
          });
        });
      }
      d.show();
    }
    _cancel(btn, callback, on_error, skip_confirm) {
      const me2 = this;
      const cancel_doc = () => {
        frappe.validated = true;
        me2.script_manager.trigger("before_cancel").then(() => {
          if (!frappe.validated) {
            return me2.handle_save_fail(btn, on_error);
          }
          var after_cancel = function(r) {
            if (r.exc) {
              me2.handle_save_fail(btn, on_error);
            } else {
              frappe.utils.play_sound("cancel");
              me2.refresh();
              callback && callback();
              me2.script_manager.trigger("after_cancel");
            }
          };
          frappe.ui.form.save(me2, "cancel", after_cancel, btn);
        });
      };
      if (skip_confirm) {
        cancel_doc();
      } else {
        frappe.confirm(__("Permanently Cancel {0}?", [this.docname]), cancel_doc, me2.handle_save_fail(btn, on_error));
      }
    }
    savetrash() {
      this.validate_form_action("Delete");
      frappe.model.delete_doc(this.doctype, this.docname, function() {
        window.history.back();
      });
    }
    amend_doc() {
      if (!this.fields_dict["amended_from"]) {
        frappe.msgprint(__('"amended_from" field must be present to do an amendment.'));
        return;
      }
      frappe.xcall("frappe.client.is_document_amended", {
        doctype: this.doc.doctype,
        docname: this.doc.name
      }).then((is_amended) => {
        if (is_amended) {
          frappe.throw(__("This document is already amended, you cannot ammend it again"));
        }
        this.validate_form_action("Amend");
        var me2 = this;
        var fn = function(newdoc) {
          newdoc.amended_from = me2.docname;
          if (me2.fields_dict && me2.fields_dict["amendment_date"])
            newdoc.amendment_date = frappe.datetime.obj_to_str(new Date());
        };
        this.copy_doc(fn, 1);
        frappe.utils.play_sound("click");
      });
    }
    validate_form_action(action, resolve) {
      var perm_to_check = this.action_perm_type_map[action];
      var allowed_for_workflow = false;
      var perms = frappe.perm.get_perm(this.doc.doctype)[0];
      if (frappe.workflow.is_read_only(this.doctype, this.docname) && (perms["write"] || perms["create"] || perms["submit"] || perms["cancel"]) || !frappe.workflow.is_read_only(this.doctype, this.docname)) {
        allowed_for_workflow = true;
      }
      if (!this.perm[0][perm_to_check] && !allowed_for_workflow) {
        if (resolve) {
          resolve();
        }
        frappe.throw(__("No permission to '{0}' {1}", [__(action), __(this.doc.doctype)], "{0} = verb, {1} = object"));
      }
    }
    enable_save() {
      this.save_disabled = false;
      this.toolbar.set_primary_action();
    }
    disable_save(set_dirty = false) {
      this.save_disabled = true;
      this.toolbar.current_status = null;
      this.set_dirty = set_dirty;
      this.page.clear_primary_action();
    }
    disable_form() {
      this.set_read_only();
      this.fields.forEach((field) => {
        this.set_df_property(field.df.fieldname, "read_only", "1");
      });
      this.disable_save();
    }
    handle_save_fail(btn, on_error) {
      $(btn).prop("disabled", false);
      if (on_error) {
        on_error();
      }
    }
    trigger_link_fields() {
      if (this.is_new() && this.doc.__run_link_triggers) {
        $.each(this.fields_dict, function(fieldname, field) {
          if (field.df.fieldtype == "Link" && this.doc[fieldname]) {
            field.set_value(this.doc[fieldname], true);
          }
        });
        delete this.doc.__run_link_triggers;
      }
    }
    show_conflict_message() {
      if (this.doc.__needs_refresh) {
        if (this.doc.__unsaved) {
          this.dashboard.clear_headline();
          this.dashboard.set_headline_alert(__("This form has been modified after you have loaded it") + '<button class="btn btn-xs btn-primary pull-right" onclick="cur_frm.reload_doc()">' + __("Refresh") + "</button>", "alert-warning");
        } else {
          this.debounced_reload_doc();
        }
      }
    }
    show_submit_message() {
      if (this.meta.is_submittable && this.perm[0] && this.perm[0].submit && !this.is_dirty() && !this.is_new() && !frappe.model.has_workflow(this.doctype) && this.doc.docstatus === 0) {
        this.dashboard.add_comment(__("Submit this document to confirm"), "blue", true);
      }
    }
    show_web_link() {
      if (!this.doc.__islocal && this.doc.__onload && this.doc.__onload.is_website_generator) {
        this.web_link && this.web_link.remove();
        if (this.doc.__onload.published) {
          this.add_web_link("/" + this.doc.route);
        }
      }
    }
    add_web_link(path, label) {
      label = __(label) || __("See on Website");
      this.web_link = this.sidebar.add_user_action(__(label), function() {
      }).attr("href", path || this.doc.route).attr("target", "_blank");
    }
    fetch_permissions() {
      let dt = this.parent_doctype ? this.parent_doctype : this.doctype;
      this.perm = frappe.perm.get_perm(dt, this.doc);
    }
    has_read_permission() {
      if (!this.perm[0].read) {
        return 0;
      }
      return 1;
    }
    check_doctype_conflict(docname) {
      if (this.doctype == "DocType" && docname == "DocType") {
        frappe.msgprint(__("Allowing DocType, DocType. Be careful!"));
      } else if (this.doctype == "DocType") {
        if (frappe.views.formview[docname] || frappe.pages["List/" + docname]) {
          window.location.reload();
        }
      } else {
        if (frappe.views.formview.DocType && frappe.views.formview.DocType.frm.opendocs[this.doctype]) {
          window.location.reload();
        }
      }
    }
    rename_notify(dt, old, name) {
      if (this.meta.istable)
        return;
      if (this.docname == old)
        this.docname = name;
      else
        return;
      if (this && this.opendocs[old] && frappe.meta.docfield_copy[dt]) {
        frappe.meta.docfield_copy[dt][name] = frappe.meta.docfield_copy[dt][old];
        delete frappe.meta.docfield_copy[dt][old];
      }
      delete this.opendocs[old];
      this.opendocs[name] = true;
      if (this.meta.in_dialog || !this.in_form) {
        return;
      }
      frappe.re_route[frappe.router.get_sub_path()] = `${encodeURIComponent(frappe.router.slug(this.doctype))}/${encodeURIComponent(name)}`;
      !frappe._from_link && frappe.set_route("Form", this.doctype, name);
    }
    print_doc() {
      frappe.route_options = {
        frm: this
      };
      frappe.set_route("print", this.doctype, this.doc.name);
    }
    navigate_records(prev) {
      let filters, sort_field, sort_order;
      let list_view = frappe.get_list_view(this.doctype);
      if (list_view) {
        filters = list_view.get_filters_for_args();
        sort_field = list_view.sort_by;
        sort_order = list_view.sort_order;
      } else {
        let list_settings = frappe.get_user_settings(this.doctype)["List"];
        if (list_settings) {
          filters = list_settings.filters;
          sort_field = list_settings.sort_by;
          sort_order = list_settings.sort_order;
        }
      }
      let args = {
        doctype: this.doctype,
        value: this.docname,
        filters,
        sort_order,
        sort_field,
        prev
      };
      frappe.call("frappe.desk.form.utils.get_next", args).then((r) => {
        if (r.message) {
          frappe.set_route("Form", this.doctype, r.message);
          this.focus_on_first_input();
        }
      });
    }
    rename_doc() {
      frappe.model.rename_doc(this.doctype, this.docname, () => this.refresh_header());
    }
    share_doc() {
      this.shared.show();
    }
    email_doc(message) {
      new frappe.views.CommunicationComposer({
        doc: this.doc,
        frm: this,
        subject: __(this.meta.name) + ": " + this.docname,
        recipients: this.doc.email || this.doc.email_id || this.doc.contact_email,
        attach_document_print: true,
        message
      });
    }
    copy_doc(onload, from_amend) {
      this.validate_form_action("Create");
      var newdoc = frappe.model.copy_doc(this.doc, from_amend);
      newdoc.idx = null;
      newdoc.__run_link_triggers = false;
      if (onload) {
        onload(newdoc);
      }
      frappe.set_route("Form", newdoc.doctype, newdoc.name);
    }
    reload_doc() {
      this.check_doctype_conflict(this.docname);
      if (!this.doc.__islocal) {
        frappe.model.remove_from_locals(this.doctype, this.docname);
        return frappe.model.with_doc(this.doctype, this.docname, () => {
          this.refresh();
        });
      }
    }
    refresh_field(fname) {
      if (this.fields_dict[fname] && this.fields_dict[fname].refresh) {
        this.fields_dict[fname].refresh();
        this.layout.refresh_dependency();
        this.layout.refresh_sections();
      }
    }
    add_fetch(link_field, source_field, target_field, target_doctype) {
      if (!target_doctype)
        target_doctype = "*";
      this.fetch_dict.setDefault(target_doctype, {}).setDefault(link_field, {})[target_field] = source_field;
    }
    has_perm(ptype) {
      return frappe.perm.has_perm(this.doctype, 0, ptype, this.doc);
    }
    dirty() {
      this.doc.__unsaved = 1;
      this.$wrapper.trigger("dirty");
      if (!frappe.boot.developer_mode) {
        addEventListener("beforeunload", this.beforeUnloadListener, { capture: true });
      }
    }
    get_docinfo() {
      return frappe.model.docinfo[this.doctype][this.docname];
    }
    is_dirty() {
      return !!this.doc.__unsaved;
    }
    is_new() {
      return this.doc.__islocal;
    }
    get_perm(permlevel, access_type) {
      return this.perm[permlevel] ? this.perm[permlevel][access_type] : null;
    }
    set_intro(txt, color) {
      this.dashboard.set_headline_alert(txt, color);
    }
    set_footnote(txt) {
      this.footnote_area = frappe.utils.set_footnote(this.footnote_area, this.body, txt);
    }
    add_custom_button(label, fn, group) {
      if (group && group.indexOf("fa fa-") !== -1)
        group = null;
      let btn = this.page.add_inner_button(label, fn, group);
      if (btn) {
        let menu_item_label = group ? `${group} > ${label}` : label;
        let menu_item = this.page.add_menu_item(menu_item_label, fn, false);
        menu_item.parent().addClass("hidden-xl");
        this.custom_buttons[label] = btn;
      }
      return btn;
    }
    change_custom_button_type(label, group, type) {
      this.page.change_inner_button_type(label, group, type);
    }
    clear_custom_buttons() {
      this.page.clear_inner_toolbar();
      this.page.clear_user_actions();
      this.custom_buttons = {};
    }
    remove_custom_button(label, group) {
      this.page.remove_inner_button(label, group);
    }
    scroll_to_element() {
      if (frappe.route_options && frappe.route_options.scroll_to) {
        var scroll_to = frappe.route_options.scroll_to;
        delete frappe.route_options.scroll_to;
        var selector = [];
        for (var key in scroll_to) {
          var value = scroll_to[key];
          selector.push(repl('[data-%(key)s="%(value)s"]', { key, value }));
        }
        selector = $(selector.join(" "));
        if (selector.length) {
          frappe.utils.scroll_to(selector);
        }
      } else if (window.location.hash) {
        if ($(window.location.hash).length) {
          frappe.utils.scroll_to(window.location.hash, true, 200, null, null, true);
        } else {
          this.scroll_to_field(window.location.hash.replace("#", "")) && history.replaceState(null, null, " ");
        }
      }
    }
    show_success_action() {
      const route = frappe.get_route();
      if (route[0] !== "Form")
        return;
      if (this.meta.is_submittable && this.doc.docstatus !== 1)
        return;
      const success_action = new frappe.ui.form.SuccessAction(this);
      success_action.show();
    }
    get_doc() {
      return locals[this.doctype][this.docname];
    }
    set_currency_labels(fields_list, currency, parentfield) {
      if (!currency)
        return;
      var me2 = this;
      var doctype2 = parentfield ? this.fields_dict[parentfield].grid.doctype : this.doc.doctype;
      var field_label_map = {};
      var grid_field_label_map = {};
      $.each(fields_list, function(i, fname) {
        var docfield = frappe.meta.docfield_map[doctype2][fname];
        if (docfield) {
          var label = __(docfield.label || "").replace(/\([^\)]*\)/g, "");
          if (parentfield) {
            grid_field_label_map[doctype2 + "-" + fname] = label.trim() + " (" + __(currency) + ")";
          } else {
            field_label_map[fname] = label.trim() + " (" + currency + ")";
          }
        }
      });
      $.each(field_label_map, function(fname, label) {
        me2.fields_dict[fname].set_label(label);
      });
      $.each(grid_field_label_map, function(fname, label) {
        fname = fname.split("-");
        me2.fields_dict[parentfield].grid.update_docfield_property(fname[1], "label", label);
      });
    }
    field_map(fnames, fn) {
      if (typeof fnames === "string") {
        if (fnames == "*") {
          fnames = Object.keys(this.fields_dict);
        } else {
          fnames = [fnames];
        }
      }
      for (var i = 0, l = fnames.length; i < l; i++) {
        var fieldname = fnames[i];
        var field = frappe.meta.get_docfield(this.doctype, fieldname, this.docname);
        if (field) {
          fn(field);
          this.refresh_field(fieldname);
        }
      }
    }
    get_docfield(fieldname1, fieldname2) {
      if (fieldname2) {
        var doctype2 = this.get_docfield(fieldname1).options;
        return frappe.meta.get_docfield(doctype2, fieldname2, this.docname);
      } else {
        return frappe.meta.get_docfield(this.doctype, fieldname1, this.docname);
      }
    }
    set_df_property(fieldname, property, value, docname, table_field, table_row_name = null) {
      let df;
      if (!docname || !table_field) {
        df = this.get_docfield(fieldname);
      } else {
        const grid = this.fields_dict[fieldname].grid;
        const filtered_fields = frappe.utils.filter_dict(grid.docfields, {
          fieldname: table_field
        });
        if (filtered_fields.length) {
          df = frappe.meta.get_docfield(filtered_fields[0].parent, table_field, table_row_name);
        }
      }
      if (df && df[property] != value) {
        df[property] = value;
        if (table_field && table_row_name) {
          if (this.fields_dict[fieldname].grid.grid_rows_by_docname[table_row_name]) {
            this.fields_dict[fieldname].grid.grid_rows_by_docname[table_row_name].refresh_field(fieldname);
          }
        } else {
          this.refresh_field(fieldname);
        }
      }
    }
    toggle_enable(fnames, enable) {
      this.field_map(fnames, function(field) {
        field.read_only = enable ? 0 : 1;
      });
    }
    toggle_reqd(fnames, mandatory) {
      this.field_map(fnames, function(field) {
        field.reqd = mandatory ? true : false;
      });
    }
    toggle_display(fnames, show) {
      this.field_map(fnames, function(field) {
        field.hidden = show ? 0 : 1;
      });
    }
    get_files() {
      return this.attachments ? frappe.utils.sort(this.attachments.get_attachments(), "file_name", "string") : [];
    }
    set_query(fieldname, opt1, opt2) {
      if (opt2) {
        this.fields_dict[opt1].grid.get_field(fieldname).get_query = opt2;
      } else {
        if (this.fields_dict[fieldname]) {
          this.fields_dict[fieldname].get_query = opt1;
        }
      }
    }
    clear_table(fieldname) {
      frappe.model.clear_table(this.doc, fieldname);
    }
    add_child(fieldname, values) {
      var doc = frappe.model.add_child(this.doc, frappe.meta.get_docfield(this.doctype, fieldname).options, fieldname);
      if (values) {
        var d = {};
        var unique_keys = ["idx", "name"];
        Object.keys(values).map((key) => {
          if (!unique_keys.includes(key)) {
            d[key] = values[key];
          }
        });
        $.extend(doc, d);
      }
      return doc;
    }
    set_value(field, value, if_missing, skip_dirty_trigger = false) {
      var me2 = this;
      var _set = function(f, v) {
        var fieldobj = me2.fields_dict[f];
        if (fieldobj) {
          if (!if_missing || !frappe.model.has_value(me2.doctype, me2.doc.name, f)) {
            if (frappe.model.table_fields.includes(fieldobj.df.fieldtype) && $.isArray(v)) {
              frappe.model.clear_table(me2.doc, fieldobj.df.fieldname);
              const standard_fields = [
                ...frappe.model.std_fields_list,
                ...frappe.model.child_table_field_list
              ];
              v.forEach((d, idx) => {
                let child = frappe.model.add_child(me2.doc, fieldobj.df.options, fieldobj.df.fieldname, idx + 1);
                let doc_copy = __spreadValues({}, d);
                standard_fields.forEach((field2) => {
                  delete doc_copy[field2];
                });
                $.extend(child, doc_copy);
              });
              me2.refresh_field(f);
              return Promise.resolve();
            } else {
              return frappe.model.set_value(me2.doctype, me2.doc.name, f, v, me2.fieldtype, skip_dirty_trigger);
            }
          }
        } else {
          frappe.msgprint(__("Field {0} not found.", [f]));
          throw "frm.set_value";
        }
      };
      if (typeof field == "string") {
        return _set(field, value);
      } else if ($.isPlainObject(field)) {
        let tasks = [];
        for (let f in field) {
          let v = field[f];
          if (me2.get_field(f)) {
            tasks.push(() => _set(f, v));
          }
        }
        return frappe.run_serially(tasks);
      }
    }
    call(opts, args, callback) {
      var me2 = this;
      if (typeof opts === "string") {
        opts = {
          method: opts,
          doc: this.doc,
          args,
          callback
        };
      }
      if (!opts.doc) {
        if (opts.method.indexOf(".") === -1)
          opts.method = frappe.model.get_server_module_name(me2.doctype) + "." + opts.method;
        opts.original_callback = opts.callback;
        opts.callback = function(r) {
          if ($.isPlainObject(r.message)) {
            if (opts.child) {
              opts.child = locals[opts.child.doctype][opts.child.name];
              var std_field_list = ["doctype"].concat(frappe.model.std_fields_list).concat(frappe.model.child_table_field_list);
              for (var key in r.message) {
                if (std_field_list.indexOf(key) === -1) {
                  opts.child[key] = r.message[key];
                }
              }
              me2.fields_dict[opts.child.parentfield].refresh();
            } else {
              me2.set_value(r.message);
            }
          }
          opts.original_callback && opts.original_callback(r);
        };
      } else {
        opts.original_callback = opts.callback;
        opts.callback = function(r) {
          if (!r.exc)
            me2.refresh_fields();
          opts.original_callback && opts.original_callback(r);
        };
      }
      return frappe.call(opts);
    }
    get_field(field) {
      return this.fields_dict[field];
    }
    set_read_only() {
      const docperms = frappe.perm.get_perm(this.doc.doctype);
      this.perm = docperms.map((p) => {
        return {
          read: p.read,
          cancel: p.cancel,
          share: p.share,
          print: p.print,
          email: p.email
        };
      });
    }
    trigger(event, doctype2, docname) {
      return this.script_manager.trigger(event, doctype2, docname);
    }
    get_formatted(fieldname) {
      return frappe.format(this.doc[fieldname], frappe.meta.get_docfield(this.doctype, fieldname, this.docname), { no_icon: true }, this.doc);
    }
    open_grid_row() {
      return frappe.ui.form.get_open_grid_form();
    }
    get_title() {
      if (this.meta.title_field) {
        return this.doc[this.meta.title_field];
      } else {
        return String(this.doc.name);
      }
    }
    get_selected() {
      var selected = {}, me2 = this;
      frappe.meta.get_table_fields(this.doctype).forEach(function(df) {
        let _selected = [];
        if (me2.fields_dict[df.fieldname].grid) {
          _selected = me2.fields_dict[df.fieldname].grid.get_selected();
        }
        if (_selected.length) {
          selected[df.fieldname] = _selected;
        }
      });
      return selected;
    }
    set_indicator_formatter(fieldname, get_color, get_text) {
      var doctype2;
      if (frappe.meta.docfield_map[this.doctype][fieldname]) {
        doctype2 = this.doctype;
      } else {
        frappe.meta.get_table_fields(this.doctype).every(function(df) {
          if (frappe.meta.docfield_map[df.options][fieldname]) {
            doctype2 = df.options;
            return false;
          } else {
            return true;
          }
        });
      }
      frappe.meta.docfield_map[doctype2][fieldname].formatter = function(value, df, options, doc) {
        if (value) {
          var label;
          if (get_text) {
            label = get_text(doc);
          } else if (frappe.form.link_formatters[df.options]) {
            label = frappe.form.link_formatters[df.options](value, doc);
          } else {
            label = value;
          }
          const escaped_name = encodeURIComponent(value);
          return `
						<a class="indicator ${get_color(doc || {})}"
							href="/app/${frappe.router.slug(df.options)}/${escaped_name}"
							data-doctype="${df.options}"
							data-name="${frappe.utils.escape_html(value)}">
							${label}
						</a>
					`;
        } else {
          return "";
        }
      };
    }
    can_create(doctype2) {
      if (!frappe.model.can_create(doctype2)) {
        return false;
      }
      if (this.custom_make_buttons && this.custom_make_buttons[doctype2]) {
        const key = __(this.custom_make_buttons[doctype2]);
        return !!this.custom_buttons[key];
      }
      if (this.can_make_methods && this.can_make_methods[doctype2]) {
        return this.can_make_methods[doctype2](this);
      } else {
        if (this.meta.is_submittable && !this.doc.docstatus == 1) {
          return false;
        } else {
          return true;
        }
      }
    }
    make_new(doctype2) {
      let me2 = this;
      if (this.make_methods && this.make_methods[doctype2]) {
        return this.make_methods[doctype2](this);
      } else if (this.custom_make_buttons && this.custom_make_buttons[doctype2]) {
        this.custom_buttons[__(this.custom_make_buttons[doctype2])].trigger("click");
      } else {
        frappe.model.with_doctype(doctype2, function() {
          let new_doc = frappe.model.get_new_doc(doctype2, null, null, true);
          me2.set_link_field(doctype2, new_doc);
          frappe.ui.form.make_quick_entry(doctype2, null, null, new_doc);
        });
      }
    }
    set_link_field(doctype2, new_doc) {
      let me2 = this;
      frappe.get_meta(doctype2).fields.forEach(function(df) {
        if (df.fieldtype === "Link" && df.options === me2.doctype) {
          new_doc[df.fieldname] = me2.doc.name;
        } else if (["Link", "Dynamic Link"].includes(df.fieldtype) && me2.doc[df.fieldname]) {
          new_doc[df.fieldname] = me2.doc[df.fieldname];
        } else if (df.fieldtype === "Table" && df.options && df.reqd) {
          let row = new_doc[df.fieldname][0];
          me2.set_link_field(df.options, row);
        }
      });
    }
    update_in_all_rows(table_fieldname, fieldname, value) {
      if (value === void 0)
        return;
      frappe.model.get_children(this.doc, table_fieldname).filter((child) => !frappe.model.has_value(child.doctype, child.name, fieldname)).forEach((child) => frappe.model.set_value(child.doctype, child.name, fieldname, value));
    }
    get_sum(table_fieldname, fieldname) {
      let sum = 0;
      for (let d of this.doc[table_fieldname] || []) {
        sum += d[fieldname];
      }
      return sum;
    }
    scroll_to_field(fieldname, focus = true) {
      let field = this.get_field(fieldname);
      if (!field)
        return;
      let $el = field.$wrapper;
      if (field.tab && !field.tab.is_active()) {
        field.tab.set_active();
      }
      if (field.section.is_collapsed()) {
        field.section.collapse(false);
      }
      frappe.utils.scroll_to($el, true, 15);
      if (focus) {
        $el.find("input, select, textarea").focus();
      }
      let control_element = $el.closest(".frappe-control");
      control_element.addClass("highlight");
      setTimeout(() => {
        control_element.removeClass("highlight");
      }, 2e3);
      return true;
    }
    setup_docinfo_change_listener() {
      let doctype2 = this.doctype;
      let docname = this.docname;
      if (this.doc && !this.is_new()) {
        frappe.socketio.doc_subscribe(doctype2, docname);
      }
      frappe.realtime.off("docinfo_update");
      frappe.realtime.on("docinfo_update", ({ doc, key, action = "update" }) => {
        if (!doc.reference_doctype || !doc.reference_name || doc.reference_doctype !== doctype2 || doc.reference_name !== docname) {
          return;
        }
        let doc_list = frappe.model.docinfo[doctype2][docname][key] || [];
        let docindex = doc_list.findIndex((old_doc) => {
          return old_doc.name === doc.name;
        });
        if (action === "add") {
          frappe.model.docinfo[doctype2][docname][key].push(doc);
        }
        if (docindex > -1) {
          if (action === "update") {
            frappe.model.docinfo[doctype2][docname][key].splice(docindex, 1, doc);
          }
          if (action === "delete") {
            frappe.model.docinfo[doctype2][docname][key].splice(docindex, 1);
          }
        }
        if (!(["add", "update"].includes(action) && doc.doctype === "Comment" && doc.owner === frappe.session.user)) {
          this.timeline && this.timeline.refresh();
        }
      });
    }
    set_fields_as_options(fieldname, reference_doctype, filter_function, default_options = [], table_fieldname) {
      if (!reference_doctype)
        return Promise.resolve();
      let options = default_options || [];
      if (!filter_function)
        filter_function = (f) => f;
      return new Promise((resolve) => {
        frappe.model.with_doctype(reference_doctype, () => {
          frappe.get_meta(reference_doctype).fields.map((df) => {
            filter_function(df) && options.push({ label: df.label || df.fieldname, value: df.fieldname });
          });
          options && this.set_df_property(fieldname, "options", options, this.doc.name, table_fieldname);
          resolve(options);
        });
      });
    }
    set_active_tab(tab) {
      if (!this.active_tab_map) {
        this.active_tab_map = {};
      }
      this.active_tab_map[this.docname] = tab;
    }
    get_active_tab() {
      return this.active_tab_map && this.active_tab_map[this.docname];
    }
    get_involved_users() {
      let user_fields = this.meta.fields.filter((d) => d.fieldtype === "Link" && d.options === "User").map((d) => d.fieldname);
      user_fields = [...user_fields, "owner", "modified_by"];
      let involved_users = user_fields.map((field) => this.doc[field]);
      const docinfo = this.get_docinfo();
      involved_users = involved_users.concat(docinfo.communications.map((d) => d.sender && d.delivery_status === "sent"), docinfo.comments.map((d) => d.owner), docinfo.versions.map((d) => d.owner), docinfo.assignments.map((d) => d.owner));
      return involved_users.uniqBy((u) => u).filter((user) => !["Administrator", frappe.session.user].includes(user)).filter(Boolean);
    }
  };
  frappe.validated = 0;
  Object.defineProperty(window, "validated", {
    get: function() {
      console.warn("Please use `frappe.validated` instead of `validated`. It will be deprecated soon.");
      return frappe.validated;
    },
    set: function(value) {
      console.warn("Please use `frappe.validated` instead of `validated`. It will be deprecated soon.");
      frappe.validated = value;
      return frappe.validated;
    }
  });

  // frappe/public/js/frappe/list/list_filter.js
  frappe.provide("frappe.ui");
  var ListFilter = class {
    constructor({ wrapper, doctype: doctype2 }) {
      Object.assign(this, arguments[0]);
      this.can_add_global = frappe.user.has_role(["System Manager", "Administrator"]);
      this.filters = [];
      this.make();
      this.bind();
      this.refresh();
    }
    make() {
      this.wrapper.html(`
			<li class="input-area"></li>
			<li class="sidebar-action">
				<a class="saved-filters-preview">${__("Show Saved")}</a>
			</li>
			<div class="saved-filters"></div>
		`);
      this.$input_area = this.wrapper.find(".input-area");
      this.$list_filters = this.wrapper.find(".list-filters");
      this.$saved_filters = this.wrapper.find(".saved-filters").hide();
      this.$saved_filters_preview = this.wrapper.find(".saved-filters-preview");
      this.saved_filters_hidden = true;
      this.toggle_saved_filters(true);
      this.filter_input = frappe.ui.form.make_control({
        df: {
          fieldtype: "Data",
          placeholder: __("Filter Name"),
          input_class: "input-xs"
        },
        parent: this.$input_area,
        render_input: 1
      });
      this.is_global_input = frappe.ui.form.make_control({
        df: {
          fieldtype: "Check",
          label: __("Is Global")
        },
        parent: this.$input_area,
        render_input: 1
      });
    }
    bind() {
      this.bind_save_filter();
      this.bind_toggle_saved_filters();
      this.bind_click_filter();
      this.bind_remove_filter();
    }
    refresh() {
      this.get_list_filters().then(() => {
        this.filters.length ? this.$saved_filters_preview.show() : this.$saved_filters_preview.hide();
        const html = this.filters.map((filter) => this.filter_template(filter));
        this.wrapper.find(".filter-pill").remove();
        this.$saved_filters.append(html);
      });
      this.is_global_input.toggle(false);
      this.filter_input.set_description("");
    }
    filter_template(filter) {
      return `<div class="list-link filter-pill list-sidebar-button btn btn-default" data-name="${filter.name}">
			<a class="ellipsis filter-name">${filter.filter_name}</a>
			<a class="remove">${frappe.utils.icon("close")}</a>
		</div>`;
    }
    bind_toggle_saved_filters() {
      this.wrapper.find(".saved-filters-preview").click(() => {
        this.toggle_saved_filters(this.saved_filters_hidden);
      });
    }
    toggle_saved_filters(show) {
      this.$saved_filters.toggle(show);
      const label = show ? __("Hide Saved") : __("Show Saved");
      this.wrapper.find(".saved-filters-preview").text(label);
      this.saved_filters_hidden = !this.saved_filters_hidden;
    }
    bind_click_filter() {
      this.wrapper.on("click", ".filter-pill .filter-name", (e) => {
        let $filter = $(e.currentTarget).parent(".filter-pill");
        this.set_applied_filter($filter);
        const name = $filter.attr("data-name");
        this.list_view.filter_area.clear().then(() => {
          this.list_view.filter_area.add(this.get_filters_values(name));
        });
      });
    }
    bind_remove_filter() {
      this.wrapper.on("click", ".filter-pill .remove", (e) => {
        const $li = $(e.currentTarget).closest(".filter-pill");
        const filter_label = $li.text().trim();
        frappe.confirm(__("Are you sure you want to remove the {0} filter?", [filter_label.bold()]), () => {
          const name = $li.attr("data-name");
          const applied_filters = this.get_filters_values(name);
          $li.remove();
          this.remove_filter(name).then(() => this.refresh());
          this.list_view.filter_area.remove_filters(applied_filters);
        });
      });
    }
    bind_save_filter() {
      this.filter_input.$input.keydown(frappe.utils.debounce((e) => {
        const value = this.filter_input.get_value();
        const has_value = Boolean(value);
        if (e.which === frappe.ui.keyCode["ENTER"]) {
          if (!has_value || this.filter_name_exists(value))
            return;
          this.filter_input.set_value("");
          this.save_filter(value).then(() => this.refresh());
          this.toggle_saved_filters(true);
        } else {
          let help_text = __("Press Enter to save");
          if (this.filter_name_exists(value)) {
            help_text = __("Duplicate Filter Name");
          }
          this.filter_input.set_description(has_value ? help_text : "");
          if (this.can_add_global) {
            this.is_global_input.toggle(has_value);
          }
        }
      }, 300));
    }
    save_filter(filter_name) {
      return frappe.db.insert({
        doctype: "List Filter",
        reference_doctype: this.list_view.doctype,
        filter_name,
        for_user: this.is_global_input.get_value() ? "" : frappe.session.user,
        filters: JSON.stringify(this.get_current_filters())
      });
    }
    remove_filter(name) {
      if (!name)
        return;
      return frappe.db.delete_doc("List Filter", name);
    }
    get_filters_values(name) {
      const filter = this.filters.find((filter2) => filter2.name === name);
      return JSON.parse(filter.filters || "[]");
    }
    get_current_filters() {
      return this.list_view.filter_area.get();
    }
    filter_name_exists(filter_name) {
      return (this.filters || []).find((f) => f.filter_name === filter_name);
    }
    get_list_filters() {
      if (frappe.session.user === "Guest")
        return Promise.resolve();
      return frappe.db.get_list("List Filter", {
        fields: ["name", "filter_name", "for_user", "filters"],
        filters: { reference_doctype: this.list_view.doctype },
        or_filters: [
          ["for_user", "=", frappe.session.user],
          ["for_user", "=", ""]
        ]
      }).then((filters) => {
        this.filters = filters || [];
      });
    }
    set_applied_filter($filter) {
      this.$saved_filters.find(".btn-primary-light").toggleClass("btn-primary-light btn-default");
      $filter.toggleClass("btn-default btn-primary-light");
    }
  };

  // ../book_room/book_room/public/js/frappe/list/list_sidebar.js
  frappe.provide("frappe.views");
  frappe.views.ListSidebar = class ListSidebar {
    constructor(opts) {
      $.extend(this, opts);
    }
    make() {
      var sidebar_content = frappe.render_template("list_sidebar", { doctype: this.doctype });
      this.sidebar = $('<div class="list-sidebar overlay-sidebar hidden-xs hidden-sm"></div>').html(sidebar_content).appendTo(this.page.sidebar.empty());
      this.setup_list_filter();
      this.setup_list_group_by();
      $(document).trigger("list_sidebar_setup");
      if (this.list_view.list_view_settings && this.list_view.list_view_settings.disable_sidebar_stats) {
        this.sidebar.find(".list-tags").remove();
      } else {
        this.sidebar.find(".list-stats").on("show.bs.dropdown", (e) => {
          this.reload_stats();
        });
      }
      this.add_insights_banner();
    }
    setup_views() {
      var show_list_link = false;
      if (frappe.views.calendar[this.doctype]) {
        this.sidebar.find('.list-link[data-view="Calendar"]').removeClass("hide");
        this.sidebar.find('.list-link[data-view="Gantt"]').removeClass("hide");
        show_list_link = true;
      }
      this.sidebar.find('.list-link[data-view="Kanban"]').removeClass("hide");
      if (this.doctype === "Communication" && frappe.boot.email_accounts.length) {
        this.sidebar.find('.list-link[data-view="Inbox"]').removeClass("hide");
        show_list_link = true;
      }
      if (frappe.treeview_settings[this.doctype] || frappe.get_meta(this.doctype).is_tree) {
        this.sidebar.find(".tree-link").removeClass("hide");
      }
      this.current_view = "List";
      var route = frappe.get_route();
      if (route.length > 2 && frappe.views.view_modes.includes(route[2])) {
        this.current_view = route[2];
        if (this.current_view === "Kanban") {
          this.kanban_board = route[3];
        } else if (this.current_view === "Inbox") {
          this.email_account = route[3];
        }
      }
      this.sidebar.find('.list-link[data-view="' + this.current_view + '"] a').attr("disabled", "disabled").addClass("disabled");
      this.sidebar.find('.list-link[data-view="Kanban"] a, .list-link[data-view="Inbox"] a').attr("disabled", null).removeClass("disabled");
      if (this.list_view.meta.image_field) {
        this.sidebar.find('.list-link[data-view="Image"]').removeClass("hide");
        show_list_link = true;
      }
      if (this.list_view.settings.get_coords_method || this.list_view.meta.fields.find((i) => i.fieldname === "latitude") && this.list_view.meta.fields.find((i) => i.fieldname === "longitude") || this.list_view.meta.fields.find((i) => i.fieldname === "location" && i.fieldtype == "Geolocation")) {
        this.sidebar.find('.list-link[data-view="Map"]').removeClass("hide");
        show_list_link = true;
      }
      if (show_list_link) {
        this.sidebar.find('.list-link[data-view="List"]').removeClass("hide");
      }
    }
    setup_reports() {
      var me2 = this;
      var added = [];
      var dropdown = this.page.sidebar.find(".reports-dropdown");
      var divider = false;
      var add_reports = function(reports2) {
        $.each(reports2, function(name, r) {
          if (!r.ref_doctype || r.ref_doctype == me2.doctype) {
            var report_type = r.report_type === "Report Builder" ? `List/${r.ref_doctype}/Report` : "query-report";
            var route = r.route || report_type + "/" + (r.title || r.name);
            if (added.indexOf(route) === -1) {
              added.push(route);
              if (!divider) {
                me2.get_divider().appendTo(dropdown);
                divider = true;
              }
              $('<li><a href="#' + route + '">' + __(r.title || r.name) + "</a></li>").appendTo(dropdown);
            }
          }
        });
      };
      if (this.list_view.settings.reports) {
        add_reports(this.list_view.settings.reports);
      }
      var reports = Object.values(frappe.boot.user.all_reports).sort((a, b) => a.title.localeCompare(b.title)) || [];
      add_reports(reports);
    }
    setup_list_filter() {
      this.list_filter = new ListFilter({
        wrapper: this.page.sidebar.find(".list-filters"),
        doctype: this.doctype,
        list_view: this.list_view
      });
    }
    setup_kanban_boards() {
      const $dropdown = this.page.sidebar.find(".kanban-dropdown");
      frappe.views.KanbanView.setup_dropdown_in_sidebar(this.doctype, $dropdown);
    }
    setup_keyboard_shortcuts() {
      this.sidebar.find(".list-link > a, .list-link > .btn-group > a").each((i, el) => {
        frappe.ui.keys.get_shortcut_group(this.page).add($(el));
      });
    }
    setup_list_group_by() {
      this.list_group_by = new frappe.views.ListGroupBy({
        doctype: this.doctype,
        sidebar: this,
        list_view: this.list_view,
        page: this.page
      });
    }
    get_stats() {
      var me2 = this;
      let dropdown_options = me2.sidebar.find(".list-stats-dropdown .stat-result");
      this.set_loading_state(dropdown_options);
      frappe.call({
        method: "frappe.desk.reportview.get_sidebar_stats",
        type: "GET",
        args: {
          stats: me2.stats,
          doctype: me2.doctype,
          filters: (me2.list_view.filter_area ? me2.list_view.get_filters_for_args() : me2.default_filters) || []
        },
        callback: function(r) {
          let stats = (r.message.stats || {})["_user_tags"] || [];
          me2.render_stat(stats);
          let stats_dropdown = me2.sidebar.find(".list-stats-dropdown");
          frappe.utils.setup_search(stats_dropdown, ".stat-link", ".stat-label");
        }
      });
    }
    set_loading_state(dropdown) {
      dropdown.html(`<li>
			<div class="empty-state">
				${__("Loading...")}
			</div>
		</li>`);
    }
    render_stat(stats) {
      let args = {
        stats,
        label: __("Tags")
      };
      let tag_list = $(frappe.render_template("list_sidebar_stat", args)).on("click", ".stat-link", (e) => {
        let fieldname = $(e.currentTarget).attr("data-field");
        let label = $(e.currentTarget).attr("data-label");
        let condition = "like";
        let existing = this.list_view.filter_area.filter_list.get_filter(fieldname);
        if (existing) {
          existing.remove();
        }
        if (label == "No Tags") {
          label = "%,%";
          condition = "not like";
        }
        this.list_view.filter_area.add(this.doctype, fieldname, condition, label);
      });
      this.sidebar.find(".list-stats-dropdown .stat-result").html(tag_list);
    }
    reload_stats() {
      this.sidebar.find(".stat-link").remove();
      this.sidebar.find(".stat-no-records").remove();
      this.get_stats();
    }
    add_insights_banner() {
      try {
        if (this.list_view.view != "Report") {
          return;
        }
        if (localStorage.getItem("show_insights_banner") == "false") {
          return;
        }
        if (this.insights_banner) {
          this.insights_banner.remove();
        }
        const message = "Get more insights with";
        const link = "https://frappe.io/s/insights";
        const cta = "Frappe Insights";
        this.insights_banner = $(`
				<div style="position: relative;">
					<div class="pr-3">
						${message} <a href="${link}" target="_blank" style="color: var(--primary-color)">${cta} &rarr; </a>
					</div>
					<div style="position: absolute; top: -1px; right: -4px; cursor: pointer;" title="Dismiss"
						onclick="localStorage.setItem('show_insights_banner', 'false') || this.parentElement.remove()">
						<svg class="icon  icon-sm" style="">
							<use class="" href="#icon-close"></use>
						</svg>
					</div>
				</div>
			`).appendTo(this.sidebar);
      } catch (error) {
        console.error(error);
      }
    }
  };
})();
//# sourceMappingURL=book_room.bundle.KETYB5T4.js.map
