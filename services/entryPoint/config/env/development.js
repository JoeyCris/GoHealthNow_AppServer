'use strict';

module.exports = {
    db: {
        uri: 'mongodb://localhost/rawdata',
        //uri: 'mongodb://dev.kdd.csd.uwo.ca/rawdata',
        options: {
            user: '',
            pass: ''
        }
    },
    log: {
        // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
        format: 'dev',
        // Stream defaults to process.stdout
        // Uncomment to enable logging to a log on the file system
        options: {
            //stream: 'access.log'
        }
    },
    serverURL: 'https://test.glucoguide.com/',
    app: {
        title: 'GoHealthNow'
    },
    facebook: {
        clientID: process.env.FACEBOOK_ID || '1727226117519475',
        clientSecret: process.env.FACEBOOK_SECRET || 'c5bcbb20ba1e4cbbe80601b1d6bdf513',
        callbackURL: '/auth/facebook/callback'
    },
	fitbit: {
		clientID: '227RBP',
		clientSecret:  '32a2d417fd1fda95e51c1f0a3683897a',
		callbackURL: 'https://test.glucoguide.com/auth/fitbit/callback'
	},
    mailer: {
        from: process.env.MAILER_FROM || 'GlucoGuide',
        options: {
            service: process.env.MAILER_SERVICE_PROVIDER || 'Gmail',
            auth: {
                user: process.env.MAILER_EMAIL_ID || 'service@glucoguide.com',
                pass: process.env.MAILER_PASSWORD || 'ggservice123456'
            }
        }
    }
};
