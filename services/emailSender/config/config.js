var config = {
	app: {
			title: 'GlucoGuide App server'
	},
  header: {
      production  :   'https://api.glucoguide.com',
      development :   'https://test.glucoguide.com',
      default     :   'http://localhost:3000',
  },
	mailer: {
			from: process.env.MAILER_FROM || 'GlucoGuide',
			options: {
					service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
					auth: {
							user: process.env.MAILER_EMAIL_ID || 'support@glucoguide.com',
							pass: process.env.MAILER_PASSWORD || 'glucoguide123456'
					}
			}
	}
};

module.exports = config;
