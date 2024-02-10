// Copyright (c) 2024, kunhimohamed and contributors
// For license information, please see license.txt

{% include 'book_room/issuing/issuing_common.js' %}

extend_cscript(cur_frm.cscript, new book_room.issuing.IssueController({frm: cur_frm}));
