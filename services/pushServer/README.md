#pushserver

NODE_ENV = <production || development> forever start --uid <processname> - a - l <logfile> -o <output logfile> -e <error logfile> index.js <portno>

#GCM API

http://hostname:portno/pushserver/gcm/?regid = id & apikey = key & mes = message

Test regid = ""
Test apikey = ""

#APN API

http://hostname:portno/pushserver/apn/?token = token &  mes = message

Test token = b5290e45ac61022f97d2e4b986edc0a48d0467f5caf06fbba881bf7d7e910f70
