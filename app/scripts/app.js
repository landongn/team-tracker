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
						id: db.getLastKey()
					};

					db.save(p.title, p);
					that.drawProjects();
					$("#add").css({'right': 400});
					return false;
				});

				$("#chart").on("click", function (e){
					$("#add").removeClass("showing");
				});


				$("[data-id]").on('click', function (e){
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
				var startMonth = moment().startOf('week').subtract('week', 2);
				var endMonth = moment().startOf('week').add('month', 4);

				var index = endMonth.diff(startMonth, 'days');
				$("#chart").width((index * 55)+'px');

				for (var i = 0; i < index; i++) {
					var curDay = startMonth.clone().add('days', i);
					var str = "";
					if (curDay.day() === 0 || curDay.day() === 6) {
						str = '<section class="chart-column closed">';
					} else {
						str = '<section class="chart-column">';
					}

						str += '<section class="date">'+curDay.format('DD MMM')+'</section></section>';
					$("#chart").append($(str));
				}

			},

			drawProjects: function () {
				var projectTitles = db.all();
				$(".project").remove();
				//start positions for the project bars
				var startY = 0;
				var startX = 0;

				//itr through each project and append it to the proper placement.
				for (var i = 0; i < db.all().length; i++) {
					var p = db.get(projectTitles[i]);
					var tmpl = "<section data-id='"+p.id+"' class='project'>";
						tmpl += "<h3 class='title'>"+p.title+"</h3>";
						tmpl += "<section class='editor'>";
						tmpl += "<section>Foo bar baz</section>";
						tmpl += "</section>";

					var $tmpl = $(tmpl);
					var start = moment(p.start);
					var end = moment(p.end);
					var width = (end.diff(p.start, 'days') * 55)+'px';
					var today = moment();

					$("#chart").append($tmpl);
					$tmpl.width(width).css({'top': startY, 'left': start.diff(moment().startOf('week').subtract('week', 2), 'days') * 55 + 'px'});


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
				console.log("adding ", data, "to project", id);
				var rec = db.get(id);
				rec.milestones.push(data);
				console.log(rec);
				db.save(id, rec);
			}

		};

		return new App();
});