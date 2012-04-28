$(function(){

	navigator.geolocation.getCurrentPosition(function(location){
		navigator.lat = location.coords.latitude;
		navigator.lng = location.coords.longitude;
		// console.log(navigator.lat, navigator.lng);
	});

	window.view_model = new Backbone.Model({
		defaults: {
			// "active": integer (model id)
		},
		validate: function(attrs){
			console.log('YAARRRRR');
		}
	});

	Status_M = Backbone.Model.extend({
		urlRoot: 'status',
		validate: function(hash){

			if(!hash.lat || !hash.lng){
				return 'Missing latitude/longtitude.';
			}
		}
	});

	Status_C = Backbone.Collection.extend({
		model: Status_M,
		url: 'status/list'
	});

	Status_V_simple = Backbone.View.extend({
		tagName: 'li',
		className: 'status simple',
		template: Hogan.compile($('#status_template').html()),
		content: function(){
			return this.template.render(this.model.toJSON());
		},
		initialize: function(){

			// Build view (but don't add it to DOM)
			this.$el
				.html( this.content() )
				.attr('id', this.model.get('id') + '_status');

			// Listen for changes to the model and push them to view
			this.model.on('change', function(){
				this.$el.html( this.content() );
			}, this);

			view_model.on('change:active', function(model, value, events){
				if(this.model.get('id') == value){
					this.$el.addClass('active');
				}
				else{
					this.$el.removeClass('active');
				}
			}, this);
		}
	});

	Status_V_simple_list = Backbone.View.extend({
		selector: 'status_list',
		initialize: function(){
			this.setElement(document.getElementById(this.selector));
		},
		render: function(){
			var view = this;

			this.collection.each(function(m){
				var status = new Status_V_simple({model:m});
				view.$el.append(status.$el);
			});
		},
		events: {
			'click .status' : 'select_status'
		},
		select_status: function(e){
			view_model.set('active', parseInt(e.currentTarget.id, 10));
		}
	});

	Status_V_map_pin = Backbone.View.extend({
		initialize: function(args){
			var view = this;

			view.google_map = args.google_map;

			view.position = new google.maps.LatLng(view.model.get('lat'), view.model.get('lng')),
			view.marker = new google.maps.Marker({
				position: view.position,
				map: view.google_map,
				title: view.model.get('name')
			});

			google.maps.event.addListener(this.marker, 'click', function(){
				view_model.set('active', view.model.get('id'));
			});

			view_model.on('change:active', function(model, value, events){
				if(view.model.get('id') == value){
					view.google_map.panTo(view.position);
				}
			});
		}
	});

	Status_V_map = Backbone.View.extend({
		selector: 'map_canvas',
		options: {
			center: new google.maps.LatLng(39.085078, -94.58573),
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			panControl: false,
			zoomControl: false,
			streetViewControl: false,
			mapTypeControl: false,
			styles:[
				{
					featureType: "landscape",
					stylers: [
						{ visibility: "simplified" },
						{ hue: "#00b2ff" },
						{ saturation: 49 }
					]
				},
				{
					featureType: "road",
					stylers: [
						{ visibility: "simplified" },
						{ hue: "#f7931e" }
					]
				},
				{
					featureType: "poi",
					stylers: [
						{ visibility: "simplified" },
						{ hue: "#00b2ff" }
					]
				}
			]
		},
		render: function(){
			var view = this;

			view.collection.each(function(m){
				var pin = new Status_V_map_pin({model:m, google_map:view.google_map});
			});
		},
		initialize: function(){
			this.setElement(document.getElementById(this.selector));
			this.google_map = new google.maps.Map(this.el, this.options);
		}
	});

	status_c = new Status_C();
	status_v_simple_list = new Status_V_simple_list({collection:status_c});
	status_v_map = new Status_V_map({collection:status_c});

	status_c.fetch({
		success:function(){
			status_v_simple_list.render();
			status_v_map.render();
		}
	});

});