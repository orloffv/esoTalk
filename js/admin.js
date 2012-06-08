// Administration CP JavaScript

// Dashboard page.
var ETAdminDashboard = {

init: function() {

	// If the welcome sheet is present, show it as a sheet.
	if ($("#adminWelcomeSheet").length)
		ETSheet.showSheet("adminWelcomeSheet", $("#adminWelcomeSheet"));

	// Load the news posts, and update the update notification area.
	$.ETAjax({
		url: "admin/dashboard/news.ajax",
		global: false,
		success: function(data) {
			$("#adminNews .loading").replaceWith($(data.view).hide().fadeIn());
			$("#adminUpdateNotification").replaceWith(data.updateNotification);
		}
	});

}

};


// Forum Settings page.
var ETAdminSettings = {

init: function() {

	$("#adminSettings input[name=forumHeader]").change(function() {
		$("#adminSettings input[name=forumHeaderImage]").toggle($(this).val() == "image");
	}).filter(":checked").trigger("change");

	$("#adminSettings input[name=registrationOpen]").change(function() {
		$("#adminSettings input[name=requireEmailConfirmation]").attr("disabled", $(this).val() == "0");
	}).filter(":checked").trigger("change");

}

};


// Manage Groups.
var ETAdminGroups = {

init: function() {

	$("#adminGroups li .control-edit").click(function(e) {
		var id = $(this).parents("li").data("id");
		ETAdminGroups.showEditSheet(id);
		e.preventDefault();
	});

	$("#addGroupButton").click(function(e) {
		ETAdminGroups.showCreateSheet();
		e.preventDefault();
	});

	$("#adminGroups li .control-delete").click(function(e) {
		return confirm("Are you sure?");
	});

},

showEditSheet: function(groupId, formData) {
	ETSheet.loadSheet("editGroupSheet", "admin/groups/edit.view/"+groupId, function() {
		$(this).find("form").ajaxForm("save", function(formData) {
			ETAdminGroups.showEditSheet(groupId, formData);
		});
	}, formData);
},

showCreateSheet: function(formData) {
	ETSheet.loadSheet("editGroupSheet", "admin/groups/create.view/", function() {
		$(this).find("form").ajaxForm("save", ETAdminGroups.showCreateSheet);
	}, formData);
}

};


// Appearance Settings.
var ETAdminSkins = {

init: function() {

	// Make the controls into popups.
	$("#skinList li").each(function() {
		$(this).prepend($(this).find(".controls").first().popup({alignment: "right"}));
	});

	// Give the mobile icon a tooltip.
	$("#skinList .icon-mobile").tooltip();

}

};


// Manage plugins.
var ETAdminPlugins = {

init: function() {

	// Make the controls into popups.
	$("#pluginList li").each(function() {
		var item = $(this).find(".controls").first().popup({alignment: "right"});
		$(this).find(".pluginControls").prepend(item);
	});

	// Make the plugin settings load up as sheets.
	$("#pluginList .pluginSettings").click(function(e) {
		e.preventDefault();
		var plugin = $(this).data("plugin");
		ETSheet.loadSheet("pluginSettingsSheet", "admin/plugins/settings.view/"+plugin);
	});

}

};


// Manage languages.
var ETAdminLanguages = {

init: function() {

	// Make the controls into popups.
	$("#languageList li").each(function() {
		var item = $("<li>").append($(this).find(".controls").first().popup({alignment: "right"}));
		$(this).prepend(item);
	});

}

};


// Manage Channels.
var ETAdminChannels = {

channelId: null,

init: function() {

	// Make the channel list sortable.
	$("#adminChannels .channelList").nestedSortable({
		forcePlaceholderSize: true,
		handle: 'div',
		helper:	'clone',
		items: 'li',
		maxLevels: 0,
		opacity: .6,
		placeholder: 'placeholder',
		revert: 250,
		tabSize: 25,
		tolerance: 'pointer',
		toleranceElement: '> div',
		update: function() {
			$.ETAjax({
				url: "admin/channels/reorder.ajax",
				data: {tree: $("#adminChannels .channelList").nestedSortable("toArray", {startDepthCount: -1})},
				globalLoading: true
			});
		}
	});

	// Add a handler to open the "create channel" sheet.
	$("#createChannelLink").click(function(e) {
		e.preventDefault();
		ETSheet.loadSheet("editChannelSheet", "admin/channels/create.view", ETAdminChannels.initEditChannel);
	});

	// Add a handler to all edit controls, to open the "edit channel" sheet.
	$(".channelList .control-edit").tooltip().click(function(e) {
		e.preventDefault();
		var channelId = $(this).parents("li").data("id");
		ETSheet.loadSheet("editChannelSheet", "admin/channels/edit.view/"+channelId, ETAdminChannels.initEditChannel);
	});

	// Add a handler to all delete controls, to open the "delete channel" sheet.
	$(".channelList .control-delete").tooltip().click(function(e) {
		e.preventDefault();
		var channelId = $(this).parents("li").data("id");
		ETSheet.loadSheet("deleteChannelSheet", "admin/channels/delete.view/"+channelId, ETAdminChannels.initEditChannel);
	});

},

// Initialize the edit channel sheet.
initEditChannel: function() {

    var generate = function(type, str)
    {
        if (type == 'slug')
        {
            str = str.replace(/[\s]+/gi, '-').replace(/-+/, "-").replace(/^-+|-+$/g, "");
            str = translit(str);
            str = str.replace(/[^0-9a-z-]+/gi, '').toLowerCase();
        }

        return str;
    }

    var translit = function(str)
    {
        var ru=("А-а-Б-б-В-в-Ґ-ґ-Г-г-Д-д-Е-е-Ё-ё-Є-є-Ж-ж-З-з-И-и-І-і-Ї-ї-Й-й-К-к-Л-л-М-м-Н-н-О-о-П-п-Р-р-С-с-Т-т-У-у-Ф-ф-Х-х-Ц-ц-Ч-ч-Ш-ш-Щ-щ-Ъ-ъ-Ы-ы-Ь-ь-Э-э-Ю-ю-Я-я").split("-")
        var en=("A-a-B-b-V-v-G-g-G-g-D-d-E-e-E-e-E-e-ZH-zh-Z-z-I-i-I-i-I-i-J-j-K-k-L-l-M-m-N-n-O-o-P-p-R-r-S-s-T-t-U-u-F-f-H-h-TS-ts-CH-ch-SH-sh-SCH-sch-'-'-Y-y-'-'-E-e-YU-yu-YA-ya").split("-")
        var res = '';
        for(var i=0, l=str.length; i<l; i++)
        {
            var s = str.charAt(i), n = ru.indexOf(s);
            if(n >= 0) { res += en[n]; }
            else { res += s; }
        }
        return res;
    }

    var $input_parent = $("#editChannelSheet input[name=title]");
    var $input_item = $("#channelSlug");
    var type='slug';

    var update_item = $input_item.val() ==  generate(type, $input_parent.val()) || $input_item.val() == '';

    $input_item.change(function()
    {
        update_item = $input_item.val() ==  generate(type, $input_parent.val()) || $input_item.val() == '';
    });

    $input_parent.keyup(function()
    {
        if ($input_parent.length && $input_item.length)
        {
            var str = generate(type, $input_parent.val());

            if (update_item) {
                $input_item.val(str).trigger('focusout');
            }
        }
    });

	// Allow the user to select a channel to import permissions from.
	$("select[name=copyPermissions]").change(function(e) {
		var select = $(this);
		$.ETAjax({
			url: "admin/channels/getPermissions.json/"+$(this).val(),
			success: function(data) {

				// Uncheck all of the permission boxes.
				$("#channelPermissions input[name]").prop("checked", false);

				// Go through this channel's permissions and check all of the boxes that apply.
				for (var type in data.permissions) {
					for (var i in data.permissions[type]) {
						var groupId = data.permissions[type][i];
						$("#channelPermissions input[name=permissions\\["+groupId+"\\]\\["+type+"\\]]").prop("checked", true);
					}
				}

				ETAdminChannels.updatePermissionState();
				select.val("");
			}
		});
	});

	// Whenever a checkbox is checked or unchecked, we need to update the state of the rest of the checkboxes.
	ETAdminChannels.updatePermissionState();
	$("#channelPermissions input").change(ETAdminChannels.updatePermissionState);

	// Whenever a group name in the table is clicked, we toggle all checkboxes on that row.
	$("#channelPermissions tbody th").css("cursor", "pointer").click(function() {
		var input = $(this).parent().find("input");
		input.prop("checked", !input.not(":disabled").first().prop("checked"));
		ETAdminChannels.updatePermissionState();
	});

	// Whenever a permission name in the table is clicked, we toggle all checkboxes in that column.
	$("#channelPermissions thead th").css("cursor", "pointer").click(function() {
		var index = $(this).index() + 1;
		var input = $("#channelPermissions tbody td:nth-child("+index+") input[name]");
		input.prop("checked", !input.first().prop("checked"));
		ETAdminChannels.updatePermissionState();
	});

},

// Update the permission checkboxes' disabled states depending on which boxes are checked/unchecked.
updatePermissionState: function() {

	// If guests can view, then so can everyone else.
	var checkboxes = $("#channelPermissions .permission-view:not(#permissions-guests .permission-view)").prop("disabled", false);
	if ($("#permissions-guests .permission-view").prop("checked")) {
		checkboxes.prop("checked", true).prop("disabled", true);
	}

	// If any row cannot view, then it also cannot reply, start, or moderate.
	$("#permissions-members, #channelPermissions .group").each(function() {
		var checkboxes = $(this).find("input:not(.permission-view)").prop("disabled", false);
		if (!$(this).find(".permission-view").prop("checked"))
			checkboxes.prop("checked", false).prop("disabled", true);
	});

	// If members can view, reply, or start then so can all groups.
	var permissions = ["view", "reply", "start", "moderate"];
	for (var i in permissions) {
		var checkboxes = $("#channelPermissions .group .permission-"+permissions[i]);
		if ($("#permissions-members .permission-"+permissions[i]).prop("checked")) {
			checkboxes.prop("checked", true).prop("disabled", true);
		}
	}

}

};
