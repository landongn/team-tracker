define(

	[
		"jquery",
		"lsdb"
	],

	/*global console d3 moment multistr */
	function ($, db){

		"use strict";

		var App = function () {};

		App.prototype = {
			init: function () {
				this.renderAllBlocks();
				var that = this;

				$("#addProject").on("submit", function (e) {
					e.preventDefault();
					var p = {
						title: $("input[name='project_title']").val(),
						start: moment($("input[name='project_start']").val()),
						end: moment($("input[name='project_end']").val()),
						milestones: [],
						id: db.getLastKey(),
						type: "Web"
					};

					db.save(p.title, p);
					that.drawProjects();
					$("#add").css({'right': 400});
					return false;
				});

				$("#chart").on("click", function (e){
					$("#add").removeClass("showing");
				});

				this.interval = setInterval(function () {
					var milestones = $(".chart-column.milestone");
					var mslength = milestones.length;
					var randPick = Math.floor((Math.random() * (mslength - 0) + 0));
					var item = $(".chart-column.milestone").eq(randPick).children("[data-date]").attr("data-date") + moment().format('YYYY');
					var start = $(".chart-column").eq(0).children("[data-date]").attr("data-date") + moment().format("YYYY");
					var s, t;
					s = moment(start);
					t = moment(item);
					var count = t.diff(s, 'days');
					console.log(count);
					var currentscroll = $("body").scrollLeft();
					var actualscroll = (count * 55);
					if (currentscroll <= actualscroll) {
						$("body").animate({
							scrollLeft: (actualscroll - currentscroll)
						}, 1500);
					} else if (currentscroll >= actualscroll) {
						$("body").animate({
							scrollLeft: (currentscroll - actualscroll)
						}, 1500);
					} else if (actualscroll == currentscroll) {
						return;
					}

				}, 5000);
				$(document).on('click', "[data-id]",  function (e){
					var item_id = $(this).children('.title').html();
					that.editProject(item_id, $(this));
				});

				$(".add").on("click", function (e){
					if ($("#add").attr("class") === 'showing') {
						$("#add").removeClass("showing");
					} else {
						$("#add").addClass("showing");
					}
				});

				$("#cancelEdit").on("click", function(e){
					e.preventDefault();
					$("#edit").removeClass("showing");
				});

				$("#addMilestone").on("click", function(e){
					e.preventDefault();
					var ms = {
						title:$("input[name='milestone_title']").val(),
						date: $("input[name='milestone_date']").val(),
						type: $("option:selected").val()
					};

					var title = $(".editing").children("h3").html();

					that.addMilestone(title, $(this), ms);

				});

			},

			renderAllBlocks: function () {
				this.drawTimeline();
				this.drawProjects();
			},

			drawTimeline: function () {
				var startMonth = moment().startOf('month').subtract('month', 1);
				var endMonth = moment().startOf('week').add('month', 4);
				var current_month = startMonth.startOf('month').format("MMM");
				var month_Y = 0;
				var index = endMonth.diff(startMonth, 'days');
				$("#chart").width((index * 55)+'px');
				$("#months").append($("<span class='month'>"+current_month+"</span>"));

				var pxtotoday = 0;

				for (var i = 0; i < index; i++) {
					var curDay = startMonth.clone().add('days', i);
					var str = "";
					if (curDay.day() === 0 || curDay.day() === 6) {
						str = '<section class="chart-column closed">';
					} else {
						str = '<section class="chart-column">';
					}

					if (curDay.format('DD MMM') === moment().format('DD MMM')) {
						str += '<section data-date="'+curDay.format('DD MMM')+'" class="date">'+curDay.format('DD MMM')+'</section></section>';
						var t = $(str);
						pxtotoday = 55 * i;
						$("#chart").append(t);
						$("#chart").children('.chart-column').last().addClass('today');
					} else {
						str += '<section data-date="'+curDay.format('DD MMM')+'" class="date">'+curDay.format('DD MMM')+'</section></section>';
						$("#chart").append($(str));
					}

					if (curDay.format("MMM") !== current_month) {
						current_month = curDay.format("MMM");
						$("#months").append($("<span class='month'>"+current_month+"</span>").css({'left': (55*i)}));
						console.log(curDay.format("MMM"), current_month);
					}
				}

				$('body').scrollLeft(pxtotoday);

			},

			drawProjects: function () {
				var projectTitles = db.all();
				$(".project").remove();
				//start positions for the project bars
				var startY = 40;
				var startX = 55;

				//itr through each project and append it to the proper placement.
				for (var i = 0; i < db.all().length; i++) {

					var p = db.get(projectTitles[i]);

					var start = moment(p.start);
					var end = moment(p.end);
					var width = (end.diff(p.start, 'days') * 55)+'px';

					var tmpl = "<section data-id='"+p.id+"' class='project'>";
						tmpl += "<h3 class='title'>"+p.title+"</h3>";
						tmpl += "<i class='type "+p.type+"'></i>";
					for (var milestone in p.milestones) {
						var m = p.milestones[milestone];
						tmpl += '<section data-milestone-date="'+m.date+'" class="milestone '+m.type+'"></section>';
						var diff = moment(m.date);
						var d = diff.format('DD MMM');
						$('[data-date="'+d+'"]').parent().addClass("milestone").addClass(m.type);
						$('.' + m.type + "_count").html(Number($('.' + m.type + "_count").html()) + 1);
					}
					tmpl += "</section>";

					var $tmpl = $(tmpl);
					$("#chart").append($tmpl);
					$tmpl.width(width).css({'top': startY, 'left': start.diff(moment().startOf('month').subtract('month', 1), 'days')  * 55 + 'px'});


					startY += 110;
				}
			},
			editProject: function (id, $el) {
				var project = db.get(id);
				$el.addClass("editing");
				$("#edit").addClass("showing");

				//setup the form

				$("input[name='edit-title']").val(project.title);
				$("input[name='edit-start']").val(project.start);
				$("input[name='edit-end']").val(project.end);

				$("#current-milestones").html("");
				if (project.milestones.length) {
					for (var i = 0; i < project.milestones.length; i++) {
						var ms = project.milestones[i];
						var str = '<li class="single-milestone"><span class="date">'+ms.date+'</span> <span class="title">'+ms.title+'</span> <span class="type">'+ms.type+'</span></li>';
						$(str).appendTo("#current-milestones");
					}
				}
			},

			addMilestone: function (id, $el, data) {
				var rec = db.get(id);
				rec.milestones.push(data);
				console.log(rec);
				db.save(id, rec);
				this.drawProjects();
			}

		};

		return new App();
});