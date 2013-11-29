var request = require('request');

var data = {
	saturday: {
		total_sessions: 0
	},
	sunday: {
		total_sessions: 0
	},
	format: {},
	facilitator: [],
	total_sessions: 0
};

Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
};

request.get('http://schedule.mozillafestival.org/schedule', function(error, response, body){
	if(!error && response.statusCode === 200){
		var schedule = JSON.parse(body).schedule;

		for(var track in schedule){
			var trackSchedule = schedule[track],
				day = (track.slice(-1) === '5') ? 'saturday' : 'sunday';

			for(var entry in trackSchedule){
				var session = trackSchedule[entry];

				// data normalization
				session.format = session.format || 'unknown';
				session.format = session.format.trim().toLowerCase();
				if(session.id == 'badges'){
					session.format = session.format.replace(/.: /, '');
				}

				session.facilitators = session.speaker || '';
				session.facilitators = session.facilitators.replace(/(<([^>]+)>)/ig, '').split(',');

				// push sessions into their tracks on the right day
				if(!data[day][session.id]){
					data[day][session.id] = {
						sessions: 0,
						facilitators: []
					};
				}
				data[day][session.id] = {
					sessions: data[day][session.id].sessions + 1,
					facilitators: data[day][session.id].facilitators.concat(session.facilitators).getUnique()
				};

				// generate some numbers on formats
				if(!data.format[session.format]){ data.format[session.format] = {sessions: 0}; }
				data.format[session.format].sessions = data.format[session.format].sessions + 1;

				// generate some data on facilitators
				data.facilitator = data.facilitator.concat(session.facilitators).getUnique();

				// generate some numbers on sessions
				data[day].total_sessions++;
				data.total_sessions++;
			}
		}

		console.log(JSON.stringify(data));
	}
});